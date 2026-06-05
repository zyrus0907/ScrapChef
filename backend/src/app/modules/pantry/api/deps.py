from fastapi import Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.infrastructure.database.session import get_db_session
from app.modules.identity.api.deps import get_current_user
from app.modules.identity.infrastructure.models import HouseholdModel, UserModel


async def get_current_household(
    current_user: UserModel = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> HouseholdModel:
    result = await session.execute(
        select(HouseholdModel).where(HouseholdModel.owner_id == current_user.id)
    )
    household = result.scalar_one_or_none()
    if household is None:
        raise NotFoundError("No household found for this user")
    return household
