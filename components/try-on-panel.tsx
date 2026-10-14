"use client";
import { useState } from "react";
import Image from "next/image";
import { ShieldCheck, Upload } from "lucide-react";
export function TryOnPanel() {
  const [consent, setConsent] = useState(false);
  const [file, setFile] = useState<string | null>(null);
  return (
    <div className="mt-10 max-w-3xl bg-paper border border-line p-6 lg:p-8">
      <div className="relative h-52 overflow-hidden -mx-6 -mt-6 lg:-mx-8 lg:-mt-8 mb-8">
        <Image src="/fitting-room-editorial.jpg" alt="Editorial fitting room with mirrored styling view" fill sizes="(max-width: 768px) 100vw, 800px" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-forest/70 to-transparent" />
      </div>
      <p className="uppercase tracking-[.25em] text-[10px] text-bronze">
        Visual preview
      </p>
      <h2 className="serif text-4xl mt-3">Try on, thoughtfully.</h2>
      <p className="text-muted leading-6 mt-4">
        Upload a photo of yourself and a selected garment for a visual preview.
        This cannot guarantee fit, sizing, drape, comfort, or fabric behaviour.
      </p>
      <div className="mt-8 border border-dashed border-line p-8 text-center">
        <Upload className="mx-auto text-bronze" size={24} />
        <p className="text-sm mt-3">{file ?? "Choose a full-body photo"}</p>
        <label className="inline-block border border-line px-4 py-2 text-xs mt-4 cursor-pointer">
          Choose photo
          <input
            className="sr-only"
            type="file"
            accept="image/*"
            onChange={(event) => setFile(event.target.files?.[0]?.name ?? null)}
          />
        </label>
      </div>
      <label className="flex gap-3 mt-7 text-sm text-muted leading-6">
        <input
          type="checkbox"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
          className="mt-1"
        />
        I understand this is a visual preview and I explicitly consent to
        sending this selected photo to a configured provider. No provider is
        connected in this demo.
      </label>
      <button
        disabled={!consent || !file}
        className="bg-forest text-ivory disabled:opacity-40 px-5 py-3 text-xs mt-7"
      >
        {consent && file
          ? "Provider unavailable in demo"
          : "Continue when ready"}
      </button>
      <div className="flex gap-2 items-center text-xs text-muted mt-6">
        <ShieldCheck size={15} className="text-bronze" />
        Photos are not uploaded by adding them to your wardrobe.
      </div>
    </div>
  );
}
