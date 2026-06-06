from dataclasses import dataclass, field
from decimal import Decimal
from typing import Optional


@dataclass(frozen=True)
class ReceiptLine:
    name: str
    quantity: Decimal = Decimal("1")
    unit: str = "unit"
    price: Optional[Decimal] = None  # line total paid
    category: Optional[str] = None


@dataclass(frozen=True)
class ParsedReceipt:
    provider: str
    store_name: Optional[str]
    lines: list[ReceiptLine] = field(default_factory=list)


@dataclass(frozen=True)
class ParsedIngredient:
    name: str
    quantity: Optional[Decimal] = None
    unit: Optional[str] = None


@dataclass(frozen=True)
class ParsedRecipe:
    provider: str
    title: str
    ingredients: list[ParsedIngredient] = field(default_factory=list)
