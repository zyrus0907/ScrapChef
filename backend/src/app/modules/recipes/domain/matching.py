"""Pure domain service for recipe-to-pantry matching.

No framework imports — just Python. All logic is testable in isolation.
"""
from dataclasses import dataclass
from typing import Optional

from app.modules.pantry.domain.pantry_item import PantryItem
from app.modules.recipes.domain.recipe import Recipe, RecipeIngredient

EXPIRY_BOOST_WINDOW = 7  # days — full boost at 0 days, zero at 7+ days


# ---------------------------------------------------------------------------
# Result types
# ---------------------------------------------------------------------------

@dataclass
class IngredientCoverage:
    ingredient_name: str
    is_matched: bool
    pantry_item_name: Optional[str] = None
    days_until_expiry: Optional[int] = None


@dataclass
class RecipeMatchResult:
    recipe: Recipe
    coverage: list[IngredientCoverage]
    missing_count: int
    match_percentage: float
    expiry_boost: float

    @property
    def score(self) -> float:
        """Combined score: coverage + expiry urgency bonus."""
        return self.match_percentage + 0.3 * min(self.expiry_boost, 1.0)


# ---------------------------------------------------------------------------
# Matching helpers
# ---------------------------------------------------------------------------

def _normalize(name: str) -> str:
    return name.lower().strip()


def _ingredient_matches(pantry_name: str, recipe_name: str) -> bool:
    """Fuzzy name match: exact, or either name contains the other."""
    a, b = _normalize(pantry_name), _normalize(recipe_name)
    return a == b or b in a or a in b


def _find_pantry_match(
    ingredient: RecipeIngredient, pantry: list[PantryItem]
) -> Optional[PantryItem]:
    return next(
        (p for p in pantry if _ingredient_matches(p.name, ingredient.name)),
        None,
    )


def _expiry_boost_for_ingredient(
    ingredient: RecipeIngredient, pantry: list[PantryItem]
) -> float:
    item = _find_pantry_match(ingredient, pantry)
    if item is None or item.days_until_expiry is None:
        return 0.0
    days = item.days_until_expiry
    if days > EXPIRY_BOOST_WINDOW:
        return 0.0
    return max(0.0, (EXPIRY_BOOST_WINDOW - days) / EXPIRY_BOOST_WINDOW)


# ---------------------------------------------------------------------------
# Core matching function
# ---------------------------------------------------------------------------

def match_recipe(recipe: Recipe, pantry: list[PantryItem]) -> RecipeMatchResult:
    """Compute coverage of a single recipe against a pantry snapshot."""
    required = recipe.required_ingredients
    if not required:
        return RecipeMatchResult(
            recipe=recipe, coverage=[], missing_count=0,
            match_percentage=0.0, expiry_boost=0.0,
        )

    coverage: list[IngredientCoverage] = []
    expiry_boost = 0.0

    for ingredient in required:
        match = _find_pantry_match(ingredient, pantry)
        coverage.append(
            IngredientCoverage(
                ingredient_name=ingredient.name,
                is_matched=match is not None,
                pantry_item_name=match.name if match else None,
                days_until_expiry=match.days_until_expiry if match else None,
            )
        )
        if match is not None:
            expiry_boost += _expiry_boost_for_ingredient(ingredient, pantry)

    matched = sum(1 for c in coverage if c.is_matched)
    return RecipeMatchResult(
        recipe=recipe,
        coverage=coverage,
        missing_count=len(required) - matched,
        match_percentage=matched / len(required),
        expiry_boost=expiry_boost,
    )


# ---------------------------------------------------------------------------
# Mode filters
# ---------------------------------------------------------------------------

def strict_match(
    recipes: list[Recipe], pantry: list[PantryItem]
) -> list[RecipeMatchResult]:
    """Only recipes where user owns every required ingredient."""
    results = [match_recipe(r, pantry) for r in recipes if r.required_ingredients]
    results = [r for r in results if r.missing_count == 0]
    return sorted(results, key=lambda r: r.expiry_boost, reverse=True)


def near_match(
    recipes: list[Recipe], pantry: list[PantryItem], max_missing: int = 2
) -> list[RecipeMatchResult]:
    """Recipes missing 1–max_missing ingredients, sorted by fewest missing."""
    results = [match_recipe(r, pantry) for r in recipes if r.required_ingredients]
    results = [r for r in results if 1 <= r.missing_count <= max_missing]
    return sorted(results, key=lambda r: (r.missing_count, -r.expiry_boost))


def scraps_match(
    recipes: list[Recipe], pantry: list[PantryItem], min_coverage: float = 0.5
) -> list[RecipeMatchResult]:
    """Best-coverage recipes for low-pantry situations (≥ min_coverage match)."""
    results = [match_recipe(r, pantry) for r in recipes if r.required_ingredients]
    results = [r for r in results if r.match_percentage >= min_coverage]
    return sorted(results, key=lambda r: r.score, reverse=True)


def expiry_rescue(
    recipes: list[Recipe], pantry: list[PantryItem]
) -> list[RecipeMatchResult]:
    """Recipes that best use up ingredients nearing expiry."""
    active_expiring = [
        p for p in pantry
        if p.days_until_expiry is not None and p.days_until_expiry <= EXPIRY_BOOST_WINDOW
    ]
    if not active_expiring:
        return []
    results = [match_recipe(r, pantry) for r in recipes if r.required_ingredients]
    results = [r for r in results if r.expiry_boost > 0]
    return sorted(results, key=lambda r: r.expiry_boost, reverse=True)
