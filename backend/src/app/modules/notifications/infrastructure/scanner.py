from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.identity.infrastructure.models import HouseholdModel
from app.modules.notifications.application.dtos import ExpiringItem
from app.modules.notifications.application.use_cases.scan_expiries import (
    ScanHouseholdExpiries,
)
from app.modules.notifications.infrastructure.log_sender import LogNotificationSender
from app.modules.notifications.infrastructure.repository import SqlNotificationRepository
from app.modules.pantry.infrastructure.repository import SqlPantryRepository


async def _expiring_items(
    session: AsyncSession, household_id: UUID, within_days: int
) -> list[ExpiringItem]:
    pantry = SqlPantryRepository(session)
    items = await pantry.get_expiring_soon(household_id, within_days)
    out: list[ExpiringItem] = []
    for it in items:
        if it.expiry_date is None or it.days_until_expiry is None:
            continue
        out.append(
            ExpiringItem(
                item_id=it.id,
                name=it.name,
                expiry_date=it.expiry_date,
                days_until_expiry=it.days_until_expiry,
            )
        )
    return out


async def scan_household(
    session: AsyncSession, household_id: UUID, within_days: int = 3
) -> int:
    """Scan a single household; returns the number of notifications created."""
    items = await _expiring_items(session, household_id, within_days)
    use_case = ScanHouseholdExpiries(
        SqlNotificationRepository(session), LogNotificationSender()
    )
    created = await use_case.execute(household_id, items)
    return len(created)


async def scan_all_households(session: AsyncSession, within_days: int = 3) -> int:
    """Scan every household; returns the total notifications created."""
    result = await session.execute(select(HouseholdModel.id))
    household_ids = [row[0] for row in result.all()]
    total = 0
    for hid in household_ids:
        total += await scan_household(session, hid, within_days)
    return total
