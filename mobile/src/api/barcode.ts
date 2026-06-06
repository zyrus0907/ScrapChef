// Product lookup via Open Food Facts (free, no key). Uses fetch directly so the
// app's auth interceptor doesn't attach a bearer token to a third-party host.

export interface ProductInfo {
  barcode: string;
  name: string;
  brand?: string;
  category?: string; // mapped to our pantry categories
  imageUrl?: string;
}

// Open Food Facts categories are messy; map keywords to our chip categories.
const CATEGORY_MAP: { test: RegExp; category: string }[] = [
  { test: /dairy|milk|cheese|yogurt|yoghurt|butter|cream/i, category: 'Dairy' },
  { test: /meat|beef|pork|chicken|poultry|fish|seafood|sausage/i, category: 'Meat' },
  { test: /fruit|vegetable|produce|salad|legume/i, category: 'Produce' },
  { test: /frozen/i, category: 'Frozen' },
  { test: /beverage|drink|water|juice|soda|coffee|tea/i, category: 'Beverages' },
  { test: /snack|chocolate|candy|sweet|biscuit|cookie|chip|crisp/i, category: 'Snacks' },
];

const mapCategory = (raw?: string): string | undefined => {
  if (!raw) return undefined;
  for (const { test, category } of CATEGORY_MAP) {
    if (test.test(raw)) return category;
  }
  return 'Pantry';
};

export const lookupBarcode = async (barcode: string): Promise<ProductInfo | null> => {
  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json` +
        '?fields=product_name,brands,categories,image_front_url,image_url',
    );
    if (!res.ok) return null;
    const json = await res.json();
    if (json.status !== 1 || !json.product) return null;
    const p = json.product;
    const name: string = p.product_name?.trim() || '';
    if (!name) return null;
    return {
      barcode,
      name,
      brand: p.brands?.split(',')[0]?.trim() || undefined,
      category: mapCategory(p.categories),
      imageUrl: p.image_front_url || p.image_url || undefined,
    };
  } catch {
    return null;
  }
};
