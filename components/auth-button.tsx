"use client";
import { useEffect, useState } from "react";
export function AuthButton({ dark = false }: { dark?: boolean }) {
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((s) => setSignedIn(Boolean(s?.user)))
      .catch(() => undefined);
  }, []);
  return signedIn ? (
    <a
      href="/logout"
      className={dark ? "text-xs text-ivory/80" : "text-xs text-muted"}
    >
      Sign out
    </a>
  ) : (
    <a
      href="/sign-in"
      className={
        dark
          ? "text-xs border border-ivory/30 rounded-xl px-3 py-2 text-ivory/80"
          : "text-xs border border-line px-3 py-2"
      }
    >
      Sign in
    </a>
  );
}
