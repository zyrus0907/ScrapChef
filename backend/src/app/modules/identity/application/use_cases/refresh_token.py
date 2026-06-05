from datetime import datetime, timedelta, timezone

from app.core.config import get_settings
from app.core.exceptions import UnauthorizedError
from app.core.security import create_access_token, generate_refresh_token, hash_token
from app.modules.identity.application.dtos import TokenPair
from app.modules.identity.application.ports import AbstractTokenRepository

settings = get_settings()


class RefreshAccessToken:
    def __init__(self, tokens: AbstractTokenRepository) -> None:
        self._tokens = tokens

    async def execute(self, raw_token: str) -> TokenPair:
        stored = await self._tokens.find(hash_token(raw_token))

        if stored is None:
            raise UnauthorizedError("Invalid refresh token")

        if stored.revoked:
            # Token reuse detected — compromise assumed, revoke entire family
            await self._tokens.revoke_family(stored.family_id)
            raise UnauthorizedError("Refresh token already used — please log in again")

        expires_at = stored.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at < datetime.now(timezone.utc):
            raise UnauthorizedError("Refresh token expired")

        # Rotate: revoke old token, issue new one in same family
        await self._tokens.revoke(hash_token(raw_token))
        new_refresh = generate_refresh_token()
        await self._tokens.store(
            user_id=stored.user_id,
            token_hash=hash_token(new_refresh),
            family_id=stored.family_id,
            expires_at=datetime.now(timezone.utc)
            + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        )

        return TokenPair(
            access_token=create_access_token(str(stored.user_id)),
            refresh_token=new_refresh,
        )
