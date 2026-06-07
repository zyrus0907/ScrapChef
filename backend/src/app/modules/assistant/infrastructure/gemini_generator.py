from app.core.logging import get_logger
from app.modules.assistant.application.dtos import GeneratedRecipe, LeftoverChefRequest
from app.modules.assistant.application.ports import AbstractRecipeGenerator
from app.modules.assistant.infrastructure.claude_generator import _to_recipe
from app.modules.assistant.infrastructure.gemini_client import GeminiClient
from app.modules.assistant.infrastructure.prompt import SYSTEM_PROMPT, build_user_prompt

log = get_logger("assistant.gemini_chef")

_JSON_SHAPE = (
    'Respond ONLY as JSON with this exact shape: {"recipes": [{"name": string, '
    '"description": string, "ingredients_used": [string], "additional_ingredients": '
    '[string], "steps": [string], "estimated_time_minutes": number, '
    '"uses_expiring_items": boolean}]}'
)


class GeminiRecipeGenerator(AbstractRecipeGenerator):
    """Leftover Chef backed by Gemini (free tier)."""

    def __init__(self, client: GeminiClient) -> None:
        self._client = client

    @property
    def provider(self) -> str:
        return "gemini"

    async def generate(self, request: LeftoverChefRequest) -> list[GeneratedRecipe]:
        prompt = f"{SYSTEM_PROMPT}\n\n{build_user_prompt(request)}\n\n{_JSON_SHAPE}"
        data = await self._client.generate_json(prompt)
        recipes = [_to_recipe(item) for item in data.get("recipes", [])]
        log.info("assistant.gemini_chef.generated", count=len(recipes))
        return recipes
