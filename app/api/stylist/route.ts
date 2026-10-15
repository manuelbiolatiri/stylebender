import { z } from "zod";
import { NextResponse } from "next/server";
import type { OutfitContext, WardrobeContextItem } from "@/lib/outfit";
import { auth } from "@/auth";
import { buildStylistPrompt } from "@/lib/stylist-prompt";
import { validateStylistResponse, type StylistResponse } from "@/lib/stylist-response";

const requestWindow = new Map<string, { count: number; resetAt: number }>();
const MAX_REQUESTS = Number(process.env.GEMINI_MAX_REQUESTS_PER_HOUR ?? 8);
const MAX_OUTPUT_TOKENS = Number(process.env.GEMINI_MAX_OUTPUT_TOKENS ?? 2048);
const WINDOW_MS = 60 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 45_000;
const MAX_RETRIES = 2;

const requestSchema = z.object({
  occasion: z.string().min(1).max(80),
  budget: z.string().max(40).default("£150–£300"),
  styles: z.array(z.string().max(60)).max(10).default([]),
  wardrobe: z.array(z.union([
    z.string().max(100),
    z.object({
      id: z.string().min(1).max(100),
      name: z.string().min(1).max(100),
      category: z.string().max(60),
      colour: z.string().max(60).optional(),
      material: z.string().max(80).optional(),
        sample: z.boolean().optional(),
    }),
  ])).max(30).default([]),
  weather: z.string().max(30).optional(),
  sampleWardrobe: z.array(z.object({
    id: z.string().min(1).max(100), name: z.string().min(1).max(100), category: z.string().max(60),
    colour: z.string().max(60).optional(), material: z.string().max(80).optional(), sample: z.literal(true),
  })).max(20).default([]),
  request: z.string().max(500).default("Recommend one strong outfit"),
});
const responseSchema = z.object({
  verdict: z.enum(["Wear", "Change One Piece", "Elevate", "Skip"]),
  title: z.string(),
  summary: z.string(),
  reasons: z.array(z.string()).max(3),
  pieces: z.array(
    z.object({ name: z.string(), owned: z.boolean(), note: z.string() }),
  ).min(3).max(6),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { status: "auth_required", error: "Sign in with Google to generate a live styling verdict." },
      { status: 401 },
    );
  }
  const now = Date.now();
  const keyForLimit = session.user.email ?? "authenticated-user";
  const usage = requestWindow.get(keyForLimit);
  if (usage && usage.resetAt > now && usage.count >= MAX_REQUESTS) {
    return NextResponse.json({ status: "rate_limited", error: "Styling limit reached. Try again later." }, { status: 429 });
  }
  requestWindow.set(keyForLimit, usage && usage.resetAt > now ? { count: usage.count + 1, resetAt: usage.resetAt } : { count: 1, resetAt: now + WINDOW_MS });
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 20_000) {
    return NextResponse.json({ error: "Styling request is too large." }, { status: 413 });
  }
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
  const apiKey = key;
  const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";
  const fallbackModel = process.env.GEMINI_FALLBACK_MODEL || "gemini-3.6-flash";
  const context: OutfitContext = parsed.data;
  const prompt = buildStylistPrompt(context);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const startedAt = Date.now();
  const body = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: "application/json",
      thinkingConfig: { thinkingLevel: "low" },
      temperature: 0.7,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
    },
  });
  const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
  const retryDelay = (response: Response, attempt: number) => {
    const retryAfter = response.headers.get("retry-after");
    const fromHeader = retryAfter ? Number(retryAfter) * 1000 : 0;
    const exponential = Math.min(8_000, 750 * 2 ** attempt);
    const jitter = Math.floor(Math.random() * 400);
    return Math.min(8_000, Math.max(0, fromHeader || exponential + jitter));
  };
  async function requestModel(requestedModel: string) {
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
      if (Date.now() - startedAt >= REQUEST_TIMEOUT_MS) return null;
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${requestedModel}:generateContent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body,
        cache: "no-store",
        signal: controller.signal,
      }).catch(() => null);
      console.info("[Gemini] request attempt", { model: requestedModel, attempt: attempt + 1, status: response?.status ?? "timeout" });
      if (!response || response.status !== 503 || attempt === MAX_RETRIES) return response;
      const delay = retryDelay(response, attempt);
      if (Date.now() - startedAt + delay >= REQUEST_TIMEOUT_MS) return response;
      await wait(delay);
    }
    return null;
  }
  let usedModel = model;
  let result = await requestModel(model);
  if (result?.status === 503 && fallbackModel !== model) {
    console.info("[Gemini] primary model unavailable; trying fallback", { primary: model, fallback: fallbackModel });
    usedModel = fallbackModel;
    result = await requestModel(fallbackModel);
  }
  clearTimeout(timeout);
  if (!result) {
    console.error("[Gemini] request timed out", { model: usedModel, timeoutMs: REQUEST_TIMEOUT_MS, category: "timeout" });
    return NextResponse.json({ status: "error", error: "Gemini timed out. Try again shortly." }, { status: 504 });
  }
  if (!result.ok) {
    const upstream = await result.json().catch(() => null) as { error?: { message?: string } } | null;
    console.error("[Gemini] upstream request failed", {
      status: result.status,
      model: usedModel,
      attempts: result.status === 503 ? MAX_RETRIES + 1 : 1,
      category: result.status === 503 ? "capacity" : "upstream",
      error: upstream?.error?.message ?? "No error body returned",
    });
    const message = result.status === 401 || result.status === 403
      ? "Gemini rejected the API key. Check that it is an active Gemini API key for this project."
      : result.status === 404
          ? `Gemini model '${usedModel}' is unavailable. Update GEMINI_MODEL.`
        : result.status === 429
          ? "Gemini quota or rate limit reached. Try again later."
          : result.status === 503
            ? "Gemini is temporarily busy. Please try again in a moment."
          : "Gemini could not complete this styling request. Try again shortly.";
    return NextResponse.json(
      {
        status: "error",
        error: message,
        ...(process.env.NODE_ENV !== "production" && upstream?.error?.message ? { detail: upstream.error.message } : {}),
      },
      { status: result.status === 401 || result.status === 403 ? 502 : result.status === 429 || result.status === 503 ? result.status : 502 },
    );
  }
  const payload = (await result.json()) as {
    candidates?: Array<{ finishReason?: string; content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
  const finishReason = payload.candidates?.[0]?.finishReason;
  if (finishReason === "MAX_TOKENS") {
    console.error("[Gemini] response exhausted its token budget", { model: usedModel, finishReason });
    return NextResponse.json({ status: "error", error: "Gemini reached its response limit. Try again with a shorter request." }, { status: 502 });
  }
  let candidate: unknown = null;
  try { candidate = text ? JSON.parse(text) : null; } catch { candidate = null; }
  const output = responseSchema.safeParse(candidate);
  if (!output.success) {
    console.error("[Gemini] response did not match styling schema", {
      model: usedModel,
      finishReason,
      responsePreview: text?.slice(0, 1200) ?? "No text returned",
      issues: output.error.issues,
    });
    return NextResponse.json(
      {
        status: "error",
        error: "Gemini returned an unexpected styling response.",
      },
      { status: 502 },
    );
  }
  const qualityIssue = validateStylistResponse(output.data as StylistResponse);
  if (qualityIssue) {
    console.error("[Gemini] response failed recommendation quality checks", { model: usedModel, qualityIssue });
    return NextResponse.json({ status: "error", error: "Gemini returned an incomplete or inconsistent outfit. Try again." }, { status: 502 });
  }
  return NextResponse.json({ status: "ready", data: output.data });
}
