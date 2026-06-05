import uuid
from datetime import date
from decimal import Decimal
from typing import Optional

from sqlalchemy import Date, ForeignKey, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.infrastructure.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class PantryItemModel(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "pantry_items"

    household_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("households.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    added_by_user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # Core inventory fields
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    quantity: Mapped[Decimal] = mapped_column(Numeric(10, 3), nullable=False)
    unit: Mapped[str] = mapped_column(String(30), nullable=False)
    category: Mapped[str] = mapped_column(String(60), nullable=False, default="uncategorised")
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="active", index=True)

    # Identification
    barcode: Mapped[Optional[str]] = mapped_column(String(50), nullable=True, index=True)

    # Expiry tracking
    expiry_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True, index=True)
    opened_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)

    # Cost tracking (Phase 1 — powers savings dashboard)
    purchase_price: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2), nullable=True)
    purchase_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    quantity_purchased: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 3), nullable=True)

    notes: Mapped[str] = mapped_column(Text, nullable=False, default="")

    household: Mapped["HouseholdModel"] = relationship(  # type: ignore[name-defined]
        "HouseholdModel", back_populates="pantry_items"
    )
