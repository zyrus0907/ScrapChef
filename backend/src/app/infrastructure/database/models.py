"""Central import point for all ORM models.

Alembic imports this so Base.metadata is fully populated for autogenerate.
As each module adds models, import them here.
"""

from app.infrastructure.database.base import Base  # noqa: F401

# Added in later steps, e.g.:
# from app.modules.identity.infrastructure.models import UserModel  # noqa: F401
