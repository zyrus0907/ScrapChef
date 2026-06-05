from dataclasses import dataclass, field
from decimal import Decimal
from typing import Optional


@dataclass(frozen=True)
class PantryIngredient:
    """A single item the household has on hand, fed to the AI."""

    name: str
    quantity: Decimal
    unit: str
    days_until_expiry: Optional[int] = None

    @property
    def is_expiring(self) -> bool:
        return self.days_until_expiry is not None and self.days_until_expiry <= 3


@dataclass(frozen=True)
class LeftoverChefRequest:
    ingredients: list[PantryIngredient]
    dietary_preferences: list[str] = field(default_factory=list)
    max_recipes: int = 3
    prioritise_expiring: bool = True


@dataclass(frozen=True)
class GeneratedRecipe:
    name: str
    description: str
    ingredients_used: list[str]
    additional_ingredients: list[str]
    steps: list[str]
    estimated_time_minutes: int
    uses_expiring_items: bool
