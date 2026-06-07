from datetime import datetime, timezone
from uuid import UUID

from app.core.exceptions import NotFoundError, UnauthorizedError
from app.core.security import hash_password, verify_password
from app.modules.identity.application.ports import AbstractUserRepository
from app.modules.identity.domain.user import User


class UpdateProfile:
    def __init__(self, users: AbstractUserRepository) -> None:
        self._users = users

    async def execute(self, user_id: UUID, display_name: str) -> User:
        user = await self._users.get_by_id(user_id)
        if user is None:
            raise NotFoundError("User not found")
        user.display_name = display_name.strip()
        user.updated_at = datetime.now(timezone.utc)
        await self._users.save(user)
        return user


class ChangePassword:
    def __init__(self, users: AbstractUserRepository) -> None:
        self._users = users

    async def execute(self, user_id: UUID, current_password: str, new_password: str) -> None:
        user = await self._users.get_by_id(user_id)
        if user is None:
            raise NotFoundError("User not found")
        if not verify_password(current_password, user.hashed_password):
            raise UnauthorizedError("Current password is incorrect")
        user.hashed_password = hash_password(new_password)
        user.updated_at = datetime.now(timezone.utc)
        await self._users.save(user)
