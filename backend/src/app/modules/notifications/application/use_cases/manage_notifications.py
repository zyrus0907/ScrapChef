from uuid import UUID

from app.modules.notifications.application.ports import AbstractNotificationRepository
from app.modules.notifications.domain.notification import Notification


class ListNotifications:
    def __init__(self, repo: AbstractNotificationRepository) -> None:
        self._repo = repo

    async def execute(
        self, household_id: UUID, unread_only: bool = False, limit: int = 50
    ) -> list[Notification]:
        return await self._repo.list_for_household(household_id, unread_only, limit)


class CountUnread:
    def __init__(self, repo: AbstractNotificationRepository) -> None:
        self._repo = repo

    async def execute(self, household_id: UUID) -> int:
        return await self._repo.unread_count(household_id)


class MarkNotificationRead:
    def __init__(self, repo: AbstractNotificationRepository) -> None:
        self._repo = repo

    async def execute(self, notification_id: UUID, household_id: UUID) -> None:
        await self._repo.mark_read(notification_id, household_id)


class MarkAllRead:
    def __init__(self, repo: AbstractNotificationRepository) -> None:
        self._repo = repo

    async def execute(self, household_id: UUID) -> int:
        return await self._repo.mark_all_read(household_id)
