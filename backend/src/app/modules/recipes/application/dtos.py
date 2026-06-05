from dataclasses import dataclass, field
from decimal import Decimal
from typing import Optional
from uuid import UUID


@dataclass(frozen=True)
class RecipeIngredientCommand:
    name: str
    quantity: Decimal
    unit: str
    is_optional: bool = False
    notes: str = ""


@dataclass(frozen=True)
class CreateRecipeCommand:
    name: str
    instructions: str
    ingredients: list[RecipeIngredientCommand]
    description: str = ""
    prep_time_minutes: int = 0
    cook_time_minutes: int = 0
    servings: int = 2
    cuisine: str = "other"
    tags: list[str] = field(default_factory=list)
    created_by_user_id: Optional[UUID] = None
