from decimal import Decimal, InvalidOperation
from typing import Optional

from app.core.logging import get_logger
from app.modules.assistant.application.parsing_dtos import (
    ParsedIngredient,
    ParsedReceipt,
    ParsedRecipe,
    ReceiptLine,
)
from app.modules.assistant.application.parsing_ports import (
    AbstractReceiptParser,
    AbstractRecipeParser,
)
from app.modules.assistant.infrastructure.gemini_client import GeminiClient

log = get_logger("assistant.gemini")

CATEGORIES = "Produce, Dairy, Meat, Frozen, Beverages, Snacks, Pantry, Other"

RECEIPT_PROMPT = (
    "You are reading a photo of a grocery store receipt. Extract every purchased "
    "food/grocery line item. Ignore totals, tax, discounts, loyalty lines, and "
    "non-grocery items. Respond ONLY as JSON with this shape:\n"
    '{"store_name": string|null, "items": [{"name": string, "quantity": number, '
    '"unit": string, "price": number|null, "category": string}]}\n'
    f"`price` is the line total paid in the receipt's currency. `category` must be one of: {CATEGORIES}. "
    "`unit` is a short unit like 'unit', 'kg', 'g', 'L', 'pack' (default 'unit'). "
    "Use clean, human-readable product names (expand obvious abbreviations)."
)

RECIPE_PROMPT = (
    "Extract the recipe's ingredient list. Respond ONLY as JSON with this shape:\n"
    '{"title": string, "ingredients": [{"name": string, "quantity": number|null, "unit": string|null}]}\n'
    "Use clean ingredient names (no amounts inside the name). Quantity is numeric if known."
)


def _dec(value, default: Optional[Decimal] = None) -> Optional[Decimal]:
    if value is None:
        return default
    try:
        return Decimal(str(value))
    except (InvalidOperation, ValueError, TypeError):
        return default


class GeminiReceiptParser(AbstractReceiptParser):
    def __init__(self, client: GeminiClient) -> None:
        self._client = client

    @property
    def provider(self) -> str:
        return "gemini"

    @property
    def available(self) -> bool:
        return True

    async def parse(self, image_bytes: bytes, mime_type: str) -> ParsedReceipt:
        data = await self._client.generate_json(RECEIPT_PROMPT, image_bytes, mime_type)
        lines: list[ReceiptLine] = []
        for item in data.get("items", []) or []:
            name = (item.get("name") or "").strip()
            if not name:
                continue
            lines.append(
                ReceiptLine(
                    name=name,
                    quantity=_dec(item.get("quantity"), Decimal("1")) or Decimal("1"),
                    unit=(item.get("unit") or "unit").strip() or "unit",
                    price=_dec(item.get("price")),
                    category=(item.get("category") or None),
                )
            )
        log.info("assistant.receipt.parsed", count=len(lines))
        return ParsedReceipt(
            provider="gemini", store_name=data.get("store_name"), lines=lines
        )


class GeminiRecipeParser(AbstractRecipeParser):
    def __init__(self, client: GeminiClient) -> None:
        self._client = client

    @property
    def provider(self) -> str:
        return "gemini"

    @property
    def available(self) -> bool:
        return True

    async def parse(
        self,
        *,
        image_bytes: Optional[bytes] = None,
        mime_type: Optional[str] = None,
        text: Optional[str] = None,
    ) -> ParsedRecipe:
        prompt = RECIPE_PROMPT
        if text:
            prompt = f"{RECIPE_PROMPT}\n\nRecipe:\n{text}"
        data = await self._client.generate_json(prompt, image_bytes, mime_type)
        ingredients: list[ParsedIngredient] = []
        for ing in data.get("ingredients", []) or []:
            name = (ing.get("name") or "").strip()
            if not name:
                continue
            ingredients.append(
                ParsedIngredient(
                    name=name,
                    quantity=_dec(ing.get("quantity")),
                    unit=(ing.get("unit") or None),
                )
            )
        return ParsedRecipe(
            provider="gemini",
            title=(data.get("title") or "Imported recipe").strip(),
            ingredients=ingredients,
        )
