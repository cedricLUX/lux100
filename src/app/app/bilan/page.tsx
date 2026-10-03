"use client";

import { useState } from "react";
import { useProgress } from "@/lib/progress";
import { WEEKLY_BADGE, WEEKLY_QUESTIONS, WEEKS, makeQuiz, type QuizItem } from "@/lib/learning";
import { WORDS } from "@/lib/words";
import { Quiz } from "@/components/Quiz";

export default function Weekly() {
  const { days, weekly, saveWeekly } = useProgress();
  const [run, setRun] = useState<{ week: number; items: QuizItem[] } | null>(null);
  const [result, setResult] = useState<{ week: number; score: number } | null>(null);
  const open = Math.min(WEEKS, Math.floor(days.size / 7));

  if (run)
    return (
      <Quiz
        key={run.week}
        title={`Bilan de la semaine ${run.week}`}
        items={run.items}
        onDone={async (score) => {
          await saveWeekly(run.week, score);
          setResult({ week: run.week, score });
          setRun(null);
        }}
      />
    );

  if (result)
    return (
      <section className="panel">
        <div className="eyebrow">Bilan de la semaine {result.week}</div>
        <h2>
          {result.score} / {WEEKLY_QUESTIONS} {result.score >= WEEKLY_BADGE && "· badge obtenu 🏅"}
        </h2>
        <p className="muted" style={{ margin: 0 }}>
          {result.score >= WEEKLY_BADGE
            ? "Excellent travail, les mots de la semaine sont bien ancrés."
            : "Les mots ratés reviendront dans vos révisions. Vous pourrez refaire ce bilan."}
        </p>
        <div className="row">
          <button type="button" className="btn primary" onClick={() => setResult(null)}>
            Retour aux bilans
          </button>
        </div>
      </section>
    );

  return (
    <>
      <section>
        <div className="eyebrow">Bilan hebdomadaire</div>
        <h2>Un bilan tous les 7 jours</h2>
        <p className="muted">
          {WEEKLY_QUESTIONS} questions sur les 28 mots de la semaine. {WEEKLY_BADGE} bonnes réponses ou plus donnent un
          badge.
        </p>
      </section>
      <div className="panel">
        {Array.from({ length: WEEKS }, (_, k) => k + 1).map((i) => {
          const sc = weekly.get(i);
          const unlocked = i <= open;
          return (
            <div key={i} className="row between" style={{ borderBottom: "1px solid var(--line)", paddingBottom: 8 }}>
              <span>
                <b>Semaine {i}</b>{" "}
                <span className="muted">
                  · jours {(i - 1) * 7 + 1} à {i * 7}
                </span>
              </span>
              <span className="row">
                {sc !== undefined && (
                  <span>
                    {sc} / {WEEKLY_QUESTIONS} {sc >= WEEKLY_BADGE && "🏅"}
                  </span>
                )}
                <button
                  type="button"
                  className={`btn small ${unlocked && sc === undefined ? "good" : ""}`}
                  disabled={!unlocked}
                  onClick={() =>
                    setRun({
                      week: i,
                      items: makeQuiz(
                        WORDS.filter((w) => w.day > (i - 1) * 7 && w.day <= i * 7),
                        WEEKLY_QUESTIONS,
                      ),
                    })
                  }
                >
                  {unlocked ? (sc !== undefined ? "Refaire" : "Commencer") : "Verrouillé"}
                </button>
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
}
