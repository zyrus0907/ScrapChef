from abc import ABC, abstractmethod
from uuid import UUID

from app.modules.notifications.domain.notification import Notification


class AbstractNotificationRepository(ABC):
    @abstractmethod
    async def add(self, notification: Notification) -> None: ...

    @abstractmethod
    async def list_for_household(
        self, household_id: UUID, unread_only: bool = False, limit: int = 50
    ) -> list[Notification]: ...

    @abstractmethod
    async def get(self, notification_id: UUID, household_id: UUID) -> Notification | None: ...

    @abstractmethod
    async def unread_count(self, household_id: UUID) -> int: ...

    @abstractmethod
    async def mark_read(self, notification_id: UUID, household_id: UUID) -> None: ...

    @abstractmethod
    async def mark_all_read(self, household_id: UUID) -> int: ...

    @abstractmethod
    async def exists_dedup_key(self, household_id: UUID, dedup_key: str) -> bool: ...


class AbstractNotificationSender(ABC):
    """Delivers a notification to an external channel (push/email/etc.).

    The DB record is the source of truth; senders are best-effort side-channels.
    A log-only stub ships now; push/email adapters slot in behind this port.
    """

    @property
    @abstractmethod
    def channel(self) -> str: ...

    @abstractmethod
    async def send(self, notification: Notification) -> None: ...
