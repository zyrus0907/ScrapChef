from uuid import UUID

from app.core.exceptions import NotFoundError
from app.modules.recipes.application.ports import AbstractRecipeRepository
from app.modules.recipes.domain.recipe import Recipe


class GetRecipe:
    def __init__(self, repo: AbstractRecipeRepository) -> None:
        self._repo = repo

    async def execute(self, recipe_id: UUID) -> Recipe:
        recipe = await self._repo.get_by_id(recipe_id)
        if recipe is None:
            raise NotFoundError("Recipe not found")
        return recipe
