import type { ProductReference } from "@/lib/outfit";

/**
 * The local catalog is deliberately not presented as retailer inventory.
 * Replace this provider with an affiliate/retailer adapter when credentials
 * and product-feed terms are approved.
 */
export const localCatalog: ProductReference[] = [
  { id: "local-forest-overshirt", source: "local-catalog", name: "Forest overshirt", image: "/demo-wardrobe/forest-overshirt.png" },
  { id: "local-navy-blazer", source: "local-catalog", name: "Navy tailored blazer", image: "/demo-wardrobe/navy-blazer.png" },
  { id: "local-ivory-shirt", source: "local-catalog", name: "Ivory Oxford shirt", image: "/demo-wardrobe/ivory-oxford.png" },
  { id: "local-charcoal-trousers", source: "local-catalog", name: "Charcoal tailored trousers", image: "/demo-wardrobe/charcoal-trousers.png" },
  { id: "local-brown-loafers", source: "local-catalog", name: "Dark brown penny loafers", image: "/demo-wardrobe/brown-loafers.png" },
];

/** No retailer feed is connected in this MVP amendment. Keep this empty until listings are verified. */
export function getVerifiedRetailerListings(_garmentName: string): ProductReference[] {
  return [];
}

export type GarmentCategory = "outerwear" | "shirt" | "knitwear" | "trousers" | "shoes" | "accessories" | "other";

function normalise(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9 ]/g, " ");
}

export function inferGarmentCategory(value: string): GarmentCategory {
  const text = normalise(value);
  if (/blazer|jacket|overshirt|coat|outerwear/.test(text)) return "outerwear";
  if (/shirt|oxford|tee|t shirt|polo/.test(text)) return "shirt";
  if (/knit|knitwear|sweater|jumper|cardigan/.test(text)) return "knitwear";
  if (/trouser|pants|chino|jean|shorts/.test(text)) return "trousers";
  if (/loafer|shoe|trainer|sneaker|boot/.test(text)) return "shoes";
  if (/tie|belt|scarf|watch|bag/.test(text)) return "accessories";
  return "other";
}

const colourWords = new Set(["black", "brown", "burgundy", "charcoal", "cream", "forest", "green", "grey", "indigo", "ivory", "navy", "rust", "stone", "white"]);

export function findCatalogProduct(name: string) {
  const query = normalise(name);
  const words = query.split(/\s+/).filter((word) => word.length > 3);
  const category = inferGarmentCategory(name);
  const queryColours = words.filter((word) => colourWords.has(word));
  return localCatalog.find((product) => {
    const candidate = normalise(product.name);
    if (category !== inferGarmentCategory(product.name)) return false;
    if (!words.some((word) => candidate.split(/\s+/).includes(word))) return false;
    const productColours = candidate.split(/\s+/).filter((word) => colourWords.has(word));
    return queryColours.length === 0 || queryColours.some((colour) => productColours.includes(colour));
  });
}

