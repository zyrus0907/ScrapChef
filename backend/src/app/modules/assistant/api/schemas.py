from pydantic import BaseModel, Field


class LeftoverChefRequestBody(BaseModel):
    dietary_preferences: list[str] = Field(default_factory=list)
    max_recipes: int = Field(default=3, ge=1, le=5)
    prioritise_expiring: bool = True
    # When true, only consider items expiring within `within_days`.
    expiring_only: bool = False
    within_days: int = Field(default=7, ge=1, le=60)


class GeneratedRecipeResponse(BaseModel):
    name: str
    description: str
    ingredients_used: list[str]
    additional_ingredients: list[str]
    steps: list[str]
    estimated_time_minutes: int
    uses_expiring_items: bool

    @classmethod
    def from_dto(cls, r) -> "GeneratedRecipeResponse":
        return cls(
            name=r.name,
            description=r.description,
            ingredients_used=r.ingredients_used,
            additional_ingredients=r.additional_ingredients,
            steps=r.steps,
            estimated_time_minutes=r.estimated_time_minutes,
            uses_expiring_items=r.uses_expiring_items,
        )


class LeftoverChefResponse(BaseModel):
    provider: str
    ingredients_considered: int
    recipes: list[GeneratedRecipeResponse]
