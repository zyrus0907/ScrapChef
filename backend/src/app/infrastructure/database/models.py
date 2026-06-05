"""Central import point for all ORM models.

Alembic imports this so Base.metadata is fully populated for autogenerate.
Add every new module's models here.
"""

from app.infrastructure.database.base import Base  # noqa: F401
from app.modules.identity.infrastructure.models import (  # noqa: F401
    HouseholdMemberModel,
    HouseholdModel,
    RefreshTokenModel,
    UserModel,
)
from app.modules.pantry.infrastructure.models import PantryItemModel  # noqa: F401
from app.modules.recipes.infrastructure.models import (  # noqa: F401
    RecipeIngredientModel,
    RecipeModel,
)
