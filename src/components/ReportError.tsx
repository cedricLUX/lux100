"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Word } from "@/lib/words";

const KINDS = [
  ["orthographe", "Orthographe du mot"],
  ["traduction", "Traduction"],
  ["exemple", "Phrase d'exemple"],
  ["audio", "Prononciation / audio"],
  ["image", "Image"],
  ["autre", "Autre chose"],
] as const;

export function ReportError({ word }: { word: Word }) {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<string>("orthographe");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("error_reports")
      .insert({ word_n: word.n, kind, message: message.trim() || null, user_id: data.user?.id });
    setState(error ? "error" : "sent");
  }

  if (!open)
    return (
      <button type="button" className="linkish" onClick={() => setOpen(true)}>
        Signaler une erreur
      </button>
    );

  if (state === "sent")
    return (
      <p className="notice good" role="status">
        Merci ! Votre signalement sur « {word.word} » a été transmis.
      </p>
    );

  return (
    <form className="report" onSubmit={send}>
      <label htmlFor={`kind-${word.n}`}>Qu&apos;est-ce qui ne va pas avec « {word.word} » ?</label>
      <select id={`kind-${word.n}`} value={kind} onChange={(e) => setKind(e.target.value)}>
        {KINDS.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
      <label htmlFor={`msg-${word.n}`}>Précisez si vous le souhaitez (facultatif)</label>
      <textarea
        id={`msg-${word.n}`}
        rows={2}
        maxLength={1000}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Ex. : on écrit plutôt…"
      />
      {state === "error" && <p className="error">L&apos;envoi a échoué. Réessayez dans un instant.</p>}
      <div className="row">
        <button className="btn small primary" disabled={state === "sending"}>
          {state === "sending" ? "Envoi…" : "Envoyer"}
        </button>
        <button type="button" className="btn small" onClick={() => setOpen(false)}>
          Annuler
        </button>
      </div>
    </form>
  );
}
