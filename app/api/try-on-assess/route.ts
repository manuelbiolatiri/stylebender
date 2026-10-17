import { z } from "zod";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

const schema = z.object({
  occasion: z.string().min(1).max(100),
  selectedGarment: z.string().min(1).max(120),
  currentPieces: z.array(z.string().min(1).max(120)).min(1).max(8),
});
const outputSchema = z.object({
  verdict: z.enum(["works", "tweak", "skip"]),
  headline: z.string().min(4).max(120),
  explanation: z.string().min(12).max(400),
  practicalTip: z.string().min(4).max(220),
});
const uses = new Map<string, { count: number; expires: number }>();

function fail(error: string, status: number) {
  return NextResponse.json({ error }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) return fail("Sign in to request styling advice.", 401);
  if (Number(request.headers.get("content-length") ?? 0) > 3500) return fail("The styling request is too large.", 413);
  const input = schema.safeParse(await request.json().catch(() => null));
  if (!input.success) return fail("Choose a garment and a current look first.", 400);
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return fail("Gemini is not configured for style checks.", 503);

  const id = session.user.email.toLowerCase();
  const now = Date.now();
  const previous = uses.get(id);
  const count = previous && previous.expires > now ? previous.count : 0;
  if (count >= 5) return fail("Today's style-check limit has been reached.", 429);
  uses.set(id, { count: count + 1, expires: previous && previous.expires > now ? previous.expires : now + 86_400_000 });

  const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";
  const { occasion, selectedGarment, currentPieces } = input.data;
  const prompt = [
    "You are an exceptional pragmatic menswear stylist. Answer only as strict JSON.",
    "Give an honest occasion-specific assessment of whether the proposed garment works with the named outfit pieces.",
    "Crucial: You cannot see photographs. Do not claim to have inspected the generated image, fit, textile, or appearance.",
    "The selected garment may replace an existing upper-body item; do not assume all garments are worn at once.",
    "Use these JSON fields: verdict (works|tweak|skip), headline, explanation, practicalTip.",
    "Keep it under 100 words total; be specific, not flattering by default.",
    `Occasion: ${occasion}`, `Proposed garment: ${selectedGarment}`,
    `Current look pieces: ${currentPieces.join(", ")}`,
  ].join("\n");

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: "POST", cache: "no-store", signal: AbortSignal.timeout(25_000),
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.45, maxOutputTokens: 500 },
      }),
    });
    if (!response.ok) {
      console.warn("[TryOnStyleCheck] Gemini unavailable", { httpStatus: response.status });
      return fail(response.status === 429 ? "Gemini is at its quota limit." : "Gemini could not assess these garments right now.", response.status === 429 ? 429 : 502);
    }
    const result = await response.json() as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const raw = result.candidates?.[0]?.content?.parts?.[0]?.text;
    let candidate: unknown;
    try { candidate = JSON.parse(raw ?? "null"); } catch { candidate = null; }
    const checked = outputSchema.safeParse(candidate);
    if (!checked.success) return fail("Gemini returned an incomplete style assessment.", 502);
    return NextResponse.json({ assessment: checked.data }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return fail("Style check timed out. Try again later.", 503);
  }
}
