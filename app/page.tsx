"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Bookmark,
  ChevronRight,
  Compass,
  Shirt,
  Sparkles,
  UserRound,
} from "lucide-react";
import { AuthButton } from "@/components/auth-button";
import { OccasionVoiceButton } from "@/components/occasion-voice-button";
import { WardrobePanel } from "@/components/wardrobe-panel";
import { StyleProfilePanel } from "@/components/style-profile-panel";
import { VerdictPanel } from "@/components/verdict-panel";
import { AchievePanel } from "@/components/achieve-panel";
import { ElevatePanel } from "@/components/elevate-panel";
import { TryOnPanel } from "@/components/try-on-panel";
import { StyleIQPanel } from "@/components/style-iq-panel";
import { defaultOutfitContext, readCurrentOutfit, type OutfitContext } from "@/lib/outfit";
import { getWardrobeMetadata } from "@/lib/wardrobe";
import { SavedPanel } from "@/components/saved-panel";
import { getSampleWardrobeContext, hasSelectedSampleWeather, readSelectedSampleWeather } from "@/lib/sample-wardrobes";

function Nav({
  active,
  setActive,
  sessionEmail,
}: {
  active: string;
  setActive: (x: string, replace?: boolean, occasionOverride?: string) => void;
  sessionEmail?: string;
}) {
  const tabs = [
    ["Discover", "Home", Compass],
    ["Style Me", "My Look", Sparkles],
    ["Wardrobe", "Wardrobe", Shirt],
    ["Saved", "Saved", Bookmark],
  ] as const;
  const initials = sessionEmail
    ? sessionEmail.split("@")[0].replace(/[^a-z0-9]/gi, "").slice(0, 2).toUpperCase() || "??"
    : "";

  return (
    <>
      <header className="hidden lg:flex sticky top-5 z-30 mx-auto mt-5 max-w-5xl h-[72px] rounded-2xl bg-paper/75 backdrop-blur-2xl border border-forest/10 text-forest items-center justify-between px-5 shadow-[0_18px_45px_rgba(20,37,30,0.14)] supports-[backdrop-filter]:bg-paper/60">
        <div className="flex items-center gap-3">
          <img
            src="/stylebender-symbol.svg"
            alt="Stylebender"
            className="h-11 w-11 rounded-xl object-cover"
          />
          <span className="serif text-[25px] tracking-[-.045em] leading-none">Stylebender</span>
        </div>
        <div className="flex items-center gap-8">
          {tabs.map(([label, mobileLabel, I]) => (
            <button
              key={label}
              aria-label={label}
              onClick={() => setActive(label)}
              className={
                active === label
                  ? "text-bronze font-medium"
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
            className={`border rounded-xl px-3 py-2 text-xs transition-colors ${
              active === "Profile"
                ? "border-forest text-forest bg-forest/5"
                : "border-forest/15 text-forest/75 hover:border-bronze hover:text-bronze"
            }`}
            onClick={() => setActive("Profile")}
          >
            <UserRound size={15} className="inline mr-2" />
            Profile
          </button>
        </div>
      </header>
      <header className="lg:hidden shrink-0 h-[58px] bg-forest text-ivory flex items-center justify-between px-5 z-30">
        <button type="button" onClick={() => setActive("Discover")} className="flex items-center gap-2" aria-label="Stylebender home">
          <img src="/stylebender-symbol.svg" alt="" className="h-8 w-8 rounded-lg object-cover" />
          <span className="serif text-[21px] tracking-[-.045em] leading-none">Stylebender</span>
        </button>
        <button
          type="button"
          onClick={() => setActive("Profile")}
          aria-label="Open Profile"
          className={`h-9 w-9 rounded-full border flex items-center justify-center transition-colors ${active === "Profile" ? "border-bronze text-bronze" : "border-ivory/30 text-ivory/80"}`}
        >
          {initials ? <span className="text-[11px] font-semibold tracking-wide">{initials}</span> : <UserRound size={17} />}
        </button>
      </header>
      <nav aria-label="Primary" className="mobile-bottom-nav lg:hidden fixed bottom-0 inset-x-0 min-h-[72px] rounded-t-[1.5rem] bg-paper/95 backdrop-blur-xl border-t border-line flex justify-around items-center px-1 z-20 shadow-[0_-12px_35px_rgba(20,37,30,0.12)]">
        {tabs.map(([label, mobileLabel, I]) => (
          <button
            key={label}
            onClick={() => setActive(label)}
            aria-label={label}
            aria-current={active === label ? "page" : undefined}
            className={`min-w-[68px] min-h-[54px] rounded-2xl flex flex-col items-center justify-center transition-colors ${
              active === label ? "text-forest bg-forest/10 font-medium" : "text-muted"
            }`}
          >
            <I size={20} />
            <span className="block text-[10px] mt-1">{mobileLabel}</span>
          </button>
        ))}
      </nav>
    </>
  );
}

export default function Home() {
  const [active, setActiveState] = useState("Discover");
  const [tryOnWardrobeId, setTryOnWardrobeId] = useState<string | null>(null);
  const [selected, setSelectedState] = useState("");
  const [customOccasion, setCustomOccasion] = useState("");
  const [autoGenerateVerdict, setAutoGenerateVerdict] = useState(false);
  const [profileContext, setProfileContext] = useState<OutfitContext>(defaultOutfitContext);
  const [sessionEmail, setSessionEmail] = useState<string | undefined>();
  const screenRef = useRef<HTMLDivElement>(null);
  const occasionInputRef = useRef<HTMLTextAreaElement>(null);
  const [showOccasionHint, setShowOccasionHint] = useState(false);
  const scrollPositions = useRef<Record<string, number>>({});

  function setSelected(occasion: string) {
    setSelectedState(occasion);
    if (typeof window !== "undefined") {
      localStorage.setItem("stylebender-selected-occasion", occasion);
    }
  }

  function setActive(next: string, replace = false, occasionOverride?: string) {
    if (screenRef.current) scrollPositions.current[active] = screenRef.current.scrollTop;
    setActiveState(next);
    if (next !== "Try On") setTryOnWardrobeId(null);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams();
      if (next !== "Discover") params.set("view", next === "Style Me" ? "Style Me" : next);
      const occasion = occasionOverride ?? selected;
      if (occasion) params.set("occasion", occasion);
      const query = params.toString();
      const url = query ? `/?${query}` : "/";
      window.history[replace ? "replaceState" : "pushState"]({ view: next, occasion }, "", url);
    }
  }

  useEffect(() => {
    fetch("/api/auth/session")
      .then((response) => response.ok ? response.json() : null)
      .then((session) => setSessionEmail(session?.user?.email ?? undefined))
      .catch(() => setSessionEmail(undefined));
  }, []);

  useEffect(() => {
    const screen = screenRef.current;
    if (!screen) return;
    screen.scrollTop = scrollPositions.current[active] ?? 0;
  }, [active]);

  function startStyling(occasionToStyle: string) {
    const target = occasionToStyle.trim();
    if (!target) {
      setShowOccasionHint(true);
      occasionInputRef.current?.focus();
      return;
    }
    setShowOccasionHint(false);
    setSelected(target);
    setAutoGenerateVerdict(true);
    setActive("Style Me", false, target);
  }

  const wardrobeContextLabel = profileContext.wardrobe.length > 0 && profileContext.sampleWardrobe?.length
    ? "Using wardrobe + sample references"
    : profileContext.wardrobe.length > 0
      ? "Using my wardrobe"
      : profileContext.sampleWardrobe?.length
        ? "Using sample references"
        : "No wardrobe context yet";

  // Load URL state & popstate listener
  useEffect(() => {
    function restoreStateFromUrl() {
      const params = new URLSearchParams(window.location.search);
      const view = params.get("view");
      const occasionParam = params.get("occasion");
      if (view) setActiveState(view === "Verdict" ? "Style Me" : view);
      if (occasionParam) {
        setSelectedState(occasionParam);
      } else {
        // Fallback to local storage or current outfit occasion
        const storedOccasion = localStorage.getItem("stylebender-selected-occasion");
        const currentOutfit = readCurrentOutfit();
        if (storedOccasion) {
          setSelectedState(storedOccasion);
        } else if (currentOutfit?.context?.occasion) {
          setSelectedState(currentOutfit.context.occasion);
        }
      }
    }

    restoreStateFromUrl();
    const onPopState = () => restoreStateFromUrl();
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // Hydrate pending auth context and local preferences
  useEffect(() => {
    try {
      const pending = JSON.parse(sessionStorage.getItem("stylebender-pending-context") ?? "null");
      if (pending?.occasion) {
        setSelected(pending.occasion);
        setProfileContext(pending);
        if (pending.autoGenerate) {
          setAutoGenerateVerdict(true);
          setActiveState("Style Me");
        }
        sessionStorage.removeItem("stylebender-pending-context");
      }

      const profile = JSON.parse(localStorage.getItem("stylebender-profile") ?? "null");
      const sampleSelected = hasSelectedSampleWeather();
      setProfileContext((current) => ({
        ...current,
        styles: profile?.confirmed ? (profile.styles ?? []) : [],
        budget: profile?.budget ?? current.budget,
        wardrobe: getWardrobeMetadata().map((item) => item.name),
        ...(sampleSelected ? { weather: readSelectedSampleWeather(), sampleWardrobe: getSampleWardrobeContext(readSelectedSampleWeather()) } : { weather: undefined, sampleWardrobe: undefined }),
      }));
    } catch {
      /* ignore malformed local metadata */
    }

    // Listen for wardrobe updates across panels
    function onWardrobeUpdated() {
      setProfileContext((current) => ({
        ...current,
        wardrobe: getWardrobeMetadata().map((item) => item.name),
      }));
    }
    function onSampleUpdated() {
      const weather = readSelectedSampleWeather();
      setProfileContext((current) => ({ ...current, weather, sampleWardrobe: getSampleWardrobeContext(weather) }));
    }
    window.addEventListener("stylebender-wardrobe-updated", onWardrobeUpdated);
    window.addEventListener("stylebender-sample-updated", onSampleUpdated);
    return () => {
      window.removeEventListener("stylebender-wardrobe-updated", onWardrobeUpdated);
      window.removeEventListener("stylebender-sample-updated", onSampleUpdated);
    };
  }, []);

  // Update profile context when view changes
  useEffect(() => {
    try {
      const profile = JSON.parse(localStorage.getItem("stylebender-profile") ?? "null");
      const sampleSelected = hasSelectedSampleWeather();
      setProfileContext((current) => ({
        ...current,
        styles: profile?.confirmed ? (profile.styles ?? []) : [],
        budget: profile?.budget ?? current.budget,
        wardrobe: getWardrobeMetadata().map((item) => item.name),
        ...(sampleSelected ? { weather: readSelectedSampleWeather(), sampleWardrobe: getSampleWardrobeContext(readSelectedSampleWeather()) } : { weather: undefined, sampleWardrobe: undefined }),
      }));
    } catch {
      /* ignore malformed local metadata */
    }
  }, [active]);

  return (
    <>
      <div className="mobile-app-shell bg-ivory">
        <Nav active={active} setActive={setActive} sessionEmail={sessionEmail} />
        <div
          ref={screenRef}
          onScroll={(event) => { scrollPositions.current[active] = event.currentTarget.scrollTop; }}
          className="mobile-screen-scroll flex-1 lg:overflow-visible"
        >
          {active === "Discover" ? (
          <main className="pb-8 lg:pb-0">
            <section className="mobile-home-screen lg:hidden px-5 pt-8 pb-7">
              <p className="eyebrow text-bronze">Your personal stylist</p>
              <h1 className="serif text-[2.8rem] leading-[.96] mt-4">What are you dressing for?</h1>
              <p className="text-muted text-[15px] leading-6 mt-4 max-w-sm">Describe the occasion. We&rsquo;ll put together a look.</p>
              <label htmlFor="mobile-occasion" className="sr-only">Describe your occasion</label>
              <textarea
                id="mobile-occasion"
                ref={occasionInputRef}
                aria-describedby={showOccasionHint ? "mobile-occasion-hint" : undefined}
                value={customOccasion || selected}
                onChange={(event) => { setCustomOccasion(event.target.value); setSelected(event.target.value); if (event.target.value.trim()) setShowOccasionHint(false); }}
                onFocus={(event) => event.currentTarget.scrollIntoView({ block: "center", behavior: "smooth" })}
                placeholder="A dinner date in Manchester on a chilly evening..."
                className="mobile-occasion-input mt-5 w-full min-h-[144px] resize-none bg-paper border border-line p-4 text-[15px] leading-6 text-ink placeholder:text-muted/70 focus:border-forest focus:outline-none"
              />
              <div className="mt-2 flex items-start justify-between gap-3">
                <OccasionVoiceButton
                  value={customOccasion || selected}
                  onTranscript={(transcript) => { setCustomOccasion(transcript); setSelected(transcript); setShowOccasionHint(false); }}
                />
                <button type="button" onClick={() => { const text = "A dinner date in Manchester on a chilly evening, smart casual but not overly formal."; setCustomOccasion(text); setSelected(text); setShowOccasionHint(false); }} className="min-h-11 shrink-0 px-1 text-xs text-forest underline decoration-bronze underline-offset-4">Use an example</button>
              </div>
              {showOccasionHint && <p id="mobile-occasion-hint" role="status" className="mt-2 text-sm text-forest">Tell us what you are dressing for to begin.</p>}
              <button type="button" onClick={() => startStyling(customOccasion || selected)} className="mt-4 w-full min-h-[50px] bg-forest text-ivory px-5 py-3 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-forest/90 active:bg-forest/95">
                Style my look <ChevronRight size={17} />
              </button>
              <div className="mobile-home-context mt-8 pt-4 border-t border-line flex items-center justify-between text-xs text-muted">
                <span className="inline-flex items-center gap-2"><Shirt size={16} className="text-forest" /> {wardrobeContextLabel}</span>
                <button type="button" onClick={() => setActive("Wardrobe")} className="text-forest inline-flex items-center gap-1">Change <ChevronRight size={14} /></button>
              </div>
            </section>

            <section className="desktop-home-hero hero-shell relative overflow-hidden mt-0 lg:mt-5 min-h-[520px] sm:min-h-[560px] md:min-h-[700px] rounded-b-[2rem] lg:rounded-none bg-forest text-ivory px-6 pt-6 md:px-12 lg:px-20 lg:pt-24 max-w-[1600px] mx-auto pb-10 lg:pb-16 hidden lg:block">
              <Image
                src="/stylebender-hero-campaign.jpg"
                alt="Model in a forest green tailored jacket"
                fill
                priority
                sizes="100vw"
                className="hero-image absolute inset-0 object-cover object-[62%_center]"
              />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(20,37,30,.98)_0%,rgba(20,37,30,.85)_35%,rgba(20,37,30,.3)_75%,rgba(20,37,30,.15)_100%)]" />

              <div className="relative z-10 max-w-2xl hero-reveal">
                <div className="inline-flex items-center gap-2 px-1 py-1 lg:hidden">
                  <img src="/stylebender-symbol.svg" alt="" className="h-7 w-7 rounded-full object-cover" />
                  <span className="serif text-[20px] leading-none text-ivory">Stylebender</span>
                </div>

                <p className="eyebrow text-bronze mt-2 lg:mt-0">The London edit · 2026</p>

                <h1 className="display text-5xl sm:text-6xl md:text-7xl lg:text-[6.5rem] leading-[.9] mt-4 max-w-3xl">
                  A look for every occasion.
                  <br />
                  <span className="text-ivory/55">Make it yours.</span>
                </h1>

                <p className="text-ivory/80 mt-5 max-w-lg leading-6 md:leading-7 text-sm md:text-base">
                  Describe your occasion, discover a considered outfit, and refine it until it feels like yours.
                </p>

                {/* Same occasion-first journey as mobile, with desktop editorial presentation. */}
                <div className="desktop-occasion-form mt-8 max-w-[550px] rounded-2xl border border-ivory/20 bg-forest/90 p-5 shadow-2xl backdrop-blur-md xl:p-6">
                  <label htmlFor="desktop-occasion" className="block text-sm font-semibold text-ivory">What are you dressing for?</label>
                  <textarea id="desktop-occasion" rows={3} value={customOccasion || selected}
                    onChange={(event) => {
                      setCustomOccasion(event.target.value);
                      setSelected(event.target.value);
                      if (event.target.value.trim()) setShowOccasionHint(false);
                    }}
                    aria-describedby={showOccasionHint ? "desktop-occasion-hint" : undefined}
                    placeholder="A dinner date in Manchester on a chilly evening..."
                    className="mt-3 block min-h-[116px] w-full resize-y rounded-xl border border-ivory/30 bg-paper px-4 py-3 text-[15px] leading-6 text-ink placeholder:text-muted/70 focus:border-bronze focus:outline-none" />
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                    <OccasionVoiceButton value={customOccasion || selected}
                      onTranscript={(text) => { setCustomOccasion(text); setSelected(text); setShowOccasionHint(false); }} />
                    <button type="button" onClick={() => {
                      const example = "A dinner date in Manchester on a chilly evening, smart casual but not overly formal.";
                      setCustomOccasion(example); setSelected(example); setShowOccasionHint(false);
                    }} className="min-h-11 text-xs text-ivory underline decoration-bronze underline-offset-4">Use an example</button>
                  </div>
                  {showOccasionHint && <p id="desktop-occasion-hint" role="status" className="mt-2 text-sm text-ivory">Tell us what you are dressing for to begin.</p>}
                  <button type="button" onClick={() => startStyling(customOccasion || selected)}
                    className="mt-4 inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-ivory px-5 py-3 text-sm font-semibold text-forest hover:bg-white">
                    Style my look <ChevronRight size={18} />
                  </button>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-ivory/20 pt-3 text-xs text-ivory/75">
                    <span className="inline-flex items-center gap-2"><Shirt size={16} className="text-bronze" /> {wardrobeContextLabel}</span>
                    <button onClick={() => setActive("Wardrobe")} className="inline-flex min-h-11 items-center gap-1 text-ivory hover:text-bronze">Wardrobe <ChevronRight size={14} /></button>
                  </div>
                </div>
                              </div>
            </section>

            </main>
          ) : (
          <Placeholder
            active={active}
            setActive={setActive}
            tryOnWardrobeId={tryOnWardrobeId}
            onTryOnWardrobeItem={(id) => { setActive("Try On"); setTryOnWardrobeId(id); }}
            setSelected={setSelected}
            context={{ ...profileContext, occasion: selected }}
            sessionEmail={sessionEmail}
            autoGenerate={autoGenerateVerdict}
            onAutoGenerateConsumed={() => setAutoGenerateVerdict(false)}
          />
          )}

        <footer className="hidden lg:flex px-6 lg:px-20 pb-10 text-xs text-muted justify-between items-center border-t border-line/40 pt-6 mt-12 max-w-[1600px] mx-auto">
          <span>Stylebender · Considered menswear styling</span>
          <span className="text-[11px] text-muted">Privacy first · Private local wardrobe</span>
        </footer>
        </div>
      </div>
    </>
  );
}

function Placeholder({
  active,
  setActive,
  tryOnWardrobeId,
  onTryOnWardrobeItem,
  setSelected,
  context,
  sessionEmail,
  autoGenerate,
  onAutoGenerateConsumed,
}: {
  active: string;
  setActive: (x: string, replace?: boolean, occasionOverride?: string) => void;
  tryOnWardrobeId: string | null;
  onTryOnWardrobeItem: (id: string) => void;
  setSelected: (occasion: string) => void;
  context: OutfitContext;
  sessionEmail?: string;
  autoGenerate: boolean;
  onAutoGenerateConsumed: () => void;
}) {
  return (
    <main className="mobile-panel w-full min-w-0 px-5 lg:px-12 xl:px-16 pt-6 lg:pt-12 max-w-[1320px] mx-auto">
      {(active === "Style Me" || active === "Elevate" || active === "Try On") && (
        <button type="button"
          onClick={() => setActive(active === "Style Me" ? "Discover" : "Style Me")}
          className={`inline-flex items-center gap-2 text-sm text-forest mb-5 min-h-11 hover:text-bronze ${active === "Style Me" ? "lg:hidden" : ""}`}
          aria-label={active === "Style Me" ? "Back to Home" : "Back to My Look"}>
          <ChevronRight className="rotate-180" size={17} />
          {active === "Style Me" ? "Home" : "Back to My Look"}
        </button>
      )}

      {active !== "Profile" && (
        <p className="uppercase tracking-[.25em] text-[10px] text-bronze font-medium">
          Stylebender / {active}
        </p>
      )}

      <h1 aria-label={active === "Style Me" ? "Style Me" : undefined} className={`serif mt-3 mobile-panel-title ${active === "Wardrobe" || active === "Profile" ? "text-4xl md:text-6xl" : "text-5xl md:text-6xl"}`}>{active === "Style Me" ? "My Look" : active}</h1>

      {active === "Wardrobe" ? (
        <WardrobePanel onTryOn={onTryOnWardrobeItem} />
      ) : active === "Profile" ? (
        <StyleProfilePanel email={sessionEmail} />
      ) : active === "Style Me" || active === "Verdict" ? (
        <VerdictPanel
          onAction={setActive}
          context={context}
          autoGenerate={autoGenerate}
          onAutoGenerateConsumed={onAutoGenerateConsumed}
        />
      ) : active === "Achieve" ? (
        <AchievePanel onAddToWardrobe={() => setActive("Wardrobe")} />
      ) : active === "Elevate" ? (
        <ElevatePanel onReturnToLook={() => setActive("Style Me")} />
      ) : active === "Try On" ? (
        <TryOnPanel initialWardrobeId={tryOnWardrobeId} />
      ) : active === "Style IQ" ? (
        <StyleIQPanel />
      ) : active === "Saved" ? (
        <SavedPanel
          onOpen={(item) => {
            setSelected(item.context.occasion);
            onAutoGenerateConsumed();
            setActive("Style Me", false, item.context.occasion);
          }}
        />
      ) : (
        <div className="mt-8 bg-paper border border-line p-7 max-w-xl">
          <p className="text-muted leading-7">
            This space is ready for your personal style journey.
          </p>
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setActive("Discover")}
              className="border border-line px-5 py-3 text-xs hover:border-forest"
            >
              Back to discover
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
