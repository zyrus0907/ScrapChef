from dataclasses import dataclass, field
from datetime import date
from decimal import Decimal
from typing import Optional
from uuid import UUID


@dataclass(frozen=True)
class AddItemCommand:
    household_id: UUID
    added_by_user_id: UUID
    name: str
    quantity: Decimal
    unit: str
    category: str = "uncategorised"
    barcode: Optional[str] = None
    expiry_date: Optional[date] = None
    purchase_price: Optional[Decimal] = None
    purchase_date: Optional[date] = None
    quantity_purchased: Optional[Decimal] = None
    notes: str = ""


@dataclass(frozen=True)
class UpdateItemCommand:
    item_id: UUID
    household_id: UUID
    quantity: Optional[Decimal] = None
    unit: Optional[str] = None
    category: Optional[str] = None
    expiry_date: Optional[date] = None
    opened_date: Optional[date] = None
    purchase_price: Optional[Decimal] = None
    notes: Optional[str] = None
