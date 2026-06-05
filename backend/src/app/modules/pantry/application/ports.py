from abc import ABC, abstractmethod
from typing import Optional
from uuid import UUID

from app.modules.pantry.domain.pantry_item import PantryItem


class AbstractPantryRepository(ABC):
    @abstractmethod
    async def get_by_id(self, item_id: UUID, household_id: UUID) -> PantryItem | None: ...

    @abstractmethod
    async def list_by_household(
        self, household_id: UUID, status: Optional[str] = "active"
    ) -> list[PantryItem]: ...

    @abstractmethod
    async def get_expiring_soon(
        self, household_id: UUID, within_days: int
    ) -> list[PantryItem]: ...

    @abstractmethod
    async def save(self, item: PantryItem) -> None: ...

    @abstractmethod
    async def delete(self, item_id: UUID, household_id: UUID) -> None: ...
