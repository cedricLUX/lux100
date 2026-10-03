"use client";

import { useMemo, useState } from "react";
import { useProgress } from "@/lib/progress";
import { gamePool, gameRound } from "@/lib/learning";
import { ListenButton } from "@/components/ListenButton";
import { Lux } from "@/components/WordCard";

const ROUNDS = 10;

export default function Game() {
  const { profile, reviews, saveGameScore } = useProgress();
  const pool = useMemo(() => gamePool(profile?.current_day ?? 1, new Set(reviews.keys())), [profile, reviews]);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [cards, setCards] = useState(() => gameRound(pool));
  const [pick, setPick] = useState<number | null>(null);

  if (round >= ROUNDS)
    return (
      <section className="panel">
        <div className="eyebrow">Jeu des cartes</div>
        <h2>
          Score : {score} / {ROUNDS}
        </h2>
        <p className="muted" style={{ margin: 0 }}>
          Meilleur score : {Math.max(score, profile?.game_best ?? 0)} / {ROUNDS}. Le jeu utilise les mots que vous avez
          déjà vus et qui ont une image.
        </p>
        <div className="row">
          <button
            type="button"
            className="btn primary"
            onClick={() => {
              setRound(0);
              setScore(0);
              setPick(null);
              setCards(gameRound(pool));
            }}
          >
            Rejouer
          </button>
        </div>
      </section>
    );

  const { target, options } = cards;
  function choose(k: number) {
    if (pick !== null) return;
    setPick(k);
    if (options[k].n === target.n) setScore((s) => s + 1);
  }
  function next() {
    const r = round + 1;
    setRound(r);
    setPick(null);
    if (r < ROUNDS) setCards(gameRound(pool));
    else saveGameScore(score);
  }

  return (
    <>
      <div className="row between">
        <div className="eyebrow">
          Jeu des cartes · manche {round + 1} / {ROUNDS}
        </div>
        <div className="eyebrow">Score {score}</div>
      </div>
      <section className="panel flash">
        <p className="muted" style={{ margin: 0 }}>
          Touchez l&apos;image qui correspond au mot
        </p>
        <div className="lb">
          <Lux word={target} />
        </div>
        <div className="row center">
          <ListenButton word={target} />
        </div>
      </section>
      <div className="cards">
        {options.map((o, k) => {
          const cls = pick === null ? "" : o.n === target.n ? "ok" : k === pick ? "ko" : "";
          return (
            <button
              key={o.n}
              type="button"
              className={`card ${cls}`}
              onClick={() => choose(k)}
              aria-label={pick === null ? `Carte ${k + 1}` : `Carte ${k + 1} : ${o.fr}`}
            >
              {o.emoji}
            </button>
          );
        })}
      </div>
      {pick !== null && (
        <div className="row between">
          <span>{options[pick].n === target.n ? "✔ Correct !" : `✘ C'était : ${target.fr}`}</span>
          <button type="button" className="btn primary" onClick={next}>
            Suivant
          </button>
        </div>
      )}
    </>
  );
}
