"use client";

import Link from "next/link";
import { useState } from "react";
import { useProgress } from "@/lib/progress";
import { cultureForDay } from "@/lib/culture";
import { daysBetween } from "@/lib/learning";
import { wordsOfDay } from "@/lib/words";
import { WordCard } from "@/components/WordCard";

export default function Today() {
  const { profile, today, days, weekly, dueWords, learnCurrentDay } = useProgress();
  const [busy, setBusy] = useState(false);
  if (!profile) return null;

  const day = profile.current_day;
  const gap = profile.prev_visit ? daysBetween(profile.prev_visit, today) : 0;
  const doneToday = [...days.values()].some((d) => d.completed_on === today && !d.via_test);
  const pendingWeek = Math.min(14, Math.floor(days.size / 7));
  const culture = cultureForDay(day);

  async function learn() {
    setBusy(true);
    await learnCurrentDay();
    setBusy(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      {gap > 1 && day <= 100 && (
        <p className="notice">
          Bon retour ! Vous n&apos;êtes pas venu depuis {gap} jours. Rien ne s&apos;accumule : vous reprenez simplement au
          jour {day}.
        </p>
      )}
      {dueWords.length > 0 && (
        <div className="notice red row between">
          <span>
            <b>
              {dueWords.length} mot{dueWords.length > 1 ? "s" : ""} à réviser
            </b>{" "}
            avant les nouveaux mots.
          </span>
          <Link className="btn small warn" href="/app/revision">
            Réviser
          </Link>
        </div>
      )}
      {pendingWeek >= 1 && !weekly.has(pendingWeek) && (
        <div className="notice good row between">
          <span>Le bilan de la semaine {pendingWeek} est prêt.</span>
          <Link className="btn small good" href="/app/bilan">
            Faire le bilan
          </Link>
        </div>
      )}

      {day > 100 ? (
        <section className="panel">
          <h2>Félicitations, les 100 jours sont terminés !</h2>
          <p>Vous avez vu les 400 mots. Continuez les révisions pour les garder en mémoire.</p>
        </section>
      ) : (
        <>
          <section>
            <div className="eyebrow">
              Jour {day} · mots {(day - 1) * 4 + 1} à {day * 4}
            </div>
            <h2>{doneToday ? "Encore 4 mots ? Vous êtes en avance." : "Vos 4 mots du jour"}</h2>
          </section>
          <div className="words">
            {wordsOfDay(day).map((w) => (
              <WordCard key={w.n} word={w} />
            ))}
          </div>
          <div className="row">
            <button type="button" className="btn primary" onClick={learn} disabled={busy}>
              {busy ? "Enregistrement…" : "J'ai appris ces 4 mots"}
            </button>
            <span className="muted">Ils reviendront demain en révision.</span>
          </div>
        </>
      )}

      <section className="panel culture">
        <div className="eyebrow">Note culturelle · semaine {culture.week}</div>
        <h3>{culture.title}</h3>
        <p style={{ margin: 0 }}>{culture.text}</p>
      </section>
    </>
  );
}
