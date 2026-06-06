from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.core.config import get_settings
from app.core.logging import configure_logging, get_logger
from app.infrastructure.api.error_handlers import register_exception_handlers
from app.infrastructure.api.router import api_router
from app.modules.notifications.infrastructure.scheduler import (
    shutdown_scheduler,
    start_scheduler,
)

settings = get_settings()
log = get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    configure_logging(settings.DEBUG)
    log.info("app.startup", env=settings.ENVIRONMENT)
    start_scheduler()
    yield
    shutdown_scheduler()
    log.info("app.shutdown")


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        version="0.1.0",
        debug=settings.DEBUG,
        lifespan=lifespan,
        docs_url="/docs",
        openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
    )

    register_exception_handlers(app)

    @app.get("/health", tags=["meta"])
    async def health() -> dict[str, str]:
        return {"status": "ok", "env": settings.ENVIRONMENT}

    app.include_router(api_router, prefix=settings.API_V1_PREFIX)
    return app


app = create_app()
