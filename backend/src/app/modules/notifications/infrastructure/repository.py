from uuid import UUID

from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.notifications.application.ports import AbstractNotificationRepository
from app.modules.notifications.domain.notification import Notification, NotificationType
from app.modules.notifications.infrastructure.models import NotificationModel


class SqlNotificationRepository(AbstractNotificationRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def add(self, notification: Notification) -> None:
        self._session.add(
            NotificationModel(
                id=notification.id,
                household_id=notification.household_id,
                type=notification.type.value,
                title=notification.title,
                body=notification.body,
                related_item_id=notification.related_item_id,
                dedup_key=notification.dedup_key,
                is_read=notification.is_read,
                created_at=notification.created_at,
                updated_at=notification.updated_at,
            )
        )

    async def list_for_household(
        self, household_id: UUID, unread_only: bool = False, limit: int = 50
    ) -> list[Notification]:
        query = select(NotificationModel).where(
            NotificationModel.household_id == household_id
        )
        if unread_only:
            query = query.where(NotificationModel.is_read.is_(False))
        query = query.order_by(NotificationModel.created_at.desc()).limit(limit)
        result = await self._session.execute(query)
        return [self._to_domain(m) for m in result.scalars().all()]

    async def get(
        self, notification_id: UUID, household_id: UUID
    ) -> Notification | None:
        result = await self._session.execute(
            select(NotificationModel)
            .where(NotificationModel.id == notification_id)
            .where(NotificationModel.household_id == household_id)
        )
        model = result.scalar_one_or_none()
        return self._to_domain(model) if model else None

    async def unread_count(self, household_id: UUID) -> int:
        result = await self._session.execute(
            select(func.count())
            .select_from(NotificationModel)
            .where(NotificationModel.household_id == household_id)
            .where(NotificationModel.is_read.is_(False))
        )
        return int(result.scalar_one())

    async def mark_read(self, notification_id: UUID, household_id: UUID) -> None:
        await self._session.execute(
            update(NotificationModel)
            .where(NotificationModel.id == notification_id)
            .where(NotificationModel.household_id == household_id)
            .values(is_read=True)
        )

    async def mark_all_read(self, household_id: UUID) -> int:
        result = await self._session.execute(
            update(NotificationModel)
            .where(NotificationModel.household_id == household_id)
            .where(NotificationModel.is_read.is_(False))
            .values(is_read=True)
        )
        return result.rowcount or 0

    async def exists_dedup_key(self, household_id: UUID, dedup_key: str) -> bool:
        result = await self._session.execute(
            select(NotificationModel.id)
            .where(NotificationModel.household_id == household_id)
            .where(NotificationModel.dedup_key == dedup_key)
        )
        return result.scalar_one_or_none() is not None

    @staticmethod
    def _to_domain(model: NotificationModel) -> Notification:
        return Notification(
            id=model.id,
            household_id=model.household_id,
            type=NotificationType(model.type),
            title=model.title,
            body=model.body,
            related_item_id=model.related_item_id,
            dedup_key=model.dedup_key,
            is_read=model.is_read,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )
