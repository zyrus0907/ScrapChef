from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.database.session import get_db_session
from app.modules.identity.api.deps import get_current_user
from app.modules.identity.infrastructure.models import HouseholdModel, UserModel
from app.modules.pantry.api.deps import get_current_household
from app.modules.shopping.api.schemas import (
    AddListItemRequest,
    CreateListRequest,
    RestockSuggestionResponse,
    ShoppingListResponse,
    UpdateListItemRequest,
)
from app.modules.shopping.application.dtos import (
    AddListItemCommand,
    CreateListCommand,
    UpdateListItemCommand,
)
from app.modules.shopping.application.use_cases.manage_items import (
    AddShoppingListItem,
    RemoveShoppingListItem,
    ToggleItemPurchased,
    UpdateShoppingListItem,
)
from app.modules.shopping.application.use_cases.manage_lists import (
    ArchiveShoppingList,
    CreateShoppingList,
    DeleteShoppingList,
    GetShoppingList,
    GetShoppingLists,
)
from app.modules.shopping.application.use_cases.suggest_restock import SuggestRestock
from app.modules.shopping.infrastructure.repository import SqlShoppingRepository
from app.modules.shopping.infrastructure.suggestion_repository import RestockSuggester

router = APIRouter()


def _repo(session: AsyncSession) -> SqlShoppingRepository:
    return SqlShoppingRepository(session)


@router.post("/lists", response_model=ShoppingListResponse, status_code=201)
async def create_list(
    body: CreateListRequest,
    household: HouseholdModel = Depends(get_current_household),
    current_user: UserModel = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> ShoppingListResponse:
    sl = await CreateShoppingList(_repo(session)).execute(
        CreateListCommand(
            household_id=household.id,
            created_by_user_id=current_user.id,
            name=body.name,
        )
    )
    return ShoppingListResponse.from_domain(sl)


@router.get("/lists", response_model=list[ShoppingListResponse])
async def list_lists(
    include_archived: bool = Query(default=False),
    household: HouseholdModel = Depends(get_current_household),
    session: AsyncSession = Depends(get_db_session),
) -> list[ShoppingListResponse]:
    lists = await GetShoppingLists(_repo(session)).execute(household.id, include_archived)
    return [ShoppingListResponse.from_domain(sl) for sl in lists]


@router.get("/suggestions", response_model=list[RestockSuggestionResponse])
async def restock_suggestions(
    within_days: int = Query(default=30, ge=1, le=365),
    household: HouseholdModel = Depends(get_current_household),
    session: AsyncSession = Depends(get_db_session),
) -> list[RestockSuggestionResponse]:
    suggestions = await SuggestRestock(RestockSuggester(session)).execute(
        household.id, within_days
    )
    return [RestockSuggestionResponse.from_dto(s) for s in suggestions]


@router.get("/lists/{list_id}", response_model=ShoppingListResponse)
async def get_list(
    list_id: UUID,
    household: HouseholdModel = Depends(get_current_household),
    session: AsyncSession = Depends(get_db_session),
) -> ShoppingListResponse:
    sl = await GetShoppingList(_repo(session)).execute(list_id, household.id)
    return ShoppingListResponse.from_domain(sl)


@router.post("/lists/{list_id}/archive", response_model=ShoppingListResponse)
async def archive_list(
    list_id: UUID,
    household: HouseholdModel = Depends(get_current_household),
    session: AsyncSession = Depends(get_db_session),
) -> ShoppingListResponse:
    sl = await ArchiveShoppingList(_repo(session)).execute(list_id, household.id)
    return ShoppingListResponse.from_domain(sl)


@router.delete("/lists/{list_id}", status_code=204)
async def delete_list(
    list_id: UUID,
    household: HouseholdModel = Depends(get_current_household),
    session: AsyncSession = Depends(get_db_session),
) -> None:
    await DeleteShoppingList(_repo(session)).execute(list_id, household.id)


@router.post("/lists/{list_id}/items", response_model=ShoppingListResponse, status_code=201)
async def add_item(
    list_id: UUID,
    body: AddListItemRequest,
    household: HouseholdModel = Depends(get_current_household),
    session: AsyncSession = Depends(get_db_session),
) -> ShoppingListResponse:
    sl = await AddShoppingListItem(_repo(session)).execute(
        AddListItemCommand(
            list_id=list_id,
            household_id=household.id,
            name=body.name,
            quantity=body.quantity,
            unit=body.unit,
            category=body.category,
            notes=body.notes,
        )
    )
    return ShoppingListResponse.from_domain(sl)


@router.patch("/lists/{list_id}/items/{item_id}", response_model=ShoppingListResponse)
async def update_item(
    list_id: UUID,
    item_id: UUID,
    body: UpdateListItemRequest,
    household: HouseholdModel = Depends(get_current_household),
    session: AsyncSession = Depends(get_db_session),
) -> ShoppingListResponse:
    sl = await UpdateShoppingListItem(_repo(session)).execute(
        UpdateListItemCommand(
            list_id=list_id,
            item_id=item_id,
            household_id=household.id,
            quantity=body.quantity,
            unit=body.unit,
            category=body.category,
            notes=body.notes,
        )
    )
    return ShoppingListResponse.from_domain(sl)


@router.post("/lists/{list_id}/items/{item_id}/toggle", response_model=ShoppingListResponse)
async def toggle_item(
    list_id: UUID,
    item_id: UUID,
    household: HouseholdModel = Depends(get_current_household),
    session: AsyncSession = Depends(get_db_session),
) -> ShoppingListResponse:
    sl = await ToggleItemPurchased(_repo(session)).execute(list_id, item_id, household.id)
    return ShoppingListResponse.from_domain(sl)


@router.delete("/lists/{list_id}/items/{item_id}", response_model=ShoppingListResponse)
async def remove_item(
    list_id: UUID,
    item_id: UUID,
    household: HouseholdModel = Depends(get_current_household),
    session: AsyncSession = Depends(get_db_session),
) -> ShoppingListResponse:
    sl = await RemoveShoppingListItem(_repo(session)).execute(list_id, item_id, household.id)
    return ShoppingListResponse.from_domain(sl)
