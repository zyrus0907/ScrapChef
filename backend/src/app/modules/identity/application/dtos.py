from dataclasses import dataclass
from uuid import UUID


@dataclass(frozen=True)
class RegisterCommand:
    email: str
    password: str
    display_name: str


@dataclass(frozen=True)
class LoginCommand:
    email: str
    password: str


@dataclass(frozen=True)
class TokenPair:
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


@dataclass(frozen=True)
class AuthResult:
    user_id: UUID
    tokens: TokenPair
