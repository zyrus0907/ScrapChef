from app.core.logging import get_logger
from app.modules.notifications.application.ports import AbstractNotificationSender
from app.modules.notifications.domain.notification import Notification

log = get_logger("notifications.sender")


class LogNotificationSender(AbstractNotificationSender):
    """Default best-effort sender: logs the notification.

    The DB record is the source of truth; this is the seam where a push (Expo /
    APNs / FCM) or email adapter slots in later without touching the use cases.
    """

    @property
    def channel(self) -> str:
        return "log"

    async def send(self, notification: Notification) -> None:
        log.info(
            "notification.dispatch",
            channel=self.channel,
            household_id=str(notification.household_id),
            type=notification.type.value,
            title=notification.title,
        )
