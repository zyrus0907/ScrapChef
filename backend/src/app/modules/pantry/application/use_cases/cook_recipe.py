from datetime import datetime, timezone
from uuid import UUID

from app.modules.pantry.application.ports import AbstractPantryRepository
from app.modules.pantry.domain.pantry_item import PantryItemStatus


class ConsumeByNames:
    """Mark active pantry items consumed by (case-insensitive) name.

    Powers "Cook this" — when a recipe is cooked, the pantry items it used are
    marked consumed (which also feeds the savings tracker).
    """

    def __init__(self, repo: AbstractPantryRepository) -> None:
        self._repo = repo

    async def execute(self, household_id: UUID, names: list[str]) -> list[str]:
        wanted = {n.strip().lower() for n in names if n and n.strip()}
        if not wanted:
            return []

        items = await self._repo.list_by_household(household_id, status="active")
        consumed: list[str] = []
        for item in items:
            if item.name.strip().lower() in wanted:
                item.status = PantryItemStatus.CONSUMED
                item.updated_at = datetime.now(timezone.utc)
                await self._repo.save(item)
                consumed.append(item.name)
        return consumed
