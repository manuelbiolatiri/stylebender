"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AlertCircle, ShieldCheck, Trash2, Upload, X } from "lucide-react";

type PreviewFile = {
  id: string;
  file: File;
  url: string;
};

export function TryOnPanel() {
  const [consent, setConsent] = useState(false);
  const [files, setFiles] = useState<PreviewFile[]>([]);
  const filesRef = useRef<PreviewFile[]>([]);

  useEffect(() => () => filesRef.current.forEach((item) => URL.revokeObjectURL(item.url)), []);

  function addFiles(selection: FileList | null) {
    if (!selection) return;
    const next = Array.from(selection)
      .filter((file) => file.type.startsWith("image/") || file.type.startsWith("video/"))
      .filter((file) => file.size <= 50 * 1024 * 1024)
      .map((file) => ({ id: crypto.randomUUID(), file, url: URL.createObjectURL(file) }));
    setFiles((current) => {
      filesRef.current = [...current, ...next];
      return filesRef.current;
    });
  }

  function removeFile(id: string) {
    setFiles((current) => {
      const item = current.find((entry) => entry.id === id);
      if (item) URL.revokeObjectURL(item.url);
      filesRef.current = current.filter((entry) => entry.id !== id);
      return filesRef.current;
    });
  }

  function clearFiles() {
    files.forEach((item) => URL.revokeObjectURL(item.url));
    filesRef.current = [];
    setFiles([]);
  }

  return (
    <div className="mt-8 max-w-3xl bg-paper border border-line p-6 lg:p-8">
      <div className="relative h-48 md:h-56 overflow-hidden -mx-6 -mt-6 lg:-mx-8 lg:-mt-8 mb-8">
        <Image
          src="/fitting-room-editorial.jpg"
          alt="Editorial fitting room with mirrored styling view"
          fill
          sizes="(max-width: 768px) 100vw, 800px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest/80 via-forest/30 to-transparent" />
        <span className="absolute bottom-4 left-6 eyebrow text-ivory">Experimental / Studio Preview</span>
      </div>

      <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 text-amber-900 text-xs mb-6">
        <AlertCircle size={15} className="shrink-0" />
        <span>
          <strong>Provider Offline:</strong> Generative virtual try-on is in development. No third-party image synthesis provider is currently connected. You can upload local reference imagery to preview styling privately.
        </span>
      </div>

      <p className="uppercase tracking-[.25em] text-[10px] text-bronze font-medium">
        Local Visual Reference
      </p>
      <h2 className="serif text-3xl md:text-4xl mt-2">Try on, thoughtfully.</h2>
      <p className="text-muted leading-6 mt-3 text-sm md:text-base">
        Add reference photos or short video clips of yourself alongside recommended pieces.
        Everything is previewed locally in your browser only. This does not claim physical drape, exact fit, or textile stretch.
      </p>

      <div className="mt-6 border border-dashed border-line p-8 text-center bg-ivory/20">
        <Upload className="mx-auto text-bronze" size={24} />
        <p className="text-sm font-medium mt-3">
          {files.length ? `${files.length} file${files.length === 1 ? "" : "s"} loaded locally` : "Choose reference images or clips"}
        </p>
        <label className="inline-block border border-forest bg-forest text-ivory px-4 py-2 text-xs mt-3 cursor-pointer hover:bg-forest/90 transition-colors">
          Select files
          <input
            className="sr-only"
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={(event) => {
              addFiles(event.target.files);
              event.currentTarget.value = "";
            }}
          />
        </label>
        <p className="text-[11px] text-muted mt-2">
          Stored locally in your browser session · never transmitted without provider connection
        </p>
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-5">
          {files.map((item) => (
            <article key={item.id} className="relative bg-forest overflow-hidden aspect-[4/5] border border-line">
              {item.file.type.startsWith("video/") ? (
                <video src={item.url} controls muted playsInline className="w-full h-full object-cover" />
              ) : (
                <img src={item.url} alt={item.file.name} className="w-full h-full object-cover" />
              )}
              <button
                type="button"
                onClick={() => removeFile(item.id)}
                aria-label={`Remove ${item.file.name}`}
                className="absolute top-2 right-2 bg-forest/85 text-ivory p-1.5 hover:bg-forest"
              >
                <X size={14} />
              </button>
              <p className="absolute bottom-0 inset-x-0 bg-forest/80 text-ivory text-[10px] p-2 truncate">
                {item.file.name}
              </p>
            </article>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <button
          type="button"
          onClick={clearFiles}
          className="text-xs text-muted mt-4 hover:text-forest transition-colors inline-flex items-center gap-1"
        >
          <Trash2 size={13} />
          Clear all reference files
        </button>
      )}

      <div className="mt-8 pt-6 border-t border-line flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex gap-2 items-center text-xs text-muted">
          <ShieldCheck size={16} className="text-bronze shrink-0" />
          <span>Files never leave this browser device.</span>
        </div>
        <button
          type="button"
          disabled
          aria-disabled="true"
          className="bg-forest/20 text-forest/50 cursor-not-allowed px-5 py-2.5 text-xs font-medium border border-forest/15"
          title="Virtual try-on model provider is not yet connected"
        >
          AI Try-On (Provider Coming Soon)
        </button>
      </div>
    </div>
  );
}
