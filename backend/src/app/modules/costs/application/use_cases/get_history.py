from uuid import UUID

from app.modules.costs.application.dtos import MonthlySnapshot
from app.modules.costs.infrastructure.analytics_repository import CostAnalyticsRepository


class GetCostHistory:
    def __init__(self, repo: CostAnalyticsRepository) -> None:
        self._repo = repo

    async def execute(self, household_id: UUID, months: int = 6) -> list[MonthlySnapshot]:
        return await self._repo.get_history(household_id, months)
