from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.database.session import get_db_session
from app.modules.identity.api.deps import get_current_user
from app.modules.identity.infrastructure.models import HouseholdModel, UserModel
from app.modules.pantry.api.deps import get_current_household
from app.modules.pantry.api.schemas import (
    AddItemRequest,
    CookRequest,
    CookResponse,
    PantryItemResponse,
    UpdateItemRequest,
)
from app.modules.pantry.application.dtos import AddItemCommand, UpdateItemCommand
from app.modules.pantry.application.use_cases.add_item import AddPantryItem
from app.modules.pantry.application.use_cases.cook_recipe import ConsumeByNames
from app.modules.pantry.application.use_cases.delete_item import DeletePantryItem
from app.modules.pantry.application.use_cases.get_inventory import (
    GetExpiringSoon,
    GetInventory,
    InventoryFilters,
)
from app.modules.pantry.application.use_cases.mark_consumed import MarkItemConsumed
from app.modules.pantry.application.use_cases.mark_wasted import MarkItemWasted
from app.modules.pantry.application.use_cases.update_item import UpdatePantryItem
from app.modules.pantry.infrastructure.repository import SqlPantryRepository

router = APIRouter()


def _repo(session: AsyncSession) -> SqlPantryRepository:
    return SqlPantryRepository(session)


@router.post("/items", response_model=PantryItemResponse, status_code=201)
async def add_item(
    body: AddItemRequest,
    household: HouseholdModel = Depends(get_current_household),
    current_user: UserModel = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> PantryItemResponse:
    item = await AddPantryItem(_repo(session)).execute(
        AddItemCommand(
            household_id=household.id,
            added_by_user_id=current_user.id,
            name=body.name,
            quantity=body.quantity,
            unit=body.unit,
            category=body.category,
            barcode=body.barcode,
            image_url=body.image_url,
            expiry_date=body.expiry_date,
            purchase_price=body.purchase_price,
            purchase_date=body.purchase_date,
        )
    )
    return PantryItemResponse.from_domain(item)


@router.post("/cook", response_model=CookResponse)
async def cook(
    body: CookRequest,
    household: HouseholdModel = Depends(get_current_household),
    session: AsyncSession = Depends(get_db_session),
) -> CookResponse:
    """Mark the recipe's used pantry items consumed (feeds the savings tracker)."""
    names = await ConsumeByNames(_repo(session)).execute(household.id, body.ingredient_names)
    return CookResponse(consumed=len(names), names=names)


@router.get("/items/expiring-soon", response_model=list[PantryItemResponse])
async def expiring_soon(
    within_days: int = Query(default=3, ge=1, le=30),
    household: HouseholdModel = Depends(get_current_household),
    session: AsyncSession = Depends(get_db_session),
) -> list[PantryItemResponse]:
    items = await GetExpiringSoon(_repo(session)).execute(household.id, within_days)
    return [PantryItemResponse.from_domain(i) for i in items]


@router.get("/items", response_model=list[PantryItemResponse])
async def list_items(
    status: str = Query(default="active", pattern="^(active|consumed|wasted)$"),
    category: Optional[str] = Query(default=None),
    household: HouseholdModel = Depends(get_current_household),
    session: AsyncSession = Depends(get_db_session),
) -> list[PantryItemResponse]:
    items = await GetInventory(_repo(session)).execute(
        household.id, InventoryFilters(status=status, category=category)
    )
    return [PantryItemResponse.from_domain(i) for i in items]


@router.get("/items/{item_id}", response_model=PantryItemResponse)
async def get_item(
    item_id: UUID,
    household: HouseholdModel = Depends(get_current_household),
    session: AsyncSession = Depends(get_db_session),
) -> PantryItemResponse:
    from app.core.exceptions import NotFoundError
    item = await _repo(session).get_by_id(item_id, household.id)
    if item is None:
        raise NotFoundError("Pantry item not found")
    return PantryItemResponse.from_domain(item)


@router.patch("/items/{item_id}", response_model=PantryItemResponse)
async def update_item(
    item_id: UUID,
    body: UpdateItemRequest,
    household: HouseholdModel = Depends(get_current_household),
    session: AsyncSession = Depends(get_db_session),
) -> PantryItemResponse:
    item = await UpdatePantryItem(_repo(session)).execute(
        UpdateItemCommand(
            item_id=item_id,
            household_id=household.id,
            quantity=body.quantity,
            unit=body.unit,
            category=body.category,
            expiry_date=body.expiry_date,
            opened_date=body.opened_date,
            purchase_price=body.purchase_price,
            notes=body.notes,
        )
    )
    return PantryItemResponse.from_domain(item)


@router.delete("/items/{item_id}", status_code=204)
async def delete_item(
    item_id: UUID,
    household: HouseholdModel = Depends(get_current_household),
    session: AsyncSession = Depends(get_db_session),
) -> None:
    await DeletePantryItem(_repo(session)).execute(item_id, household.id)


@router.post("/items/{item_id}/consume", response_model=PantryItemResponse)
async def consume_item(
    item_id: UUID,
    household: HouseholdModel = Depends(get_current_household),
    session: AsyncSession = Depends(get_db_session),
) -> PantryItemResponse:
    item = await MarkItemConsumed(_repo(session)).execute(item_id, household.id)
    return PantryItemResponse.from_domain(item)


@router.post("/items/{item_id}/waste", response_model=PantryItemResponse)
async def waste_item(
    item_id: UUID,
    household: HouseholdModel = Depends(get_current_household),
    session: AsyncSession = Depends(get_db_session),
) -> PantryItemResponse:
    item = await MarkItemWasted(_repo(session)).execute(item_id, household.id)
    return PantryItemResponse.from_domain(item)
