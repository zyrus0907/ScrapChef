import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.infrastructure.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class UserModel(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    display_name: Mapped[str] = mapped_column(String(100), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    households: Mapped[list["HouseholdModel"]] = relationship(
        "HouseholdModel",
        back_populates="owner",
        foreign_keys="HouseholdModel.owner_id",
    )
    memberships: Mapped[list["HouseholdMemberModel"]] = relationship(
        "HouseholdMemberModel", back_populates="user"
    )


class HouseholdModel(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "households"

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    owner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    owner: Mapped["UserModel"] = relationship(
        "UserModel", back_populates="households", foreign_keys=[owner_id]
    )
    members: Mapped[list["HouseholdMemberModel"]] = relationship(
        "HouseholdMemberModel", back_populates="household"
    )
    pantry_items: Mapped[list["PantryItemModel"]] = relationship(  # type: ignore[name-defined]
        "PantryItemModel", back_populates="household"
    )


class HouseholdMemberModel(Base):
    __tablename__ = "household_members"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    )
    household_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("households.id", ondelete="CASCADE"),
        primary_key=True,
    )
    role: Mapped[str] = mapped_column(String(20), nullable=False, default="member")
    joined_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    user: Mapped["UserModel"] = relationship("UserModel", back_populates="memberships")
    household: Mapped["HouseholdModel"] = relationship(
        "HouseholdModel", back_populates="members"
    )


class RefreshTokenModel(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "refresh_tokens"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    token_hash: Mapped[str] = mapped_column(
        String(64), unique=True, nullable=False, index=True
    )
    family_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), nullable=False, index=True
    )
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    revoked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Many-to-one to the owning user. Without this relationship SQLAlchemy's
    # unit of work doesn't know a refresh_token insert must follow its user,
    # and can emit them in the wrong order (FK violation on register/login).
    user: Mapped["UserModel"] = relationship("UserModel")
