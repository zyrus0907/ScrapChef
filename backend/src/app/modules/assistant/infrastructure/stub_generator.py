from app.modules.assistant.application.dtos import GeneratedRecipe, LeftoverChefRequest
from app.modules.assistant.application.ports import AbstractRecipeGenerator


class StubRecipeGenerator(AbstractRecipeGenerator):
    """Offline fallback used when no LLM API key is configured.

    It can't truly "invent" recipes, but it returns a sensible, deterministic
    suggestion built from the actual pantry items so the endpoint stays usable
    (and the front-end testable) before a real key is added.
    """

    @property
    def provider(self) -> str:
        return "stub"

    async def generate(self, request: LeftoverChefRequest) -> list[GeneratedRecipe]:
        # Surface expiring items first — that's the whole point of Leftover Chef.
        ordered = sorted(
            request.ingredients,
            key=lambda i: (
                i.days_until_expiry if i.days_until_expiry is not None else 9999
            ),
        )
        names = [i.name for i in ordered]
        uses_expiring = any(i.is_expiring for i in ordered)

        headline = names[0] if names else "pantry"
        recipe = GeneratedRecipe(
            name=f"Simple {headline} skillet",
            description=(
                "A quick, no-frills skillet that uses up what you already have. "
                "Connect an AI provider (set LLM_API_KEY) for tailored recipes."
            ),
            ingredients_used=names,
            additional_ingredients=["olive oil", "salt", "pepper"],
            steps=[
                "Heat a little oil in a pan over medium heat.",
                f"Add your ingredients, starting with: {', '.join(names[:5]) or 'what you have'}.",
                "Cook until tender, season with salt and pepper, and serve.",
            ],
            estimated_time_minutes=20,
            uses_expiring_items=uses_expiring,
        )
        return [recipe][: max(1, request.max_recipes)]
