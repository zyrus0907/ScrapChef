import uuid
from decimal import Decimal

from app.modules.pantry.application.ports import AbstractPantryRepository
from app.modules.pantry.application.use_cases.cook_recipe import ConsumeByNames
from app.modules.pantry.domain.pantry_item import PantryItem, PantryItemStatus


class FakePantryRepository(AbstractPantryRepository):
    def __init__(self, items):
        self.items = {i.id: i for i in items}

    async def get_by_id(self, item_id, household_id):
        return self.items.get(item_id)

    async def list_by_household(self, household_id, status="active"):
        return [
            i
            for i in self.items.values()
            if i.household_id == household_id and (not status or i.status.value == status)
        ]

    async def get_expiring_soon(self, household_id, within_days):
        return []

    async def save(self, item):
        self.items[item.id] = item

    async def delete(self, item_id, household_id):
        self.items.pop(item_id, None)


def _item(hh, name, status=PantryItemStatus.ACTIVE):
    return PantryItem(
        household_id=hh,
        added_by_user_id=uuid.uuid4(),
        name=name,
        quantity=Decimal("1"),
        unit="pcs",
        status=status,
    )


async def test_cook_consumes_matching_active_items():
    hh = uuid.uuid4()
    eggs, spinach, rice = _item(hh, "Eggs"), _item(hh, "Spinach"), _item(hh, "Rice")
    repo = FakePantryRepository([eggs, spinach, rice])

    consumed = await ConsumeByNames(repo).execute(hh, ["eggs", "SPINACH", "missing"])

    assert sorted(consumed) == ["Eggs", "Spinach"]
    assert repo.items[eggs.id].status == PantryItemStatus.CONSUMED
    assert repo.items[spinach.id].status == PantryItemStatus.CONSUMED
    assert repo.items[rice.id].status == PantryItemStatus.ACTIVE  # untouched


async def test_cook_ignores_consumed_and_other_households():
    hh, other = uuid.uuid4(), uuid.uuid4()
    already = _item(hh, "Milk", status=PantryItemStatus.CONSUMED)
    elsewhere = _item(other, "Milk")
    repo = FakePantryRepository([already, elsewhere])

    consumed = await ConsumeByNames(repo).execute(hh, ["milk"])

    assert consumed == []  # already consumed (not active) and other household ignored


async def test_cook_empty_names():
    repo = FakePantryRepository([])
    assert await ConsumeByNames(repo).execute(uuid.uuid4(), []) == []
