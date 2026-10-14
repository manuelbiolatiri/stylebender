"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ShieldCheck, Trash2, Upload, X } from "lucide-react";

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
        Add one or more reference images or short videos of yourself and the garments
        you want to compare. Everything is previewed locally in this browser first.
        This cannot guarantee fit, sizing, drape, comfort, or fabric behaviour.
      </p>
      <div className="mt-8 border border-dashed border-line p-8 text-center">
        <Upload className="mx-auto text-bronze" size={24} />
        <p className="text-sm mt-3">{files.length ? `${files.length} file${files.length === 1 ? "" : "s"} selected` : "Choose images or videos"}</p>
        <label className="inline-block border border-line px-4 py-2 text-xs mt-4 cursor-pointer">
          Add files
          <input
            className="sr-only"
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={(event) => { addFiles(event.target.files); event.currentTarget.value = ""; }}
          />
        </label>
        <p className="text-[11px] text-muted mt-3">Images and videos up to 50 MB each · stored locally until you approve processing</p>
      </div>
      {files.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-5">
          {files.map((item) => (
            <article key={item.id} className="relative bg-forest overflow-hidden aspect-[4/5]">
              {item.file.type.startsWith("video/") ? (
                <video src={item.url} controls muted playsInline className="w-full h-full object-cover" />
              ) : (
                <img src={item.url} alt={item.file.name} className="w-full h-full object-cover" />
              )}
              <button type="button" onClick={() => removeFile(item.id)} aria-label={`Remove ${item.file.name}`} className="absolute top-2 right-2 bg-forest/85 text-ivory p-1.5"><X size={14} /></button>
              <p className="absolute bottom-0 inset-x-0 bg-forest/80 text-ivory text-[10px] p-2 truncate">{item.file.name}</p>
            </article>
          ))}
        </div>
      )}
      {files.length > 0 && <button type="button" onClick={clearFiles} className="text-xs text-muted mt-4 underline underline-offset-4"><Trash2 size={13} className="inline mr-1" />Clear all</button>}
      <label className="flex gap-3 mt-7 text-sm text-muted leading-6">
        <input
          type="checkbox"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
          className="mt-1"
        />
        I understand this is a visual preview and I explicitly consent to
        sending these selected files to a configured provider if I approve a
        future processing step.
      </label>
      <button
        disabled={!consent || !files.length}
        className="bg-forest text-ivory disabled:opacity-40 px-5 py-3 text-xs mt-7"
      >
        {consent && files.length ? "Preview ready for provider review" : "Select files to continue"}
      </button>
      <div className="flex gap-2 items-center text-xs text-muted mt-6">
        <ShieldCheck size={15} className="text-bronze" />
        Files remain local until an explicit provider action is connected.
      </div>
    </div>
  );
}
