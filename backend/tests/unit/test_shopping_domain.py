import uuid
from decimal import Decimal

from app.modules.shopping.domain.shopping_list import ShoppingList, ShoppingListItem


def _item(name: str, purchased: bool = False) -> ShoppingListItem:
    return ShoppingListItem(
        name=name, quantity=Decimal("1"), unit="pcs", is_purchased=purchased
    )


def test_add_item_binds_list_id():
    sl = ShoppingList(household_id=uuid.uuid4())
    item = sl.add_item(_item("milk"))
    assert item.list_id == sl.id
    assert sl.total_items == 1


def test_pending_and_purchased_split():
    sl = ShoppingList(household_id=uuid.uuid4())
    sl.add_item(_item("milk", purchased=True))
    sl.add_item(_item("eggs", purchased=False))
    assert len(sl.purchased_items) == 1
    assert len(sl.pending_items) == 1


def test_is_complete_only_when_all_purchased():
    sl = ShoppingList(household_id=uuid.uuid4())
    assert sl.is_complete is False  # empty list is not "complete"
    sl.add_item(_item("milk", purchased=True))
    assert sl.is_complete is True
    sl.add_item(_item("eggs", purchased=False))
    assert sl.is_complete is False


def test_find_and_remove_item():
    sl = ShoppingList(household_id=uuid.uuid4())
    item = sl.add_item(_item("milk"))
    assert sl.find_item(item.id) is item
    sl.remove_item(item.id)
    assert sl.find_item(item.id) is None
    assert sl.total_items == 0
