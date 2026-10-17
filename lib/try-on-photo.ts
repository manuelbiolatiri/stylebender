export type CropBounds = { top: number; right: number; bottom: number; left: number };
export type TryOnPhoto = { file: File; url: string };
export const fullCrop: CropBounds = { top: 0, right: 0, bottom: 0, left: 0 };

export function validCrop(crop: CropBounds): boolean {
  const vals = [crop.top, crop.right, crop.bottom, crop.left];
  return vals.every((n) => Number.isFinite(n) && n >= 0 && n <= 85) &&
    crop.left + crop.right <= 85 && crop.top + crop.bottom <= 85;
}

/**
 * Crop the original decoded image BEFORE downscaling, so shopping-site
 * screenshots retain garment detail and browser chrome is never uploaded.
 */
export async function prepareTryOnPhoto(file: File, crop: CropBounds = fullCrop): Promise<TryOnPhoto> {
  if (!file.type.startsWith("image/")) throw new Error("Choose an image file, not a video.");
  if (file.size > 15_000_000) throw new Error("Choose an image smaller than 15 MB.");
  if (!validCrop(crop)) throw new Error("The crop is too small. Leave more of the garment visible.");

  const inputUrl = URL.createObjectURL(file);
  try {
    const image = new window.Image();
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("This photo could not be opened. Use a supported phone photo, JPEG or PNG."));
      image.src = inputUrl;
    });
    const w = image.naturalWidth, h = image.naturalHeight;
    if (!w || !h) throw new Error("The image has no visible dimensions.");
    const sx = Math.round(w * crop.left / 100), sy = Math.round(h * crop.top / 100);
    const sw = Math.max(1, Math.round(w * (100 - crop.left - crop.right) / 100));
    const sh = Math.max(1, Math.round(h * (100 - crop.top - crop.bottom) / 100));
    const factor = Math.min(1, 1280 / Math.max(sw, sh));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(sw * factor));
    canvas.height = Math.max(1, Math.round(sh * factor));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Your browser could not prepare this photo.");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.8));
    if (!blob || blob.size > 1_500_000) throw new Error("The image is too detailed. Use a smaller photo or tighter crop.");
    return { file: new File([blob], "try-on-reference.jpg", { type: "image/jpeg" }), url: URL.createObjectURL(blob) };
  } finally {
    URL.revokeObjectURL(inputUrl);
  }
}
