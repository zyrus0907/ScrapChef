from datetime import datetime, timezone
from uuid import UUID

from app.modules.costs.application.dtos import CostSummary
from app.modules.costs.infrastructure.analytics_repository import CostAnalyticsRepository


class GetCostSummary:
    def __init__(self, repo: CostAnalyticsRepository) -> None:
        self._repo = repo

    async def execute(
        self, household_id: UUID, year: int | None = None, month: int | None = None
    ) -> CostSummary:
        now = datetime.now(timezone.utc)
        return await self._repo.get_monthly_summary(
            household_id,
            year=year or now.year,
            month=month or now.month,
        )
