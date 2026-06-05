from datetime import datetime
from uuid import UUID

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.identity.application.ports import AbstractTokenRepository, StoredToken
from app.modules.identity.infrastructure.models import RefreshTokenModel


class SqlTokenRepository(AbstractTokenRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def store(
        self, user_id: UUID, token_hash: str, family_id: UUID, expires_at: datetime
    ) -> None:
        self._session.add(
            RefreshTokenModel(
                user_id=user_id,
                token_hash=token_hash,
                family_id=family_id,
                expires_at=expires_at,
            )
        )

    async def find(self, token_hash: str) -> StoredToken | None:
        result = await self._session.execute(
            select(RefreshTokenModel).where(RefreshTokenModel.token_hash == token_hash)
        )
        model = result.scalar_one_or_none()
        if model is None:
            return None
        return StoredToken(
            user_id=model.user_id,
            family_id=model.family_id,
            expires_at=model.expires_at,
            revoked=model.revoked,
        )

    async def revoke(self, token_hash: str) -> None:
        await self._session.execute(
            update(RefreshTokenModel)
            .where(RefreshTokenModel.token_hash == token_hash)
            .values(revoked=True)
        )

    async def revoke_family(self, family_id: UUID) -> None:
        await self._session.execute(
            update(RefreshTokenModel)
            .where(RefreshTokenModel.family_id == family_id)
            .values(revoked=True)
        )
