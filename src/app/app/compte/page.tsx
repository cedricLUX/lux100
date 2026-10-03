"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useProgress } from "@/lib/progress";

export default function Account() {
  const { profile, setReminder } = useProgress();
  const [password, setPassword] = useState("");
  const [pwState, setPwState] = useState<"idle" | "ok" | "error">("idle");
  if (!profile) return null;

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await createClient().auth.updateUser({ password });
    setPwState(error ? "error" : "ok");
    if (!error) setPassword("");
  }

  async function signOut() {
    await createClient().auth.signOut();
    // Rechargement complet volontaire : vide l'état de progression en mémoire.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign("/");
  }

  return (
    <>
      <section>
        <div className="eyebrow">Compte</div>
        <h2>{profile.email}</h2>
      </section>
      <section className="panel">
        <h3>Rappel quotidien</h3>
        <label className="toggle" htmlFor="reminder">
          <input
            id="reminder"
            type="checkbox"
            checked={profile.reminder_email}
            onChange={(e) => setReminder(e.target.checked)}
          />
          <span>
            M&apos;envoyer un e-mail en fin de journée si je n&apos;ai pas encore appris mes 4 mots.
            <br />
            <span className="muted">Vers 18 h, heure de Luxembourg. Un seul e-mail par jour au maximum.</span>
          </span>
        </label>
      </section>
      <form className="panel" onSubmit={changePassword}>
        <h3>Changer de mot de passe</h3>
        <div className="field">
          <label htmlFor="newpw">Nouveau mot de passe</label>
          <input
            id="newpw"
            type="password"
            minLength={8}
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {pwState === "ok" && <p className="notice good">Mot de passe modifié.</p>}
        {pwState === "error" && <p className="error">Le changement a échoué. Réessayez.</p>}
        <div className="row">
          <button className="btn primary">Enregistrer</button>
        </div>
      </form>
      <section className="panel">
        <div className="row">
          <button type="button" className="btn" onClick={signOut}>
            Se déconnecter
          </button>
        </div>
      </section>
    </>
  );
}
