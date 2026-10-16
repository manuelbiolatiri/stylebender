"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, Camera, CheckCircle2, Loader2, ShieldCheck, Shirt, Trash2 } from "lucide-react";

type Photo = { file: File; url: string };

async function preparePhoto(file: File): Promise<Photo> {
  if (!file.type.startsWith("image/")) throw new Error("Choose an image file, not a video.");
  if (file.size > 15_000_000) throw new Error("Choose an image smaller than 15 MB.");

  const inputUrl = URL.createObjectURL(file);
  try {
    const image = new window.Image();
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("This photo could not be opened. Please use a JPEG or PNG."));
      image.src = inputUrl;
    });
    const scale = Math.min(1, 1280 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Your browser could not prepare this photo.");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.8));
    if (!blob || blob.size > 1_500_000) throw new Error("This image is too detailed. Choose a smaller photo.");
    const compressed = new File([blob], "try-on-reference.jpg", { type: "image/jpeg" });
    return { file: compressed, url: URL.createObjectURL(blob) };
  } finally {
    URL.revokeObjectURL(inputUrl);
  }
}

function PhotoField({
  label, helper, photo, onSelect, onRemove, person,
}: {
  label: string;
  helper: string;
  photo: Photo | null;
  onSelect: (file: File) => void;
  onRemove: () => void;
  person?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-line bg-ivory/50 p-3 min-w-0">
      <div className="flex items-center gap-2 text-sm font-medium text-forest">
        {person ? <Camera size={17} className="text-bronze" /> : <Shirt size={17} className="text-bronze" />}
        {label}
      </div>
      <p className="mt-1 text-xs text-muted leading-5 min-h-10">{helper}</p>
      {photo ? (
        <div className="relative mt-3 aspect-[4/5] rounded-xl overflow-hidden bg-forest/10">
          <img src={photo.url} alt={label + " selected for try-on"} className="h-full w-full object-contain" />
          <button
            type="button" onClick={onRemove} aria-label={"Remove " + label.toLowerCase()}
            className="absolute right-2 top-2 rounded-full min-h-11 min-w-11 inline-flex items-center justify-center bg-forest text-ivory"
          ><Trash2 size={16} /></button>
        </div>
      ) : (
        <label className="mt-3 aspect-[4/5] min-h-36 border-2 border-dashed border-line rounded-xl cursor-pointer flex flex-col items-center justify-center gap-3 bg-paper text-forest hover:border-bronze text-center px-3">
          <span className="text-sm font-medium">Choose a photo</span>
          <span className="text-xs text-muted">JPEG, PNG or a phone photo</span>
          <input
            type="file" accept="image/*" className="sr-only"
            aria-label={"Upload " + label.toLowerCase()}
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              if (file) onSelect(file);
              event.currentTarget.value = "";
            }}
          />
        </label>
      )}
    </div>
  );
}

