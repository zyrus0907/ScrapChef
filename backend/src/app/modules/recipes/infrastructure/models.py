import uuid
from decimal import Decimal
from typing import Optional

from sqlalchemy import Boolean, ForeignKey, Integer, JSON, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.infrastructure.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class RecipeModel(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "recipes"

    name: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    instructions: Mapped[str] = mapped_column(Text, nullable=False, default="")
    prep_time_minutes: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    cook_time_minutes: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    servings: Mapped[int] = mapped_column(Integer, nullable=False, default=2)
    cuisine: Mapped[str] = mapped_column(String(60), nullable=False, default="other")
    tags: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    source: Mapped[str] = mapped_column(String(20), nullable=False, default="user")
    created_by_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    ingredients: Mapped[list["RecipeIngredientModel"]] = relationship(
        "RecipeIngredientModel",
        back_populates="recipe",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class RecipeIngredientModel(Base):
    __tablename__ = "recipe_ingredients"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    recipe_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("recipes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    quantity: Mapped[Decimal] = mapped_column(Numeric(10, 3), nullable=False)
    unit: Mapped[str] = mapped_column(String(30), nullable=False)
    is_optional: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    notes: Mapped[str] = mapped_column(Text, nullable=False, default="")

    recipe: Mapped["RecipeModel"] = relationship(
        "RecipeModel", back_populates="ingredients"
    )
