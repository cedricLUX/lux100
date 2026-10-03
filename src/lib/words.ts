import data from "../../data/words.json";

export type Word = {
  n: number;
  day: number;
  word: string;
  article: string;
  category: string;
  gender: "" | "m" | "f" | "n" | "pl";
  fr: string;
  example: string;
  exampleFr: string;
  lodId: string | null;
  emoji: string;
  inGame: boolean;
};

export const WORDS = data as Word[];
export const TOTAL_DAYS = 100;
export const WORDS_PER_DAY = 4;

export const wordByN = (n: number) => WORDS[n - 1];
export const wordsOfDay = (day: number) => WORDS.filter((w) => w.day === day);

/** « den Dag », « d'Zäit », « Moien » */
export function withArticle(w: Word) {
  if (!w.article) return w.word;
  return w.article === "d'" ? `d'${w.word}` : `${w.article} ${w.word}`;
}

export const GENDER_LABEL: Record<string, string> = { m: "masculin", f: "féminin", n: "neutre", pl: "pluriel" };

// Enregistrements du Lëtzebuerger Online Dictionnaire (licence CC0)
export const lodAudio = (id: string) => `https://lod.lu/uploads/AAC/${id}.m4a`;
export const lodPage = (id: string) => `https://lod.lu/artikel/${id}`;
