from uuid import UUID

from app.core.logging import get_logger
from app.modules.notifications.application.dtos import ExpiringItem
from app.modules.notifications.application.ports import (
    AbstractNotificationRepository,
    AbstractNotificationSender,
)
from app.modules.notifications.domain.notification import Notification, NotificationType

log = get_logger("notifications.scan")


class ScanHouseholdExpiries:
    """Create expiry notifications for one household's expiring items.

    Idempotent: a stable dedup_key per (item, expiry_date, type) means running
    the scan repeatedly won't create duplicate alerts.
    """

    def __init__(
        self,
        repo: AbstractNotificationRepository,
        sender: AbstractNotificationSender,
    ) -> None:
        self._repo = repo
        self._sender = sender

    async def execute(
        self, household_id: UUID, items: list[ExpiringItem]
    ) -> list[Notification]:
        created: list[Notification] = []
        for item in items:
            expired = item.days_until_expiry < 0
            ntype = NotificationType.EXPIRED if expired else NotificationType.EXPIRING_SOON
            dedup_key = f"{ntype.value}:{item.item_id}:{item.expiry_date.isoformat()}"

            if await self._repo.exists_dedup_key(household_id, dedup_key):
                continue

            notification = Notification(
                household_id=household_id,
                type=ntype,
                title=_title(item, expired),
                body=_body(item, expired),
                related_item_id=item.item_id,
                dedup_key=dedup_key,
            )
            await self._repo.add(notification)
            await self._sender.send(notification)
            created.append(notification)

        if created:
            log.info(
                "notifications.scan.created",
                household_id=str(household_id),
                count=len(created),
            )
        return created


def _title(item: ExpiringItem, expired: bool) -> str:
    if expired:
        return f"{item.name} has expired"
    if item.days_until_expiry == 0:
        return f"{item.name} expires today"
    return f"{item.name} expires in {item.days_until_expiry} day(s)"


def _body(item: ExpiringItem, expired: bool) -> str:
    if expired:
        return f"{item.name} expired on {item.expiry_date.isoformat()}. Use it up or toss it."
    return (
        f"{item.name} expires on {item.expiry_date.isoformat()}. "
        "Ask Leftover Chef for a recipe to use it up."
    )
