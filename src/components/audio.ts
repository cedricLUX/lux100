"use client";

import { lodAudio, type Word } from "@/lib/words";

// Voix de synthèse : dernier recours quand l'enregistrement natif manque.
function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  const voices = speechSynthesis.getVoices();
  const v = voices.find((x) => /^lb/i.test(x.lang)) ?? voices.find((x) => /^de/i.test(x.lang));
  if (v) u.voice = v;
  u.lang = v?.lang ?? "de-DE";
  u.rate = 0.85;
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}

/** Joue l'enregistrement natif du LOD ; sinon la voix de synthèse. */
export function playWord(w: Word) {
  if (!w.lodId) return speak(w.word);
  let fellBack = false;
  const fallback = () => {
    if (!fellBack) {
      fellBack = true;
      speak(w.word);
    }
  };
  const a = new Audio(lodAudio(w.lodId));
  a.onerror = fallback;
  a.play().catch(fallback);
}

/** Les phrases d'exemple n'ont pas encore d'enregistrement natif. */
export function playSentence(w: Word) {
  speak(w.example);
}
