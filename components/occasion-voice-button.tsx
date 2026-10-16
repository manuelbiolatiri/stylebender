"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";

type SpeechResult = { isFinal: boolean; [index: number]: { transcript: string } };
type SpeechEvent = { results: ArrayLike<SpeechResult> };
type SpeechError = { error: string };
type BrowserRecognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechEvent) => void) | null;
  onerror: ((event: SpeechError) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
};
type RecognitionConstructor = new () => BrowserRecognition;

function speechAPI(): RecognitionConstructor | undefined {
  if (typeof window === "undefined") return undefined;
  const browser = window as Window & {
    SpeechRecognition?: RecognitionConstructor;
    webkitSpeechRecognition?: RecognitionConstructor;
  };
  return browser.SpeechRecognition ?? browser.webkitSpeechRecognition;
}

function messageForError(error: string): string {
  if (error === "not-allowed" || error === "service-not-allowed") return "Microphone permission denied. Allow microphone access in browser settings or type instead.";
  if (error === "audio-capture") return "No microphone detected. You can type instead.";
  if (error === "no-speech") return "Didn't hear anything. Please try again or type.";
  if (error === "network") return "Voice recognition is unavailable right now. Please type instead.";
  return "Voice recognition didn't work. You can still type your occasion.";
}

export function OccasionVoiceButton({
  value,
  onTranscript,
}: {
  value: string;
  onTranscript: (value: string) => void;
}) {
  const recognizerRef = useRef<BrowserRecognition | null>(null);
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setSupported(Boolean(speechAPI()));
    return () => {
      const r = recognizerRef.current;
      if (r) {
        r.onresult = null;
        r.onerror = null;
        r.onend = null;
        r.abort();
        recognizerRef.current = null;
      }
    };
  }, []);

  if (!supported) return null;

  function toggle() {
    if (recognizerRef.current) {
      const r = recognizerRef.current;
      setListening(false);
      try { r.stop(); } catch { /* already stopped */ }
      return;
    }
    const Constructor = speechAPI();
    if (!Constructor) return;
    let r: BrowserRecognition;
    try { r = new Constructor(); } catch {
      setMessage("Voice recognition could not start. Please type instead.");
      return;
    }
    const existingText = value.trim();
    let heardSpeech = false;
    let hadError = false;
    r.lang = navigator.language || "en-GB";
    r.continuous = false;
    r.interimResults = true;
    r.onresult = (event) => {
      // Complete result list replaces interim text, avoiding duplicated words.
      const spoken = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? "")
        .join(" ")
        .trim();
      if (!spoken) return;
      heardSpeech = true;
      onTranscript([existingText, spoken].filter(Boolean).join(" "));
      setMessage(null);
    };
    r.onerror = ({ error }) => {
      hadError = true;
      setListening(false);
      setMessage(messageForError(error));
    };
    r.onend = () => {
      if (recognizerRef.current === r) recognizerRef.current = null;
      setListening(false);
      if (!heardSpeech && !hadError) setMessage("Nothing heard. Try again or type your occasion.");
    };
    recognizerRef.current = r;
    setMessage(null);
    try {
      r.start();
      setListening(true);
    } catch {
      recognizerRef.current = null;
      setListening(false);
      setMessage("Voice recognition could not start. Please type instead.");
    }
  }

  return (
    <div className="min-w-0">
      <button
        type="button"
        onClick={toggle}
        aria-label={listening ? "Stop listening" : "Speak your occasion"}
        aria-pressed={listening}
        className={`min-h-11 inline-flex items-center gap-2 rounded-lg px-3 text-xs font-medium transition-colors ${listening ? "bg-forest text-ivory" : "border border-line text-forest hover:border-bronze"}`}
      >
        {listening ? <MicOff size={16} aria-hidden="true" /> : <Mic size={16} aria-hidden="true" />}
        {listening ? "Stop" : "Speak"}
      </button>
      <p role="status" aria-live="polite" className={`text-xs leading-5 mt-1 ${message ? "text-forest" : "text-muted"}`}>
        {listening ? "Listening… speak your occasion." : message ?? ""}
      </p>
    </div>
  );
}
