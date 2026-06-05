from uuid import UUID

from app.core.exceptions import NotFoundError
from app.modules.shopping.application.dtos import AddListItemCommand, UpdateListItemCommand
from app.modules.shopping.application.ports import AbstractShoppingRepository
from app.modules.shopping.domain.shopping_list import ShoppingList, ShoppingListItem


async def _load(
    repo: AbstractShoppingRepository, list_id: UUID, household_id: UUID
) -> ShoppingList:
    shopping_list = await repo.get_by_id(list_id, household_id)
    if shopping_list is None:
        raise NotFoundError("Shopping list not found")
    return shopping_list


class AddShoppingListItem:
    def __init__(self, repo: AbstractShoppingRepository) -> None:
        self._repo = repo

    async def execute(self, cmd: AddListItemCommand) -> ShoppingList:
        shopping_list = await _load(self._repo, cmd.list_id, cmd.household_id)
        shopping_list.add_item(
            ShoppingListItem(
                name=cmd.name.strip(),
                quantity=cmd.quantity,
                unit=cmd.unit,
                category=cmd.category,
                source=cmd.source,
                notes=cmd.notes,
            )
        )
        await self._repo.save(shopping_list)
        return shopping_list


class UpdateShoppingListItem:
    def __init__(self, repo: AbstractShoppingRepository) -> None:
        self._repo = repo

    async def execute(self, cmd: UpdateListItemCommand) -> ShoppingList:
        shopping_list = await _load(self._repo, cmd.list_id, cmd.household_id)
        item = shopping_list.find_item(cmd.item_id)
        if item is None:
            raise NotFoundError("Shopping list item not found")
        if cmd.quantity is not None:
            item.quantity = cmd.quantity
        if cmd.unit is not None:
            item.unit = cmd.unit
        if cmd.category is not None:
            item.category = cmd.category
        if cmd.notes is not None:
            item.notes = cmd.notes
        await self._repo.save(shopping_list)
        return shopping_list


class ToggleItemPurchased:
    def __init__(self, repo: AbstractShoppingRepository) -> None:
        self._repo = repo

    async def execute(
        self, list_id: UUID, item_id: UUID, household_id: UUID
    ) -> ShoppingList:
        shopping_list = await _load(self._repo, list_id, household_id)
        item = shopping_list.find_item(item_id)
        if item is None:
            raise NotFoundError("Shopping list item not found")
        item.is_purchased = not item.is_purchased
        await self._repo.save(shopping_list)
        return shopping_list


class RemoveShoppingListItem:
    def __init__(self, repo: AbstractShoppingRepository) -> None:
        self._repo = repo

    async def execute(
        self, list_id: UUID, item_id: UUID, household_id: UUID
    ) -> ShoppingList:
        shopping_list = await _load(self._repo, list_id, household_id)
        if shopping_list.find_item(item_id) is None:
            raise NotFoundError("Shopping list item not found")
        shopping_list.remove_item(item_id)
        await self._repo.save(shopping_list)
        return shopping_list
