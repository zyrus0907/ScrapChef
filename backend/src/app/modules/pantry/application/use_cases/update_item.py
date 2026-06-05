from datetime import datetime, timezone

from app.core.exceptions import NotFoundError
from app.modules.pantry.application.dtos import UpdateItemCommand
from app.modules.pantry.application.ports import AbstractPantryRepository
from app.modules.pantry.domain.pantry_item import PantryItem


class UpdatePantryItem:
    def __init__(self, repo: AbstractPantryRepository) -> None:
        self._repo = repo

    async def execute(self, cmd: UpdateItemCommand) -> PantryItem:
        item = await self._repo.get_by_id(cmd.item_id, cmd.household_id)
        if item is None:
            raise NotFoundError("Pantry item not found")

        if cmd.quantity is not None:
            item.quantity = cmd.quantity
        if cmd.unit is not None:
            item.unit = cmd.unit
        if cmd.category is not None:
            item.category = cmd.category
        if cmd.expiry_date is not None:
            item.expiry_date = cmd.expiry_date
        if cmd.opened_date is not None:
            item.opened_date = cmd.opened_date
        if cmd.purchase_price is not None:
            item.purchase_price = cmd.purchase_price
        if cmd.notes is not None:
            item.notes = cmd.notes
        item.updated_at = datetime.now(timezone.utc)

        await self._repo.save(item)
        return item
