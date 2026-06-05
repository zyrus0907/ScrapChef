from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.shopping.application.ports import AbstractShoppingRepository
from app.modules.shopping.domain.shopping_list import ShoppingList, ShoppingListItem
from app.modules.shopping.infrastructure.models import (
    ShoppingListItemModel,
    ShoppingListModel,
)


class SqlShoppingRepository(AbstractShoppingRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_id(self, list_id: UUID, household_id: UUID) -> ShoppingList | None:
        result = await self._session.execute(
            select(ShoppingListModel)
            .options(selectinload(ShoppingListModel.items))
            .where(ShoppingListModel.id == list_id)
            .where(ShoppingListModel.household_id == household_id)
        )
        model = result.scalar_one_or_none()
        return self._to_domain(model) if model else None

    async def list_by_household(
        self, household_id: UUID, include_archived: bool = False
    ) -> list[ShoppingList]:
        query = (
            select(ShoppingListModel)
            .options(selectinload(ShoppingListModel.items))
            .where(ShoppingListModel.household_id == household_id)
        )
        if not include_archived:
            query = query.where(ShoppingListModel.is_archived.is_(False))
        query = query.order_by(ShoppingListModel.created_at.desc())
        result = await self._session.execute(query)
        return [self._to_domain(m) for m in result.scalars().all()]

    async def save(self, shopping_list: ShoppingList) -> None:
        model = await self._session.get(ShoppingListModel, shopping_list.id)
        if model is None:
            model = ShoppingListModel(
                id=shopping_list.id,
                household_id=shopping_list.household_id,
                created_by_user_id=shopping_list.created_by_user_id,
                name=shopping_list.name,
                is_archived=shopping_list.is_archived,
                created_at=shopping_list.created_at,
                updated_at=shopping_list.updated_at,
            )
            self._session.add(model)
        else:
            model.name = shopping_list.name
            model.is_archived = shopping_list.is_archived
            model.updated_at = shopping_list.updated_at

        # Replace items (cascade delete-orphan handles removed ones).
        await self._session.execute(
            ShoppingListItemModel.__table__.delete().where(
                ShoppingListItemModel.list_id == shopping_list.id
            )
        )
        for item in shopping_list.items:
            self._session.add(
                ShoppingListItemModel(
                    id=item.id,
                    list_id=shopping_list.id,
                    name=item.name,
                    quantity=item.quantity,
                    unit=item.unit,
                    category=item.category,
                    is_purchased=item.is_purchased,
                    source=item.source,
                    notes=item.notes,
                )
            )

    async def delete(self, list_id: UUID, household_id: UUID) -> None:
        model = await self._session.get(ShoppingListModel, list_id)
        if model and model.household_id == household_id:
            await self._session.delete(model)

    @staticmethod
    def _to_domain(model: ShoppingListModel) -> ShoppingList:
        return ShoppingList(
            id=model.id,
            household_id=model.household_id,
            created_by_user_id=model.created_by_user_id,
            name=model.name,
            is_archived=model.is_archived,
            created_at=model.created_at,
            updated_at=model.updated_at,
            items=[
                ShoppingListItem(
                    id=i.id,
                    list_id=i.list_id,
                    name=i.name,
                    quantity=i.quantity,
                    unit=i.unit,
                    category=i.category,
                    is_purchased=i.is_purchased,
                    source=i.source,
                    notes=i.notes,
                )
                for i in model.items
            ],
        )
