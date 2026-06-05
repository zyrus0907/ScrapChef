import uuid
from dataclasses import dataclass, field
from decimal import Decimal
from typing import Optional

from app.shared.domain.entity import Entity


@dataclass(kw_only=True)
class ShoppingListItem:
    id: uuid.UUID = field(default_factory=uuid.uuid4)
    list_id: uuid.UUID = field(default_factory=uuid.uuid4)
    name: str
    quantity: Decimal
    unit: str
    category: str = "uncategorised"
    is_purchased: bool = False
    # Where the item came from: a person added it, or the restock engine suggested it.
    source: str = "manual"  # manual | suggested
    notes: str = ""


@dataclass(kw_only=True)
class ShoppingList(Entity):
    household_id: uuid.UUID
    created_by_user_id: Optional[uuid.UUID] = None
    name: str = "Shopping list"
    is_archived: bool = False
    items: list[ShoppingListItem] = field(default_factory=list)

    @property
    def pending_items(self) -> list[ShoppingListItem]:
        return [i for i in self.items if not i.is_purchased]

    @property
    def purchased_items(self) -> list[ShoppingListItem]:
        return [i for i in self.items if i.is_purchased]

    @property
    def total_items(self) -> int:
        return len(self.items)

    @property
    def is_complete(self) -> bool:
        return self.total_items > 0 and not self.pending_items

    def add_item(self, item: ShoppingListItem) -> ShoppingListItem:
        item.list_id = self.id
        self.items.append(item)
        return item

    def find_item(self, item_id: uuid.UUID) -> Optional[ShoppingListItem]:
        return next((i for i in self.items if i.id == item_id), None)

    def remove_item(self, item_id: uuid.UUID) -> None:
        self.items = [i for i in self.items if i.id != item_id]
