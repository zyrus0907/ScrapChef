from datetime import datetime, timezone
from uuid import UUID

from app.core.exceptions import DomainError, NotFoundError
from app.modules.pantry.application.ports import AbstractPantryRepository
from app.modules.pantry.domain.pantry_item import PantryItem, PantryItemStatus


class MarkItemWasted:
    def __init__(self, repo: AbstractPantryRepository) -> None:
        self._repo = repo

    async def execute(self, item_id: UUID, household_id: UUID) -> PantryItem:
        item = await self._repo.get_by_id(item_id, household_id)
        if item is None:
            raise NotFoundError("Pantry item not found")
        if item.status != PantryItemStatus.ACTIVE:
            raise DomainError(f"Cannot waste item with status '{item.status.value}'")
        item.status = PantryItemStatus.WASTED
        item.updated_at = datetime.now(timezone.utc)
        await self._repo.save(item)
        return item
