from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class ConsumeRequest(BaseModel):
    quantity: Optional[Decimal] = Field(None, gt=0)


class CookRequest(BaseModel):
    ingredient_names: list[str] = Field(default_factory=list)


class CookResponse(BaseModel):
    consumed: int
    names: list[str]


class AddItemRequest(BaseModel):
    name: str = Field(min_length=1, max_length=200, strip_whitespace=True)
    quantity: Decimal = Field(gt=0)
    unit: str = Field(min_length=1, max_length=30, strip_whitespace=True)
    category: str = Field(default="uncategorised", max_length=60)
    barcode: Optional[str] = Field(None, max_length=50)
    image_url: Optional[str] = Field(None, max_length=500)
    expiry_date: Optional[date] = None
    purchase_price: Optional[Decimal] = Field(None, ge=0)
    purchase_date: Optional[date] = None
    notes: str = ""


class UpdateItemRequest(BaseModel):
    quantity: Optional[Decimal] = Field(None, gt=0)
    unit: Optional[str] = Field(None, max_length=30)
    category: Optional[str] = Field(None, max_length=60)
    expiry_date: Optional[date] = None
    opened_date: Optional[date] = None
    purchase_price: Optional[Decimal] = Field(None, ge=0)
    notes: Optional[str] = None


class PantryItemResponse(BaseModel):
    id: UUID
    name: str
    quantity: Decimal
    unit: str
    category: str
    status: str
    barcode: Optional[str]
    image_url: Optional[str]
    expiry_date: Optional[date]
    opened_date: Optional[date]
    purchase_price: Optional[Decimal]
    purchase_date: Optional[date]
    quantity_purchased: Optional[Decimal]
    days_until_expiry: Optional[int]
    is_expired: bool
    notes: str
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_domain(cls, item) -> "PantryItemResponse":
        return cls(
            id=item.id,
            name=item.name,
            quantity=item.quantity,
            unit=item.unit,
            category=item.category,
            status=item.status.value,
            barcode=item.barcode,
            image_url=item.image_url,
            expiry_date=item.expiry_date,
            opened_date=item.opened_date,
            purchase_price=item.purchase_price,
            purchase_date=item.purchase_date,
            quantity_purchased=item.quantity_purchased,
            days_until_expiry=item.days_until_expiry,
            is_expired=item.is_expired,
            notes=item.notes,
            created_at=item.created_at,
            updated_at=item.updated_at,
        )
