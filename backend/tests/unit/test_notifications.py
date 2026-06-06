import uuid
from datetime import date, timedelta

import pytest

from app.modules.notifications.application.dtos import ExpiringItem
from app.modules.notifications.application.ports import (
    AbstractNotificationRepository,
    AbstractNotificationSender,
)
from app.modules.notifications.application.use_cases.manage_notifications import (
    CountUnread,
    MarkAllRead,
)
from app.modules.notifications.application.use_cases.scan_expiries import (
    ScanHouseholdExpiries,
)
from app.modules.notifications.domain.notification import Notification, NotificationType


class FakeNotificationRepository(AbstractNotificationRepository):
    def __init__(self) -> None:
        self.items: list[Notification] = []

    async def add(self, notification):
        self.items.append(notification)

    async def list_for_household(self, household_id, unread_only=False, limit=50):
        rows = [n for n in self.items if n.household_id == household_id]
        if unread_only:
            rows = [n for n in rows if not n.is_read]
        return rows[:limit]

    async def get(self, notification_id, household_id):
        return next(
            (n for n in self.items if n.id == notification_id and n.household_id == household_id),
            None,
        )

    async def unread_count(self, household_id):
        return sum(1 for n in self.items if n.household_id == household_id and not n.is_read)

    async def mark_read(self, notification_id, household_id):
        n = await self.get(notification_id, household_id)
        if n:
            n.is_read = True

    async def mark_all_read(self, household_id):
        n = 0
        for x in self.items:
            if x.household_id == household_id and not x.is_read:
                x.is_read = True
                n += 1
        return n

    async def exists_dedup_key(self, household_id, dedup_key):
        return any(
            n.household_id == household_id and n.dedup_key == dedup_key for n in self.items
        )


class FakeSender(AbstractNotificationSender):
    def __init__(self) -> None:
        self.sent: list[Notification] = []

    @property
    def channel(self) -> str:
        return "fake"

    async def send(self, notification):
        self.sent.append(notification)


def _item(name: str, days: int) -> ExpiringItem:
    return ExpiringItem(
        item_id=uuid.uuid4(),
        name=name,
        expiry_date=date.today() + timedelta(days=days),
        days_until_expiry=days,
    )


@pytest.fixture
def household_id():
    return uuid.uuid4()


async def test_scan_creates_notifications_and_sends(household_id):
    repo, sender = FakeNotificationRepository(), FakeSender()
    created = await ScanHouseholdExpiries(repo, sender).execute(
        household_id, [_item("milk", 2), _item("yoghurt", 0)]
    )
    assert len(created) == 2
    assert len(sender.sent) == 2
    assert await repo.unread_count(household_id) == 2


async def test_scan_is_idempotent(household_id):
    repo, sender = FakeNotificationRepository(), FakeSender()
    item = _item("milk", 2)
    await ScanHouseholdExpiries(repo, sender).execute(household_id, [item])
    # Re-running with the same item + expiry date creates nothing new.
    created = await ScanHouseholdExpiries(repo, sender).execute(household_id, [item])
    assert created == []
    assert len(repo.items) == 1


async def test_expired_item_gets_expired_type(household_id):
    repo, sender = FakeNotificationRepository(), FakeSender()
    created = await ScanHouseholdExpiries(repo, sender).execute(
        household_id, [_item("bread", -1)]
    )
    assert created[0].type == NotificationType.EXPIRED


async def test_count_unread_and_mark_all_read(household_id):
    repo, sender = FakeNotificationRepository(), FakeSender()
    await ScanHouseholdExpiries(repo, sender).execute(
        household_id, [_item("milk", 1), _item("eggs", 2)]
    )
    assert await CountUnread(repo).execute(household_id) == 2
    marked = await MarkAllRead(repo).execute(household_id)
    assert marked == 2
    assert await CountUnread(repo).execute(household_id) == 0


async def test_household_isolation(household_id):
    repo, sender = FakeNotificationRepository(), FakeSender()
    await ScanHouseholdExpiries(repo, sender).execute(household_id, [_item("milk", 1)])
    other = uuid.uuid4()
    assert await CountUnread(repo).execute(other) == 0
