"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Mode = "connexion" | "inscription" | "oubli";

const MESSAGES: Record<string, string> = {
  "Invalid login credentials": "E-mail ou mot de passe incorrect.",
  "Email not confirmed": "Confirmez d'abord votre adresse avec le lien reçu par e-mail.",
  "User already registered": "Un compte existe déjà avec cette adresse. Connectez-vous.",
};
// Les boutons n'apparaissent qu'une fois le fournisseur configuré dans Supabase.
const PROVIDERS = [
  ["google", "Google", process.env.NEXT_PUBLIC_AUTH_GOOGLE === "on"],
  ["apple", "Apple", process.env.NEXT_PUBLIC_AUTH_APPLE === "on"],
] as const;
const fr = (m: string) => MESSAGES[m] ?? "Une erreur est survenue. Réessayez dans un instant.";

export function AuthForm() {
  const params = useSearchParams();
  const next = params.get("suite")?.startsWith("/app") ? params.get("suite")! : "/app";
  const [mode, setMode] = useState<Mode>(params.get("mode") === "inscription" ? "inscription" : "connexion");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(params.get("erreur") ? "La connexion a échoué. Réessayez." : null);
  const [info, setInfo] = useState<string | null>(null);
  const callback = (suite: string) => `${window.location.origin}/auth/callback?suite=${encodeURIComponent(suite)}`;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setInfo(null);
    if (mode === "connexion") {
      const { error } = await createClient().auth.signInWithPassword({ email, password });
      if (error) setError(fr(error.message));
      else window.location.assign(next);
    } else if (mode === "inscription") {
      const { data, error } = await createClient().auth.signUp({
        email,
        password,
        options: { emailRedirectTo: callback(next) },
      });
      if (error) setError(fr(error.message));
      else if (data.session) window.location.assign(next);
      else setInfo("Compte créé ! Cliquez sur le lien envoyé à " + email + " pour l'activer.");
    } else {
      const { error } = await createClient().auth.resetPasswordForEmail(email, { redirectTo: callback("/app/compte") });
      if (error) setError(fr(error.message));
      else setInfo("Si un compte existe pour " + email + ", un lien pour changer le mot de passe vient d'être envoyé.");
    }
    setBusy(false);
  }

  async function oauth(provider: "google" | "apple") {
    setError(null);
    const { error } = await createClient().auth.signInWithOAuth({ provider, options: { redirectTo: callback(next) } });
    if (error) setError(fr(error.message));
  }

  const title = { connexion: "Se connecter", inscription: "Créer un compte", oubli: "Mot de passe oublié" }[mode];

  return (
    <div className="authbox">
      <Link href="/" className="eyebrow">
        ← Lëtzebuergesch en 100 jours
      </Link>
      <h2>{title}</h2>
      {mode !== "oubli" && PROVIDERS.some(([, , on]) => on) && (
        <>
          <div className="oauth">
            {PROVIDERS.filter(([, , on]) => on).map(([id, label]) => (
              <button key={id} type="button" className="btn" onClick={() => oauth(id)}>
                Continuer avec {label}
              </button>
            ))}
          </div>
          <div className="sep">ou avec votre e-mail</div>
        </>
      )}
      <form onSubmit={submit} className="panel">
        <div className="field">
          <label htmlFor="email">E-mail</label>
          <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        {mode !== "oubli" && (
          <div className="field">
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              autoComplete={mode === "inscription" ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {mode === "inscription" && <span className="muted">8 caractères minimum.</span>}
          </div>
        )}
        {error && <p className="error">{error}</p>}
        {info && <p className="notice good">{info}</p>}
        <button className="btn primary" disabled={busy}>
          {busy ? "Un instant…" : title}
        </button>
      </form>
      <div className="row between">
        {mode === "connexion" ? (
          <>
            <button type="button" className="linkish" onClick={() => setMode("inscription")}>
              Pas encore de compte ? S&apos;inscrire
            </button>
            <button type="button" className="linkish" onClick={() => setMode("oubli")}>
              Mot de passe oublié ?
            </button>
          </>
        ) : (
          <button type="button" className="linkish" onClick={() => setMode("connexion")}>
            J&apos;ai déjà un compte
          </button>
        )}
      </div>
    </div>
  );
}
