from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.identity.application.ports import AbstractHouseholdRepository
from app.modules.identity.domain.household import Household
from app.modules.identity.infrastructure.models import HouseholdModel


class SqlHouseholdRepository(AbstractHouseholdRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def save(self, household: Household) -> None:
        model = await self._session.get(HouseholdModel, household.id)
        if model is None:
            self._session.add(
                HouseholdModel(
                    id=household.id,
                    name=household.name,
                    owner_id=household.owner_id,
                    created_at=household.created_at,
                    updated_at=household.updated_at,
                )
            )
        else:
            model.name = household.name
            model.updated_at = household.updated_at

    async def get_by_owner(self, owner_id: UUID) -> Household | None:
        result = await self._session.execute(
            select(HouseholdModel).where(HouseholdModel.owner_id == owner_id)
        )
        model = result.scalar_one_or_none()
        if model is None:
            return None
        return Household(
            id=model.id,
            name=model.name,
            owner_id=model.owner_id,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )
