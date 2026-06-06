from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field


class ReceiptParseRequest(BaseModel):
    image_base64: str = Field(min_length=1)
    mime_type: str = "image/jpeg"


class ReceiptLineResponse(BaseModel):
    name: str
    quantity: Decimal
    unit: str
    price: Optional[Decimal]
    category: Optional[str]

    @classmethod
    def from_dto(cls, line) -> "ReceiptLineResponse":
        return cls(
            name=line.name,
            quantity=line.quantity,
            unit=line.unit,
            price=line.price,
            category=line.category,
        )


class ReceiptParseResponse(BaseModel):
    provider: str
    available: bool
    store_name: Optional[str]
    lines: list[ReceiptLineResponse]


class RecipeParseRequest(BaseModel):
    image_base64: Optional[str] = None
    mime_type: str = "image/jpeg"
    text: Optional[str] = None


class RecipeIngredientResponse(BaseModel):
    name: str
    quantity: Optional[Decimal]
    unit: Optional[str]

    @classmethod
    def from_dto(cls, ing) -> "RecipeIngredientResponse":
        return cls(name=ing.name, quantity=ing.quantity, unit=ing.unit)


class RecipeParseResponse(BaseModel):
    provider: str
    available: bool
    title: str
    ingredients: list[RecipeIngredientResponse]
