from uuid import UUID

from app.core.exceptions import NotFoundError
from app.modules.pantry.application.ports import AbstractPantryRepository


class DeletePantryItem:
    def __init__(self, repo: AbstractPantryRepository) -> None:
        self._repo = repo

    async def execute(self, item_id: UUID, household_id: UUID) -> None:
        item = await self._repo.get_by_id(item_id, household_id)
        if item is None:
            raise NotFoundError("Pantry item not found")
        await self._repo.delete(item_id, household_id)
