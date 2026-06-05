from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class CreateListRequest(BaseModel):
    name: str = Field(default="Shopping list", min_length=1, max_length=120)


class AddListItemRequest(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    quantity: Decimal = Field(gt=0)
    unit: str = Field(min_length=1, max_length=30)
    category: str = Field(default="uncategorised", max_length=60)
    notes: str = ""


class UpdateListItemRequest(BaseModel):
    quantity: Optional[Decimal] = Field(None, gt=0)
    unit: Optional[str] = Field(None, max_length=30)
    category: Optional[str] = Field(None, max_length=60)
    notes: Optional[str] = None


class ShoppingListItemResponse(BaseModel):
    id: UUID
    name: str
    quantity: Decimal
    unit: str
    category: str
    is_purchased: bool
    source: str
    notes: str

    @classmethod
    def from_domain(cls, item) -> "ShoppingListItemResponse":
        return cls(
            id=item.id,
            name=item.name,
            quantity=item.quantity,
            unit=item.unit,
            category=item.category,
            is_purchased=item.is_purchased,
            source=item.source,
            notes=item.notes,
        )


class ShoppingListResponse(BaseModel):
    id: UUID
    name: str
    is_archived: bool
    total_items: int
    is_complete: bool
    items: list[ShoppingListItemResponse]
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_domain(cls, sl) -> "ShoppingListResponse":
        return cls(
            id=sl.id,
            name=sl.name,
            is_archived=sl.is_archived,
            total_items=sl.total_items,
            is_complete=sl.is_complete,
            items=[ShoppingListItemResponse.from_domain(i) for i in sl.items],
            created_at=sl.created_at,
            updated_at=sl.updated_at,
        )


class RestockSuggestionResponse(BaseModel):
    name: str
    category: str
    unit: str
    suggested_quantity: Decimal
    reason: str

    @classmethod
    def from_dto(cls, s) -> "RestockSuggestionResponse":
        return cls(
            name=s.name,
            category=s.category,
            unit=s.unit,
            suggested_quantity=s.suggested_quantity,
            reason=s.reason,
        )
