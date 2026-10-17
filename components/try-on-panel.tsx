"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, ArrowLeftRight, Camera, CheckCircle2, Loader2, ShieldCheck, Shirt, Trash2 } from "lucide-react";
import { readCurrentOutfit, type OutfitVersion, type OutfitPiece } from "@/lib/outfit";
import { getWardrobeItems, getWardrobeMedia, type WardrobeItem } from "@/lib/wardrobe";
import { prepareTryOnPhoto, type TryOnPhoto, type CropBounds } from "@/lib/try-on-photo";
import { TryOnCrop } from "@/components/try-on-crop";

type StyleCheck = { verdict: "works" | "tweak" | "skip"; headline: string; explanation: string; practicalTip: string };

function PhotoField({ label, helper, photo, onSelect, onRemove, person, disabled }: {
  label: string;
  helper: string;
  photo: TryOnPhoto | null;
  onSelect: (file: File) => void;
  onRemove: () => void;
  person?: boolean;
  disabled: boolean;
}) {
  return (
    <div className="rounded-2xl border border-line bg-ivory/50 p-3 min-w-0">
      <div className="flex items-center gap-2 text-sm font-medium text-forest">
        {person ? <Camera size={17} className="text-bronze shrink-0" /> : <Shirt size={17} className="text-bronze shrink-0" />}
        {label}
      </div>
      <p className="mt-1 text-xs text-muted leading-5 min-h-10">{helper}</p>
      {photo ? (
        <div className="relative mt-3 aspect-[4/5] rounded-xl overflow-hidden bg-forest/10">
          <img src={photo.url} alt={label + " selected for try-on"} className="h-full w-full object-contain" />
          <button type="button" disabled={disabled} onClick={onRemove} aria-label={"Remove " + label.toLowerCase()}
            className="absolute right-2 top-2 rounded-full min-h-11 min-w-11 inline-flex items-center justify-center bg-forest text-ivory disabled:opacity-50">
            <Trash2 size={16} />
          </button>
        </div>
      ) : (
        <label className="mt-3 aspect-[4/5] min-h-36 border-2 border-dashed border-line rounded-xl cursor-pointer flex flex-col items-center justify-center gap-3 bg-paper text-forest hover:border-bronze text-center px-3">
          <span className="text-sm font-medium">Choose a photo</span>
          <span className="text-xs text-muted">JPEG, PNG or a phone photo</span>
          <input type="file" accept="image/*" className="sr-only" disabled={disabled}
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

export function TryOnPanel({ initialWardrobeId }: { initialWardrobeId?: string | null }) {
  const [person, setPerson] = useState<TryOnPhoto | null>(null);
  const [garment, setGarment] = useState<TryOnPhoto | null>(null);
  const [garmentName, setGarmentName] = useState("");
  const [pendingCrop, setPendingCrop] = useState<File | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>([]);
  const [currentLook, setCurrentLook] = useState<OutfitVersion | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [compare, setCompare] = useState(50);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [assessing, setAssessing] = useState(false);
  const [assessment, setAssessment] = useState<StyleCheck | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [assessmentError, setAssessmentError] = useState<string | null>(null);
  const urls = useRef(new Set<string>());
  const abortRef = useRef<AbortController | null>(null);
  const assessmentAbort = useRef<AbortController | null>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);

  function release(url: string | null | undefined) {
    if (!url) return;
    URL.revokeObjectURL(url);
    urls.current.delete(url);
  }
  function track(photo: TryOnPhoto) { urls.current.add(photo.url); return photo; }

  function clearResult() {
    if (preview) release(preview);
    setPreview(null);
    setAssessment(null);
    setAssessmentError(null);
    setError(null);
    setConsent(false);
  }
  function applyPerson(photo: TryOnPhoto) {
    clearResult();
    setPerson((old) => { release(old?.url); return track(photo); });
  }
  function applyGarment(photo: TryOnPhoto) {
    clearResult();
    setGarment((old) => { release(old?.url); return track(photo); });
  }
  function errorText(reason: unknown) {
    setError(reason instanceof Error ? reason.message : "Could not prepare that garment image.");
  }

  async function loadOwned(item: WardrobeItem) {
    if (busy || preparing) return;
    setPendingCrop(null);
    setGarmentName(item.name);
    setPreparing(true);
    clearResult();
    try {
      const media = await getWardrobeMedia(item.id);
      if (!media) throw new Error("No local photo is available for this wardrobe piece. Upload one below.");
      const photo = await prepareTryOnPhoto(new File([media], item.name + ".jpg", { type: media.type || "image/jpeg" }));
      applyGarment(photo);
    } catch (cause) {
      setGarment((old) => { release(old?.url); return null; });
      errorText(cause);
    } finally { setPreparing(false); }
  }

  async function loadLookPiece(piece: OutfitPiece) {
    if (busy || preparing) return;
    setPendingCrop(null);
    setGarmentName(piece.name);
    clearResult();
    if (piece.wardrobeItemId) {
      const found = wardrobe.find((item) => item.id === piece.wardrobeItemId);
      if (found) return void loadOwned(found);
    }
    // Only same-origin verified local catalogue images are fetched. Never
    // pretend an unrelated item or remote URL is the actual garment.
    const path = piece.product?.source === "local-catalog" ? piece.product.image : undefined;
    if (!path?.startsWith("/") || path.startsWith("//")) {
      setGarment((old) => { release(old?.url); return null; });
      setError("This look has no local photo for that garment. Add an accurate garment photo below.");
      return;
    }
    setPreparing(true);
    try {
      const response = await fetch(path, { cache: "no-store" });
      if (!response.ok) throw new Error("The reference image is unavailable. Please upload the garment.");
      const blob = await response.blob();
      applyGarment(await prepareTryOnPhoto(new File([blob], piece.name + ".png", { type: blob.type })));
    } catch (cause) {
      setGarment((old) => { release(old?.url); return null; });
      errorText(cause);
    } finally { setPreparing(false); }
  }

  useEffect(() => {
    setCurrentLook(readCurrentOutfit());
    let mounted = true;
    getWardrobeItems().then((items) => { if (mounted) setWardrobe(items); }).catch(() => { /* empty local wardrobe */ });
    return () => {
      mounted = false;
      abortRef.current?.abort();
      assessmentAbort.current?.abort();
      urls.current.forEach((url) => URL.revokeObjectURL(url));
      urls.current.clear();
    };
  }, []);

  useEffect(() => {
    if (!initialWardrobeId || !wardrobe.length) return;
    const item = wardrobe.find((entry) => entry.id === initialWardrobeId);
    if (item) void loadOwned(item);
    // Selection happens only on navigation to the try-on panel, never on each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialWardrobeId, wardrobe]);

  async function fileSelected(kind: "person" | "garment", file: File) {
    if (busy || preparing) return;
    clearResult();
    if (kind === "garment") {
      setPendingCrop(null);
      try {
        // Tall screenshots typically include website chrome and need a crop.
        // Short/local product photos can be used straight away.
        const temp = URL.createObjectURL(file);
        const image = new window.Image();
        try {
          await new Promise<void>((resolve, reject) => {
            image.onload = () => resolve(); image.onerror = () => reject(new Error("Unsupported garment photo."));
            image.src = temp;
          });
        } finally { URL.revokeObjectURL(temp); }
        if (image.naturalHeight / Math.max(1, image.naturalWidth) > 1.65) {
          setGarment((old) => { release(old?.url); return null; });
          setPendingCrop(file);
          return;
        }
      } catch (cause) { errorText(cause); return; }
    }
    setPreparing(true);
    try {
      const next = await prepareTryOnPhoto(file);
      if (kind === "person") applyPerson(next);
      else applyGarment(next);
    } catch (cause) { errorText(cause); }
    finally { setPreparing(false); }
  }

  async function applyCrop(crop: CropBounds) {
    if (!pendingCrop || preparing) return;
    setPreparing(true);
    try {
      applyGarment(await prepareTryOnPhoto(pendingCrop, crop));
      setPendingCrop(null);
    } catch (cause) { errorText(cause); }
    finally { setPreparing(false); }
  }

  async function generate() {
    if (!person || !garment || !consent || busy || preparing) return;
    setBusy(true); setError(null); clearPreviewOnly(); setAssessment(null); setAssessmentError(null);
    const abort = new AbortController(); abortRef.current = abort;
    const form = new FormData();
    form.set("person", person.file); form.set("garment", garment.file); form.set("consent", "true");
    try {
      const response = await fetch("/api/try-on", { method: "POST", body: form, cache: "no-store", signal: abort.signal });
      if (!response.ok) {
        const data = await response.json().catch(() => null) as { error?: string } | null;
        throw new Error(data?.error ?? "Could not generate try-on preview.");
      }
      const mime = response.headers.get("content-type") ?? "";
      if (!["image/png", "image/jpeg"].some((type) => mime.startsWith(type))) throw new Error("The service returned an unexpected result.");
      const blob = await response.blob();
      if (!blob.size || blob.size > 4_000_000) throw new Error("The preview could not be displayed.");
      const url = URL.createObjectURL(blob);
      urls.current.add(url);
      setPreview(url); setCompare(50);
      requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    } catch (cause) {
      if (!abort.signal.aborted) errorText(cause);
    } finally {
      if (abortRef.current === abort) abortRef.current = null;
      if (!abort.signal.aborted) setBusy(false);
    }
  }

  function clearPreviewOnly() {
    if (preview) release(preview);
    setPreview(null);
  }

  async function assessStyle() {
    if (!preview || !currentLook || !garmentName.trim() || assessing) return;
    setAssessment(null); setAssessmentError(null); setAssessing(true);
    const abort = new AbortController(); assessmentAbort.current = abort;
    try {
      const response = await fetch("/api/try-on-assess", {
        method: "POST", cache: "no-store", signal: abort.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          occasion: currentLook.context.occasion,
          selectedGarment: garmentName.trim(),
          currentPieces: currentLook.pieces.map((piece) => piece.name),
        }),
      });
      const json = await response.json() as { assessment?: StyleCheck; error?: string };
      if (!response.ok || !json.assessment) throw new Error(json.error ?? "Style check is unavailable.");
      setAssessment(json.assessment);
    } catch (cause) {
      if (!abort.signal.aborted) setAssessmentError(cause instanceof Error ? cause.message : "Style check failed.");
    } finally { if (!abort.signal.aborted) setAssessing(false); }
  }

  return (
    <section className="tryon-panel mt-5 mb-[calc(7rem+env(safe-area-inset-bottom))] lg:mb-0 max-w-3xl rounded-2xl border border-line bg-paper p-4 sm:p-6 lg:p-8">
      <p className="eyebrow text-bronze">Experimental · One garment at a time</p>
      <h2 className="serif text-3xl md:text-4xl mt-3">See it on you.</h2>
      <p className="mt-3 text-sm leading-6 text-muted">Compare a real outfit photo with an AI preview. Select a wardrobe piece, a garment from My Look, or upload a shopping screenshot and crop out the surrounding website.</p>

      {(currentLook?.pieces.length || wardrobe.length > 0) ? (
        <div className="mt-5 border border-line bg-ivory/40 rounded-xl p-3 space-y-3">
          <p className="text-xs uppercase tracking-widest text-bronze font-medium">Choose a garment you already know</p>
          {currentLook && (
            <label className="block text-xs text-forest">
              From My Look · {currentLook.context.occasion}
              <select aria-label="Choose a garment from My Look" defaultValue="" disabled={busy || preparing}
                onChange={(event) => { const chosen = currentLook.pieces.find((piece) => piece.name === event.target.value); if (chosen) void loadLookPiece(chosen); }}
                className="block w-full mt-2 border border-line rounded-lg bg-paper px-3 py-3 text-sm text-forest">
                <option value="">Select a look garment…</option>
                {currentLook.pieces.map((piece) => <option value={piece.name} key={piece.name}>{piece.name}</option>)}
              </select>
            </label>
          )}
          {wardrobe.length > 0 && (
            <label className="block text-xs text-forest">
              From my Wardrobe
              <select aria-label="Choose a garment from Wardrobe" defaultValue={initialWardrobeId ?? ""} disabled={busy || preparing}
                onChange={(event) => { const chosen = wardrobe.find((item) => item.id === event.target.value); if (chosen) void loadOwned(chosen); }}
                className="block w-full mt-2 border border-line rounded-lg bg-paper px-3 py-3 text-sm text-forest">
                <option value="">Select a saved garment…</option>
                {wardrobe.map((item) => <option key={item.id} value={item.id}>{item.name}{item.source === "demo" ? " (sample)" : ""}</option>)}
              </select>
            </label>
          )}
          <p className="text-xs text-muted">These selections stay local. Nothing is transmitted until you approve generation.</p>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-2 sm:gap-4 mt-6">
        <PhotoField label="Your photo" helper="Adult, front-facing, head-to-toe works best." photo={person} person disabled={busy || preparing}
          onSelect={(file) => { void fileSelected("person", file); }}
          onRemove={() => { clearResult(); setPerson((old) => { release(old?.url); return null; }); }} />
        <PhotoField label="Garment photo" helper="One garment, without shopping buttons or text." photo={garment} disabled={busy || preparing}
          onSelect={(file) => { void fileSelected("garment", file); }}
          onRemove={() => { clearResult(); setGarment((old) => { release(old?.url); return null; }); }} />
      </div>
      {garment && !pendingCrop && <button type="button" disabled={busy || preparing} className="mt-2 text-xs text-forest underline underline-offset-4 min-h-11" onClick={() => setPendingCrop(garment.file)}>Adjust garment crop</button>}
      {pendingCrop && <TryOnCrop file={pendingCrop} onApply={(bounds) => { void applyCrop(bounds); }} onCancel={() => setPendingCrop(null)} busy={preparing || busy} />}

      <label className="block mt-5 text-xs text-forest font-medium" htmlFor="tryon-garment-name">What garment is it? <span className="font-normal text-muted">(for optional style advice)</span></label>
      <input id="tryon-garment-name" type="text" maxLength={120} value={garmentName}
        onChange={(event) => { setGarmentName(event.target.value); setAssessment(null); }}
        placeholder="e.g. Blue denim button-down shirt" className="mt-2 w-full min-h-11 border border-line rounded-lg bg-ivory/40 px-3 text-sm text-forest" />

      <label className="mt-6 flex items-start gap-3 rounded-xl border border-line bg-ivory/40 p-4 text-xs leading-5 text-forest cursor-pointer">
        <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-1 accent-forest w-4 h-4 shrink-0" />
        <span>I am an adult, I have permission to use both photos, and I agree to send them to Google Cloud for this one AI preview when I tap Generate.</span>
      </label>
      <div className="mt-4 flex items-start gap-2 text-xs text-muted leading-5">
        <ShieldCheck size={16} className="text-bronze shrink-0 mt-0.5" />
        <span>Stylebender does not save the photos or generated image to your wardrobe or account. Google Cloud will process them only when you generate. Virtual appearance does not guarantee real-world fit.</span>
      </div>
      <button type="button" disabled={!person || !garment || !consent || busy || preparing || Boolean(pendingCrop)} onClick={() => void generate()}
        className="mt-6 w-full min-h-[50px] rounded-xl bg-forest text-ivory px-5 py-3 flex items-center justify-center gap-2 text-sm font-semibold disabled:opacity-45">
        {busy || preparing ? <><Loader2 size={17} className="animate-spin" /> {busy ? "Generating one preview…" : "Preparing photo…"}</> : "Generate virtual try-on"}
      </button>
      <p className="text-xs text-muted mt-2">Image generation is a paid operation, triggered only when you press Generate.</p>
      {error && <p role="alert" className="mt-4 flex gap-2 text-sm leading-5 text-amber-900 bg-amber-50 border border-amber-200 p-3 rounded-lg"><AlertCircle size={16} className="shrink-0" /> {error}</p>}

      {preview && person && (
        <div ref={resultRef} className="mt-7 pt-6 border-t border-line scroll-mt-6" aria-label="Virtual try-on results">
          <div className="flex gap-2 items-center"><CheckCircle2 size={18} className="text-bronze" /><h3 className="serif text-2xl">Your virtual preview</h3></div>
          <p className="text-xs text-muted mt-2">AI-generated illustration. Swipe the slider to compare. This cannot guarantee actual fit or exact colour.</p>
          <div className="relative w-full mt-4 bg-forest/10 overflow-hidden rounded-xl aspect-[3/4] max-h-[65dvh]" aria-label="Before and after image comparison">
            <img src={person.url} alt="Before: original person photo" className="absolute inset-0 w-full h-full object-contain" />
            <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - compare}% 0 0)` }}>
              <img src={preview} alt="After: AI-generated garment try-on" className="absolute inset-0 w-full h-full object-contain" />
            </div>
            <div className="absolute top-3 left-3 rounded-md px-2 py-1 bg-forest/85 text-ivory text-[11px]">After</div>
            <div className="absolute top-3 right-3 rounded-md px-2 py-1 bg-forest/85 text-ivory text-[11px]">Before</div>
            <div aria-hidden="true" className="absolute top-0 bottom-0 w-0.5 bg-paper shadow-md pointer-events-none"
              style={{ left: compare + "%" }} />
            <div aria-hidden="true" className="absolute top-1/2 w-10 h-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-paper text-forest flex items-center justify-center shadow-lg pointer-events-none"
              style={{ left: compare + "%" }}><ArrowLeftRight size={19} /></div>
          </div>
          <label className="block mt-3 text-xs text-forest font-medium" htmlFor="tryon-compare">Slide to reveal original and new look</label>
          <input id="tryon-compare" type="range" min={0} max={100} step={1} value={compare}
            onChange={(event) => setCompare(Number(event.target.value))}
            aria-label="Before and after comparison" className="w-full mt-2 min-h-11 accent-forest" />
          <div className="flex justify-between text-xs text-muted"><span>Original photo</span><span>AI preview</span></div>
          <button type="button" className="mt-3 text-xs underline underline-offset-4 min-h-11 text-forest" onClick={() => { clearPreviewOnly(); setAssessment(null); }}>Clear preview</button>

          {currentLook && (
            <div className="rounded-xl border border-line bg-ivory/40 p-4 mt-6">
              <h4 className="serif text-2xl">Does it work together?</h4>
              <p className="text-xs text-muted leading-5 mt-2">Ask Gemini to assess <strong>{garmentName.trim() || "the proposed garment"}</strong> against your saved My Look for <strong>{currentLook.context.occasion}</strong>. Only garment names and the occasion are sent, not photos or your generated image.</p>
              <button type="button" disabled={!garmentName.trim() || assessing} onClick={() => void assessStyle()}
                className="mt-4 min-h-11 rounded-lg w-full px-4 bg-forest text-ivory text-sm font-medium disabled:opacity-50">
                {assessing ? "Checking style…" : "Get styling assessment (Gemini)"}
              </button>
              <p className="text-[11px] text-muted mt-2">Optional separate AI request. May incur Gemini usage charges.</p>
              {assessmentError && <p role="alert" className="mt-3 text-xs text-red-900">{assessmentError}</p>}
              {assessment && (
                <div className="mt-4 border-t border-line pt-4" role="status">
                  <span className="uppercase text-[11px] tracking-widest text-bronze">{assessment.verdict === "works" ? "Works together" : assessment.verdict === "tweak" ? "Needs a tweak" : "Try something else"}</span>
                  <h5 className="serif text-xl mt-2">{assessment.headline}</h5>
                  <p className="text-sm leading-6 mt-2">{assessment.explanation}</p>
                  <p className="text-xs text-muted mt-3"><strong>Styling tip:</strong> {assessment.practicalTip}</p>
                  <p className="text-[11px] text-muted mt-2 italic">Text-only guidance, not a visual image assessment.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
