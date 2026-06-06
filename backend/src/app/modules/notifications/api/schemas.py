from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class NotificationResponse(BaseModel):
    id: UUID
    type: str
    title: str
    body: str
    related_item_id: Optional[UUID]
    is_read: bool
    created_at: datetime

    @classmethod
    def from_domain(cls, n) -> "NotificationResponse":
        return cls(
            id=n.id,
            type=n.type.value,
            title=n.title,
            body=n.body,
            related_item_id=n.related_item_id,
            is_read=n.is_read,
            created_at=n.created_at,
        )


class UnreadCountResponse(BaseModel):
    unread: int


class ScanResultResponse(BaseModel):
    created: int


class MarkAllReadResponse(BaseModel):
    marked_read: int
