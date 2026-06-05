import uuid
from datetime import datetime, timedelta, timezone

from app.core.config import get_settings
from app.core.exceptions import UnauthorizedError
from app.core.security import (
    create_access_token,
    generate_refresh_token,
    hash_token,
    verify_password,
)
from app.modules.identity.application.dtos import AuthResult, LoginCommand, TokenPair
from app.modules.identity.application.ports import AbstractTokenRepository, AbstractUserRepository
from app.modules.identity.domain.user import Email

settings = get_settings()


class LoginUser:
    def __init__(
        self, users: AbstractUserRepository, tokens: AbstractTokenRepository
    ) -> None:
        self._users = users
        self._tokens = tokens

    async def execute(self, cmd: LoginCommand) -> AuthResult:
        email = Email(cmd.email.lower().strip())
        user = await self._users.get_by_email(email)

        # Constant-time check — never reveal whether the email exists
        if not user or not verify_password(cmd.password, user.hashed_password):
            raise UnauthorizedError("Invalid email or password")
        if not user.is_active:
            raise UnauthorizedError("Account is inactive")

        refresh_token = generate_refresh_token()
        await self._tokens.store(
            user_id=user.id,
            token_hash=hash_token(refresh_token),
            family_id=uuid.uuid4(),
            expires_at=datetime.now(timezone.utc)
            + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        )

        return AuthResult(
            user_id=user.id,
            tokens=TokenPair(
                access_token=create_access_token(str(user.id)),
                refresh_token=refresh_token,
            ),
        )
