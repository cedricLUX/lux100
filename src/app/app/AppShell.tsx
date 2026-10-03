"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useProgress } from "@/lib/progress";

const TABS = [
  ["/app", "Aujourd'hui"],
  ["/app/revision", "Révision"],
  ["/app/jeu", "Jeu des cartes"],
  ["/app/bilan", "Bilan"],
  ["/app/progres", "Progrès"],
  ["/app/mots", "Les 400 mots"],
  ["/app/compte", "Compte"],
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { ready, error, profile, days, dueWords } = useProgress();
  const day = profile?.current_day ?? 1;

  return (
    <div className="wrap">
      <header className="top">
        <div className="brand">
          <h1>
            Lëtzebuergesch <span>en 100 jours</span>
          </h1>
          {profile && (
            <div className="daycount">
              {day > 100 ? (
                <>
                  <b>100</b> / 100 jours
                </>
              ) : (
                <>
                  Dag <b>{day}</b> / 100 · série {profile.streak} j
                </>
              )}
            </div>
          )}
        </div>
        <div className="flagbar">
          <i style={{ width: `${Math.min(100, days.size)}%` }} />
        </div>
        <nav className="tabs">
          {TABS.map(([href, label]) => (
            <Link key={href} href={href} aria-current={path === href ? "page" : undefined}>
              {label}
              {href === "/app/revision" && dueWords.length > 0 && <span className="badge">{dueWords.length}</span>}
            </Link>
          ))}
        </nav>
      </header>
      <main>
        {error && <p className="notice red">{error}</p>}
        {ready ? children : !error && <p className="loading">Chargement de votre progression…</p>}
      </main>
      <footer>
        Mots et exemples en cours de relecture : utilisez « Signaler une erreur » si quelque chose vous semble faux.
        Audio : <a href="https://lod.lu">Lëtzebuerger Online Dictionnaire</a> (CC0).
      </footer>
    </div>
  );
}
