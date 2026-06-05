from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class RecipeIngredientRequest(BaseModel):
    name: str = Field(min_length=1, max_length=200, strip_whitespace=True)
    quantity: Decimal = Field(gt=0)
    unit: str = Field(min_length=1, max_length=30, strip_whitespace=True)
    is_optional: bool = False
    notes: str = ""


class CreateRecipeRequest(BaseModel):
    name: str = Field(min_length=1, max_length=200, strip_whitespace=True)
    description: str = ""
    instructions: str = Field(min_length=1)
    prep_time_minutes: int = Field(ge=0, default=0)
    cook_time_minutes: int = Field(ge=0, default=0)
    servings: int = Field(ge=1, default=2)
    cuisine: str = Field(default="other", max_length=60)
    tags: list[str] = []
    ingredients: list[RecipeIngredientRequest] = Field(min_length=1)


class RecipeIngredientResponse(BaseModel):
    name: str
    quantity: Decimal
    unit: str
    is_optional: bool
    notes: str


class RecipeResponse(BaseModel):
    id: UUID
    name: str
    description: str
    instructions: str
    prep_time_minutes: int
    cook_time_minutes: int
    total_time_minutes: int
    servings: int
    cuisine: str
    tags: list[str]
    ingredients: list[RecipeIngredientResponse]
    created_at: datetime

    @classmethod
    def from_domain(cls, recipe) -> "RecipeResponse":
        return cls(
            id=recipe.id,
            name=recipe.name,
            description=recipe.description,
            instructions=recipe.instructions,
            prep_time_minutes=recipe.prep_time_minutes,
            cook_time_minutes=recipe.cook_time_minutes,
            total_time_minutes=recipe.total_time_minutes,
            servings=recipe.servings,
            cuisine=recipe.cuisine,
            tags=recipe.tags,
            ingredients=[
                RecipeIngredientResponse(
                    name=i.name,
                    quantity=i.quantity,
                    unit=i.unit,
                    is_optional=i.is_optional,
                    notes=i.notes,
                )
                for i in recipe.ingredients
            ],
            created_at=recipe.created_at,
        )


class IngredientCoverageResponse(BaseModel):
    ingredient_name: str
    is_matched: bool
    pantry_item_name: Optional[str] = None
    days_until_expiry: Optional[int] = None


class RecipeMatchResponse(BaseModel):
    recipe: RecipeResponse
    coverage: list[IngredientCoverageResponse]
    missing_count: int
    match_percentage: float
    expiry_boost: float
    score: float

    @classmethod
    def from_result(cls, result) -> "RecipeMatchResponse":
        return cls(
            recipe=RecipeResponse.from_domain(result.recipe),
            coverage=[
                IngredientCoverageResponse(
                    ingredient_name=c.ingredient_name,
                    is_matched=c.is_matched,
                    pantry_item_name=c.pantry_item_name,
                    days_until_expiry=c.days_until_expiry,
                )
                for c in result.coverage
            ],
            missing_count=result.missing_count,
            match_percentage=round(result.match_percentage, 3),
            expiry_boost=round(result.expiry_boost, 3),
            score=round(result.score, 3),
        )
