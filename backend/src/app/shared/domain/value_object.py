from dataclasses import dataclass


@dataclass(frozen=True)
class ValueObject:
    """Base for value objects. Frozen → immutable, equality by value."""