from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.database.session import get_db_session
from app.modules.assistant.api.schemas import (
    GeneratedRecipeResponse,
    LeftoverChefRequestBody,
    LeftoverChefResponse,
)
from app.modules.assistant.application.dtos import (
    LeftoverChefRequest,
    PantryIngredient,
)
from app.modules.assistant.application.use_cases.suggest_leftover_recipes import (
    SuggestLeftoverRecipes,
)
from app.modules.assistant.infrastructure.factory import build_recipe_generator
from app.modules.identity.infrastructure.models import HouseholdModel
from app.modules.pantry.api.deps import get_current_household
from app.modules.pantry.infrastructure.repository import SqlPantryRepository

router = APIRouter()


@router.post("/leftover-chef", response_model=LeftoverChefResponse)
async def leftover_chef(
    body: LeftoverChefRequestBody,
    household: HouseholdModel = Depends(get_current_household),
    session: AsyncSession = Depends(get_db_session),
) -> LeftoverChefResponse:
    repo = SqlPantryRepository(session)

    if body.expiring_only:
        items = await repo.get_expiring_soon(household.id, body.within_days)
    else:
        items = await repo.list_by_household(household.id, status="active")

    ingredients = [
        PantryIngredient(
            name=item.name,
            quantity=item.quantity,
            unit=item.unit,
            days_until_expiry=item.days_until_expiry,
        )
        for item in items
    ]

    generator = build_recipe_generator()
    recipes = await SuggestLeftoverRecipes(generator).execute(
        LeftoverChefRequest(
            ingredients=ingredients,
            dietary_preferences=body.dietary_preferences,
            max_recipes=body.max_recipes,
            prioritise_expiring=body.prioritise_expiring,
        )
    )

    return LeftoverChefResponse(
        provider=generator.provider,
        ingredients_considered=len(ingredients),
        recipes=[GeneratedRecipeResponse.from_dto(r) for r in recipes],
    )
