from uuid import UUID

from app.core.exceptions import NotFoundError
from app.modules.shopping.application.dtos import CreateListCommand
from app.modules.shopping.application.ports import AbstractShoppingRepository
from app.modules.shopping.domain.shopping_list import ShoppingList


class CreateShoppingList:
    def __init__(self, repo: AbstractShoppingRepository) -> None:
        self._repo = repo

    async def execute(self, cmd: CreateListCommand) -> ShoppingList:
        shopping_list = ShoppingList(
            household_id=cmd.household_id,
            created_by_user_id=cmd.created_by_user_id,
            name=cmd.name.strip() or "Shopping list",
        )
        await self._repo.save(shopping_list)
        return shopping_list


class GetShoppingLists:
    def __init__(self, repo: AbstractShoppingRepository) -> None:
        self._repo = repo

    async def execute(
        self, household_id: UUID, include_archived: bool = False
    ) -> list[ShoppingList]:
        return await self._repo.list_by_household(household_id, include_archived)


class GetShoppingList:
    def __init__(self, repo: AbstractShoppingRepository) -> None:
        self._repo = repo

    async def execute(self, list_id: UUID, household_id: UUID) -> ShoppingList:
        shopping_list = await self._repo.get_by_id(list_id, household_id)
        if shopping_list is None:
            raise NotFoundError("Shopping list not found")
        return shopping_list


class ArchiveShoppingList:
    def __init__(self, repo: AbstractShoppingRepository) -> None:
        self._repo = repo

    async def execute(self, list_id: UUID, household_id: UUID) -> ShoppingList:
        shopping_list = await self._repo.get_by_id(list_id, household_id)
        if shopping_list is None:
            raise NotFoundError("Shopping list not found")
        shopping_list.is_archived = True
        await self._repo.save(shopping_list)
        return shopping_list


class DeleteShoppingList:
    def __init__(self, repo: AbstractShoppingRepository) -> None:
        self._repo = repo

    async def execute(self, list_id: UUID, household_id: UUID) -> None:
        await self._repo.delete(list_id, household_id)
