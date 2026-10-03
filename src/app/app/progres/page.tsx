"use client";

import { useState } from "react";
import { useProgress } from "@/lib/progress";
import { PLACEMENT_BLOCK, PLACEMENT_PASS, PLACEMENT_QUESTIONS, makeQuiz, type QuizItem } from "@/lib/learning";
import { WORDS } from "@/lib/words";
import { Quiz } from "@/components/Quiz";

export default function ProgressPage() {
  const { profile, days, reviews, dueWords, passPlacement, resetAll } = useProgress();
  const [test, setTest] = useState<{ from: number; to: number; items: QuizItem[] } | null>(null);
  const [result, setResult] = useState<{ from: number; to: number; score: number } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  if (!profile) return null;
  const day = profile.current_day;

  function startTest() {
    const from = day;
    const to = Math.min(100, from + PLACEMENT_BLOCK - 1);
    const pool = WORDS.filter((w) => w.day >= from && w.day <= to);
    setResult(null);
    setTest({ from, to, items: makeQuiz(pool, PLACEMENT_QUESTIONS) });
  }

  if (test)
    return (
      <Quiz
        key={test.from}
        title={`Test de niveau · jours ${test.from} à ${test.to}`}
        items={test.items}
        onDone={async (score) => {
          if (score >= PLACEMENT_PASS) await passPlacement(test.from, test.to);
          setResult({ from: test.from, to: test.to, score });
          setTest(null);
        }}
      />
    );

  if (result) {
    const pass = result.score >= PLACEMENT_PASS;
    return (
      <section className="panel">
        <div className="eyebrow">Test de niveau</div>
        <h2>{pass ? "Bloc validé" : "Bloc à travailler"}</h2>
        <p style={{ margin: 0 }}>
          {pass
            ? `Réussi (${result.score} / ${PLACEMENT_QUESTIONS}) : les jours ${result.from} à ${result.to} sont validés. Leurs mots reviendront en révision dans une semaine.`
            : `${result.score} / ${PLACEMENT_QUESTIONS} : il faut ${PLACEMENT_PASS} bonnes réponses pour sauter ce bloc. Vous continuez au jour ${day}.`}
        </p>
        <div className="row">
          {pass && day <= 100 && (
            <button type="button" className="btn primary" onClick={startTest}>
              Tester le bloc suivant
            </button>
          )}
          <button type="button" className="btn" onClick={() => setResult(null)}>
            Retour
          </button>
        </div>
      </section>
    );
  }

  const mastered = [...reviews.values()].filter((r) => r.box >= 3).length;
  return (
    <>
      <section>
        <div className="eyebrow">Progrès</div>
        <h2>{reviews.size} mots sur 400</h2>
      </section>
      <div className="stats">
        <div className="stat">
          <b>{days.size}</b>
          <span>jours validés</span>
        </div>
        <div className="stat">
          <b>{profile.streak}</b>
          <span>jours de suite</span>
        </div>
        <div className="stat">
          <b>{mastered}</b>
          <span>mots bien ancrés (réussis 3 fois ou plus)</span>
        </div>
        <div className="stat">
          <b>{dueWords.length}</b>
          <span>à réviser aujourd&apos;hui</span>
        </div>
      </div>
      <section className="panel">
        <h3>Les 100 jours</h3>
        <div className="grid100">
          {Array.from({ length: 100 }, (_, k) => k + 1).map((d) => {
            const row = days.get(d);
            const cls = [row ? (row.via_test ? "skip" : "done") : "", d === day ? "cur" : ""].join(" ");
            return (
              <div key={d} className={cls}>
                {d}
              </div>
            );
          })}
        </div>
        <div className="legend">
          <span>
            <i style={{ background: "var(--sky)" }} />
            appris
          </span>
          <span>
            <i style={{ background: "var(--sky-soft)" }} />
            validé par test
          </span>
          <span>
            <i style={{ background: "var(--line)", outline: "2px solid var(--red)" }} />
            jour actuel
          </span>
        </div>
      </section>
      <section className="panel">
        <h3>Vous avez déjà des bases ?</h3>
        <p className="muted" style={{ margin: 0 }}>
          Le test de niveau porte sur les {PLACEMENT_BLOCK} prochains jours ({PLACEMENT_BLOCK * 4} mots). Avec{" "}
          {PLACEMENT_PASS} bonnes réponses sur {PLACEMENT_QUESTIONS}, ces jours sont validés et vous passez au bloc
          suivant.
        </p>
        <div className="row">
          <button type="button" className="btn primary" onClick={startTest} disabled={day > 100}>
            Passer le test de niveau
          </button>
        </div>
      </section>
      <section className="panel">
        <h3>Recommencer</h3>
        <p className="muted" style={{ margin: 0 }}>
          Efface toute la progression : jours, révisions et bilans.
        </p>
        <div className="row">
          <button type="button" className="btn" onClick={() => setConfirmReset(true)}>
            Effacer ma progression
          </button>
          {confirmReset && (
            <button
              type="button"
              className="btn warn"
              onClick={async () => {
                await resetAll();
                setConfirmReset(false);
              }}
            >
              Oui, tout effacer
            </button>
          )}
        </div>
      </section>
    </>
  );
}
