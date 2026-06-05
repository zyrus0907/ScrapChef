from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.database.session import get_db_session
from app.modules.identity.api.routes import router as identity_router
from app.modules.pantry.api.routes import router as pantry_router
from app.modules.costs.api.routes import router as costs_router
from app.modules.recipes.api.routes import router as recipes_router

api_router = APIRouter()

api_router.include_router(identity_router, prefix="/auth", tags=["auth"])
api_router.include_router(pantry_router, prefix="/pantry", tags=["pantry"])
api_router.include_router(recipes_router, prefix="/recipes", tags=["recipes"])
api_router.include_router(costs_router, prefix="/costs", tags=["costs"])


@api_router.get("/db-health", tags=["meta"])
async def db_health(session: AsyncSession = Depends(get_db_session)) -> dict[str, str]:
    await session.execute(text("SELECT 1"))
    return {"database": "ok"}
