from typing import Optional

from app.modules.assistant.application.parsing_dtos import ParsedReceipt, ParsedRecipe
from app.modules.assistant.application.parsing_ports import (
    AbstractReceiptParser,
    AbstractRecipeParser,
)


class ParseReceipt:
    def __init__(self, parser: AbstractReceiptParser) -> None:
        self._parser = parser

    async def execute(self, image_bytes: bytes, mime_type: str) -> ParsedReceipt:
        if not self._parser.available:
            return ParsedReceipt(provider=self._parser.provider, store_name=None, lines=[])
        return await self._parser.parse(image_bytes, mime_type)


class ParseRecipe:
    def __init__(self, parser: AbstractRecipeParser) -> None:
        self._parser = parser

    async def execute(
        self,
        *,
        image_bytes: Optional[bytes] = None,
        mime_type: Optional[str] = None,
        text: Optional[str] = None,
    ) -> ParsedRecipe:
        if not self._parser.available:
            return ParsedRecipe(
                provider=self._parser.provider, title="Imported recipe", ingredients=[]
            )
        return await self._parser.parse(
            image_bytes=image_bytes, mime_type=mime_type, text=text
        )
