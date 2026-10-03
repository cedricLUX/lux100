"use client";

import { useState } from "react";
import type { QuizItem } from "@/lib/learning";
import { ListenButton } from "./ListenButton";
import { Lux } from "./WordCard";

/** Questions à choix multiples ; appelle onDone(score) à la fin. */
export function Quiz({ title, items, onDone }: { title: string; items: QuizItem[]; onDone: (score: number) => void }) {
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const q = items[i];

  function choose(k: number) {
    if (pick !== null) return;
    setPick(k);
    if (q.options[k].n === q.word.n) setScore((s) => s + 1);
  }
  function next() {
    if (i + 1 < items.length) {
      setI(i + 1);
      setPick(null);
    } else onDone(score);
  }

  return (
    <>
      <div className="eyebrow">
        {title} · question {i + 1} / {items.length}
      </div>
      <div className="progressline">
        <i style={{ width: `${(i / items.length) * 100}%` }} />
      </div>
      <section className="panel flash">
        <div className="lb">
          <Lux word={q.word} />
        </div>
        <div className="row center">
          <ListenButton word={q.word} />
        </div>
      </section>
      <div className="choices">
        {q.options.map((o, k) => {
          const cls = pick === null ? "" : o.n === q.word.n ? "ok" : k === pick ? "ko" : "";
          return (
            <button key={o.n} type="button" className={`choice ${cls}`} onClick={() => choose(k)}>
              {o.fr}
            </button>
          );
        })}
      </div>
      {pick !== null && (
        <div className="row end">
          <button type="button" className="btn primary" onClick={next}>
            {i + 1 < items.length ? "Suivant" : "Voir le résultat"}
          </button>
        </div>
      )}
    </>
  );
}
