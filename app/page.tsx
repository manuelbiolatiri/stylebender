"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import {
  ArrowUpRight,
  Bookmark,
  ChevronRight,
  Compass,
  Shirt,
  Sparkles,
  UserRound,
} from "lucide-react";
import { AuthButton } from "@/components/auth-button";
import { WardrobePanel } from "@/components/wardrobe-panel";
import { StyleProfilePanel } from "@/components/style-profile-panel";
import { VerdictPanel } from "@/components/verdict-panel";
import { AchievePanel } from "@/components/achieve-panel";
import { ElevatePanel } from "@/components/elevate-panel";
import { TryOnPanel } from "@/components/try-on-panel";
import { StyleIQPanel } from "@/components/style-iq-panel";
import { HeroMotion } from "@/components/hero-motion";
import { defaultOutfitContext, type OutfitContext } from "@/lib/outfit";
import { getWardrobeMetadata } from "@/lib/wardrobe";
import { SavedPanel } from "@/components/saved-panel";
const occasions = [
  ["Church", "Polished, expressive and considered", "/sunday-menswear-editorial.jpg"],
  ["Office Day", "Sharp layers for the working week", "/london-menswear-editorial.jpg"],
  ["Date Night", "A little more intent, never overdone", "/evening-menswear-editorial.jpg"],
] as const;
const tips = [
  [
    "The quiet flex",
    "Texture does the talking. Pair a brushed knit with clean tailoring for depth without noise.",
  ],
  [
    "Colour note",
    "Forest green and warm stone make an easy, elevated pairing.",
  ],
];
function Nav({
  active,
  setActive,
}: {
  active: string;
  setActive: (x: string) => void;
}) {
  return (
    <>
      <div className="hidden lg:flex sticky top-5 z-30 mx-auto mt-5 max-w-5xl h-[72px] rounded-2xl bg-paper/75 backdrop-blur-2xl border border-forest/10 text-forest items-center justify-between px-5 shadow-[0_18px_45px_rgba(20,37,30,0.14)] supports-[backdrop-filter]:bg-paper/60">
        <div className="flex items-center gap-3">
          <img
            src="/stylebender-mark.png"
            alt="Stylebender"
            className="h-11 w-11 rounded-xl object-cover"
          />
          <span className="tracking-[.22em] text-[11px]">STYLEBENDER</span>
        </div>
        <div className="flex items-center gap-8">
          {[
            ["Discover", Compass],
            ["Wardrobe", Shirt],
            ["Saved", Bookmark],
          ].map(([label, I]: any) => (
            <button
              key={label}
              aria-label={label}
              onClick={() => setActive(label)}
              className={
                active === label
                  ? "text-bronze"
                  : "text-muted hover:text-forest transition-colors"
              }
            >
              <I size={16} className="inline mr-2" />
              <span className="text-xs">{label}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <AuthButton />
          <button
            className="border border-forest/15 rounded-xl px-3 py-2 text-xs text-forest/75 hover:border-bronze hover:text-bronze transition-colors"
            onClick={() => setActive("Profile")}
          >
            <UserRound size={15} className="inline mr-2" />
            Profile
          </button>
        </div>
      </div>
      <nav className="lg:hidden fixed bottom-0 inset-x-0 h-[84px] rounded-t-[1.75rem] bg-paper/95 backdrop-blur-xl border-t border-line flex justify-around items-center px-2 z-20 shadow-[0_-12px_35px_rgba(20,37,30,0.12)]">
        {[
          ["Discover", Compass],
          ["Wardrobe", Shirt],
          ["Saved", Bookmark],
          ["Profile", UserRound],
        ].map(([label, I]: any) => (
          <button
            key={label}
            onClick={() => setActive(label)}
            aria-label={label}
            className={`min-w-[68px] min-h-[58px] rounded-2xl flex flex-col items-center justify-center transition-colors ${active === label ? "text-forest bg-forest/10" : "text-muted"}`}
          >
            <I size={20} />
            <span className="block text-[10px] mt-1">{label}</span>
          </button>
        ))}
      </nav>
    </>
  );
}
export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [active, setActive] = useState("Discover");
  const [selected, setSelected] = useState("Church");
  const [saved, setSaved] = useState(false);
  const [dna, setDna] = useState(false);
  const [profileContext, setProfileContext] = useState<OutfitContext>(defaultOutfitContext);
  useEffect(() => {
    const timer = window.setTimeout(() => setShowSplash(false), 2000);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    setSaved(localStorage.getItem("stylebender-saved") === "true");
    try {
      const profile = JSON.parse(localStorage.getItem("stylebender-profile") ?? "null");
      setProfileContext((current) => ({ ...current, styles: profile?.styles ?? current.styles, budget: profile?.budget ?? current.budget, wardrobe: getWardrobeMetadata().map((item) => item.name) }));
    } catch { /* ignore malformed local metadata */ }
  }, []);
  function save() {
    const next = !saved;
    setSaved(next);
    localStorage.setItem("stylebender-saved", String(next));
  }
  return (
    <>
      {showSplash && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#872d38]" role="status" aria-label="Loading Stylebender">
          <img src="/stylebender-mark.png" alt="Stylebender" className="h-24 w-24 rounded-full object-cover shadow-2xl" />
        </div>
      )}
      <div className="min-h-screen bg-ivory pb-24 lg:pb-0">
      <Nav active={active} setActive={setActive} />
      {active === "Discover" ? (
        <main>
          <section className="hero-shell relative overflow-hidden mt-0 lg:mt-5 min-h-[720px] rounded-b-[2rem] lg:rounded-none bg-forest text-ivory px-6 pt-8 md:px-12 lg:px-20 lg:pt-32 max-w-[1600px] mx-auto">
            <Image src="/stylebender-hero-campaign.jpg" alt="Model in a forest green tailored jacket" fill priority sizes="100vw" className="hero-image absolute inset-0 object-cover object-[62%_center]" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(20,37,30,.98)_0%,rgba(20,37,30,.82)_32%,rgba(20,37,30,.2)_72%,rgba(20,37,30,.12)_100%)]" />
            <HeroMotion />
            <div className="relative z-10 max-w-2xl hero-reveal">
              <div className="inline-flex items-center gap-2 px-1 py-1 lg:hidden">
                <img src="/stylebender-mark.png" alt="" className="h-7 w-7 rounded-full object-cover" />
                <span className="tracking-[.24em] text-[10px] text-ivory">STYLEBENDER</span>
              </div>
              <p className="eyebrow text-bronze">
                The London edit · 2026
              </p>
              <h1 className="display text-6xl md:text-7xl lg:text-[7.5rem] leading-[.86] mt-5 max-w-3xl">
                Discover your style.
                <br />
                <span className="text-ivory/55">Make it yours.</span>
              </h1>
              <p className="text-ivory/70 mt-6 max-w-md leading-7">
                Luxury-inspired menswear, made achievable. Start with the moment
                you’re dressing for.
              </p>
              <div className="mt-12 grid md:grid-cols-3 gap-3 max-w-4xl">
                {occasions.map(([name, desc, image]) => (
                  <button
                    key={name}
                    onClick={() => setSelected(name)}
                    className={
                      "group relative overflow-hidden text-left min-h-44 p-5 border transition " +
                      (selected === name
                        ? "bg-ivory text-forest border-ivory"
                        : "bg-paper/10 text-ivory border-ivory/25 hover:border-bronze")
                    }
                  >
                    <Image src={image} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" className="absolute inset-0 object-cover opacity-60 transition duration-700 group-hover:scale-105" />
                    <span className="absolute inset-0 bg-gradient-to-t from-forest/95 via-forest/30 to-transparent" />
                    <div className="relative z-10 flex justify-between items-start">
                      <span className="serif text-2xl">{name}</span>
                      <ArrowUpRight size={18} />
                    </div>
                    <p
                      className={
                        "relative z-10 text-xs mt-8 leading-5 " +
                        (selected === name ? "text-forest/65" : "text-ivory/70")
                      }
                    >
                      {desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </section>
          <section className="mt-16 lg:mt-28 max-w-[1500px] mx-auto grid md:grid-cols-2 lg:grid-cols-[1.2fr_.8fr] gap-5 px-6 md:px-10 lg:px-20">
            <div className="relative min-h-[390px] overflow-hidden bg-forest grain">
              <Image src="/menswear-outfit-flatlay.jpg" alt="Forest tailoring and charcoal trousers laid out together" fill sizes="(max-width: 1024px) 100vw, 60vw" className="absolute inset-0 w-full h-full object-cover opacity-55 mix-blend-screen" />
              <div className="relative p-7 lg:p-10 h-full flex flex-col justify-end text-ivory">
                <p className="uppercase tracking-[.25em] text-[10px] text-bronze">
                  Your next move
                </p>
                <h2 className="serif text-4xl mt-3">
                  Style me for
                  <br />
                  {selected}
                </h2>
                <button
                  onClick={() => setActive("Verdict")}
                  className="mt-7 bg-ivory text-forest px-5 py-3 text-xs tracking-wide w-fit"
                >
                  Get one strong look{" "}
                  <ChevronRight className="inline ml-4" size={15} />
                </button>
              </div>
            </div>
            <div className="bg-paper border border-line p-7 lg:p-10 flex flex-col justify-between">
              <div>
                <div className="flex justify-between">
                  <span className="uppercase tracking-[.25em] text-[10px] text-bronze">
                    The daily edit
                  </span>
                  <Sparkles size={17} className="text-bronze" />
                </div>
                <h2 className="serif text-3xl mt-7">{tips[0][0]}</h2>
                <p className="text-muted leading-7 mt-5">{tips[0][1]}</p>
              </div>
              <button
                onClick={() => setActive("Style IQ")}
                className="text-left border-t border-line pt-5 mt-10 text-xs tracking-wide"
              >
                Explore Style IQ{" "}
                <ArrowUpRight className="inline ml-2" size={15} />
              </button>
            </div>
          </section>
          <section className="px-6 lg:px-20 py-16 max-w-[1500px] mx-auto">
            <div className="flex justify-between items-end">
              <div>
                <p className="uppercase tracking-[.25em] text-[10px] text-bronze">
                  Made personal
                </p>
                <h2 className="serif text-4xl mt-3">Your Style DNA</h2>
              </div>
              <button
                onClick={() => setDna(!dna)}
                className="text-xs border-b border-forest pb-1"
              >
                {dna ? "Close" : "Review assumptions"}
              </button>
            </div>
            {dna && (
              <div className="mt-7 bg-paper border border-line p-6 max-w-2xl">
                <p className="text-sm leading-6">
                  A draft profile is ready: tailored elegance, quiet luxury and
                  smart casual. This is an inference, not a fact.
                </p>
                <div className="flex gap-2 mt-5">
                  <button
                    className="bg-forest text-ivory px-4 py-2 text-xs"
                    onClick={() => setDna(false)}
                  >
                    Confirm profile
                  </button>
                  <button
                    className="border border-line px-4 py-2 text-xs"
                    onClick={() => setDna(false)}
                  >
                    Edit preferences
                  </button>
                </div>
              </div>
            )}
          </section>
        </main>
      ) : (
        <Placeholder
          active={active}
          saved={saved}
          save={save}
          setActive={setActive}
          setSelected={setSelected}
          context={{ ...profileContext, occasion: selected }}
        />
      )}
      <footer className="px-6 lg:px-20 pb-10 text-xs text-muted flex justify-between">
        <span>Stylebender</span>
      </footer>
      </div>
    </>
  );
}
function Placeholder({
  active,
  saved,
  save,
  setActive,
  setSelected,
  context,
}: {
  active: string;
  saved: boolean;
  save: () => void;
  setActive: (x: string) => void;
  setSelected: (occasion: string) => void;
  context: OutfitContext;
}) {
  return (
    <main className="px-6 lg:px-20 pt-6 lg:pt-20 max-w-6xl">
      <button onClick={() => setActive("Discover")} className="lg:hidden inline-flex items-center gap-2 text-xs text-muted mb-7 min-h-10" aria-label="Back to Discover">
        <ChevronRight className="rotate-180" size={17} />
        Discover
      </button>
      {active !== "Profile" && (
        <p className="uppercase tracking-[.25em] text-[10px] text-bronze">
          Stylebender / {active}
        </p>
      )}
      <h1 className="serif text-6xl mt-5">{active}</h1>
      {active === "Wardrobe" ? (
        <WardrobePanel />
      ) : active === "Profile" ? (
        <StyleProfilePanel />
      ) : active === "Verdict" ? (
        <VerdictPanel onSave={save} onAction={setActive} context={context} />
      ) : active === "Achieve" ? (
        <AchievePanel />
      ) : active === "Elevate" ? (
        <ElevatePanel />
      ) : active === "Try On" ? (
        <TryOnPanel />
      ) : active === "Style IQ" ? (
        <StyleIQPanel />
      ) : active === "Saved" ? (
        <SavedPanel onOpen={(item) => { setSelected(item.context.occasion); setActive("Verdict"); }} />
      ) : (
        <div className="mt-10 bg-paper border border-line p-7 max-w-xl">
          <p className="text-muted leading-7">
            This space is ready for your personal style journey.
          </p>
          <div className="mt-7 flex gap-3">
            <button
              onClick={save}
              className="bg-forest text-ivory px-5 py-3 text-xs"
            >
              {saved ? "Saved" : "Save this look"}
            </button>
            <button
              onClick={() => setActive("Discover")}
              className="border border-line px-5 py-3 text-xs"
            >
              Back to discover
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
