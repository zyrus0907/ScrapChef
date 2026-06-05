from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.database.session import get_db_session
from app.modules.costs.api.schemas import CostSummaryResponse, MonthlySnapshotResponse
from app.modules.costs.application.use_cases.get_history import GetCostHistory
from app.modules.costs.application.use_cases.get_summary import GetCostSummary
from app.modules.costs.infrastructure.analytics_repository import CostAnalyticsRepository
from app.modules.identity.infrastructure.models import HouseholdModel
from app.modules.pantry.api.deps import get_current_household

router = APIRouter()


def _repo(session: AsyncSession) -> CostAnalyticsRepository:
    return CostAnalyticsRepository(session)


@router.get("/summary", response_model=CostSummaryResponse)
async def get_summary(
    year: Optional[int] = Query(None, ge=2020, le=2100),
    month: Optional[int] = Query(None, ge=1, le=12),
    household: HouseholdModel = Depends(get_current_household),
    session: AsyncSession = Depends(get_db_session),
) -> CostSummaryResponse:
    summary = await GetCostSummary(_repo(session)).execute(household.id, year, month)
    return CostSummaryResponse.from_dto(summary)


@router.get("/history", response_model=list[MonthlySnapshotResponse])
async def get_history(
    months: int = Query(default=6, ge=1, le=24),
    household: HouseholdModel = Depends(get_current_household),
    session: AsyncSession = Depends(get_db_session),
) -> list[MonthlySnapshotResponse]:
    history = await GetCostHistory(_repo(session)).execute(household.id, months)
    return [MonthlySnapshotResponse.from_dto(s) for s in history]
