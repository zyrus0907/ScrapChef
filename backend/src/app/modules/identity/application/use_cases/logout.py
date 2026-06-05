from app.core.security import hash_token
from app.modules.identity.application.ports import AbstractTokenRepository


class LogoutUser:
    def __init__(self, tokens: AbstractTokenRepository) -> None:
        self._tokens = tokens

    async def execute(self, raw_token: str) -> None:
        await self._tokens.revoke(hash_token(raw_token))
