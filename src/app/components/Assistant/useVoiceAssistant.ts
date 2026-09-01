"use client";

import { useEffect, useRef, useState } from "react";

import { BROWSER_STT_LANG, ttsLangFor } from "@/lib/assistantLanguages";

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

function pickVoice(lang: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  const wanted = lang.toLowerCase().replace("_", "-");
  return (
    voices.find((voice) => voice.lang.replace("_", "-").toLowerCase() === wanted) ||
    voices.find((voice) => voice.lang.toLowerCase().startsWith(wanted.slice(0, 2))) ||
    null
  );
}

export function useVoiceAssistant(transcribeUrl = "/api/assistant/transcribe") {
  const [listening, setListening] = useState(false);
  const [supported] = useState(() => {
    if (typeof window === "undefined") return true;
    return Boolean(navigator.mediaDevices?.getUserMedia) || Boolean(speechCtor());
  });
  const [status, setStatus] = useState("");
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const timerRef = useRef<number>(0);
  const resolvedRef = useRef(false);
  const backupRef = useRef("");
  const modeRef = useRef<"record" | "browser">("record");
  const finishRef = useRef<(text: string) => void>(() => undefined);
  const failRef = useRef<(message: string) => void>(() => undefined);

  useEffect(() => {
    const onVoices = () => window.speechSynthesis?.getVoices();
    window.speechSynthesis?.getVoices();
    window.speechSynthesis?.addEventListener("voiceschanged", onVoices);
    return () => {
      window.speechSynthesis?.removeEventListener("voiceschanged", onVoices);
      window.clearTimeout(timerRef.current);
      try {
        recRef.current?.abort?.();
      } catch {
        // ignore
      }
      try {
        if (recorderRef.current && recorderRef.current.state !== "inactive") {
          recorderRef.current.stop();
        }
      } catch {
        // ignore
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const cleanupStream = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  const haltRecognition = () => {
    try {
      recRef.current?.stop();
    } catch {
      // ignore
    }
    recRef.current = null;
  };

  const stopRecorder = () => {
    window.clearTimeout(timerRef.current);
    haltRecognition();
    try {
      if (recorderRef.current && recorderRef.current.state !== "inactive") {
        recorderRef.current.stop();
      } else {
        cleanupStream();
        setListening(false);
      }
    } catch {
      cleanupStream();
      setListening(false);
    }
  };

  const listen = async (
    onText: (text: string) => void,
    language = "auto",
    onError?: (message: string) => void
  ) => {
    if (listening) {
      setStatus("Understanding…");
      if (modeRef.current === "browser") {
        window.clearTimeout(timerRef.current);
        haltRecognition();
        const text = backupRef.current.trim();
        if (text) finishRef.current(text);
        else failRef.current("No speech captured. Tap the mic, speak clearly, then tap again.");
        return true;
      }
      stopRecorder();
      return true;
    }

    resolvedRef.current = false;
    backupRef.current = "";
    chunksRef.current = [];
    setStatus("Listening… tap mic again when done");

    const finish = (text: string) => {
      if (resolvedRef.current) return;
      resolvedRef.current = true;
      window.clearTimeout(timerRef.current);
      haltRecognition();
      setListening(false);
      setStatus("");
      cleanupStream();
      if (text.trim()) onText(text.trim());
    };

    const fail = (message: string) => {
      if (resolvedRef.current) return;
      resolvedRef.current = true;
      window.clearTimeout(timerRef.current);
      haltRecognition();
      setListening(false);
      setStatus("");
      cleanupStream();
      onError?.(message);
    };
    finishRef.current = finish;
    failRef.current = fail;

    const startBrowserBackup = () => {
      const Ctor = speechCtor();
      if (!Ctor) return;
      try {
        const rec = new Ctor();
        rec.lang = BROWSER_STT_LANG[language] || "hi-IN";
        rec.interimResults = true;
        rec.continuous = true;
        rec.onresult = (event) => {
          const last = event.results[event.results.length - 1];
          const text = String(last?.[0]?.transcript || "").trim();
          if (text) backupRef.current = text;
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
    };

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      const Ctor = speechCtor();
      if (!Ctor) {
        fail("This browser cannot use the mic. Please type, or try Chrome/Safari.");
        return false;
      }
      modeRef.current = "browser";
      startBrowserBackup();
      setListening(true);
      timerRef.current = window.setTimeout(() => {
        const text = backupRef.current;
        if (text) finish(text);
        else fail("No speech captured. Tap the mic, speak clearly, then tap again.");
      }, 12000);
      return true;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
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
        haltRecognition();
        cleanupStream();
        if (resolvedRef.current) return;
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || mime || "audio/webm",
        });
        const backup = backupRef.current.trim();
        if (blob.size >= 800) {
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
            if (backup) {
              finish(backup);
              return;
            }
            fail(data.message || "Could not hear that. Please try again.");
            return;
          } catch {
            if (backup) {
              finish(backup);
              return;
            }
            fail("Voice upload failed. Please type instead.");
            return;
          }
        }
        if (backup) {
          finish(backup);
          return;
        }
        fail("No speech captured. Tap the mic, speak clearly, then tap again.");
      };
      modeRef.current = "record";
      recorder.start(250);
      startBrowserBackup();
      setListening(true);
      timerRef.current = window.setTimeout(() => stopRecorder(), 12000);
      return true;
    } catch {
      modeRef.current = "browser";
      startBrowserBackup();
      if (recRef.current) {
        setListening(true);
        timerRef.current = window.setTimeout(() => {
          const text = backupRef.current;
          if (text) finish(text);
          else fail("Mic permission denied. Allow microphone for this site and try again.");
        }, 12000);
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
    utterance.rate = 1.02;
    const voice = pickVoice(utterance.lang);
    if (voice) utterance.voice = voice;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  return { listening, supported, status, listen, stop: stopRecorder, speak };
}
