from app.core.exceptions import DomainError
from app.modules.assistant.application.dtos import GeneratedRecipe, LeftoverChefRequest
from app.modules.assistant.application.ports import AbstractRecipeGenerator


class EmptyPantryError(DomainError):
    status_code = 422
    code = "empty_pantry"


class SuggestLeftoverRecipes:
    """Leftover Chef: suggest recipes from what the household already owns."""

    def __init__(self, generator: AbstractRecipeGenerator) -> None:
        self._generator = generator

    async def execute(self, request: LeftoverChefRequest) -> list[GeneratedRecipe]:
        if not request.ingredients:
            raise EmptyPantryError(
                "Add some pantry items before asking Leftover Chef for ideas."
            )
        return await self._generator.generate(request)
