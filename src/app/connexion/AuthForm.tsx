"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Mode = "connexion" | "inscription" | "oubli";

// Messages d'erreur Supabase Auth, par code (voir AuthError.code)
const MESSAGES: Record<string, string> = {
  invalid_credentials: "E-mail ou mot de passe incorrect.",
  email_not_confirmed: "Votre adresse n'est pas encore confirmée. Cliquez sur le lien reçu par e-mail.",
  user_already_exists: "Un compte existe déjà avec cette adresse. Connectez-vous.",
  email_exists: "Un compte existe déjà avec cette adresse. Connectez-vous.",
  over_email_send_rate_limit: "Trop d'e-mails envoyés à cette adresse. Patientez une minute avant de réessayer.",
  over_request_rate_limit: "Trop de tentatives. Patientez une minute avant de réessayer.",
  email_address_invalid: "Cette adresse e-mail n'est pas valide.",
  weak_password: "Mot de passe trop faible : 8 caractères minimum.",
  signup_disabled: "Les inscriptions sont fermées pour le moment.",
};

// Fautes de frappe fréquentes dans les adresses e-mail
const DOMAIN_TYPOS: Record<string, string> = {
  "gmailo.com": "gmail.com", "gmial.com": "gmail.com", "gmai.com": "gmail.com", "gmail.co": "gmail.com",
  "gmail.fr": "gmail.com", "gmal.com": "gmail.com", "hotmial.com": "hotmail.com", "hotmail.co": "hotmail.com",
  "outlok.com": "outlook.com", "yahooo.fr": "yahoo.fr",
};
function suggestEmail(email: string) {
  const [user, domain] = email.trim().toLowerCase().split("@");
  const fix = domain && DOMAIN_TYPOS[domain];
  return fix ? `${user}@${fix}` : null;
}
// Les boutons n'apparaissent qu'une fois le fournisseur configuré dans Supabase.
const PROVIDERS = [
  ["google", "Google", process.env.NEXT_PUBLIC_AUTH_GOOGLE === "on"],
  ["apple", "Apple", process.env.NEXT_PUBLIC_AUTH_APPLE === "on"],
] as const;
const fr = (e: { code?: string; message: string }) =>
  (e.code && MESSAGES[e.code]) || "Une erreur est survenue. Réessayez dans un instant.";

export function AuthForm() {
  const params = useSearchParams();
  const next = params.get("suite")?.startsWith("/app") ? params.get("suite")! : "/app";
  const [mode, setMode] = useState<Mode>(params.get("mode") === "inscription" ? "inscription" : "connexion");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(params.get("erreur") ? "La connexion a échoué. Réessayez." : null);
  const [info, setInfo] = useState<string | null>(null);
  const [unconfirmed, setUnconfirmed] = useState(false);
  const suggestion = suggestEmail(email);
  const callback = (suite: string) => `${window.location.origin}/auth/callback?suite=${encodeURIComponent(suite)}`;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setInfo(null);
    setUnconfirmed(false);
    if (mode === "connexion") {
      const { error } = await createClient().auth.signInWithPassword({ email, password });
      if (error) {
        setError(fr(error));
        setUnconfirmed(error.code === "email_not_confirmed");
      }
      else window.location.assign(next);
    } else if (mode === "inscription") {
      const { data, error } = await createClient().auth.signUp({
        email,
        password,
        options: { emailRedirectTo: callback(next) },
      });
      if (error) setError(fr(error));
      else if (data.session) window.location.assign(next);
      else {
        setInfo("Compte créé ! Cliquez sur le lien envoyé à " + email + " pour l'activer. Pensez à regarder dans les spams.");
        setMode("connexion");
        setUnconfirmed(true);
      }
    } else {
      const { error } = await createClient().auth.resetPasswordForEmail(email, { redirectTo: callback("/app/compte") });
      if (error) setError(fr(error));
      else setInfo("Si un compte existe pour " + email + ", un lien pour changer le mot de passe vient d'être envoyé.");
    }
    setBusy(false);
  }

  async function resend() {
    setError(null);
    const { error } = await createClient().auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: callback(next) },
    });
    if (error) setError(fr(error));
    else setInfo("Nouveau lien envoyé à " + email + ".");
  }

  async function oauth(provider: "google" | "apple") {
    setError(null);
    const { error } = await createClient().auth.signInWithOAuth({ provider, options: { redirectTo: callback(next) } });
    if (error) setError(fr(error));
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
          {suggestion && (
            <button type="button" className="linkish" onClick={() => setEmail(suggestion)}>
              Vouliez-vous dire {suggestion} ?
            </button>
          )}
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
        {unconfirmed && email && (
          <button type="button" className="linkish" onClick={resend}>
            Je n&apos;ai rien reçu : renvoyer le lien de confirmation
          </button>
        )}
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
