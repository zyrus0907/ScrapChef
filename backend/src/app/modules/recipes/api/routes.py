from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.database.session import get_db_session
from app.modules.identity.api.deps import get_current_user
from app.modules.identity.infrastructure.models import HouseholdModel, UserModel
from app.modules.pantry.api.deps import get_current_household
from app.modules.pantry.infrastructure.repository import SqlPantryRepository
from app.modules.recipes.api.schemas import (
    CreateRecipeRequest,
    RecipeMatchResponse,
    RecipeResponse,
)
from app.modules.recipes.application.dtos import CreateRecipeCommand, RecipeIngredientCommand
from app.modules.recipes.application.use_cases.create_recipe import CreateRecipe
from app.modules.recipes.application.use_cases.get_recipe import GetRecipe
from app.modules.recipes.application.use_cases.match_recipes import (
    ExpiryRescueRecipes,
    NearMatchRecipes,
    ScrapsMatchRecipes,
    StrictMatchRecipes,
)
from app.modules.recipes.infrastructure.repository import SqlRecipeRepository

router = APIRouter()


def _recipe_repo(session: AsyncSession) -> SqlRecipeRepository:
    return SqlRecipeRepository(session)


def _pantry_repo(session: AsyncSession) -> SqlPantryRepository:
    return SqlPantryRepository(session)


# ---------------------------------------------------------------------------
# CRUD
# ---------------------------------------------------------------------------

@router.post("", response_model=RecipeResponse, status_code=201)
async def create_recipe(
    body: CreateRecipeRequest,
    current_user: UserModel = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> RecipeResponse:
    recipe = await CreateRecipe(_recipe_repo(session)).execute(
        CreateRecipeCommand(
            name=body.name,
            description=body.description,
            instructions=body.instructions,
            prep_time_minutes=body.prep_time_minutes,
            cook_time_minutes=body.cook_time_minutes,
            servings=body.servings,
            cuisine=body.cuisine,
            tags=body.tags,
            created_by_user_id=current_user.id,
            ingredients=[
                RecipeIngredientCommand(
                    name=i.name,
                    quantity=i.quantity,
                    unit=i.unit,
                    is_optional=i.is_optional,
                    notes=i.notes,
                )
                for i in body.ingredients
            ],
        )
    )
    return RecipeResponse.from_domain(recipe)


@router.get("", response_model=list[RecipeResponse])
async def list_recipes(
    session: AsyncSession = Depends(get_db_session),
) -> list[RecipeResponse]:
    recipes = await _recipe_repo(session).get_all()
    return [RecipeResponse.from_domain(r) for r in recipes]


# ---------------------------------------------------------------------------
# Match endpoints — defined BEFORE /{recipe_id} to avoid route conflicts
# ---------------------------------------------------------------------------

@router.get("/match/strict", response_model=list[RecipeMatchResponse])
async def strict_match(
    household: HouseholdModel = Depends(get_current_household),
    session: AsyncSession = Depends(get_db_session),
) -> list[RecipeMatchResponse]:
    results = await StrictMatchRecipes(
        _recipe_repo(session), _pantry_repo(session)
    ).execute(household.id)
    return [RecipeMatchResponse.from_result(r) for r in results]


@router.get("/match/near", response_model=list[RecipeMatchResponse])
async def near_match(
    max_missing: int = Query(default=2, ge=1, le=5),
    household: HouseholdModel = Depends(get_current_household),
    session: AsyncSession = Depends(get_db_session),
) -> list[RecipeMatchResponse]:
    results = await NearMatchRecipes(
        _recipe_repo(session), _pantry_repo(session)
    ).execute(household.id, max_missing)
    return [RecipeMatchResponse.from_result(r) for r in results]


@router.get("/match/scraps", response_model=list[RecipeMatchResponse])
async def scraps_match(
    min_coverage: float = Query(default=0.5, ge=0.1, le=1.0),
    household: HouseholdModel = Depends(get_current_household),
    session: AsyncSession = Depends(get_db_session),
) -> list[RecipeMatchResponse]:
    results = await ScrapsMatchRecipes(
        _recipe_repo(session), _pantry_repo(session)
    ).execute(household.id, min_coverage)
    return [RecipeMatchResponse.from_result(r) for r in results]


@router.get("/match/expiry-rescue", response_model=list[RecipeMatchResponse])
async def expiry_rescue(
    household: HouseholdModel = Depends(get_current_household),
    session: AsyncSession = Depends(get_db_session),
) -> list[RecipeMatchResponse]:
    results = await ExpiryRescueRecipes(
        _recipe_repo(session), _pantry_repo(session)
    ).execute(household.id)
    return [RecipeMatchResponse.from_result(r) for r in results]


# ---------------------------------------------------------------------------
# Single recipe — AFTER match routes
# ---------------------------------------------------------------------------

@router.get("/{recipe_id}", response_model=RecipeResponse)
async def get_recipe(
    recipe_id: UUID,
    session: AsyncSession = Depends(get_db_session),
) -> RecipeResponse:
    recipe = await GetRecipe(_recipe_repo(session)).execute(recipe_id)
    return RecipeResponse.from_domain(recipe)


@router.delete("/{recipe_id}", status_code=204)
async def delete_recipe(
    recipe_id: UUID,
    current_user: UserModel = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> None:
    await _recipe_repo(session).delete(recipe_id)
