import { createSign } from "node:crypto";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = "virtual-try-on-001";
const MAX_IMAGE = 1_500_000;
const recent = new Map<string, { count: number; reset: number }>();
type Credentials = { client_email: string; private_key: string; project_id: string };
type ImageValue = { mimeType: "image/png" | "image/jpeg"; bytesBase64Encoded: string };

function error(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

function getCredentials(): Credentials | null {
  try {
    const source = process.env.GOOGLE_VERTEX_SERVICE_ACCOUNT_JSON;
    if (!source) return null;
    const data = JSON.parse(source) as Partial<Credentials>;
    if (!data.client_email || !data.private_key || !data.project_id || !/^[a-z0-9-]+$/.test(data.project_id)) return null;
    return { client_email: data.client_email, private_key: data.private_key.replace(/\\n/g, "\n"), project_id: data.project_id };
  } catch { return null; }
}

async function oauthToken(service: Credentials): Promise<string> {
  const time = Math.floor(Date.now() / 1000);
  const encode = (x: unknown) => Buffer.from(JSON.stringify(x)).toString("base64url");
  const input = encode({ alg: "RS256", typ: "JWT" }) + "." + encode({
    iss: service.client_email, scope: "https://www.googleapis.com/auth/cloud-platform",
    aud: "https://oauth2.googleapis.com/token", iat: time, exp: time + 3600,
  });
  const signer = createSign("RSA-SHA256");
  signer.update(input);
  signer.end();
  const jwt = input + "." + signer.sign(service.private_key, "base64url");
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST", cache: "no-store", signal: AbortSignal.timeout(12000),
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: jwt }),
  });
  if (!response.ok) throw new Error("Google authentication failed");
  const payload = await response.json() as { access_token?: string };
  if (!payload.access_token) throw new Error("Missing Google access token");
  return payload.access_token;
}

async function parseImage(item: FormDataEntryValue | null): Promise<ImageValue | null> {
  if (!(item instanceof File) || item.size < 20 || item.size > MAX_IMAGE) return null;
  if (item.type !== "image/jpeg" && item.type !== "image/png") return null;
  const bytes = Buffer.from(await item.arrayBuffer());
  const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const png = bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (!(item.type === "image/jpeg" ? jpeg : png)) return null;
  return { mimeType: item.type, bytesBase64Encoded: bytes.toString("base64") };
}

export async function POST(request: Request) {
  // Explicit paid call gate. Never enable on production without the owner's approval.
  if (process.env.TRYON_ENABLED !== "true" || process.env.TRYON_PAID_CALLS_APPROVED !== "true") {
    return error("Virtual try-on is not enabled yet. No photos were sent.", 503);
  }
  const session = await auth();
  const owner = process.env.TRYON_OWNER_EMAIL ?? "admin@stylebender.test";
  if (!session?.user?.email || session.user.email.toLowerCase() !== owner.toLowerCase()) {
    return error("Owner sign-in is required.", 401);
  }
  const service = getCredentials();
  const region = process.env.GOOGLE_VERTEX_LOCATION ?? "us-central1";
  if (!service || !/^[a-z0-9-]+$/.test(region)) return error("Google Cloud try-on is not configured.", 503);
  if (Number(request.headers.get("content-length") ?? 0) > 3_400_000) {
    return error("Photos are too large.", 413);
  }
  if (!(request.headers.get("content-type") ?? "").startsWith("multipart/form-data")) return error("Upload two photos.");

  let form: FormData;
  try { form = await request.formData(); } catch { return error("Could not read the uploaded photos."); }
  if (form.get("consent") !== "true") return error("Confirm you have permission to process both photos.");
  const [person, garment] = await Promise.all([parseImage(form.get("person")), parseImage(form.get("garment"))]);
  if (!person || !garment) return error("Provide JPEG or PNG photos smaller than 1.5 MB each.");

  // Best-effort guard only. Serverless memory is not a durable financial quota.
  const id = session.user.email.toLowerCase(), now = Date.now();
  const last = recent.get(id);
  const count = last && last.reset > now ? last.count : 0;
  if (count >= 2) return error("The daily demo limit has been reached.", 429);
  recent.set(id, { count: count + 1, reset: last && last.reset > now ? last.reset : now + 86_400_000 });

  try {
    const token = await oauthToken(service);
    const url = `https://${region}-aiplatform.googleapis.com/v1/projects/${service.project_id}/locations/${region}/publishers/google/models/${MODEL}:predict`;
    const response = await fetch(url, {
      method: "POST", cache: "no-store", signal: AbortSignal.timeout(52000),
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        instances: [{
          prompt: "Show this consenting adult wearing the provided garment. Preserve face, pose, garment colour and details. This is a visual preview, not an exact fit measurement.",
          personImage: { image: person },
          productImages: [{ image: garment }],
        }],
        parameters: { sampleCount: 1, addWatermark: true, personGeneration: "allow_adult",
          outputOptions: { mimeType: "image/jpeg", compressionQuality: 82 } },
      }),
    });
    if (!response.ok) {
      console.error("[TryOn] provider error", { status: response.status });
      return error(response.status === 429 ? "Provider quota exceeded. Try later." : "Provider could not generate a preview.", response.status === 429 ? 429 : 502);
    }
    const result = await response.json() as {
      predictions?: Array<{ mimeType?: string; bytesBase64Encoded?: string }>;
    };
    const image = result.predictions?.[0];
    if (!image?.bytesBase64Encoded || !["image/jpeg", "image/png"].includes(image.mimeType ?? "")) {
      return error("The provider returned no usable preview.", 502);
    }
    const bytes = Buffer.from(image.bytesBase64Encoded, "base64");
    if (!bytes.length || bytes.length > 4_000_000) return error("The preview image is too large.", 502);
    return new Response(new Uint8Array(bytes), {
      headers: { "Content-Type": image.mimeType!, "Cache-Control": "no-store, private, max-age=0", "X-Content-Type-Options": "nosniff" },
    });
  } catch (exception) {
    console.error("[TryOn] generation failed", { kind: exception instanceof Error && exception.name === "TimeoutError" ? "timeout" : "provider" });
    return error("Virtual try-on is unavailable. Your photos were not saved by Stylebender.", 503);
  }
}
