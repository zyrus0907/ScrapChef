import uuid
from decimal import Decimal


from app.modules.pantry.application.ports import AbstractPantryRepository
from app.modules.pantry.application.use_cases.mark_consumed import MarkItemConsumed
from app.modules.pantry.domain.pantry_item import PantryItem, PantryItemStatus


class FakeRepo(AbstractPantryRepository):
    def __init__(self, item):
        self._item = item

    async def get_by_id(self, item_id, household_id):
        return self._item if self._item.id == item_id else None

    async def list_by_household(self, household_id, status="active"):
        return [self._item]

    async def get_expiring_soon(self, household_id, within_days):
        return []

    async def save(self, item):
        self._item = item

    async def delete(self, item_id, household_id):
        pass


def _item(qty):
    return PantryItem(
        household_id=uuid.uuid4(),
        added_by_user_id=uuid.uuid4(),
        name="milk",
        quantity=Decimal(qty),
        unit="L",
    )


async def test_partial_consume_decrements_and_stays_active():
    item = _item("4")
    repo = FakeRepo(item)
    result = await MarkItemConsumed(repo).execute(item.id, item.household_id, Decimal("1.5"))
    assert result.status == PantryItemStatus.ACTIVE
    assert result.quantity == Decimal("2.5")


async def test_consume_full_when_amount_exceeds_remaining():
    item = _item("2")
    repo = FakeRepo(item)
    result = await MarkItemConsumed(repo).execute(item.id, item.household_id, Decimal("5"))
    assert result.status == PantryItemStatus.CONSUMED


async def test_consume_full_when_no_amount():
    item = _item("3")
    repo = FakeRepo(item)
    result = await MarkItemConsumed(repo).execute(item.id, item.household_id)
    assert result.status == PantryItemStatus.CONSUMED


async def test_consume_all_remaining_marks_consumed():
    item = _item("2")
    repo = FakeRepo(item)
    result = await MarkItemConsumed(repo).execute(item.id, item.household_id, Decimal("2"))
    assert result.status == PantryItemStatus.CONSUMED
