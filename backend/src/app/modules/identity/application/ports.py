from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime
from uuid import UUID

from app.modules.identity.domain.household import Household
from app.modules.identity.domain.user import Email, User


class AbstractUserRepository(ABC):
    @abstractmethod
    async def get_by_id(self, user_id: UUID) -> User | None: ...

    @abstractmethod
    async def get_by_email(self, email: Email) -> User | None: ...

    @abstractmethod
    async def save(self, user: User) -> None: ...

    @abstractmethod
    async def exists_by_email(self, email: Email) -> bool: ...


@dataclass
class StoredToken:
    user_id: UUID
    family_id: UUID
    expires_at: datetime
    revoked: bool


class AbstractTokenRepository(ABC):
    @abstractmethod
    async def store(
        self, user_id: UUID, token_hash: str, family_id: UUID, expires_at: datetime
    ) -> None: ...

    @abstractmethod
    async def find(self, token_hash: str) -> StoredToken | None: ...

    @abstractmethod
    async def revoke(self, token_hash: str) -> None: ...

    @abstractmethod
    async def revoke_family(self, family_id: UUID) -> None: ...


class AbstractHouseholdRepository(ABC):
    @abstractmethod
    async def save(self, household: Household) -> None: ...

    @abstractmethod
    async def get_by_owner(self, owner_id: UUID) -> Household | None: ...
