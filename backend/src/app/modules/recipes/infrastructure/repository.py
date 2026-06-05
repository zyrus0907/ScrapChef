from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.recipes.application.ports import AbstractRecipeRepository
from app.modules.recipes.domain.recipe import Recipe, RecipeIngredient
from app.modules.recipes.infrastructure.models import RecipeIngredientModel, RecipeModel


class SqlRecipeRepository(AbstractRecipeRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_id(self, recipe_id: UUID) -> Recipe | None:
        result = await self._session.execute(
            select(RecipeModel)
            .options(selectinload(RecipeModel.ingredients))
            .where(RecipeModel.id == recipe_id)
        )
        model = result.scalar_one_or_none()
        return self._to_domain(model) if model else None

    async def get_all(self) -> list[Recipe]:
        result = await self._session.execute(
            select(RecipeModel).options(selectinload(RecipeModel.ingredients))
        )
        return [self._to_domain(m) for m in result.scalars().all()]

    async def save(self, recipe: Recipe) -> None:
        model = await self._session.get(RecipeModel, recipe.id)
        if model is None:
            model = RecipeModel(
                id=recipe.id,
                name=recipe.name,
                description=recipe.description,
                instructions=recipe.instructions,
                prep_time_minutes=recipe.prep_time_minutes,
                cook_time_minutes=recipe.cook_time_minutes,
                servings=recipe.servings,
                cuisine=recipe.cuisine,
                tags=recipe.tags,
                source=recipe.source,
                created_by_user_id=recipe.created_by_user_id,
                created_at=recipe.created_at,
                updated_at=recipe.updated_at,
            )
            self._session.add(model)
        else:
            model.name = recipe.name
            model.description = recipe.description
            model.instructions = recipe.instructions
            model.prep_time_minutes = recipe.prep_time_minutes
            model.cook_time_minutes = recipe.cook_time_minutes
            model.servings = recipe.servings
            model.cuisine = recipe.cuisine
            model.tags = recipe.tags
            model.updated_at = recipe.updated_at

        # Replace ingredients (cascade delete handles old ones)
        await self._session.execute(
            RecipeIngredientModel.__table__.delete().where(
                RecipeIngredientModel.recipe_id == recipe.id
            )
        )
        for ing in recipe.ingredients:
            self._session.add(
                RecipeIngredientModel(
                    id=ing.id,
                    recipe_id=recipe.id,
                    name=ing.name,
                    quantity=ing.quantity,
                    unit=ing.unit,
                    is_optional=ing.is_optional,
                    notes=ing.notes,
                )
            )

    async def delete(self, recipe_id: UUID) -> None:
        model = await self._session.get(RecipeModel, recipe_id)
        if model:
            await self._session.delete(model)

    @staticmethod
    def _to_domain(model: RecipeModel) -> Recipe:
        return Recipe(
            id=model.id,
            name=model.name,
            description=model.description,
            instructions=model.instructions,
            prep_time_minutes=model.prep_time_minutes,
            cook_time_minutes=model.cook_time_minutes,
            servings=model.servings,
            cuisine=model.cuisine,
            tags=list(model.tags or []),
            source=model.source,
            created_by_user_id=model.created_by_user_id,
            created_at=model.created_at,
            updated_at=model.updated_at,
            ingredients=[
                RecipeIngredient(
                    id=i.id,
                    recipe_id=i.recipe_id,
                    name=i.name,
                    quantity=i.quantity,
                    unit=i.unit,
                    is_optional=i.is_optional,
                    notes=i.notes,
                )
                for i in model.ingredients
            ],
        )
