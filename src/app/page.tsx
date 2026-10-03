import Link from "next/link";
import { WORDS } from "@/lib/words";

export default function Home() {
  const sample = WORDS.slice(0, 4);
  return (
    <div className="wrap">
      <header className="brand" style={{ paddingTop: 16 }}>
        <strong>Lëtzebuergesch en 100 jours</strong>
        <nav className="topnav">
          <Link href="/connexion">Se connecter</Link>
        </nav>
      </header>
      <section className="hero">
        <div className="eyebrow">Dag 1 : {sample.map((w) => w.word).join(", ")}</div>
        <h1>
          Le luxembourgeois, <span>4 mots par jour</span>.
        </h1>
        <p>
          En 100 jours, apprenez les 400 mots qui reviennent le plus souvent au quotidien. Lisez-les, écoutez-les
          prononcés par des Luxembourgeois, et révisez-les au bon moment pour ne plus les oublier.
        </p>
        <div className="row">
          <Link className="btn primary" href="/connexion?mode=inscription">
            Commencer gratuitement
          </Link>
          <Link className="btn" href="/connexion">
            J&apos;ai déjà un compte
          </Link>
        </div>
      </section>
      <section className="features" aria-label="Ce que propose l'application">
        <div>
          <b>Écouter chaque mot</b>Enregistrements natifs du Lëtzebuerger Online Dictionnaire.
        </div>
        <div>
          <b>Révision espacée</b>Chaque mot revient après 1, 3, 7, 14, 30 puis 60 jours.
        </div>
        <div>
          <b>Jeu des cartes</b>Retrouvez l&apos;image qui correspond au mot entendu.
        </div>
        <div>
          <b>Bilan chaque semaine</b>10 questions et un badge à la clé.
        </div>
        <div>
          <b>Tous niveaux</b>Un test de niveau permet de sauter ce que vous savez déjà.
        </div>
        <div>
          <b>Culture</b>Une note sur le Luxembourg chaque semaine.
        </div>
      </section>
      <footer>
        Audio : <a href="https://lod.lu">Lëtzebuerger Online Dictionnaire</a> (CC0). Exemples en partie issus de{" "}
        <a href="https://github.com/alexff91/luxflash">LuxFlash</a> (MIT).
      </footer>
    </div>
  );
}
