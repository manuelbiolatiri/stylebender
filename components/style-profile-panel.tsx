"use client";
import { useEffect, useState } from "react";

const styles = [
  "Tailored / elegant",
  "Creative / statement",
  "Relaxed / oversized",
  "Classic / preppy",
  "Quiet luxury",
  "Smart casual",
  "Streetwear",
];
const occasions = [
  "Church",
  "Office Day",
  "Date Night",
  "Networking",
  "Party",
  "Weekend",
];
type Profile = {
  styles: string[];
  budget: string;
  occasions: string[];
  confirmed: boolean;
};
const initial: Profile = {
  styles: ["Tailored / elegant", "Quiet luxury", "Smart casual"],
  budget: "£150–£300",
  occasions: ["Church", "Office Day", "Date Night"],
  confirmed: false,
};

export function StyleProfilePanel({ email }: { email?: string }) {
  const [profile, setProfile] = useState<Profile>(initial);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    const raw = localStorage.getItem("stylebender-profile");
    if (raw) {
      try { setProfile(JSON.parse(raw)); } catch { /* keep safe defaults */ }
    }
  }, []);
  function toggle(key: "styles" | "occasions", value: string) {
    setProfile((current) => ({
      ...current,
      [key]: current[key].includes(value)
        ? current[key].filter((item) => item !== value)
        : [...current[key], value],
    }));
    setSaved(false);
  }
  function persist() {
    const next = { ...profile, confirmed: true };
    setProfile(next);
    localStorage.setItem("stylebender-profile", JSON.stringify(next));
    setSaved(true);
  }
  return (
    <div className="mt-5 lg:mt-10 max-w-3xl bg-paper border border-line p-5 lg:p-8">
      <div className="flex justify-between gap-6">
        <div>
          <p className="uppercase tracking-[.25em] text-[10px] text-bronze">
            {profile.confirmed ? "Confirmed profile" : "Reviewable draft"}
          </p>
          <h2 className="serif text-3xl mt-3">Your Style DNA</h2>
          <p className="text-muted text-sm mt-3 leading-6">
            These signals shape recommendations. You can change or reject them
            at any time.
          </p>
        </div>
        <div className="text-right text-xs text-muted">
          <span className="block">Local only</span>
          {email ? <span className="block mt-2 text-forest break-all">{email}</span> : <a href="/sign-in" className="block mt-2 text-forest underline underline-offset-4">Sign in</a>}
        </div>
      </div>
      <fieldset className="mt-8">
        <legend className="text-xs font-bold">What feels like you?</legend>
        <div className="flex gap-2 flex-wrap mt-3">
          {styles.map((style) => (
            <button
              type="button"
              key={style}
              onClick={() => toggle("styles", style)}
              className={
                "px-3 py-2 text-xs border " +
                (profile.styles.includes(style)
                  ? "bg-forest text-ivory border-forest"
                  : "border-line text-muted")
              }
            >
              {style}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset className="mt-8">
        <legend className="text-xs font-bold">
          Typical full-outfit budget
        </legend>
        <div className="flex gap-2 mt-3">
          {["£100–£150", "£150–£300", "£300+"].map((budget) => (
            <button
              type="button"
              key={budget}
              onClick={() => {
                setProfile({ ...profile, budget });
                setSaved(false);
              }}
              className={
                "px-4 py-2 text-xs border " +
                (profile.budget === budget
                  ? "bg-forest text-ivory border-forest"
                  : "border-line text-muted")
              }
            >
              {budget}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset className="mt-8">
        <legend className="text-xs font-bold">Where do you dress for?</legend>
        <div className="flex gap-2 flex-wrap mt-3">
          {occasions.map((occasion) => (
            <button
              type="button"
              key={occasion}
              onClick={() => toggle("occasions", occasion)}
              className={
                "px-3 py-2 text-xs border " +
                (profile.occasions.includes(occasion)
                  ? "bg-forest text-ivory border-forest"
                  : "border-line text-muted")
              }
            >
              {occasion}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="mt-8 flex items-center gap-4">
        <button
          type="button"
          onClick={persist}
          className="bg-forest text-ivory px-5 py-3 text-xs"
        >
          {saved ? "Profile confirmed" : "Save my profile"}
        </button>
        <span className="text-xs text-muted">
          No photos or provider calls involved.
        </span>
      </div>
      {email && (
        <a href="/logout" className="inline-block mt-7 border border-line px-4 py-2 text-xs text-forest hover:border-forest">
          Sign out
        </a>
      )}
    </div>
  );
}
