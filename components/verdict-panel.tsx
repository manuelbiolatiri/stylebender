"use client";
import { ArrowUpRight, Bookmark, Check, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
type Result = {
  verdict: string;
  title: string;
  summary: string;
  reasons: string[];
};
export function VerdictPanel({
  onSave,
  onAction,
}: {
  onSave: () => void;
  onAction: (action: string) => void;
}) {
  const [verdict, setVerdict] = useState("Wear");
  const [saved, setSaved] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [status, setStatus] = useState("idle");
  async function generate() {
    setStatus("loading");
    try {
      const response = await fetch("/api/stylist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          occasion: "Church",
          budget: "£150–£300",
          styles: ["Tailored / elegant", "Quiet luxury", "Smart casual"],
          request: "Give me one strong look",
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error);
      setResult(payload.data);
      setVerdict(payload.data.verdict);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }
  function save() {
    onSave();
    setSaved(true);
  }
  return (
    <div className="mt-10 grid lg:grid-cols-[1.1fr_.9fr] gap-4 max-w-5xl">
      <div className="bg-forest text-ivory min-h-[420px] p-7 lg:p-10 flex flex-col justify-between">
        <div>
          <div className="flex justify-between">
            <span className="uppercase tracking-[.25em] text-[10px] text-bronze">
              Style verdict / Church
            </span>
            <Sparkles size={18} className="text-bronze" />
          </div>
          <h2 className="serif text-5xl mt-10">
            {result?.title ?? "The considered layer."}
          </h2>
          <p className="text-ivory/65 leading-7 mt-6 max-w-sm">
            {result?.summary ??
              "Charcoal pleated trousers, an ivory Oxford shirt and a textured forest overshirt. Quiet confidence, with enough texture to feel intentional."}
          </p>
        </div>
        <div>
          <button
            onClick={generate}
            disabled={status === "loading"}
            className="border border-bronze text-bronze px-4 py-2 text-xs mb-5"
          >
            {status === "loading" ? (
              <>
                <Loader2 className="inline mr-2 animate-spin" size={14} />
                Thinking…
              </>
            ) : (
              "Generate with Gemini"
            )}
          </button>
          {status === "error" && (
            <p className="text-xs text-amber-200 mb-4">
              Gemini is unavailable or returned an error. The local demo verdict
              remains available.
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {["Wear", "Change One Piece", "Elevate", "Skip"].map((choice) => (
              <button
                key={choice}
                onClick={() => setVerdict(choice)}
                className={
                  "px-3 py-2 text-xs border " +
                  (verdict === choice
                    ? "bg-ivory text-forest border-ivory"
                    : "border-ivory/30 text-ivory/70")
                }
              >
                {verdict === choice && (
                  <Check className="inline mr-1" size={13} />
                )}{" "}
                {choice}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-paper border border-line p-7 lg:p-10">
        <p className="uppercase tracking-[.25em] text-[10px] text-bronze">
          Why it works
        </p>
        <div className="space-y-5 mt-7 text-sm leading-6">
          {(
            result?.reasons ?? [
              "Ivory lifts the charcoal base; forest gives the look a grounded signature.",
              "A relaxed overshirt balances the cleaner trouser line without losing shape.",
              "Illustrative estimate: £180–£260, before owned pieces. Not live pricing.",
            ]
          ).map((reason) => (
            <p key={reason}>
              <span className="text-muted">{reason}</span>
            </p>
          ))}
        </div>
        <div className="border-t border-line mt-8 pt-6 flex flex-wrap gap-3">
          <button
            onClick={() => onAction("Achieve")}
            className="text-xs border border-line px-3 py-2"
          >
            Achieve this look <ArrowUpRight className="inline ml-1" size={14} />
          </button>
          <button
            onClick={() => onAction("Elevate")}
            className="text-xs border border-line px-3 py-2"
          >
            Elevate <ArrowUpRight className="inline ml-1" size={14} />
          </button>
          <button
            onClick={() => onAction("Try On")}
            className="text-xs border border-line px-3 py-2"
          >
            Try on <ArrowUpRight className="inline ml-1" size={14} />
          </button>
          <button
            onClick={save}
            className="text-xs bg-forest text-ivory px-3 py-2"
          >
            <Bookmark className="inline mr-1" size={14} />
            {saved ? "Saved" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
