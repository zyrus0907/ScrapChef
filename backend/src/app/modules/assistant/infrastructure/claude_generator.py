import json

from app.core.logging import get_logger
from app.modules.assistant.application.dtos import GeneratedRecipe, LeftoverChefRequest
from app.modules.assistant.application.ports import AbstractRecipeGenerator
from app.modules.assistant.infrastructure.prompt import (
    RECIPE_SCHEMA,
    SYSTEM_PROMPT,
    build_user_prompt,
)

log = get_logger("assistant.claude")


class ClaudeRecipeGenerator(AbstractRecipeGenerator):
    """Recipe generator backed by Anthropic's Claude via structured outputs."""

    def __init__(self, api_key: str, model: str = "claude-opus-4-8") -> None:
        # Imported lazily so the module loads even if `anthropic` isn't installed
        # (e.g. in environments that only run the offline stub).
        from anthropic import AsyncAnthropic

        self._client = AsyncAnthropic(api_key=api_key)
        self._model = model

    @property
    def provider(self) -> str:
        return "claude"

    async def generate(self, request: LeftoverChefRequest) -> list[GeneratedRecipe]:
        response = await self._client.messages.create(
            model=self._model,
            max_tokens=8000,
            thinking={"type": "adaptive"},
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": build_user_prompt(request)}],
            output_config={"format": {"type": "json_schema", "schema": RECIPE_SCHEMA}},
        )

        # With output_config.format the first text block is schema-valid JSON.
        text = next((b.text for b in response.content if b.type == "text"), None)
        if text is None:
            log.warning("assistant.claude.no_text", stop_reason=response.stop_reason)
            return []

        data = json.loads(text)
        return [_to_recipe(item) for item in data.get("recipes", [])]


def _to_recipe(item: dict) -> GeneratedRecipe:
    return GeneratedRecipe(
        name=item["name"],
        description=item["description"],
        ingredients_used=list(item.get("ingredients_used", [])),
        additional_ingredients=list(item.get("additional_ingredients", [])),
        steps=list(item.get("steps", [])),
        estimated_time_minutes=int(item.get("estimated_time_minutes", 0)),
        uses_expiring_items=bool(item.get("uses_expiring_items", False)),
    )
