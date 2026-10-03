"use client";

import { playWord } from "./audio";
import type { Word } from "@/lib/words";

export function ListenButton({ word, label = "Écouter" }: { word: Word; label?: string }) {
  return (
    <button type="button" className="btn small" onClick={() => playWord(word)} aria-label={`Écouter ${word.word}`}>
      ▶ {label}
    </button>
  );
}
