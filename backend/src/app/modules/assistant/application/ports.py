from abc import ABC, abstractmethod

from app.modules.assistant.application.dtos import GeneratedRecipe, LeftoverChefRequest


class AbstractRecipeGenerator(ABC):
    """Port for any LLM (or fallback) that turns pantry items into recipes.

    Concrete adapters live in infrastructure/ — e.g. the Claude adapter or the
    offline stub. Use cases depend on this interface only, so swapping the
    provider is a one-line change in the factory.
    """

    @property
    @abstractmethod
    def provider(self) -> str:
        """Short identifier of the backing provider, e.g. 'claude' or 'stub'."""
        ...

    @abstractmethod
    async def generate(self, request: LeftoverChefRequest) -> list[GeneratedRecipe]: ...
