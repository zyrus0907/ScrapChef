from abc import ABC, abstractmethod
from typing import Optional

from app.modules.assistant.application.parsing_dtos import ParsedReceipt, ParsedRecipe


class AbstractReceiptParser(ABC):
    """Extracts line items + prices from a photo of a grocery receipt."""

    @property
    @abstractmethod
    def provider(self) -> str: ...

    @property
    @abstractmethod
    def available(self) -> bool:
        """True when the parser can actually read images (e.g. a key is set)."""
        ...

    @abstractmethod
    async def parse(self, image_bytes: bytes, mime_type: str) -> ParsedReceipt: ...


class AbstractRecipeParser(ABC):
    """Extracts a recipe's ingredients from an image or pasted text."""

    @property
    @abstractmethod
    def provider(self) -> str: ...

    @property
    @abstractmethod
    def available(self) -> bool: ...

    @abstractmethod
    async def parse(
        self,
        *,
        image_bytes: Optional[bytes] = None,
        mime_type: Optional[str] = None,
        text: Optional[str] = None,
    ) -> ParsedRecipe: ...
