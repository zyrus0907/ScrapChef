from app.modules.assistant.application.dtos import LeftoverChefRequest

SYSTEM_PROMPT = (
    "You are Leftover Chef, a practical home-cooking assistant whose mission is to "
    "reduce food waste. Given the ingredients a household already has, you propose "
    "realistic recipes that use up what they own — especially items close to expiry. "
    "Prefer recipes that need few or no extra ingredients. Keep steps concise and "
    "beginner-friendly. Only suggest common, widely-available additional ingredients."
)

# JSON schema the model must satisfy (structured outputs).
RECIPE_SCHEMA = {
    "type": "object",
    "properties": {
        "recipes": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "description": {"type": "string"},
                    "ingredients_used": {"type": "array", "items": {"type": "string"}},
                    "additional_ingredients": {
                        "type": "array",
                        "items": {"type": "string"},
                    },
                    "steps": {"type": "array", "items": {"type": "string"}},
                    "estimated_time_minutes": {"type": "integer"},
                    "uses_expiring_items": {"type": "boolean"},
                },
                "required": [
                    "name",
                    "description",
                    "ingredients_used",
                    "additional_ingredients",
                    "steps",
                    "estimated_time_minutes",
                    "uses_expiring_items",
                ],
                "additionalProperties": False,
            },
        }
    },
    "required": ["recipes"],
    "additionalProperties": False,
}


def build_user_prompt(request: LeftoverChefRequest) -> str:
    lines: list[str] = ["Here is what I currently have in my pantry:"]
    for ing in request.ingredients:
        expiry = ""
        if ing.days_until_expiry is not None:
            if ing.days_until_expiry < 0:
                expiry = " (EXPIRED — use or discard)"
            elif ing.days_until_expiry == 0:
                expiry = " (expires TODAY)"
            else:
                expiry = f" (expires in {ing.days_until_expiry} day(s))"
        lines.append(f"- {ing.quantity} {ing.unit} {ing.name}{expiry}")

    if request.dietary_preferences:
        lines.append(
            "\nDietary preferences / restrictions: "
            + ", ".join(request.dietary_preferences)
        )

    if request.prioritise_expiring:
        lines.append(
            "\nPrioritise recipes that use the items closest to expiry first."
        )

    lines.append(
        f"\nSuggest up to {request.max_recipes} recipes I can make. "
        "Respond using the required JSON schema."
    )
    return "\n".join(lines)
