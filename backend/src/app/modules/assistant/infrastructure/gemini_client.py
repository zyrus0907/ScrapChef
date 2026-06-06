import json
from typing import Optional

import anyio


class GeminiClient:
    """Thin async wrapper over the (synchronous) google-genai SDK."""

    def __init__(self, api_key: str, model: str) -> None:
        # Imported lazily by the factory; safe to import here.
        from google import genai

        self._client = genai.Client(api_key=api_key)
        self._model = model

    async def generate_json(
        self,
        prompt: str,
        image_bytes: Optional[bytes] = None,
        mime_type: Optional[str] = None,
    ) -> dict:
        from google.genai import types

        parts: list = []
        if image_bytes is not None:
            parts.append(
                types.Part.from_bytes(data=image_bytes, mime_type=mime_type or "image/jpeg")
            )
        parts.append(prompt)

        def _run() -> str:
            resp = self._client.models.generate_content(
                model=self._model,
                contents=parts,
                config=types.GenerateContentConfig(response_mime_type="application/json"),
            )
            return resp.text or "{}"

        text = await anyio.to_thread.run_sync(_run)
        return _loads(text)


def _loads(text: str) -> dict:
    text = text.strip()
    # Tolerate accidental markdown code fences.
    if text.startswith("```"):
        text = text.strip("`")
        if text.startswith("json"):
            text = text[4:]
    try:
        data = json.loads(text)
        return data if isinstance(data, dict) else {}
    except (ValueError, TypeError):
        return {}
