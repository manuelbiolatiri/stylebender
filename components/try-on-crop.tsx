"use client";

import { useEffect, useState } from "react";
import { Check, Crop, RotateCcw, X } from "lucide-react";
import { fullCrop, type CropBounds } from "@/lib/try-on-photo";

const minRemaining = 15;
type Edge = keyof CropBounds;
const edges: Array<{ key: Edge; label: string; counterpart: Edge }> = [
  { key: "top", label: "Trim top", counterpart: "bottom" },
  { key: "bottom", label: "Trim bottom", counterpart: "top" },
  { key: "left", label: "Trim left", counterpart: "right" },
  { key: "right", label: "Trim right", counterpart: "left" },
];

/** A no-dependency manual crop, intentionally mobile/touch and keyboard accessible. */
export function TryOnCrop({ file, onApply, onCancel, busy }: {
  file: File;
  onApply: (crop: CropBounds) => void;
  onCancel: () => void;
  busy: boolean;
}) {
  const [source, setSource] = useState("");
  const [bounds, setBounds] = useState<CropBounds>(fullCrop);
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setSource(url);
    setBounds(fullCrop);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function adjust(key: Edge, opposite: Edge, next: number) {
    setBounds((old) => ({ ...old, [key]: Math.max(0, Math.min(next, 100 - minRemaining - old[opposite])) }));
  }

  return (
    <div className="mt-4 rounded-xl border border-bronze/50 p-3 sm:p-5 bg-paper" aria-label="Crop garment photograph">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-forest inline-flex items-center gap-2"><Crop size={17} /> Crop your garment</p>
        <button type="button" onClick={onCancel} aria-label="Cancel garment crop" className="min-h-11 px-2 text-muted"><X size={19} /></button>
      </div>
      <p className="mt-1 text-xs leading-5 text-muted">Trim away website headers, buttons and prices. Only the area inside the bronze outline will be sent for generation.</p>
      {source && (
        <div className="mt-3 flex justify-center bg-ivory/50 p-2 rounded-xl">
          <div className="relative inline-block max-w-full">
            <img src={source} alt="Full garment photograph with adjustable crop outline" className="block w-auto h-auto max-w-full max-h-[320px]" />
            <div aria-hidden="true" className="pointer-events-none absolute border-[3px] border-bronze bg-bronze/10 shadow-[0_0_0_2000px_rgba(20,37,30,.28)]"
              style={{ top: bounds.top + "%", bottom: bounds.bottom + "%", left: bounds.left + "%", right: bounds.right + "%" }} />
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-4">
        {edges.map(({ key, label, counterpart }) => (
          <label key={key} className="block min-w-0">
            <span className="flex items-center justify-between text-[11px] text-forest gap-2"><span>{label}</span><span className="tabular-nums">{bounds[key]}%</span></span>
            <input type="range" min={0} max={Math.min(85, 100 - minRemaining - bounds[counterpart])} step={1}
              value={bounds[key]} onChange={(event) => adjust(key, counterpart, Number(event.target.value))}
              aria-label={label} className="w-full accent-forest mt-1 min-h-8" />
          </label>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mt-4">
        <button type="button" disabled={busy} onClick={() => onApply(bounds)} className="flex-1 min-h-11 rounded-lg px-4 py-2 bg-forest text-ivory text-sm inline-flex justify-center items-center gap-2 disabled:opacity-50">
          <Check size={16} /> {busy ? "Preparing photo…" : "Use this crop"}
        </button>
        <button type="button" disabled={busy} onClick={() => setBounds(fullCrop)} className="min-h-11 border border-line rounded-lg px-3 text-xs text-forest inline-flex gap-1 items-center">
          <RotateCcw size={14} /> Reset
        </button>
      </div>
    </div>
  );
}
