// Food imagery helpers: an emoji per item (always works) and a real keyworded
// photo per category (LoremFlickr — no API key, reliable). Scanned products use
// their own product photo; everything else falls back to these.

const NAME_EMOJI: { test: RegExp; emoji: string }[] = [
  { test: /tomato/i, emoji: '🍅' },
  { test: /apple/i, emoji: '🍎' },
  { test: /banana/i, emoji: '🍌' },
  { test: /lemon|lime/i, emoji: '🍋' },
  { test: /orange|mandarin/i, emoji: '🍊' },
  { test: /grape/i, emoji: '🍇' },
  { test: /strawberr/i, emoji: '🍓' },
  { test: /milk/i, emoji: '🥛' },
  { test: /cheese/i, emoji: '🧀' },
  { test: /yog|yoghurt|yogurt/i, emoji: '🥛' },
  { test: /butter/i, emoji: '🧈' },
  { test: /egg/i, emoji: '🥚' },
  { test: /bread|loaf|bagel|toast/i, emoji: '🍞' },
  { test: /chicken|poultry/i, emoji: '🍗' },
  { test: /beef|steak|mince/i, emoji: '🥩' },
  { test: /bacon|pork|ham/i, emoji: '🥓' },
  { test: /fish|salmon|tuna/i, emoji: '🐟' },
  { test: /shrimp|prawn/i, emoji: '🍤' },
  { test: /rice/i, emoji: '🍚' },
  { test: /pasta|spaghetti|noodle/i, emoji: '🍝' },
  { test: /carrot/i, emoji: '🥕' },
  { test: /spinach|lettuce|salad|kale|greens/i, emoji: '🥬' },
  { test: /broccoli/i, emoji: '🥦' },
  { test: /potato/i, emoji: '🥔' },
  { test: /onion/i, emoji: '🧅' },
  { test: /garlic/i, emoji: '🧄' },
  { test: /pepper|chilli|chili/i, emoji: '🌶️' },
  { test: /corn/i, emoji: '🌽' },
  { test: /mushroom/i, emoji: '🍄' },
  { test: /avocado/i, emoji: '🥑' },
  { test: /coffee/i, emoji: '☕' },
  { test: /tea/i, emoji: '🍵' },
  { test: /water/i, emoji: '💧' },
  { test: /juice/i, emoji: '🧃' },
  { test: /wine/i, emoji: '🍷' },
  { test: /beer/i, emoji: '🍺' },
  { test: /chocolate|candy|sweet/i, emoji: '🍫' },
  { test: /cookie|biscuit/i, emoji: '🍪' },
  { test: /chip|crisp/i, emoji: '🥔' },
  { test: /honey|jam|nutella|spread/i, emoji: '🍯' },
  { test: /oil|olive/i, emoji: '🫒' },
];

const CATEGORY_EMOJI: Record<string, string> = {
  Produce: '🥗',
  Dairy: '🧀',
  Meat: '🥩',
  Frozen: '🧊',
  Beverages: '🥤',
  Snacks: '🍪',
  Pantry: '🥫',
  Other: '🍽️',
  uncategorised: '🍽️',
};

export const foodEmoji = (name?: string, category?: string): string => {
  if (name) {
    for (const { test, emoji } of NAME_EMOJI) if (test.test(name)) return emoji;
  }
  if (category && CATEGORY_EMOJI[category]) return CATEGORY_EMOJI[category];
  return '🍽️';
};

const CATEGORY_KEYWORD: Record<string, string> = {
  Produce: 'vegetables',
  Dairy: 'cheese',
  Meat: 'steak',
  Frozen: 'frozen,food',
  Beverages: 'drink',
  Snacks: 'snacks',
  Pantry: 'groceries',
  Other: 'food',
};

const stableLock = (seed: string): number => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) & 0xffff;
  return h % 90;
};

// A real, keyworded photo for a category — deterministic per category so it
// doesn't reshuffle on every render.
export const categoryImage = (category?: string, name?: string, size = 240): string => {
  const keyword = (category && CATEGORY_KEYWORD[category]) || 'food';
  const lock = stableLock(category || name || 'food');
  return `https://loremflickr.com/${size}/${size}/${keyword}?lock=${lock}`;
};
