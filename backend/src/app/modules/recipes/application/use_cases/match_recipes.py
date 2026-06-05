from uuid import UUID

from app.modules.pantry.application.ports import AbstractPantryRepository
from app.modules.recipes.application.ports import AbstractRecipeRepository
from app.modules.recipes.domain import matching as svc
from app.modules.recipes.domain.matching import RecipeMatchResult


class _BaseMatch:
    def __init__(
        self,
        recipes: AbstractRecipeRepository,
        pantry: AbstractPantryRepository,
    ) -> None:
        self._recipes = recipes
        self._pantry = pantry

    async def _load(self, household_id: UUID):
        all_recipes = await self._recipes.get_all()
        active_items = await self._pantry.list_by_household(household_id, status="active")
        return all_recipes, active_items


class StrictMatchRecipes(_BaseMatch):
    async def execute(self, household_id: UUID) -> list[RecipeMatchResult]:
        recipes, pantry = await self._load(household_id)
        return svc.strict_match(recipes, pantry)


class NearMatchRecipes(_BaseMatch):
    async def execute(
        self, household_id: UUID, max_missing: int = 2
    ) -> list[RecipeMatchResult]:
        recipes, pantry = await self._load(household_id)
        return svc.near_match(recipes, pantry, max_missing)


class ScrapsMatchRecipes(_BaseMatch):
    async def execute(
        self, household_id: UUID, min_coverage: float = 0.5
    ) -> list[RecipeMatchResult]:
        recipes, pantry = await self._load(household_id)
        return svc.scraps_match(recipes, pantry, min_coverage)


class ExpiryRescueRecipes(_BaseMatch):
    async def execute(self, household_id: UUID) -> list[RecipeMatchResult]:
        recipes, pantry = await self._load(household_id)
        return svc.expiry_rescue(recipes, pantry)
