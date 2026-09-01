"use client";

import { useEffect, useRef, useState } from "react";

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

function speechCtor() {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function useVoiceAssistant() {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    setSupported(Boolean(speechCtor()));
  }, []);

  const listen = (onText: (text: string) => void) => {
    const Ctor = speechCtor();
    if (!Ctor) return false;
    try {
      recRef.current?.stop();
    } catch {
      // ignore
    }
    const rec = new Ctor();
    rec.lang = "en-IN";
    rec.interimResults = false;
    rec.continuous = false;
    rec.onresult = (event) => {
      const text = String(event.results?.[0]?.[0]?.transcript || "").trim();
      if (text) onText(text);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recRef.current = rec;
    rec.start();
    setListening(true);
    return true;
  };

  const stop = () => {
    try {
      recRef.current?.stop();
    } catch {
      // ignore
    }
    setListening(false);
  };

  const speak = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text.slice(0, 280));
    utterance.lang = "en-IN";
    utterance.rate = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  return { listening, supported, listen, stop, speak };
}
