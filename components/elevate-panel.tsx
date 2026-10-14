"use client";
import { useEffect, useState } from "react";
import { readCurrentOutfit, saveOutfit, type OutfitVersion } from "@/lib/outfit";
const directions = [
  "More polished",
  "More date-ready",
  "More creative",
  "Surprise me",
];
export function ElevatePanel() {
  const [direction, setDirection] = useState(directions[0]);
  const [versions, setVersions] = useState<OutfitVersion[]>([]);
  useEffect(() => {
    try { setVersions(JSON.parse(localStorage.getItem("stylebender-elevations") ?? "[]") as OutfitVersion[]); } catch { setVersions([]); }
  }, []);
  function create() {
    const current = readCurrentOutfit();
    if (!current) return;
    const next = [{ ...current, id: crypto.randomUUID(), createdAt: Date.now(), source: "elevated" as const, direction, title: `${direction}: ${current.title}` }, ...versions].slice(0, 5);
    setVersions(next);
    localStorage.setItem("stylebender-elevations", JSON.stringify(next));
    saveOutfit(next[0]);
  }
  return (
    <div className="mt-10 max-w-4xl">
      <div className="bg-paper border border-line p-6 lg:p-8">
        <p className="uppercase tracking-[.25em] text-[10px] text-bronze">
          Refine your direction
        </p>
        <h2 className="serif text-4xl mt-3">Elevate my look.</h2>
        <p className="text-muted mt-4 leading-6 max-w-xl">
          Keep the considered base, then choose the feeling you want to push
          further.
        </p>
        <div className="flex gap-2 flex-wrap mt-8">
          {directions.map((item) => (
            <button
              key={item}
              onClick={() => setDirection(item)}
              className={
                "px-4 py-2 text-xs border " +
                (direction === item
                  ? "bg-forest text-ivory border-forest"
                  : "border-line text-muted")
              }
            >
              {item}
            </button>
          ))}
        </div>
        <button
          onClick={create}
          className="mt-8 bg-forest text-ivory px-5 py-3 text-xs"
        >
          Create version
        </button>
      </div>
      {versions.length > 0 && (
        <div className="mt-4 bg-paper border border-line p-6">
          <p className="uppercase tracking-[.25em] text-[10px] text-bronze">
            Version history
          </p>
          {versions.map((version) => (
            <p key={version.id} className="border-b border-line py-3 text-sm">
              {version.title} · {new Date(version.createdAt).toLocaleDateString("en-GB")}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
