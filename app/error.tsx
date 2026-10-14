"use client";
import { useEffect } from "react";
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <main className="min-h-screen bg-ivory flex items-center justify-center px-6">
      <div className="bg-paper border border-line p-8 max-w-md">
        <p className="uppercase tracking-[.25em] text-[10px] text-bronze">
          Stylebender / temporary pause
        </p>
        <h1 className="serif text-4xl mt-4">The styling room needs a reset.</h1>
        <p className="text-muted leading-6 mt-4">
          A local update interrupted this view. Your saved local wardrobe and
          preferences are not affected.
        </p>
        <button
          onClick={() => reset()}
          className="bg-forest text-ivory px-5 py-3 text-xs mt-7"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
