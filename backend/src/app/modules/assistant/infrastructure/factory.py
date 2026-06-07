from app.core.config import get_settings
from app.modules.assistant.application.ports import AbstractRecipeGenerator
from app.modules.assistant.infrastructure.stub_generator import StubRecipeGenerator


def build_recipe_generator() -> AbstractRecipeGenerator:
    """Pick the recipe generator based on configuration.

    Uses Claude when the provider is set to ``claude`` and an API key is present;
    otherwise falls back to the offline stub so the feature never hard-fails.
    """
    settings = get_settings()

    # Prefer Gemini when a key is present (free tier) — same key that powers
    # receipt/recipe parsing.
    if settings.GEMINI_API_KEY:
        from app.modules.assistant.infrastructure.gemini_client import GeminiClient
        from app.modules.assistant.infrastructure.gemini_generator import (
            GeminiRecipeGenerator,
        )

        return GeminiRecipeGenerator(
            GeminiClient(api_key=settings.GEMINI_API_KEY, model=settings.GEMINI_MODEL)
        )

    if settings.LLM_PROVIDER == "claude" and settings.LLM_API_KEY:
        # Imported here so a missing `anthropic` install can't break startup.
        from app.modules.assistant.infrastructure.claude_generator import (
            ClaudeRecipeGenerator,
        )

        return ClaudeRecipeGenerator(
            api_key=settings.LLM_API_KEY, model=settings.LLM_MODEL
        )

    return StubRecipeGenerator()
