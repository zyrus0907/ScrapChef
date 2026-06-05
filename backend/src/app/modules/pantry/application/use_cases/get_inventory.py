from dataclasses import dataclass
from typing import Optional
from uuid import UUID

from app.modules.pantry.application.ports import AbstractPantryRepository
from app.modules.pantry.domain.pantry_item import PantryItem


@dataclass
class InventoryFilters:
    status: str = "active"
    category: Optional[str] = None


class GetInventory:
    def __init__(self, repo: AbstractPantryRepository) -> None:
        self._repo = repo

    async def execute(self, household_id: UUID, filters: InventoryFilters) -> list[PantryItem]:
        items = await self._repo.list_by_household(household_id, status=filters.status)
        if filters.category:
            items = [i for i in items if i.category == filters.category]
        return items


class GetExpiringSoon:
    def __init__(self, repo: AbstractPantryRepository) -> None:
        self._repo = repo

    async def execute(self, household_id: UUID, within_days: int = 3) -> list[PantryItem]:
        return await self._repo.get_expiring_soon(household_id, within_days)
