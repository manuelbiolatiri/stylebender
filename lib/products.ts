import type { ProductReference } from "@/lib/outfit";

/**
 * The local catalog is deliberately not presented as retailer inventory.
 * Replace this provider with an affiliate/retailer adapter when credentials
 * and product-feed terms are approved.
 */
export const localCatalog: ProductReference[] = [
  { id: "local-forest-overshirt", source: "local-catalog", name: "Forest overshirt", image: "/london-menswear-editorial.jpg" },
  { id: "local-charcoal-blazer", source: "local-catalog", name: "Charcoal tailored blazer", image: "/stylebender-hero-campaign.jpg" },
  { id: "local-ivory-shirt", source: "local-catalog", name: "Ivory textured shirt", image: "/sunday-menswear-editorial.jpg" },
  { id: "local-charcoal-trousers", source: "local-catalog", name: "Charcoal tailored trousers", image: "/menswear-outfit-flatlay.jpg" },
  { id: "local-leather-loafers", source: "local-catalog", name: "Leather loafers", image: "/evening-menswear-editorial.jpg" },
];

function normalise(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9 ]/g, " ");
}

export function findCatalogProduct(name: string) {
  const query = normalise(name);
  const words = query.split(/\s+/).filter((word) => word.length > 3);
  return localCatalog.find((product) => {
    const candidate = normalise(product.name);
    return words.some((word) => candidate.includes(word));
  });
}

