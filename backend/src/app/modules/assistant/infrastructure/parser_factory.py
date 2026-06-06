from app.core.config import get_settings
from app.modules.assistant.application.parsing_ports import (
    AbstractReceiptParser,
    AbstractRecipeParser,
)
from app.modules.assistant.infrastructure.stub_parsers import (
    StubReceiptParser,
    StubRecipeParser,
)


def _gemini_client():
    settings = get_settings()
    # Imported here so a missing google-genai install can't break startup.
    from app.modules.assistant.infrastructure.gemini_client import GeminiClient

    return GeminiClient(api_key=settings.GEMINI_API_KEY, model=settings.GEMINI_MODEL)


def build_receipt_parser() -> AbstractReceiptParser:
    if get_settings().GEMINI_API_KEY:
        from app.modules.assistant.infrastructure.gemini_parsers import GeminiReceiptParser

        return GeminiReceiptParser(_gemini_client())
    return StubReceiptParser()


def build_recipe_parser() -> AbstractRecipeParser:
    if get_settings().GEMINI_API_KEY:
        from app.modules.assistant.infrastructure.gemini_parsers import GeminiRecipeParser

        return GeminiRecipeParser(_gemini_client())
    return StubRecipeParser()
