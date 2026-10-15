import type { WardrobeItem } from "./wardrobe";

export type SampleWeather = "Rainy" | "Cold" | "Mild" | "Hot";
export type SampleWardrobeItem = WardrobeItem & { image?: string; sampleCollection: SampleWeather };

const base = (item: Omit<SampleWardrobeItem, "source" | "sampleCollection">, sampleCollection: SampleWeather): SampleWardrobeItem => ({
  ...item,
  source: "demo",
  sampleCollection,
});

export const sampleWardrobes: Record<SampleWeather, SampleWardrobeItem[]> = {
  Rainy: [
    base({ id: "sample-rain-forest-overshirt", name: "Forest weatherproof overshirt", category: "Outerwear", colour: "Forest", material: "Waxed cotton", createdAt: 0, image: "/demo-wardrobe/forest-overshirt.png" }, "Rainy"),
    base({ id: "sample-rain-charcoal-merino", name: "Charcoal merino crewneck", category: "Knitwear", colour: "Charcoal", material: "Merino wool", createdAt: 0, image: "/demo-wardrobe/charcoal-merino.png" }, "Rainy"),
    base({ id: "sample-rain-indigo-jeans", name: "Dark indigo straight jeans", category: "Trousers", colour: "Indigo", material: "Selvedge denim", createdAt: 0, image: "/demo-wardrobe/indigo-jeans.png" }, "Rainy"),
    base({ id: "sample-rain-white-sneakers", name: "White leather sneakers", category: "Shoes", colour: "White", material: "Leather", createdAt: 0, image: "/demo-wardrobe/white-sneakers.png" }, "Rainy"),
    base({ id: "sample-rain-navy-blazer", name: "Navy hopsack blazer", category: "Outerwear", colour: "Navy", material: "Hopsack wool", createdAt: 0, image: "/demo-wardrobe/navy-blazer.png" }, "Rainy"),
    base({ id: "sample-rain-ivory-oxford", name: "Ivory Oxford shirt", category: "Shirts", colour: "Ivory", material: "Oxford cotton", createdAt: 0, image: "/demo-wardrobe/ivory-oxford.png" }, "Rainy"),
    base({ id: "sample-rain-loafers", name: "Dark brown penny loafers", category: "Shoes", colour: "Dark brown", material: "Leather", createdAt: 0, image: "/demo-wardrobe/brown-loafers.png" }, "Rainy"),
    base({ id: "sample-rain-umbrella", name: "Compact black umbrella", category: "Accessories", colour: "Black", material: "Recycled nylon", createdAt: 0 }, "Rainy"),
  ],
  Cold: [
    base({ id: "sample-cold-burgundy-jacket", name: "Burgundy velvet dinner jacket", category: "Outerwear", colour: "Burgundy", material: "Cotton velvet", createdAt: 0, image: "/demo-wardrobe/burgundy-dinner-jacket.png" }, "Cold"),
    base({ id: "sample-cold-charcoal-merino", name: "Charcoal merino crewneck", category: "Knitwear", colour: "Charcoal", material: "Merino wool", createdAt: 0, image: "/demo-wardrobe/charcoal-merino.png" }, "Cold"),
    base({ id: "sample-cold-trousers", name: "Charcoal wool trousers", category: "Trousers", colour: "Charcoal", material: "Wool blend", createdAt: 0, image: "/demo-wardrobe/charcoal-trousers.png" }, "Cold"),
    base({ id: "sample-cold-loafers", name: "Dark brown penny loafers", category: "Shoes", colour: "Dark brown", material: "Leather", createdAt: 0, image: "/demo-wardrobe/brown-loafers.png" }, "Cold"),
    base({ id: "sample-cold-navy-blazer", name: "Navy hopsack blazer", category: "Outerwear", colour: "Navy", material: "Hopsack wool", createdAt: 0, image: "/demo-wardrobe/navy-blazer.png" }, "Cold"),
    base({ id: "sample-cold-ivory-shirt", name: "Ivory Oxford shirt", category: "Shirts", colour: "Ivory", material: "Oxford cotton", createdAt: 0, image: "/demo-wardrobe/ivory-oxford.png" }, "Cold"),
    base({ id: "sample-cold-knit-polo", name: "Rust knitted polo", category: "Knitwear", colour: "Rust", material: "Cotton knit", createdAt: 0, image: "/demo-wardrobe/rust-knit-polo.png" }, "Cold"),
    base({ id: "sample-cold-scarf", name: "Charcoal wool scarf", category: "Accessories", colour: "Charcoal", material: "Wool", createdAt: 0 }, "Cold"),
  ],
  Mild: [
    base({ id: "sample-mild-navy-blazer", name: "Navy hopsack blazer", category: "Outerwear", colour: "Navy", material: "Hopsack wool", createdAt: 0, image: "/demo-wardrobe/navy-blazer.png" }, "Mild"),
    base({ id: "sample-mild-cream-linen", name: "Cream linen shirt", category: "Shirts", colour: "Cream", material: "Linen", createdAt: 0, image: "/demo-wardrobe/cream-linen-shirt.png" }, "Mild"),
    base({ id: "sample-mild-stone-chinos", name: "Stone cotton chinos", category: "Trousers", colour: "Stone", material: "Cotton twill", createdAt: 0, image: "/demo-wardrobe/stone-chinos.png" }, "Mild"),
    base({ id: "sample-mild-loafers", name: "Dark brown penny loafers", category: "Shoes", colour: "Dark brown", material: "Leather", createdAt: 0, image: "/demo-wardrobe/brown-loafers.png" }, "Mild"),
    base({ id: "sample-mild-forest-overshirt", name: "Forest overshirt", category: "Outerwear", colour: "Forest", material: "Cotton twill", createdAt: 0, image: "/demo-wardrobe/forest-overshirt.png" }, "Mild"),
    base({ id: "sample-mild-white-sneakers", name: "White leather sneakers", category: "Shoes", colour: "White", material: "Leather", createdAt: 0, image: "/demo-wardrobe/white-sneakers.png" }, "Mild"),
    base({ id: "sample-mild-rust-polo", name: "Rust knitted polo", category: "Knitwear", colour: "Rust", material: "Cotton knit", createdAt: 0, image: "/demo-wardrobe/rust-knit-polo.png" }, "Mild"),
    base({ id: "sample-mild-belt", name: "Dark brown leather belt", category: "Accessories", colour: "Dark brown", material: "Leather", createdAt: 0 }, "Mild"),
  ],
  Hot: [
    base({ id: "sample-hot-cream-linen", name: "Cream linen shirt", category: "Shirts", colour: "Cream", material: "Linen", createdAt: 0, image: "/demo-wardrobe/cream-linen-shirt.png" }, "Hot"),
    base({ id: "sample-hot-stone-chinos", name: "Stone cotton chinos", category: "Trousers", colour: "Stone", material: "Cotton twill", createdAt: 0, image: "/demo-wardrobe/stone-chinos.png" }, "Hot"),
    base({ id: "sample-hot-white-sneakers", name: "White leather sneakers", category: "Shoes", colour: "White", material: "Leather", createdAt: 0, image: "/demo-wardrobe/white-sneakers.png" }, "Hot"),
    base({ id: "sample-hot-brown-loafers", name: "Dark brown penny loafers", category: "Shoes", colour: "Dark brown", material: "Leather", createdAt: 0, image: "/demo-wardrobe/brown-loafers.png" }, "Hot"),
    base({ id: "sample-hot-ivory-shirt", name: "Ivory Oxford shirt", category: "Shirts", colour: "Ivory", material: "Oxford cotton", createdAt: 0, image: "/demo-wardrobe/ivory-oxford.png" }, "Hot"),
    base({ id: "sample-hot-rust-polo", name: "Rust knitted polo", category: "Knitwear", colour: "Rust", material: "Cotton knit", createdAt: 0, image: "/demo-wardrobe/rust-knit-polo.png" }, "Hot"),
    base({ id: "sample-hot-indigo-jeans", name: "Dark indigo straight jeans", category: "Trousers", colour: "Indigo", material: "Selvedge denim", createdAt: 0, image: "/demo-wardrobe/indigo-jeans.png" }, "Hot"),
    base({ id: "sample-hot-cap", name: "Stone cotton cap", category: "Accessories", colour: "Stone", material: "Cotton", createdAt: 0 }, "Hot"),
  ],
};

export const sampleWeatherOptions = Object.keys(sampleWardrobes) as SampleWeather[];

export function getSampleWardrobeContext(weather: SampleWeather) {
  return sampleWardrobes[weather].map(({ id, name, category, colour, material }) => ({
    id, name, category, ...(colour ? { colour } : {}), ...(material ? { material } : {}), sample: true as const,
  }));
}

export function readSelectedSampleWeather(): SampleWeather {
  if (typeof window === "undefined") return "Mild";
  const value = localStorage.getItem("stylebender-sample-weather");
  return sampleWeatherOptions.includes(value as SampleWeather) ? value as SampleWeather : "Mild";
}

export function selectSampleWeather(weather: SampleWeather) {
  localStorage.setItem("stylebender-sample-weather", weather);
  window.dispatchEvent(new CustomEvent("stylebender-sample-updated"));
}
