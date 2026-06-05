import uuid
from dataclasses import dataclass
from datetime import date
from decimal import Decimal
from enum import Enum
from typing import Optional

from app.shared.domain.entity import Entity


class PantryItemStatus(str, Enum):
    ACTIVE = "active"
    CONSUMED = "consumed"
    WASTED = "wasted"


@dataclass(kw_only=True)
class PantryItem(Entity):
    household_id: uuid.UUID
    added_by_user_id: uuid.UUID
    name: str
    quantity: Decimal
    unit: str
    category: str = "uncategorised"
    status: PantryItemStatus = PantryItemStatus.ACTIVE
    barcode: Optional[str] = None
    expiry_date: Optional[date] = None
    opened_date: Optional[date] = None
    # Cost tracking fields (Phase 1 requirement)
    purchase_price: Optional[Decimal] = None
    purchase_date: Optional[date] = None
    quantity_purchased: Optional[Decimal] = None
    notes: str = ""

    @property
    def is_expired(self) -> bool:
        return self.expiry_date is not None and self.expiry_date < date.today()

    @property
    def days_until_expiry(self) -> Optional[int]:
        if self.expiry_date is None:
            return None
        return (self.expiry_date - date.today()).days

    @property
    def estimated_value_remaining(self) -> Optional[Decimal]:
        """Proportional value of remaining quantity vs purchased quantity."""
        if (
            self.purchase_price is None
            or self.quantity_purchased is None
            or self.quantity_purchased == 0
        ):
            return None
        return (self.quantity / self.quantity_purchased) * self.purchase_price

    @property
    def estimated_value_wasted(self) -> Optional[Decimal]:
        """Value of food if the item ends up wasted (full purchase price)."""
        if self.status != PantryItemStatus.WASTED:
            return None
        return self.purchase_price
