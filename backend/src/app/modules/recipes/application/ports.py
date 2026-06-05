from abc import ABC, abstractmethod
from uuid import UUID

from app.modules.recipes.domain.recipe import Recipe


class AbstractRecipeRepository(ABC):
    @abstractmethod
    async def get_by_id(self, recipe_id: UUID) -> Recipe | None: ...

    @abstractmethod
    async def get_all(self) -> list[Recipe]: ...

    @abstractmethod
    async def save(self, recipe: Recipe) -> None: ...

    @abstractmethod
    async def delete(self, recipe_id: UUID) -> None: ...
