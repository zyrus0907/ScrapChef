from uuid import UUID

from app.modules.shopping.application.dtos import RestockSuggestion
from app.modules.shopping.application.ports import AbstractRestockSuggester


class SuggestRestock:
    """Suggest items the household has run out of, based on pantry history."""

    def __init__(self, suggester: AbstractRestockSuggester) -> None:
        self._suggester = suggester

    async def execute(
        self, household_id: UUID, within_days: int = 30
    ) -> list[RestockSuggestion]:
        return await self._suggester.suggest(household_id, within_days)
