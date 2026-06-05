from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.identity.application.ports import AbstractUserRepository
from app.modules.identity.domain.user import Email, User
from app.modules.identity.infrastructure.models import UserModel


class SqlUserRepository(AbstractUserRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_id(self, user_id: UUID) -> User | None:
        model = await self._session.get(UserModel, user_id)
        return self._to_domain(model) if model else None

    async def get_by_email(self, email: Email) -> User | None:
        result = await self._session.execute(
            select(UserModel).where(UserModel.email == str(email))
        )
        model = result.scalar_one_or_none()
        return self._to_domain(model) if model else None

    async def save(self, user: User) -> None:
        model = await self._session.get(UserModel, user.id)
        if model is None:
            self._session.add(
                UserModel(
                    id=user.id,
                    email=str(user.email),
                    hashed_password=user.hashed_password,
                    display_name=user.display_name,
                    is_active=user.is_active,
                    created_at=user.created_at,
                    updated_at=user.updated_at,
                )
            )
        else:
            model.email = str(user.email)
            model.hashed_password = user.hashed_password
            model.display_name = user.display_name
            model.is_active = user.is_active
            model.updated_at = user.updated_at

    async def exists_by_email(self, email: Email) -> bool:
        result = await self._session.execute(
            select(UserModel.id).where(UserModel.email == str(email))
        )
        return result.scalar_one_or_none() is not None

    @staticmethod
    def _to_domain(model: UserModel) -> User:
        return User(
            id=model.id,
            email=Email(model.email),
            hashed_password=model.hashed_password,
            display_name=model.display_name,
            is_active=model.is_active,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )
