from abc import ABC, abstractmethod
from uuid import UUID

from app.modules.shopping.application.dtos import RestockSuggestion
from app.modules.shopping.domain.shopping_list import ShoppingList


class AbstractShoppingRepository(ABC):
    @abstractmethod
    async def get_by_id(self, list_id: UUID, household_id: UUID) -> ShoppingList | None: ...

    @abstractmethod
    async def list_by_household(
        self, household_id: UUID, include_archived: bool = False
    ) -> list[ShoppingList]: ...

    @abstractmethod
    async def save(self, shopping_list: ShoppingList) -> None: ...

    @abstractmethod
    async def delete(self, list_id: UUID, household_id: UUID) -> None: ...


class AbstractRestockSuggester(ABC):
    @abstractmethod
    async def suggest(
        self, household_id: UUID, within_days: int = 30
    ) -> list[RestockSuggestion]: ...
