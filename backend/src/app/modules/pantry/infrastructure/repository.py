from datetime import date, timedelta
from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.pantry.application.ports import AbstractPantryRepository
from app.modules.pantry.domain.pantry_item import PantryItem, PantryItemStatus
from app.modules.pantry.infrastructure.models import PantryItemModel


class SqlPantryRepository(AbstractPantryRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_id(self, item_id: UUID, household_id: UUID) -> PantryItem | None:
        result = await self._session.execute(
            select(PantryItemModel)
            .where(PantryItemModel.id == item_id)
            .where(PantryItemModel.household_id == household_id)
        )
        model = result.scalar_one_or_none()
        return self._to_domain(model) if model else None

    async def list_by_household(
        self, household_id: UUID, status: Optional[str] = "active"
    ) -> list[PantryItem]:
        query = select(PantryItemModel).where(PantryItemModel.household_id == household_id)
        if status:
            query = query.where(PantryItemModel.status == status)
        query = query.order_by(
            PantryItemModel.expiry_date.asc().nulls_last(),
            PantryItemModel.name.asc(),
        )
        result = await self._session.execute(query)
        return [self._to_domain(m) for m in result.scalars().all()]

    async def get_expiring_soon(self, household_id: UUID, within_days: int) -> list[PantryItem]:
        cutoff = date.today() + timedelta(days=within_days)
        result = await self._session.execute(
            select(PantryItemModel)
            .where(PantryItemModel.household_id == household_id)
            .where(PantryItemModel.status == "active")
            .where(PantryItemModel.expiry_date.isnot(None))
            .where(PantryItemModel.expiry_date <= cutoff)
            .order_by(PantryItemModel.expiry_date.asc())
        )
        return [self._to_domain(m) for m in result.scalars().all()]

    async def save(self, item: PantryItem) -> None:
        model = await self._session.get(PantryItemModel, item.id)
        if model is None:
            self._session.add(
                PantryItemModel(
                    id=item.id,
                    household_id=item.household_id,
                    added_by_user_id=item.added_by_user_id,
                    name=item.name,
                    quantity=item.quantity,
                    unit=item.unit,
                    category=item.category,
                    status=item.status.value,
                    barcode=item.barcode,
                    expiry_date=item.expiry_date,
                    opened_date=item.opened_date,
                    purchase_price=item.purchase_price,
                    purchase_date=item.purchase_date,
                    quantity_purchased=item.quantity_purchased,
                    notes=item.notes,
                    created_at=item.created_at,
                    updated_at=item.updated_at,
                )
            )
        else:
            model.name = item.name
            model.quantity = item.quantity
            model.unit = item.unit
            model.category = item.category
            model.status = item.status.value
            model.barcode = item.barcode
            model.expiry_date = item.expiry_date
            model.opened_date = item.opened_date
            model.purchase_price = item.purchase_price
            model.purchase_date = item.purchase_date
            model.quantity_purchased = item.quantity_purchased
            model.notes = item.notes
            model.updated_at = item.updated_at

    async def delete(self, item_id: UUID, household_id: UUID) -> None:
        model = await self._session.get(PantryItemModel, item_id)
        if model and model.household_id == household_id:
            await self._session.delete(model)

    @staticmethod
    def _to_domain(model: PantryItemModel) -> PantryItem:
        return PantryItem(
            id=model.id,
            household_id=model.household_id,
            added_by_user_id=model.added_by_user_id,
            name=model.name,
            quantity=model.quantity,
            unit=model.unit,
            category=model.category,
            status=PantryItemStatus(model.status),
            barcode=model.barcode,
            expiry_date=model.expiry_date,
            opened_date=model.opened_date,
            purchase_price=model.purchase_price,
            purchase_date=model.purchase_date,
            quantity_purchased=model.quantity_purchased,
            notes=model.notes,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )
