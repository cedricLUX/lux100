// Règles d'apprentissage, sans dépendance à React ni à Supabase (testables seules).
import { WORDS, type Word } from "./words";

/** Intervalles de la répétition espacée, en jours, par « boîte » (0 à 5). */
export const INTERVALS = [1, 3, 7, 14, 30, 60] as const;
export const MAX_BOX = INTERVALS.length - 1;
/** Boîte donnée aux mots d'un bloc validé par le test de niveau. */
export const PLACEMENT_BOX = 2;
export const PLACEMENT_BLOCK = 10;
export const PLACEMENT_QUESTIONS = 8;
export const PLACEMENT_PASS = 7;
export const WEEKLY_QUESTIONS = 10;
export const WEEKLY_BADGE = 8;
export const WEEKS = 14;

export const TIME_ZONE = "Europe/Luxembourg";

/** Date du jour au format AAAA-MM-JJ, à l'heure de Luxembourg. */
export function todayIso(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(now);
}

export function addDays(iso: string, n: number) {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function daysBetween(a: string, b: string) {
  return Math.round((Date.parse(`${b}T12:00:00Z`) - Date.parse(`${a}T12:00:00Z`)) / 864e5);
}

/** Nouvelle boîte et prochaine date après une révision. */
export function grade(box: number, remembered: boolean, today: string) {
  const next = remembered ? Math.min(MAX_BOX, box + 1) : 0;
  return { box: next, due: addDays(today, INTERVALS[next]) };
}

/** Série de jours consécutifs avec au moins un jour validé. */
export function nextStreak(streak: number, streakDate: string | null, today: string) {
  if (streakDate === today) return { streak, streakDate };
  const continued = streakDate !== null && daysBetween(streakDate, today) === 1;
  return { streak: continued ? streak + 1 : 1, streakDate: today };
}

/** Prochain jour à apprendre : le premier jour non terminé à partir de `from`. */
export function nextOpenDay(from: number, finished: Set<number>) {
  let d = from;
  while (d <= 100 && finished.has(d)) d++;
  return d;
}

export function shuffle<T>(items: T[], rand = Math.random): T[] {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export type QuizItem = { word: Word; options: Word[] };

/** Questions à choix multiples : le mot luxembourgeois, quatre traductions possibles. */
export function makeQuiz(pool: Word[], count: number, rand = Math.random): QuizItem[] {
  return shuffle(pool, rand)
    .slice(0, count)
    .map((word) => {
      const sameKind = shuffle(
        WORDS.filter((o) => o.n !== word.n && o.fr !== word.fr && o.category === word.category),
        rand,
      );
      const others = shuffle(
        WORDS.filter((o) => o.n !== word.n && o.fr !== word.fr),
        rand,
      );
      const picked: Word[] = [];
      for (const o of [...sameKind, ...others]) {
        if (picked.length === 3) break;
        if (!picked.some((p) => p.fr === o.fr)) picked.push(o);
      }
      return { word, options: shuffle([word, ...picked], rand) };
    });
}

/** Mots utilisables dans le jeu des cartes : vus par l'apprenant et illustrés. */
export function gamePool(currentDay: number, learned: Set<number>) {
  const pool = WORDS.filter((w) => w.inGame && (learned.has(w.n) || w.day <= currentDay));
  return pool.length >= 6 ? pool : WORDS.filter((w) => w.inGame).slice(0, 12);
}

export function gameRound(pool: Word[], rand = Math.random) {
  const target = pool[Math.floor(rand() * pool.length)];
  const others = shuffle(
    pool.filter((w) => w.n !== target.n && w.emoji !== target.emoji),
    rand,
  ).slice(0, 3);
  return { target, options: shuffle([target, ...others], rand) };
}
