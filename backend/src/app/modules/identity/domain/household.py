import uuid
from dataclasses import dataclass

from app.shared.domain.entity import Entity


@dataclass(kw_only=True)
class Household(Entity):
    name: str
    owner_id: uuid.UUID
