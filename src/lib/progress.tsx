"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { wordsOfDay } from "@/lib/words";
import { PLACEMENT_BOX, addDays, grade, nextOpenDay, nextStreak, todayIso } from "@/lib/learning";

export type Profile = {
  id: string;
  email: string | null;
  current_day: number;
  streak: number;
  streak_date: string | null;
  last_visit: string | null;
  prev_visit: string | null;
  game_best: number;
  reminder_email: boolean;
};
type DayRow = { day: number; completed_on: string; via_test: boolean };
type ReviewRow = { word_n: number; box: number; due: string };
type WeeklyRow = { week: number; best_score: number };

type Progress = {
  ready: boolean;
  error: string | null;
  today: string;
  profile: Profile | null;
  days: Map<number, DayRow>;
  reviews: Map<number, ReviewRow>;
  weekly: Map<number, number>;
  dueWords: number[];
  learnCurrentDay: () => Promise<void>;
  gradeWord: (n: number, remembered: boolean) => Promise<void>;
  saveWeekly: (week: number, score: number) => Promise<void>;
  passPlacement: (from: number, to: number) => Promise<void>;
  saveGameScore: (score: number) => Promise<void>;
  setReminder: (on: boolean) => Promise<void>;
  resetAll: () => Promise<void>;
};

const Ctx = createContext<Progress | null>(null);

