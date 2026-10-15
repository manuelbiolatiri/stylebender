import { saveWardrobeItem, type WardrobeItem } from "./wardrobe";

export type DemoWardrobeItem = WardrobeItem & { image: string };

export const demoWardrobe: DemoWardrobeItem[] = [
  { id: "demo-navy-blazer", name: "Navy hopsack blazer", category: "Outerwear", colour: "Navy", material: "Hopsack wool", styles: ["Tailored", "Classic"], occasions: ["Church", "Office Day", "Date Night"], createdAt: 0, source: "demo", image: "/demo-wardrobe/navy-blazer.png" },
  { id: "demo-ivory-oxford", name: "Ivory Oxford shirt", category: "Shirts", colour: "Ivory", material: "Oxford cotton", styles: ["Classic", "Smart casual"], occasions: ["Church", "Office Day", "Date Night"], createdAt: 0, source: "demo", image: "/demo-wardrobe/ivory-oxford.png" },
  { id: "demo-charcoal-merino", name: "Charcoal merino crewneck", category: "Knitwear", colour: "Charcoal", material: "Merino wool", styles: ["Minimal", "Quiet luxury"], occasions: ["Office Day", "Date Night", "Weekend"], createdAt: 0, source: "demo", image: "/demo-wardrobe/charcoal-merino.png" },
  { id: "demo-charcoal-trousers", name: "Charcoal wool trousers", category: "Trousers", colour: "Charcoal", material: "Wool blend", styles: ["Tailored", "Classic"], occasions: ["Church", "Office Day", "Date Night"], createdAt: 0, source: "demo", image: "/demo-wardrobe/charcoal-trousers.png" },
  { id: "demo-indigo-jeans", name: "Dark indigo straight jeans", category: "Trousers", colour: "Indigo", material: "Selvedge denim", styles: ["Smart casual", "Minimal"], occasions: ["Date Night", "Weekend"], createdAt: 0, source: "demo", image: "/demo-wardrobe/indigo-jeans.png" },
  { id: "demo-stone-chinos", name: "Stone cotton chinos", category: "Trousers", colour: "Stone", material: "Cotton twill", styles: ["Smart casual", "Classic"], occasions: ["Office Day", "Weekend", "Church"], createdAt: 0, source: "demo", image: "/demo-wardrobe/stone-chinos.png" },
  { id: "demo-white-sneakers", name: "White leather sneakers", category: "Shoes", colour: "White", material: "Leather", styles: ["Minimal", "Smart casual"], occasions: ["Date Night", "Weekend"], createdAt: 0, source: "demo", image: "/demo-wardrobe/white-sneakers.png" },
  { id: "demo-brown-loafers", name: "Dark brown penny loafers", category: "Shoes", colour: "Dark brown", material: "Leather", styles: ["Classic", "Quiet luxury"], occasions: ["Church", "Office Day", "Date Night"], createdAt: 0, source: "demo", image: "/demo-wardrobe/brown-loafers.png" },
  { id: "demo-rust-knit-polo", name: "Rust knitted polo", category: "Knitwear", colour: "Rust", material: "Cotton knit", styles: ["Smart casual", "Creative"], occasions: ["Date Night", "Weekend"], createdAt: 0, source: "demo", image: "/demo-wardrobe/rust-knit-polo.png" },
  { id: "demo-cream-linen", name: "Cream linen shirt", category: "Shirts", colour: "Cream", material: "Linen", styles: ["Relaxed", "Classic"], occasions: ["Date Night", "Weekend", "Church"], createdAt: 0, source: "demo", image: "/demo-wardrobe/cream-linen-shirt.png" },
  { id: "demo-burgundy-dinner-jacket", name: "Burgundy velvet dinner jacket", category: "Outerwear", colour: "Burgundy", material: "Cotton velvet", styles: ["Tailored", "Creative"], occasions: ["Date Night"], createdAt: 0, source: "demo", image: "/demo-wardrobe/burgundy-dinner-jacket.png" },
  { id: "demo-yoruba-agbada", name: "Ivory Yoruba agbada with indigo embroidery", category: "Yoruba attire", colour: "Ivory and indigo", material: "Embroidered cotton", styles: ["Traditional", "Statement"], occasions: ["Church", "Celebration"], createdAt: 0, source: "demo", image: "/demo-wardrobe/yoruba-agbada.png" },
];

export async function importDemoWardrobe() {
  for (const item of demoWardrobe) {
    const response = await fetch(item.image);
    if (!response.ok) throw new Error(`Could not load ${item.name}`);
    const blob = await response.blob();
    await saveWardrobeItem({ ...item, createdAt: 0, source: "demo" }, blob);
  }
}
