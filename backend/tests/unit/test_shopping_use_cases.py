import uuid
from decimal import Decimal

import pytest

from app.core.exceptions import NotFoundError
from app.modules.shopping.application.dtos import (
    AddListItemCommand,
    CreateListCommand,
    UpdateListItemCommand,
)
from app.modules.shopping.application.ports import AbstractShoppingRepository
from app.modules.shopping.application.use_cases.manage_items import (
    AddShoppingListItem,
    RemoveShoppingListItem,
    ToggleItemPurchased,
    UpdateShoppingListItem,
)
from app.modules.shopping.application.use_cases.manage_lists import (
    CreateShoppingList,
    GetShoppingList,
)
from app.modules.shopping.domain.shopping_list import ShoppingList


class FakeShoppingRepository(AbstractShoppingRepository):
    def __init__(self) -> None:
        self._store: dict[uuid.UUID, ShoppingList] = {}

    async def get_by_id(self, list_id, household_id):
        sl = self._store.get(list_id)
        if sl and sl.household_id == household_id:
            return sl
        return None

    async def list_by_household(self, household_id, include_archived=False):
        return [
            sl
            for sl in self._store.values()
            if sl.household_id == household_id
            and (include_archived or not sl.is_archived)
        ]

    async def save(self, shopping_list):
        self._store[shopping_list.id] = shopping_list

    async def delete(self, list_id, household_id):
        sl = self._store.get(list_id)
        if sl and sl.household_id == household_id:
            del self._store[list_id]


@pytest.fixture
def household_id():
    return uuid.uuid4()


@pytest.fixture
def repo():
    return FakeShoppingRepository()


async def _make_list(repo, household_id) -> ShoppingList:
    return await CreateShoppingList(repo).execute(
        CreateListCommand(household_id=household_id, created_by_user_id=None, name="Weekly")
    )


async def test_create_then_get(repo, household_id):
    sl = await _make_list(repo, household_id)
    fetched = await GetShoppingList(repo).execute(sl.id, household_id)
    assert fetched.name == "Weekly"


async def test_get_missing_raises(repo, household_id):
    with pytest.raises(NotFoundError):
        await GetShoppingList(repo).execute(uuid.uuid4(), household_id)


async def test_add_item_and_toggle(repo, household_id):
    sl = await _make_list(repo, household_id)
    sl = await AddShoppingListItem(repo).execute(
        AddListItemCommand(
            list_id=sl.id,
            household_id=household_id,
            name="milk",
            quantity=Decimal("2"),
            unit="L",
        )
    )
    assert sl.total_items == 1
    item_id = sl.items[0].id

    sl = await ToggleItemPurchased(repo).execute(sl.id, item_id, household_id)
    assert sl.items[0].is_purchased is True
    assert sl.is_complete is True


async def test_update_and_remove_item(repo, household_id):
    sl = await _make_list(repo, household_id)
    sl = await AddShoppingListItem(repo).execute(
        AddListItemCommand(
            list_id=sl.id,
            household_id=household_id,
            name="eggs",
            quantity=Decimal("6"),
            unit="pcs",
        )
    )
    item_id = sl.items[0].id

    sl = await UpdateShoppingListItem(repo).execute(
        UpdateListItemCommand(
            list_id=sl.id,
            item_id=item_id,
            household_id=household_id,
            quantity=Decimal("12"),
        )
    )
    assert sl.items[0].quantity == Decimal("12")

    sl = await RemoveShoppingListItem(repo).execute(sl.id, item_id, household_id)
    assert sl.total_items == 0


async def test_household_isolation(repo, household_id):
    sl = await _make_list(repo, household_id)
    other_household = uuid.uuid4()
    with pytest.raises(NotFoundError):
        await GetShoppingList(repo).execute(sl.id, other_household)
