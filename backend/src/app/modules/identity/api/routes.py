from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.database.session import get_db_session
from app.modules.identity.api.deps import get_current_user
from app.modules.identity.api.schemas import (
    LoginRequest,
    LogoutRequest,
    MeResponse,
    RefreshRequest,
    RegisterRequest,
    TokenResponse,
)
from app.modules.identity.application.dtos import LoginCommand, RegisterCommand
from app.modules.identity.application.use_cases.login import LoginUser
from app.modules.identity.application.use_cases.logout import LogoutUser
from app.modules.identity.application.use_cases.refresh_token import RefreshAccessToken
from app.modules.identity.application.use_cases.register import RegisterUser
from app.modules.identity.infrastructure.models import UserModel
from app.modules.identity.infrastructure.household_repository import SqlHouseholdRepository
from app.modules.identity.infrastructure.token_repository import SqlTokenRepository
from app.modules.identity.infrastructure.user_repository import SqlUserRepository

router = APIRouter()


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(
    body: RegisterRequest,
    session: AsyncSession = Depends(get_db_session),
) -> TokenResponse:
    result = await RegisterUser(
        SqlUserRepository(session),
        SqlTokenRepository(session),
        SqlHouseholdRepository(session),
    ).execute(
        RegisterCommand(
            email=body.email,
            password=body.password,
            display_name=body.display_name,
        )
    )
    t = result.tokens
    return TokenResponse(
        access_token=t.access_token,
        refresh_token=t.refresh_token,
        token_type=t.token_type,
    )


@router.post("/login", response_model=TokenResponse)
async def login(
    body: LoginRequest,
    session: AsyncSession = Depends(get_db_session),
) -> TokenResponse:
    result = await LoginUser(
        SqlUserRepository(session), SqlTokenRepository(session)
    ).execute(LoginCommand(email=body.email, password=body.password))
    t = result.tokens
    return TokenResponse(
        access_token=t.access_token,
        refresh_token=t.refresh_token,
        token_type=t.token_type,
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh(
    body: RefreshRequest,
    session: AsyncSession = Depends(get_db_session),
) -> TokenResponse:
    pair = await RefreshAccessToken(SqlTokenRepository(session)).execute(
        body.refresh_token
    )
    return TokenResponse(
        access_token=pair.access_token,
        refresh_token=pair.refresh_token,
        token_type=pair.token_type,
    )


@router.post("/logout", status_code=204)
async def logout(
    body: LogoutRequest,
    session: AsyncSession = Depends(get_db_session),
) -> None:
    await LogoutUser(SqlTokenRepository(session)).execute(body.refresh_token)


@router.get("/me", response_model=MeResponse)
async def me(current_user: UserModel = Depends(get_current_user)) -> MeResponse:
    return MeResponse(
        id=current_user.id,
        email=current_user.email,
        display_name=current_user.display_name,
        is_active=current_user.is_active,
    )
