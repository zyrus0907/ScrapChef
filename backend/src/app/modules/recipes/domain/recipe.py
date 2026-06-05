import uuid
from dataclasses import dataclass, field
from decimal import Decimal
from typing import Optional

from app.shared.domain.entity import Entity


@dataclass(kw_only=True)
class RecipeIngredient:
    id: uuid.UUID = field(default_factory=uuid.uuid4)
    recipe_id: uuid.UUID = field(default_factory=uuid.uuid4)
    name: str
    quantity: Decimal
    unit: str
    is_optional: bool = False
    notes: str = ""


@dataclass(kw_only=True)
class Recipe(Entity):
    name: str
    description: str = ""
    instructions: str = ""
    prep_time_minutes: int = 0
    cook_time_minutes: int = 0
    servings: int = 2
    cuisine: str = "other"
    tags: list[str] = field(default_factory=list)
    source: str = "user"
    created_by_user_id: Optional[uuid.UUID] = None
    ingredients: list[RecipeIngredient] = field(default_factory=list)

    @property
    def required_ingredients(self) -> list[RecipeIngredient]:
        return [i for i in self.ingredients if not i.is_optional]

    @property
    def total_time_minutes(self) -> int:
        return self.prep_time_minutes + self.cook_time_minutes
