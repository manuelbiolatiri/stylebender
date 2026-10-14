import { z } from "zod";
import { NextResponse } from "next/server";
import type { OutfitContext } from "@/lib/outfit";

const requestSchema = z.object({
  occasion: z.string().min(1).max(80),
  budget: z.string().max(40).default("£150–£300"),
  styles: z.array(z.string().max(60)).max(10).default([]),
  wardrobe: z.array(z.string().max(100)).max(30).default([]),
  request: z.string().max(500).default("Recommend one strong outfit"),
});
const responseSchema = z.object({
  verdict: z.enum(["Wear", "Change One Piece", "Elevate", "Skip"]),
  title: z.string(),
  summary: z.string(),
  reasons: z.array(z.string()).max(3),
  pieces: z.array(
    z.object({ name: z.string(), owned: z.boolean(), note: z.string() }),
  ),
});

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return NextResponse.json(
      { error: "Please provide a valid occasion and styling request." },
      { status: 400 },
    );
  const key = process.env.GEMINI_API_KEY;
  if (!key)
    return NextResponse.json(
      {
        status: "unavailable",
        error:
          "Gemini is not configured. Add GEMINI_API_KEY on the server to enable AI styling.",
      },
      { status: 503 },
    );
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const context: OutfitContext = parsed.data;
  const prompt = `You are Stylebender, a decisive UK menswear stylist. Return JSON only matching this schema: {"verdict":"Wear|Change One Piece|Elevate|Skip","title":"short title","summary":"concise explanation","reasons":["up to 3 reasons"],"pieces":[{"name":"garment","owned":true,"note":"styling note"}]}. Occasion: ${context.occasion}. Budget: ${context.budget ?? "£150–£300"}. Confirmed styles: ${context.styles.join(", ") || "not yet confirmed"}. Owned wardrobe items: ${context.wardrobe.join(", ") || "none provided"}. User request: ${context.request ?? "Recommend one strong outfit"}. Mark a piece owned only when it matches an item in the supplied wardrobe. Never claim live prices, weather, physical fit, or real product availability.`;
  const result = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.7,
          maxOutputTokens: 800,
        },
      }),
      cache: "no-store",
    },
  );
  if (!result.ok)
    return NextResponse.json(
      {
        status: "error",
        error:
          "Gemini could not complete this styling request. Try again shortly.",
      },
      { status: 502 },
    );
  const payload = (await result.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
  const output = responseSchema.safeParse(text ? JSON.parse(text) : null);
  if (!output.success)
    return NextResponse.json(
      {
        status: "error",
        error: "Gemini returned an unexpected styling response.",
      },
      { status: 502 },
    );
  return NextResponse.json({ status: "ready", data: output.data });
}