export function useProgress() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useProgress doit être utilisé dans <ProgressProvider>");
  return v;
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [today] = useState(() => todayIso());
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [days, setDays] = useState(new Map<number, DayRow>());
  const [reviews, setReviews] = useState(new Map<number, ReviewRow>());
  const [weekly, setWeekly] = useState(new Map<number, number>());

  const fail = (e: { message: string } | null) => {
    if (e) setError("La sauvegarde a échoué. Vérifiez votre connexion puis rechargez la page.");
    return Boolean(e);
  };

  const load = useCallback(async () => {
    const { data: auth } = await createClient().auth.getUser();
    if (!auth.user) return;
    const uid = auth.user.id;
    const [p, d, r, w] = await Promise.all([
      createClient().from("profiles").select("*").eq("id", uid).single(),
      createClient().from("day_progress").select("day, completed_on, via_test"),
      createClient().from("word_reviews").select("word_n, box, due"),
      createClient().from("weekly_results").select("week, best_score"),
    ]);
    if (p.error || d.error || r.error || w.error) {
      setError("Impossible de charger votre progression. Rechargez la page.");
      return;
    }
    let prof = p.data as Profile;
    // Mémorise la visite précédente pour le message de retour après une absence.
    if (prof.last_visit !== today) {
      const patch = { prev_visit: prof.last_visit, last_visit: today };
      await createClient().from("profiles").update(patch).eq("id", uid);
      prof = { ...prof, ...patch };
    }
    setProfile(prof);
    setDays(new Map((d.data as DayRow[]).map((x) => [x.day, x])));
    setReviews(new Map((r.data as ReviewRow[]).map((x) => [x.word_n, x])));
    setWeekly(new Map((w.data as WeeklyRow[]).map((x) => [x.week, x.best_score])));
    setReady(true);
  }, [today]);

  useEffect(() => {
    // Chargement initial des données de l'apprenant depuis Supabase.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const dueWords = useMemo(
    () => [...reviews.values()].filter((r) => r.due <= today).map((r) => r.word_n),
    [reviews, today],
  );

  const updateProfile = useCallback(
    async (patch: Partial<Profile>) => {
      if (!profile) return false;
      const { error } = await createClient().from("profiles").update(patch).eq("id", profile.id);
      if (fail(error)) return false;
      setProfile({ ...profile, ...patch });
      return true;
    },
    [profile],
  );

  const learnCurrentDay = useCallback(async () => {
    if (!profile || profile.current_day > 100) return;
    const day = profile.current_day;
    const newReviews = wordsOfDay(day)
      .filter((w) => !reviews.has(w.n))
      .map((w) => ({ user_id: profile.id, word_n: w.n, box: 0, due: addDays(today, 1) }));
    const row = { user_id: profile.id, day, completed_on: today, via_test: false };
    const a = await createClient().from("day_progress").upsert(row);
    if (fail(a.error)) return;
    if (newReviews.length) {
      const b = await createClient().from("word_reviews").upsert(newReviews);
      if (fail(b.error)) return;
    }
    const finished = new Set([...days.keys(), day]);
    const s = nextStreak(profile.streak, profile.streak_date, today);
    const ok = await updateProfile({
      current_day: nextOpenDay(day, finished),
      streak: s.streak,
      streak_date: s.streakDate,
    });
    if (!ok) return;
    setDays(new Map(days).set(day, row));
    const rv = new Map(reviews);
    newReviews.forEach((x) => rv.set(x.word_n, x));
    setReviews(rv);
  }, [profile, reviews, days, today, updateProfile]);

  const gradeWord = useCallback(
    async (n: number, remembered: boolean) => {
      const cur = reviews.get(n);
      if (!cur || !profile) return;
      const next = { word_n: n, ...grade(cur.box, remembered, today) };
      const { error } = await createClient()
        .from("word_reviews")
        .update({ box: next.box, due: next.due })
        .eq("user_id", profile.id)
        .eq("word_n", n);
      if (fail(error)) return;
      setReviews(new Map(reviews).set(n, next));
    },
    [reviews, profile, today],
  );

  const saveWeekly = useCallback(
    async (week: number, score: number) => {
      if (!profile) return;
      const best = Math.max(weekly.get(week) ?? 0, score);
      const { error } = await createClient()
        .from("weekly_results")
        .upsert({ user_id: profile.id, week, best_score: best });
      if (fail(error)) return;
      setWeekly(new Map(weekly).set(week, best));
    },
    [profile, weekly],
  );

  const passPlacement = useCallback(
    async (from: number, to: number) => {
      if (!profile) return;
      const rows: DayRow[] = [];
      const newReviews: ReviewRow[] = [];
      for (let d = from; d <= to; d++) {
        if (days.has(d)) continue;
        rows.push({ day: d, completed_on: today, via_test: true });
        for (const w of wordsOfDay(d)) {
          if (!reviews.has(w.n)) newReviews.push({ word_n: w.n, box: PLACEMENT_BOX, due: addDays(today, 7) });
        }
      }
      const a = await createClient().from("day_progress").upsert(rows.map((r) => ({ ...r, user_id: profile.id })));
      if (fail(a.error)) return;
      const b = await createClient().from("word_reviews").upsert(newReviews.map((r) => ({ ...r, user_id: profile.id })));
      if (fail(b.error)) return;
      const finished = new Set([...days.keys(), ...rows.map((r) => r.day)]);
      if (!(await updateProfile({ current_day: nextOpenDay(to + 1, finished) }))) return;
      const dm = new Map(days);
      rows.forEach((r) => dm.set(r.day, r));
      setDays(dm);
      const rm = new Map(reviews);
      newReviews.forEach((r) => rm.set(r.word_n, r));
      setReviews(rm);
    },
    [profile, days, reviews, today, updateProfile],
  );

  const saveGameScore = useCallback(
    async (score: number) => {
      if (profile && score > profile.game_best) await updateProfile({ game_best: score });
    },
    [profile, updateProfile],
  );

  const setReminder = useCallback(async (on: boolean) => void (await updateProfile({ reminder_email: on })), [updateProfile]);

  const resetAll = useCallback(async () => {
    if (!profile) return;
    const uid = profile.id;
    const results = await Promise.all([
      createClient().from("day_progress").delete().eq("user_id", uid),
      createClient().from("word_reviews").delete().eq("user_id", uid),
      createClient().from("weekly_results").delete().eq("user_id", uid),
    ]);
    if (results.some((r) => fail(r.error))) return;
    await updateProfile({ current_day: 1, streak: 0, streak_date: null, game_best: 0 });
    setDays(new Map());
    setReviews(new Map());
    setWeekly(new Map());
  }, [profile, updateProfile]);

  const value: Progress = {
    ready,
    error,
    today,
    profile,
    days,
    reviews,
    weekly,
    dueWords,
    learnCurrentDay,
    gradeWord,
    saveWeekly,
    passPlacement,
    saveGameScore,
    setReminder,
    resetAll,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
