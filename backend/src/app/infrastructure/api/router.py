from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.database.session import get_db_session

api_router = APIRouter()


@api_router.get("/db-health", tags=["meta"])
async def db_health(session: AsyncSession = Depends(get_db_session)) -> dict[str, str]:
    await session.execute(text("SELECT 1"))
    return {"database": "ok"}


# Feature module routers register below as they are built.
