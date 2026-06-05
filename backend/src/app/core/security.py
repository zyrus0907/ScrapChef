import secrets
from datetime import datetime, timedelta, timezone
from hashlib import sha256

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import get_settings

settings = get_settings()

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain: str) -> str:
    return _pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    return _pwd_context.verify(plain, hashed)


def create_access_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    return jwt.encode(
        {"sub": user_id, "exp": expire, "type": "access"},
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM,
    )


def decode_access_token(token: str) -> str:
    """Returns user_id string or raises JWTError."""
    payload = jwt.decode(
        token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM]
    )
    if payload.get("type") != "access":
        raise JWTError("Not an access token")
    return str(payload["sub"])


def generate_refresh_token() -> str:
    return secrets.token_urlsafe(64)


def hash_token(token: str) -> str:
    return sha256(token.encode()).hexdigest()
