"use client";

import { GENDER_LABEL, lodPage, type Word } from "@/lib/words";
import { ListenButton } from "./ListenButton";
import { ReportError } from "./ReportError";
import { playSentence } from "./audio";

export function Lux({ word }: { word: Word }) {
  return (
    <>
      {word.article && <small className="article">{word.article}</small>}
      {word.word}
    </>
  );
}

export function WordCard({ word }: { word: Word }) {
  return (
    <article className="word">
      <div className="head">
        <div className="pic" aria-hidden="true">
          {word.emoji || "🔤"}
        </div>
        <div className="min0">
          <div className="lb">
            <Lux word={word} />
          </div>
          <div className="fr">{word.fr}</div>
        </div>
      </div>
      <div className="meta">
        {word.category}
        {word.gender && ` · ${GENDER_LABEL[word.gender]}`} · mot {word.n}/400
      </div>
      <div className="row">
        <ListenButton word={word} />
        <button type="button" className="btn small" disabled title="Prévu en phase 2">
          🎙 Répéter et noter (bientôt)
        </button>
        {word.lodId && (
          <a className="lod" href={lodPage(word.lodId)} target="_blank" rel="noopener noreferrer">
            Voir sur lod.lu ↗
          </a>
        )}
      </div>
      <div className="ex">
        {word.example}{" "}
        <button type="button" className="btn small" onClick={() => playSentence(word)} aria-label="Écouter la phrase">
          ▶
        </button>
        <i>{word.exampleFr}</i>
      </div>
      <ReportError word={word} />
    </article>
  );
}
