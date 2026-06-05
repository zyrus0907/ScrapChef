from dataclasses import dataclass
from decimal import Decimal
from typing import Optional
from uuid import UUID


@dataclass(frozen=True)
class CreateListCommand:
    household_id: UUID
    created_by_user_id: Optional[UUID]
    name: str = "Shopping list"


@dataclass(frozen=True)
class AddListItemCommand:
    list_id: UUID
    household_id: UUID
    name: str
    quantity: Decimal
    unit: str
    category: str = "uncategorised"
    source: str = "manual"
    notes: str = ""


@dataclass(frozen=True)
class UpdateListItemCommand:
    list_id: UUID
    item_id: UUID
    household_id: UUID
    quantity: Optional[Decimal] = None
    unit: Optional[str] = None
    category: Optional[str] = None
    notes: Optional[str] = None


@dataclass(frozen=True)
class RestockSuggestion:
    """A pantry item the household has run out of and may want to rebuy."""

    name: str
    category: str
    unit: str
    suggested_quantity: Decimal
    reason: str  # ran_out | expiring_soon
