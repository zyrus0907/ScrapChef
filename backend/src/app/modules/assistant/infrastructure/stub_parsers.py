from typing import Optional

from app.modules.assistant.application.parsing_dtos import ParsedReceipt, ParsedRecipe
from app.modules.assistant.application.parsing_ports import (
    AbstractReceiptParser,
    AbstractRecipeParser,
)


class StubReceiptParser(AbstractReceiptParser):
    """Used when no Gemini key is set — can't read images, returns nothing."""

    @property
    def provider(self) -> str:
        return "stub"

    @property
    def available(self) -> bool:
        return False

    async def parse(self, image_bytes: bytes, mime_type: str) -> ParsedReceipt:
        return ParsedReceipt(provider="stub", store_name=None, lines=[])


class StubRecipeParser(AbstractRecipeParser):
    @property
    def provider(self) -> str:
        return "stub"

    @property
    def available(self) -> bool:
        return False

    async def parse(
        self,
        *,
        image_bytes: Optional[bytes] = None,
        mime_type: Optional[str] = None,
        text: Optional[str] = None,
    ) -> ParsedRecipe:
        return ParsedRecipe(provider="stub", title="Imported recipe", ingredients=[])
