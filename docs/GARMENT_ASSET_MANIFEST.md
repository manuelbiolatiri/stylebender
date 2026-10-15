# Garment asset manifest

Status: manually reviewed 15 October 2026.

These are local styling references only. The image must depict the garment described by the filename and metadata before it can appear in Sample Wardrobe, the local catalogue, My Look or Saved Looks.

| Asset | Reviewed garment | Result |
|---|---|---|
| `navy-blazer.png` | Navy hopsack / tailored blazer | Corrected: replaced the previous beige trouser + white sneaker collage with a navy blazer product image |
| `ivory-oxford.png` | Ivory Oxford shirt | Pass |
| `cream-linen-shirt.png` | Cream linen shirt | Pass |
| `charcoal-merino.png` | Charcoal merino crewneck | Pass |
| `rust-knit-polo.png` | Rust knitted polo | Pass |
| `forest-overshirt.png` | Forest overshirt | Pass |
| `burgundy-dinner-jacket.png` | Burgundy velvet dinner jacket | Pass |
| `charcoal-trousers.png` | Charcoal wool trousers | Pass |
| `stone-chinos.png` | Stone cotton chinos | Pass |
| `indigo-jeans.png` | Dark indigo straight jeans | Pass |
| `brown-loafers.png` | Dark brown penny loafers | Pass |
| `white-sneakers.png` | White leather sneakers | Pass |
| `yoruba-agbada.png` | Ivory Yoruba agbada with indigo embroidery | Pass |

`lib/garment-assets.ts` is the checked source of truth. Tests verify that every image referenced by `lib/demo-wardrobe.ts`, `lib/sample-wardrobes.ts` and `lib/products.ts` exists in this manifest. My Look and Saved Looks resolve catalogue images through the manifest; mismatched or unknown images fall back to the neutral garment placeholder.
