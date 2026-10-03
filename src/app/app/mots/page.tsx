"use client";

import { useState } from "react";
import { WORDS, withArticle } from "@/lib/words";
import { ListenButton } from "@/components/ListenButton";

export default function WordList() {
  const [q, setQ] = useState("");
  const s = q.trim().toLowerCase();
  const rows = WORDS.filter((w) => !s || w.word.toLowerCase().includes(s) || w.fr.toLowerCase().includes(s));
  return (
    <>
      <section>
        <div className="eyebrow">Référence</div>
        <h2>Les 400 mots</h2>
      </section>
      <input
        id="q"
        type="search"
        placeholder="Chercher un mot en luxembourgeois ou en français"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label="Chercher un mot"
      />
      <div className="tablewrap">
        <table>
          <thead>
            <tr>
              <th>Jour</th>
              <th>Mot</th>
              <th>Français</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((w) => (
              <tr key={w.n}>
                <td className="n">{w.day}</td>
                <td>
                  <b>{withArticle(w)}</b>
                </td>
                <td>{w.fr}</td>
                <td>
                  <ListenButton word={w} label="" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
