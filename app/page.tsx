"use client";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Bookmark,
  ChevronRight,
  Compass,
  Menu,
  Shirt,
  Sparkles,
  UserRound,
  X,
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
const occasions = [
  ["Church", "Polished, expressive and considered"],
  ["Office Day", "Sharp layers for the working week"],
  ["Date Night", "A little more intent, never overdone"],
];
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
            className="border border-ivory/30 rounded-xl px-3 py-2 text-xs text-ivory/80 hover:border-bronze hover:text-bronze transition-colors"
            onClick={() => setActive("Profile")}
          >
            <UserRound size={15} className="inline mr-2" />
            Profile
          </button>
        </div>
      </div>
      <nav className="lg:hidden fixed bottom-0 inset-x-0 h-20 bg-paper/95 backdrop-blur border-t border-line flex justify-around items-center z-20">
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
            className={active === label ? "text-forest" : "text-muted"}
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
  const [active, setActive] = useState("Discover");
  const [selected, setSelected] = useState("Church");
  const [saved, setSaved] = useState(false);
  const [menu, setMenu] = useState(false);
  const [dna, setDna] = useState(false);
  useEffect(() => {
    setSaved(localStorage.getItem("stylebender-saved") === "true");
  }, []);
  function save() {
    const next = !saved;
    setSaved(next);
    localStorage.setItem("stylebender-saved", String(next));
  }
  return (
    <div className="min-h-screen bg-ivory pb-24">
      <Nav active={active} setActive={setActive} />
      <header className="px-6 pt-6 lg:hidden flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/stylebender-mark.png"
            alt="Stylebender"
            className="h-9 w-9 rounded-full object-cover"
          />
          <span className="tracking-[.25em] text-xs">STYLEBENDER</span>
        </div>
        <div className="flex items-center gap-4">
          <AuthButton />
          <button
            className="text-muted"
            aria-label="Profile"
            onClick={() => setActive("Profile")}
          >
            <UserRound size={20} />
          </button>
          <button
            className="lg:hidden"
            onClick={() => setMenu(!menu)}
            aria-label="Menu"
          >
            {menu ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      {active === "Discover" ? (
        <main>
          <HeroMotion />
          <section className="relative overflow-hidden mx-4 lg:mx-8 mt-8 min-h-[680px] bg-forest text-ivory px-6 pt-14 lg:px-20 lg:pt-28 max-w-[1500px] mx-auto rounded-[2rem]">
            <img
              src="/editorial-hero.png"
              alt="A model wearing a forest overshirt in a cinematic studio"
              className="absolute inset-0 w-full h-full object-cover object-center opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-forest via-forest/70 to-transparent" />
            <div className="relative z-10 max-w-2xl">
              <p className="text-bronze uppercase tracking-[.25em] text-[10px]">
                Tuesday, 13 October · London
              </p>
              <h1 className="serif text-5xl lg:text-7xl leading-[.95] mt-5 max-w-2xl">
                Discover your style.
                <br />
                <span className="text-ivory/55">Make it yours.</span>
              </h1>
              <p className="text-ivory/70 mt-6 max-w-md leading-7">
                Luxury-inspired menswear, made achievable. Start with the moment
                you’re dressing for.
              </p>
              <div className="mt-12 grid md:grid-cols-3 gap-3">
                {occasions.map(([name, desc]) => (
                  <button
                    key={name}
                    onClick={() => setSelected(name)}
                    className={
                      "text-left p-5 border transition " +
                      (selected === name
                        ? "bg-ivory text-forest border-ivory"
                        : "bg-paper/10 text-ivory border-ivory/25 hover:border-bronze")
                    }
                  >
                    <div className="flex justify-between items-start">
                      <span className="serif text-2xl">{name}</span>
                      <ArrowUpRight size={18} />
                    </div>
                    <p
                      className={
                        "text-xs mt-8 leading-5 " +
                        (selected === name ? "text-forest/65" : "text-ivory/65")
                      }
                    >
                      {desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </section>
          <section className="mt-16 lg:mt-24 max-w-[1500px] mx-auto grid lg:grid-cols-[1.2fr_.8fr] gap-5 px-6 lg:px-20">
            <div className="relative min-h-[390px] overflow-hidden bg-forest grain">
              <img
                src="/hero-spiral-hires.webp"
                alt="Abstract editorial spiral artwork"
                className="absolute inset-0 w-full h-full object-cover opacity-75 mix-blend-screen"
              />
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
        />
      )}
      <footer className="px-6 lg:px-20 pb-10 text-xs text-muted flex justify-between">
        <span>Stylebender</span>
      </footer>
    </div>
  );
}
function Placeholder({
  active,
  saved,
  save,
  setActive,
}: {
  active: string;
  saved: boolean;
  save: () => void;
  setActive: (x: string) => void;
}) {
  return (
    <main className="px-6 lg:px-20 pt-20 max-w-6xl">
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
        <VerdictPanel onSave={save} onAction={setActive} />
      ) : active === "Achieve" ? (
        <AchievePanel />
      ) : active === "Elevate" ? (
        <ElevatePanel />
      ) : active === "Try On" ? (
        <TryOnPanel />
      ) : active === "Style IQ" ? (
        <StyleIQPanel />
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
