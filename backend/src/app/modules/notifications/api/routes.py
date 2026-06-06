from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.infrastructure.database.session import get_db_session
from app.modules.identity.infrastructure.models import HouseholdModel
from app.modules.notifications.api.schemas import (
    MarkAllReadResponse,
    NotificationResponse,
    ScanResultResponse,
    UnreadCountResponse,
)
from app.modules.notifications.application.use_cases.manage_notifications import (
    CountUnread,
    ListNotifications,
    MarkAllRead,
    MarkNotificationRead,
)
from app.modules.notifications.infrastructure.repository import (
    SqlNotificationRepository,
)
from app.modules.notifications.infrastructure.scanner import scan_household
from app.modules.pantry.api.deps import get_current_household

router = APIRouter()


def _repo(session: AsyncSession) -> SqlNotificationRepository:
    return SqlNotificationRepository(session)


@router.get("", response_model=list[NotificationResponse])
async def list_notifications(
    unread_only: bool = Query(default=False),
    limit: int = Query(default=50, ge=1, le=200),
    household: HouseholdModel = Depends(get_current_household),
    session: AsyncSession = Depends(get_db_session),
) -> list[NotificationResponse]:
    items = await ListNotifications(_repo(session)).execute(
        household.id, unread_only=unread_only, limit=limit
    )
    return [NotificationResponse.from_domain(n) for n in items]


@router.get("/unread-count", response_model=UnreadCountResponse)
async def unread_count(
    household: HouseholdModel = Depends(get_current_household),
    session: AsyncSession = Depends(get_db_session),
) -> UnreadCountResponse:
    count = await CountUnread(_repo(session)).execute(household.id)
    return UnreadCountResponse(unread=count)


@router.post("/read-all", response_model=MarkAllReadResponse)
async def mark_all_read(
    household: HouseholdModel = Depends(get_current_household),
    session: AsyncSession = Depends(get_db_session),
) -> MarkAllReadResponse:
    n = await MarkAllRead(_repo(session)).execute(household.id)
    return MarkAllReadResponse(marked_read=n)


@router.post("/scan", response_model=ScanResultResponse)
async def scan_now(
    household: HouseholdModel = Depends(get_current_household),
    session: AsyncSession = Depends(get_db_session),
) -> ScanResultResponse:
    """Manually trigger an expiry scan for the current household (also runs on a daily schedule)."""
    created = await scan_household(
        session, household.id, get_settings().EXPIRY_SCAN_WITHIN_DAYS
    )
    return ScanResultResponse(created=created)


@router.post("/{notification_id}/read", status_code=204)
async def mark_read(
    notification_id: UUID,
    household: HouseholdModel = Depends(get_current_household),
    session: AsyncSession = Depends(get_db_session),
) -> None:
    await MarkNotificationRead(_repo(session)).execute(notification_id, household.id)
