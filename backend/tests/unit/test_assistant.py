from decimal import Decimal

import pytest

from app.modules.assistant.application.dtos import (
    GeneratedRecipe,
    LeftoverChefRequest,
    PantryIngredient,
)
from app.modules.assistant.application.ports import AbstractRecipeGenerator
from app.modules.assistant.application.use_cases.suggest_leftover_recipes import (
    EmptyPantryError,
    SuggestLeftoverRecipes,
)
from app.modules.assistant.infrastructure.stub_generator import StubRecipeGenerator


def _ingredient(name: str, days: int | None = None) -> PantryIngredient:
    return PantryIngredient(
        name=name, quantity=Decimal("1"), unit="pcs", days_until_expiry=days
    )


async def test_stub_generates_a_recipe_from_pantry():
    gen = StubRecipeGenerator()
    recipes = await gen.generate(
        LeftoverChefRequest(ingredients=[_ingredient("eggs"), _ingredient("spinach")])
    )
    assert len(recipes) == 1
    assert "eggs" in recipes[0].ingredients_used
    assert gen.provider == "stub"


async def test_stub_flags_expiring_items():
    gen = StubRecipeGenerator()
    recipes = await gen.generate(
        LeftoverChefRequest(ingredients=[_ingredient("milk", days=1)])
    )
    assert recipes[0].uses_expiring_items is True


async def test_stub_orders_expiring_first():
    gen = StubRecipeGenerator()
    recipes = await gen.generate(
        LeftoverChefRequest(
            ingredients=[_ingredient("rice", days=30), _ingredient("tomato", days=1)]
        )
    )
    # The soonest-to-expire item drives the recipe name.
    assert "tomato" in recipes[0].name.lower()


async def test_empty_pantry_raises():
    with pytest.raises(EmptyPantryError):
        await SuggestLeftoverRecipes(StubRecipeGenerator()).execute(
            LeftoverChefRequest(ingredients=[])
        )


async def test_use_case_delegates_to_generator():
    class FakeGenerator(AbstractRecipeGenerator):
        @property
        def provider(self) -> str:
            return "fake"

        async def generate(self, request):
            return [
                GeneratedRecipe(
                    name="Test dish",
                    description="d",
                    ingredients_used=[i.name for i in request.ingredients],
                    additional_ingredients=[],
                    steps=["cook"],
                    estimated_time_minutes=10,
                    uses_expiring_items=False,
                )
            ]

    recipes = await SuggestLeftoverRecipes(FakeGenerator()).execute(
        LeftoverChefRequest(ingredients=[_ingredient("pasta")])
    )
    assert recipes[0].name == "Test dish"
    assert recipes[0].ingredients_used == ["pasta"]
