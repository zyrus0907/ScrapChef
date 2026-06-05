import uuid

from app.modules.recipes.application.dtos import CreateRecipeCommand
from app.modules.recipes.application.ports import AbstractRecipeRepository
from app.modules.recipes.domain.recipe import Recipe, RecipeIngredient


class CreateRecipe:
    def __init__(self, repo: AbstractRecipeRepository) -> None:
        self._repo = repo

    async def execute(self, cmd: CreateRecipeCommand) -> Recipe:
        recipe_id = uuid.uuid4()
        recipe = Recipe(
            id=recipe_id,
            name=cmd.name.strip(),
            description=cmd.description,
            instructions=cmd.instructions,
            prep_time_minutes=cmd.prep_time_minutes,
            cook_time_minutes=cmd.cook_time_minutes,
            servings=cmd.servings,
            cuisine=cmd.cuisine,
            tags=list(cmd.tags),
            source="user",
            created_by_user_id=cmd.created_by_user_id,
            ingredients=[
                RecipeIngredient(
                    recipe_id=recipe_id,
                    name=i.name.strip(),
                    quantity=i.quantity,
                    unit=i.unit,
                    is_optional=i.is_optional,
                    notes=i.notes,
                )
                for i in cmd.ingredients
            ],
        )
        await self._repo.save(recipe)
        return recipe
