import uuid
from datetime import datetime, timedelta, timezone

from app.core.config import get_settings
from app.core.exceptions import ConflictError
from app.core.security import (
    create_access_token,
    generate_refresh_token,
    hash_password,
    hash_token,
)
from app.modules.identity.application.dtos import AuthResult, RegisterCommand, TokenPair
from app.modules.identity.application.ports import AbstractTokenRepository, AbstractUserRepository
from app.modules.identity.domain.user import Email, User

settings = get_settings()


class RegisterUser:
    def __init__(
        self, users: AbstractUserRepository, tokens: AbstractTokenRepository
    ) -> None:
        self._users = users
        self._tokens = tokens

    async def execute(self, cmd: RegisterCommand) -> AuthResult:
        email = Email(cmd.email.lower().strip())

        if await self._users.exists_by_email(email):
            raise ConflictError("Email already registered")

        user = User(
            email=email,
            hashed_password=hash_password(cmd.password),
            display_name=cmd.display_name.strip(),
        )
        await self._users.save(user)

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
