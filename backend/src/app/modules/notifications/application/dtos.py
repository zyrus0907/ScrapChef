from dataclasses import dataclass
from datetime import date
from uuid import UUID


@dataclass(frozen=True)
class ExpiringItem:
    """Minimal pantry-item view the expiry scan needs."""

    item_id: UUID
    name: str
    expiry_date: date
    days_until_expiry: int
