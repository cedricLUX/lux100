"use client";

import Link from "next/link";
import { useState } from "react";
import { useProgress } from "@/lib/progress";
import { shuffle } from "@/lib/learning";
import { wordByN } from "@/lib/words";
import { ListenButton } from "@/components/ListenButton";
import { Lux } from "@/components/WordCard";

export default function Review() {
  const { dueWords, reviews, gradeWord } = useProgress();
  // La file est figée à l'ouverture : un mot raté revient demain, pas dans la même séance.
  const [queue, setQueue] = useState(() => shuffle(dueWords));
  const [shown, setShown] = useState(false);
  const [stats, setStats] = useState({ ok: 0, total: 0 });

  if (!queue.length) {
    const next = [...reviews.values()].map((r) => r.due).sort()[0];
    return (
      <section className="panel">
        <div className="eyebrow">Révision espacée</div>
        <h2>{stats.total ? `Terminé : ${stats.ok} / ${stats.total} retenus` : "Rien à réviser pour l'instant"}</h2>
        <p className="muted" style={{ margin: 0 }}>
          Chaque mot revient après 1, 3, 7, 14, 30 puis 60 jours tant que vous vous en souvenez. Un mot oublié repart au
          début.
          {next &&
            ` Prochaine révision : ${new Date(next + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}.`}
        </p>
        <div className="row">
          <Link className="btn primary" href="/app">
            Aller aux mots du jour
          </Link>
        </div>
      </section>
    );
  }

  const w = wordByN(queue[0]);
  async function answer(remembered: boolean) {
    setStats((s) => ({ ok: s.ok + (remembered ? 1 : 0), total: s.total + 1 }));
    setShown(false);
    setQueue((q) => q.slice(1));
    await gradeWord(w.n, remembered);
  }

  return (
    <>
      <div className="eyebrow">
        Révision · {queue.length} restant{queue.length > 1 ? "s" : ""}
      </div>
      <section className="panel flash">
        <div className="pic" aria-hidden="true">
          {shown ? w.emoji : " "}
        </div>
        <div className="lb">
          <Lux word={w} />
        </div>
        <div className="row center">
          <ListenButton word={w} />
        </div>
        {shown ? (
          <>
            <div style={{ fontSize: "1.25rem" }}>{w.fr}</div>
            <div className="muted">
              {w.example}
              <br />
              {w.exampleFr}
            </div>
            <div className="row center">
              <button type="button" className="btn warn" onClick={() => answer(false)}>
                Je ne savais pas
              </button>
              <button type="button" className="btn good" onClick={() => answer(true)}>
                Je savais
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="muted" style={{ margin: 0 }}>
              Que veut dire ce mot ?
            </p>
            <div className="row center">
              <button type="button" className="btn primary" onClick={() => setShown(true)}>
                Voir la réponse
              </button>
            </div>
          </>
        )}
      </section>
    </>
  );
}
