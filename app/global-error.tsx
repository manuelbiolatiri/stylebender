"use client";
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en-GB">
      <body>
        <main style={{ padding: 40, fontFamily: "Arial, sans-serif" }}>
          <h1>Stylebender needs a refresh.</h1>
          <button onClick={() => reset()}>Reload experience</button>
        </main>
      </body>
    </html>
  );
}
