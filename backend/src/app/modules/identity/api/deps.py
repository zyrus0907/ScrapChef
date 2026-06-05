from uuid import UUID

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import UnauthorizedError
from app.core.security import decode_access_token
from app.infrastructure.database.session import get_db_session
from app.modules.identity.infrastructure.models import UserModel

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: AsyncSession = Depends(get_db_session),
) -> UserModel:
    try:
        user_id = decode_access_token(token)
    except JWTError:
        raise UnauthorizedError("Invalid or expired access token")
    user = await session.get(UserModel, UUID(user_id))
    if not user or not user.is_active:
        raise UnauthorizedError("User not found or inactive")
    return user
