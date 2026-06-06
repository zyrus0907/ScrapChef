import base64
import binascii

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import DomainError
from app.infrastructure.database.session import get_db_session
from app.modules.assistant.api.parsing_schemas import (
    ReceiptLineResponse,
    ReceiptParseRequest,
    ReceiptParseResponse,
    RecipeIngredientResponse,
    RecipeParseRequest,
    RecipeParseResponse,
)
from app.modules.assistant.api.schemas import (
    GeneratedRecipeResponse,
    LeftoverChefRequestBody,
    LeftoverChefResponse,
)
from app.modules.assistant.application.dtos import (
    LeftoverChefRequest,
    PantryIngredient,
)
from app.modules.assistant.application.use_cases.parse_inputs import (
    ParseReceipt,
    ParseRecipe,
)
from app.modules.assistant.application.use_cases.suggest_leftover_recipes import (
    SuggestLeftoverRecipes,
)
from app.modules.assistant.infrastructure.factory import build_recipe_generator
from app.modules.assistant.infrastructure.parser_factory import (
    build_receipt_parser,
    build_recipe_parser,
)
from app.modules.identity.infrastructure.models import HouseholdModel
from app.modules.pantry.api.deps import get_current_household
from app.modules.pantry.infrastructure.repository import SqlPantryRepository

router = APIRouter()


class BadImageError(DomainError):
    status_code = 422
    code = "bad_image"


def _decode(image_base64: str) -> bytes:
    # Accept raw base64 or a data: URL.
    if image_base64.startswith("data:") and "," in image_base64:
        image_base64 = image_base64.split(",", 1)[1]
    try:
        return base64.b64decode(image_base64, validate=True)
    except (binascii.Error, ValueError) as exc:
        raise BadImageError("Could not decode the uploaded image.") from exc


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


@router.post("/receipt", response_model=ReceiptParseResponse)
async def parse_receipt(
    body: ReceiptParseRequest,
    _: HouseholdModel = Depends(get_current_household),
) -> ReceiptParseResponse:
    """Read a grocery receipt photo into line items + prices (Gemini)."""
    parser = build_receipt_parser()
    result = await ParseReceipt(parser).execute(_decode(body.image_base64), body.mime_type)
    return ReceiptParseResponse(
        provider=result.provider,
        available=parser.available,
        store_name=result.store_name,
        lines=[ReceiptLineResponse.from_dto(line) for line in result.lines],
    )


@router.post("/recipe", response_model=RecipeParseResponse)
async def parse_recipe(
    body: RecipeParseRequest,
    _: HouseholdModel = Depends(get_current_household),
) -> RecipeParseResponse:
    """Read a recipe (photo or pasted text) into its ingredient list (Gemini)."""
    if not body.image_base64 and not (body.text and body.text.strip()):
        raise BadImageError("Provide a recipe photo or some recipe text.")
    parser = build_recipe_parser()
    image_bytes = _decode(body.image_base64) if body.image_base64 else None
    result = await ParseRecipe(parser).execute(
        image_bytes=image_bytes, mime_type=body.mime_type, text=body.text
    )
    return RecipeParseResponse(
        provider=result.provider,
        available=parser.available,
        title=result.title,
        ingredients=[RecipeIngredientResponse.from_dto(i) for i in result.ingredients],
    )
