/**
 * Manually reviewed garment asset manifest.
 *
 * These images are local styling references, not retailer inventory. Keep this
 * list in sync with public/demo-wardrobe and reject any unknown/mismatched
 * image instead of showing a plausible-looking but incorrect garment.
 */
export type GarmentAsset = {
  image: string;
  garment: string;
  category: string;
  aliases: string[];
  reviewed: true;
};

export const garmentAssetManifest: GarmentAsset[] = [
  { image: "/demo-wardrobe/navy-blazer.png", garment: "Navy hopsack blazer", category: "Outerwear", aliases: ["navy blazer", "navy hopsack blazer", "navy tailored blazer"], reviewed: true },
  { image: "/demo-wardrobe/ivory-oxford.png", garment: "Ivory Oxford shirt", category: "Shirts", aliases: ["ivory oxford shirt", "ivory shirt"], reviewed: true },
  { image: "/demo-wardrobe/cream-linen-shirt.png", garment: "Cream linen shirt", category: "Shirts", aliases: ["cream linen shirt", "cream shirt"], reviewed: true },
  { image: "/demo-wardrobe/charcoal-merino.png", garment: "Charcoal merino crewneck", category: "Knitwear", aliases: ["charcoal merino", "charcoal crewneck", "merino crewneck"], reviewed: true },
  { image: "/demo-wardrobe/rust-knit-polo.png", garment: "Rust knitted polo", category: "Knitwear", aliases: ["rust knitted polo", "rust polo", "knitted polo"], reviewed: true },
  { image: "/demo-wardrobe/forest-overshirt.png", garment: "Forest overshirt", category: "Outerwear", aliases: ["forest overshirt", "forest weatherproof overshirt"], reviewed: true },
  { image: "/demo-wardrobe/burgundy-dinner-jacket.png", garment: "Burgundy velvet dinner jacket", category: "Outerwear", aliases: ["burgundy dinner jacket", "burgundy velvet jacket"], reviewed: true },
  { image: "/demo-wardrobe/charcoal-trousers.png", garment: "Charcoal wool trousers", category: "Trousers", aliases: ["charcoal trousers", "charcoal wool trousers", "charcoal tailored trousers"], reviewed: true },
  { image: "/demo-wardrobe/stone-chinos.png", garment: "Stone cotton chinos", category: "Trousers", aliases: ["stone chinos", "stone cotton chinos"], reviewed: true },
  { image: "/demo-wardrobe/indigo-jeans.png", garment: "Dark indigo straight jeans", category: "Trousers", aliases: ["indigo jeans", "dark indigo jeans", "straight jeans"], reviewed: true },
  { image: "/demo-wardrobe/brown-loafers.png", garment: "Dark brown penny loafers", category: "Shoes", aliases: ["brown loafers", "dark brown penny loafers", "penny loafers"], reviewed: true },
  { image: "/demo-wardrobe/white-sneakers.png", garment: "White leather sneakers", category: "Shoes", aliases: ["white sneakers", "white leather sneakers"], reviewed: true },
  { image: "/demo-wardrobe/yoruba-agbada.png", garment: "Ivory Yoruba agbada with indigo embroidery", category: "Yoruba attire", aliases: ["yoruba agbada", "agbada", "ivory agbada"], reviewed: true },
];

function normalise(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function findReviewedGarmentAsset(garmentName: string) {
  const target = normalise(garmentName);
  return garmentAssetManifest.find((asset) => asset.aliases.some((alias) => {
    const candidate = normalise(alias);
    return target === candidate || target.includes(candidate) || candidate.includes(target);
  }));
}

export function isReviewedGarmentImage(image: string | undefined, garmentName: string) {
  if (!image) return false;
  const asset = garmentAssetManifest.find((entry) => entry.image === image);
  const expected = findReviewedGarmentAsset(garmentName);
  return Boolean(asset && expected && asset.image === expected.image);
}

export function getReviewedGarmentImage(garmentName: string, candidateImage?: string) {
  if (candidateImage && isReviewedGarmentImage(candidateImage, garmentName)) return candidateImage;
  return findReviewedGarmentAsset(garmentName)?.image;
}
