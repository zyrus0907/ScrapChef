import uuid
from dataclasses import dataclass
from enum import Enum
from typing import Optional

from app.shared.domain.entity import Entity


class NotificationType(str, Enum):
    EXPIRING_SOON = "expiring_soon"
    EXPIRED = "expired"
    GENERAL = "general"


@dataclass(kw_only=True)
class Notification(Entity):
    household_id: uuid.UUID
    type: NotificationType = NotificationType.GENERAL
    title: str
    body: str = ""
    # Optional link back to the pantry item that triggered this notification.
    related_item_id: Optional[uuid.UUID] = None
    # Stable key used to avoid creating duplicate notifications for the same
    # underlying event (e.g. one "expiring" alert per item per expiry date).
    dedup_key: Optional[str] = None
    is_read: bool = False

    def mark_read(self) -> None:
        self.is_read = True
