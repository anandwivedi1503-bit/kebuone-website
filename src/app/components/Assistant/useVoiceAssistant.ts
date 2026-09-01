"use client";

import { useEffect, useRef, useState } from "react";

import { ttsLangFor } from "@/lib/assistantLanguages";

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  abort?: () => void;
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

function pickMime() {
  if (typeof MediaRecorder === "undefined") return "";
  const types = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"];
  return types.find((type) => MediaRecorder.isTypeSupported(type)) || "";
}

const STT_LANG: Record<string, string> = {
  auto: "en-IN",
  en: "en-IN",
  hi: "hi-IN",
  ta: "ta-IN",
  te: "te-IN",
  mr: "mr-IN",
  bn: "bn-IN",
  gu: "gu-IN",
  kn: "kn-IN",
  ml: "ml-IN",
  pa: "pa-IN",
  ur: "ur-IN",
};

export function useVoiceAssistant(transcribeUrl = "/api/assistant/transcribe") {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [status, setStatus] = useState("");
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const timerRef = useRef<number>(0);
  const resolvedRef = useRef(false);

  useEffect(() => {
    const hasMic = Boolean(navigator.mediaDevices?.getUserMedia);
    setSupported(hasMic || Boolean(speechCtor()));
  }, []);

  const cleanupStream = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  const stop = () => {
    window.clearTimeout(timerRef.current);
    try {
      recRef.current?.stop();
    } catch {
      // ignore
    }
    try {
      if (recorderRef.current && recorderRef.current.state !== "inactive") {
        recorderRef.current.stop();
      }
    } catch {
      cleanupStream();
    }
    setListening(false);
  };

  const listen = async (
    onText: (text: string) => void,
    language = "auto",
    onError?: (message: string) => void
  ) => {
    if (listening) {
      stop();
      return true;
    }

    resolvedRef.current = false;
    chunksRef.current = [];
    setStatus("Listening… tap mic again when done");

    const finish = (text: string) => {
      if (resolvedRef.current) return;
      resolvedRef.current = true;
      setListening(false);
      setStatus("");
      cleanupStream();
      if (text.trim()) onText(text.trim());
    };

    const fail = (message: string) => {
      if (resolvedRef.current) return;
      resolvedRef.current = true;
      setListening(false);
      setStatus("");
      cleanupStream();
      onError?.(message);
    };

    const Ctor = speechCtor();
    if (Ctor) {
      try {
        const rec = new Ctor();
        rec.lang = STT_LANG[language] || "hi-IN";
        rec.interimResults = false;
        rec.continuous = false;
        rec.onresult = (event) => {
          const text = String(event.results?.[0]?.[0]?.transcript || "").trim();
          if (text) finish(text);
        };
        rec.onerror = () => {
          recRef.current = null;
        };
        rec.onend = () => {
          recRef.current = null;
        };
        recRef.current = rec;
        rec.start();
      } catch {
        recRef.current = null;
      }
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      if (!Ctor) {
        fail("This browser cannot use the mic. Please type, or try Chrome/Safari.");
        return false;
      }
      setListening(true);
      timerRef.current = window.setTimeout(() => stop(), 12000);
      return true;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = pickMime();
      const recorder = mime
        ? new MediaRecorder(stream, { mimeType: mime })
        : new MediaRecorder(stream);
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = async () => {
        cleanupStream();
        if (resolvedRef.current) return;
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || mime || "audio/webm",
        });
        if (blob.size < 800) {
          fail("No speech captured. Hold the mic, speak clearly, then tap again.");
          return;
        }
        setStatus("Understanding…");
        try {
          const form = new FormData();
          const ext = blob.type.includes("mp4") ? "m4a" : "webm";
          form.append("audio", blob, `speech.${ext}`);
          form.append("language", language);
          const res = await fetch(transcribeUrl, { method: "POST", body: form });
          const data = await res.json();
          if (data.text) {
            finish(String(data.text));
            return;
          }
          fail(data.message || "Could not hear that. Please try again.");
        } catch {
          fail("Voice upload failed. Please type instead.");
        }
      };
      recorder.start();
      setListening(true);
      timerRef.current = window.setTimeout(() => stop(), 12000);
      return true;
    } catch {
      if (Ctor && recRef.current) {
        setListening(true);
        timerRef.current = window.setTimeout(() => stop(), 12000);
        return true;
      }
      fail("Mic permission denied. Allow microphone for evuddy.com and try again.");
      return false;
    }
  };

  const speak = (text: string, language = "auto") => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text.slice(0, 320));
    utterance.lang = ttsLangFor(text, language);
    utterance.rate = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  return { listening, supported, status, listen, stop, speak };
}
