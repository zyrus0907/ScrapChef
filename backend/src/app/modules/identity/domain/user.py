import re
from dataclasses import dataclass

from app.shared.domain.entity import Entity
from app.shared.domain.value_object import ValueObject


@dataclass(frozen=True)
class Email(ValueObject):
    value: str

    def __post_init__(self) -> None:
        if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", self.value):
            raise ValueError(f"Invalid email address: {self.value}")

    def __str__(self) -> str:
        return self.value


@dataclass(kw_only=True)
class User(Entity):
    email: Email
    hashed_password: str
    display_name: str
    is_active: bool = True
