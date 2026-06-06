from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from app.core.config import get_settings
from app.core.logging import get_logger
from app.infrastructure.database.session import AsyncSessionFactory
from app.modules.notifications.infrastructure.scanner import scan_all_households

log = get_logger("notifications.scheduler")

_scheduler: AsyncIOScheduler | None = None


async def _run_daily_scan() -> None:
    settings = get_settings()
    async with AsyncSessionFactory() as session:
        try:
            total = await scan_all_households(session, settings.EXPIRY_SCAN_WITHIN_DAYS)
            await session.commit()
            log.info("notifications.scheduler.scan_done", created=total)
        except Exception:  # noqa: BLE001 - log and let the scheduler keep running
            await session.rollback()
            log.exception("notifications.scheduler.scan_failed")


def start_scheduler() -> None:
    """Start the background scheduler (called from the app lifespan)."""
    global _scheduler
    settings = get_settings()
    if not settings.ENABLE_SCHEDULER:
        log.info("notifications.scheduler.disabled")
        return
    if _scheduler is not None:
        return

    _scheduler = AsyncIOScheduler(timezone="UTC")
    _scheduler.add_job(
        _run_daily_scan,
        CronTrigger(hour=settings.EXPIRY_SCAN_HOUR_UTC, minute=0),
        id="daily_expiry_scan",
        replace_existing=True,
    )
    _scheduler.start()
    log.info(
        "notifications.scheduler.started",
        hour_utc=settings.EXPIRY_SCAN_HOUR_UTC,
        within_days=settings.EXPIRY_SCAN_WITHIN_DAYS,
    )


def shutdown_scheduler() -> None:
    global _scheduler
    if _scheduler is not None:
        _scheduler.shutdown(wait=False)
        _scheduler = None
        log.info("notifications.scheduler.stopped")
