from app.modules.pantry.application.dtos import AddItemCommand
from app.modules.pantry.application.ports import AbstractPantryRepository
from app.modules.pantry.domain.pantry_item import PantryItem


class AddPantryItem:
    def __init__(self, repo: AbstractPantryRepository) -> None:
        self._repo = repo

    async def execute(self, cmd: AddItemCommand) -> PantryItem:
        item = PantryItem(
            household_id=cmd.household_id,
            added_by_user_id=cmd.added_by_user_id,
            name=cmd.name.strip(),
            quantity=cmd.quantity,
            unit=cmd.unit,
            category=cmd.category,
            barcode=cmd.barcode,
            expiry_date=cmd.expiry_date,
            purchase_price=cmd.purchase_price,
            purchase_date=cmd.purchase_date,
            # If not provided, treat original qty as purchased qty for cost tracking
            quantity_purchased=cmd.quantity_purchased or cmd.quantity,
            notes=cmd.notes,
        )
        await self._repo.save(item)
        return item