export function TryOnPanel() {
  const [person, setPerson] = useState<Photo | null>(null);
  const [garment, setGarment] = useState<Photo | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const urls = useRef<string[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => {
    abortRef.current?.abort();
    urls.current.forEach((url) => URL.revokeObjectURL(url));
    urls.current = [];
  }, []);

  function resetPreview() {
    setPreview(null);
    setError(null);
    setConsent(false);
  }

  async function select(kind: "person" | "garment", file: File) {
    if (busy) return;
    resetPreview();
    try {
      const photo = await preparePhoto(file);
      urls.current.push(photo.url);
      if (kind === "person") {
        setPerson((previous) => {
          if (previous) URL.revokeObjectURL(previous.url);
          return photo;
        });
      } else {
        setGarment((previous) => {
          if (previous) URL.revokeObjectURL(previous.url);
          return photo;
        });
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not prepare the photo.");
    }
  }

  function remove(kind: "person" | "garment") {
    resetPreview();
    if (kind === "person") {
      if (person) URL.revokeObjectURL(person.url);
      setPerson(null);
    } else {
      if (garment) URL.revokeObjectURL(garment.url);
      setGarment(null);
    }
  }

  async function generate() {
    if (!person || !garment || !consent || busy) return;
    setBusy(true);
    setError(null);
    setPreview(null);
    const abort = new AbortController();
    abortRef.current = abort;
    const form = new FormData();
    form.set("person", person.file);
    form.set("garment", garment.file);
    form.set("consent", "true");
    try {
      const response = await fetch("/api/try-on", { method: "POST", body: form, cache: "no-store", signal: abort.signal });
      if (!response.ok) {
        const body = await response.json().catch(() => null) as { error?: string } | null;
        throw new Error(body?.error ?? "Could not generate try-on preview.");
      }
      const mime = response.headers.get("content-type") ?? "";
      if (!["image/png", "image/jpeg"].some((type) => mime.startsWith(type))) throw new Error("The service returned an unexpected result.");
      const image = await response.blob();
      if (image.size === 0 || image.size > 4_000_000) throw new Error("The preview could not be displayed.");
      const url = URL.createObjectURL(image);
      urls.current.push(url);
      setPreview(url);
    } catch (cause) {
      if (!abort.signal.aborted) setError(cause instanceof Error ? cause.message : "Try-on is temporarily unavailable.");
    } finally {
      if (abortRef.current === abort) abortRef.current = null;
      if (!abort.signal.aborted) setBusy(false);
    }
  }

  return (
    <section className="mt-5 max-w-3xl rounded-2xl border border-line bg-paper p-4 sm:p-6 lg:p-8">
      <p className="eyebrow text-bronze">Experimental · One garment at a time</p>
      <h2 className="serif text-3xl md:text-4xl mt-3">See it on you.</h2>
      <p className="mt-3 text-sm leading-6 text-muted">
        Add a photo of yourself and a clear photograph of one item of clothing.
        You can preview the photos here without sending them anywhere.
      </p>

      <div className="grid grid-cols-2 gap-2 sm:gap-4 mt-6">
        <PhotoField
          label="Your photo"
          helper="Adult, front-facing, head-to-toe works best."
          photo={person} person
          onSelect={(file) => { void select("person", file); }}
          onRemove={() => remove("person")}
        />
        <PhotoField
          label="Garment photo"
          helper="One shirt, jacket or other clothing item on its own."
          photo={garment}
          onSelect={(file) => { void select("garment", file); }}
          onRemove={() => remove("garment")}
        />
      </div>

      <label className="mt-6 flex items-start gap-3 rounded-xl border border-line bg-ivory/40 p-4 text-xs leading-5 text-forest cursor-pointer">
        <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-1 accent-forest w-4 h-4 shrink-0" />
        <span>I am an adult, I have permission to use both photos, and I agree to send them to Google Cloud for this one AI preview when I tap Generate.</span>
      </label>
      <div className="mt-4 flex items-start gap-2 text-xs text-muted leading-5">
        <ShieldCheck size={16} className="text-bronze shrink-0 mt-0.5" />
        <span>Stylebender does not save the photos or generated image to your wardrobe or account. Google Cloud will process them when you generate. This is a visual suggestion, not a measurement of actual fit.</span>
      </div>

      <button type="button" disabled={!person || !garment || !consent || busy} onClick={() => void generate()}
        className="mt-6 w-full min-h-[50px] rounded-xl bg-forest text-ivory px-5 py-3 flex items-center justify-center gap-2 text-sm font-semibold disabled:opacity-45">
        {busy ? <><Loader2 size={17} className="animate-spin" /> Generating one preview…</> : "Generate virtual try-on"}
      </button>
      <p className="text-xs text-muted mt-2">AI image generation is a paid operation and only happens when you press Generate. Availability depends on the configured provider.</p>

      {error && <p role="alert" className="mt-4 flex gap-2 text-sm leading-5 text-amber-900 bg-amber-50 border border-amber-200 p-3 rounded-lg"><AlertCircle size={16} className="shrink-0" /> {error}</p>}

      {preview && (
        <div className="mt-7 pt-6 border-t border-line">
          <div className="flex gap-2 items-center"><CheckCircle2 size={18} className="text-bronze" /><h3 className="serif text-2xl">Your virtual preview</h3></div>
          <p className="text-xs text-muted mt-2">AI-generated illustration. This does not guarantee garment fit, dimensions or exact colour.</p>
          <div className="mt-4 bg-forest/10 rounded-xl overflow-hidden">
            <img src={preview} alt="AI-generated virtual try-on preview" className="block w-full h-auto max-h-[640px] object-contain" />
          </div>
          <button type="button" className="text-xs text-forest underline underline-offset-4 min-h-11 mt-3" onClick={() => setPreview(null)}>Clear preview</button>
        </div>
      )}
    </section>
  );
}
