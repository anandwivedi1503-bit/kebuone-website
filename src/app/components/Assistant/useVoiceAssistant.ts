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
  const base = wanted.slice(0, 2);
  const exact = voices.filter(
    (voice) => voice.lang.replace("_", "-").toLowerCase() === wanted
  );
  const prefixed = voices.filter((voice) => voice.lang.toLowerCase().startsWith(base));
  const pool = exact.length ? exact : prefixed;
  if (!pool.length) return null;
  // Prefer natural Hindi / Indian voices when available.
  return (
    pool.find((voice) => /hindi|हिन्दी|india|google.*hi|microsoft.*hi/i.test(voice.name)) ||
    pool.find((voice) => /female|woman|neerja|swara|kajal/i.test(voice.name)) ||
    pool[0]
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
    onError?: (message: string) => void,
    preferBrowser = false
  ) => {
    if (listening) {
      setStatus("समझ रही हूँ…");
      if (modeRef.current === "browser") {
        window.clearTimeout(timerRef.current);
        haltRecognition();
        const text = backupRef.current.trim();
        if (text) finishRef.current(text);
        else failRef.current("आवाज़ नहीं सुनाई दी। माइक दबाएँ, साफ़ बोलें, फिर रोकने के लिए फिर दबाएँ।");
        return true;
      }
      stopRecorder();
      return true;
    }

    resolvedRef.current = false;
    backupRef.current = "";
    chunksRef.current = [];
    setStatus("सुन रही हूँ… बोलकर माइक फिर दबाएँ");

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

    // Eva: use browser speech first so users never see "voice server not configured".
    if (preferBrowser && speechCtor()) {
      modeRef.current = "browser";
      startBrowserBackup();
      if (!recRef.current) {
        fail("इस ब्राउज़र में माइक नहीं चल रहा। सवाल टाइप करें, या Chrome/Safari आज़माएँ।");
        return false;
      }
      setListening(true);
      timerRef.current = window.setTimeout(() => {
        const text = backupRef.current;
        if (text) finish(text);
        else fail("आवाज़ नहीं सुनाई दी। माइक दबाएँ, साफ़ बोलें, फिर रोकने के लिए फिर दबाएँ।");
      }, 12000);
      return true;
    }

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      const Ctor = speechCtor();
      if (!Ctor) {
        fail("इस ब्राउज़र में माइक नहीं चल रहा। टाइप करें, या Chrome/Safari आज़माएँ।");
        return false;
      }
      modeRef.current = "browser";
      startBrowserBackup();
      setListening(true);
      timerRef.current = window.setTimeout(() => {
        const text = backupRef.current;
        if (text) finish(text);
        else fail("आवाज़ नहीं सुनाई दी। माइक दबाएँ, साफ़ बोलें, फिर रोकने के लिए फिर दबाएँ।");
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
          setStatus("समझ रही हूँ…");
          try {
            const form = new FormData();
            const ext = blob.type.includes("mp4") ? "m4a" : "webm";
            form.append("audio", blob, `speech.${ext}`);
            form.append("language", language === "en" ? "en" : "hi");
            const res = await fetch(transcribeUrl, { method: "POST", body: form });
            const data = await res.json();
            if (data.text) {
              finish(String(data.text));
              return;
            }
            // Prefer browser speech text over any server error (incl. not configured).
            if (backup) {
              finish(backup);
              return;
            }
            if (res.status === 503 || data.code === "STT_NOT_CONFIGURED") {
              fail(
                "वॉइस सर्वर सेट नहीं है — Chrome/Safari में माइक से बोलें, या सवाल हिंदी में टाइप करें।"
              );
              return;
            }
            fail(
              typeof data.message === "string" && data.message
                ? data.message
                : "सुनाई नहीं दी। फिर से बोलकर देखें।"
            );
            return;
          } catch {
            if (backup) {
              finish(backup);
              return;
            }
            fail("आवाज़ भेजने में समस्या। कृपया टाइप करें।");
            return;
          }
        }
        if (backup) {
          finish(backup);
          return;
        }
        fail("आवाज़ नहीं सुनाई दी। माइक दबाएँ, साफ़ बोलें, फिर रोकने के लिए फिर दबाएँ।");
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
          else fail("माइक की अनुमति नहीं मिली। साइट के लिए माइक ऑन करें।");
        }, 12000);
        return true;
      }
      fail("माइक की अनुमति नहीं मिली। evuddy.com के लिए माइक ऑन करें।");
      return false;
    }
  };

  const speak = (text: string, language = "hi") => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    // Default / Auto / Hindi → Hindi voice. Only explicit "en" (etc.) switches away.
    const useHindi = !language || language === "auto" || language === "hi" || language === "mr";
    const utterance = new SpeechSynthesisUtterance(text.slice(0, 420));
    utterance.lang = useHindi ? "hi-IN" : ttsLangFor(text, language);
    utterance.rate = useHindi ? 0.96 : 1.02;
    const voice = pickVoice(utterance.lang);
    if (voice) utterance.voice = voice;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  return { listening, supported, status, listen, stop: stopRecorder, speak };
}
