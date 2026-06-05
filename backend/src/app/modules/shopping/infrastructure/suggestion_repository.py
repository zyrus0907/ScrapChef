from datetime import datetime, timedelta, timezone
from decimal import Decimal
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.pantry.infrastructure.models import PantryItemModel
from app.modules.shopping.application.dtos import RestockSuggestion
from app.modules.shopping.application.ports import AbstractRestockSuggester


class RestockSuggester(AbstractRestockSuggester):
    """Derives 'you've run out of X' suggestions from pantry history.

    An item is suggested when it was recently consumed or wasted but the
    household has no remaining *active* stock of the same name.
    """

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def suggest(
        self, household_id: UUID, within_days: int = 30
    ) -> list[RestockSuggestion]:
        m = PantryItemModel

        # Names still in stock — we never suggest rebuying these.
        active_rows = await self._session.execute(
            select(m.name)
            .where(m.household_id == household_id)
            .where(m.status == "active")
        )
        active_names = {name.strip().lower() for (name,) in active_rows.all()}

        cutoff = datetime.now(timezone.utc) - timedelta(days=within_days)
        used_rows = await self._session.execute(
            select(
                m.name,
                m.category,
                m.unit,
                m.quantity_purchased,
                m.quantity,
                m.updated_at,
            )
            .where(m.household_id == household_id)
            .where(m.status.in_(["consumed", "wasted"]))
            .where(m.updated_at >= cutoff)
            .order_by(m.updated_at.desc())
        )

        suggestions: list[RestockSuggestion] = []
        seen: set[str] = set()
        for name, category, unit, qty_purchased, quantity, _updated in used_rows.all():
            key = name.strip().lower()
            if key in active_names or key in seen:
                continue
            seen.add(key)
            suggested_qty = qty_purchased or quantity or Decimal("1")
            suggestions.append(
                RestockSuggestion(
                    name=name,
                    category=category,
                    unit=unit,
                    suggested_quantity=Decimal(str(suggested_qty)),
                    reason="ran_out",
                )
            )
        return suggestions
