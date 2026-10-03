# Lëtzebuergesch en 100 jours

Application web pour apprendre les 400 mots essentiels du luxembourgeois, 4 mots par jour pendant 100 jours.

**Stack** : Next.js 16 (React 19) · Supabase (base PostgreSQL, comptes) · Vercel (hébergement, tâche quotidienne) · Resend (e-mails).

## Fonctions

- 4 mots par jour : mot avec article et genre, traduction, audio natif du [LOD](https://lod.lu), phrase d'exemple traduite.
- On peut avancer plus vite ; un jour manqué ne fait rien accumuler (on reprend au premier jour non terminé).
- Révision espacée : 1, 3, 7, 14, 30 puis 60 jours ; un mot oublié repart au début.
- Jeu des cartes : retrouver l'image (emoji) qui correspond au mot.
- Bilan hebdomadaire (10 questions, badge à partir de 8) et test de niveau par blocs de 10 jours (7/8 pour valider).
- Note culturelle chaque semaine.
- Comptes : e-mail + mot de passe, Google, Apple.
- Rappel quotidien par e-mail vers 18 h (désactivable dans « Compte »).
- Bouton « Signaler une erreur » sur chaque mot ; les signalements arrivent dans la table `error_reports`.

## Organisation du code

| Chemin | Rôle |
|---|---|
| `data/words.json` | Les 400 mots (jour, article, genre, traduction, exemple, identifiant LOD, emoji) |
| `src/lib/learning.ts` | Règles d'apprentissage (répétition espacée, série, quiz, jeu), testées dans `learning.test.ts` |
| `src/lib/progress.tsx` | Chargement et sauvegarde de la progression dans Supabase |
| `src/app/app/*` | Écrans de l'apprenant (aujourd'hui, révision, jeu, bilan, progrès, mots, compte) |
| `src/app/api/cron/rappel` | Envoi des rappels, appelé chaque jour par Vercel Cron |
| `supabase/migrations/0001_init.sql` | Tables et règles de sécurité (chaque apprenant ne voit que ses données) |

## Mise en ligne, pas à pas

### 1. Supabase (base de données et comptes)

1. Créer un compte sur [supabase.com](https://supabase.com) puis un projet, région **Frankfurt (eu-central-1)** pour garder les données en Europe.
2. **SQL Editor** : coller et exécuter `supabase/migrations/0001_init.sql`.
3. **Authentication > URL Configuration** : Site URL = l'adresse finale (ex. `https://moien100.lu`) ; ajouter `https://moien100.lu/auth/callback` et `http://localhost:3000/auth/callback` aux Redirect URLs.
4. **Authentication > Emails > SMTP Settings** : brancher Resend (étape 2). L'envoi d'e-mails intégré à Supabase est limité à quelques messages par heure, insuffisant pour les confirmations d'inscription.
5. **Authentication > Sign In / Providers** :
   - Google : créer un identifiant OAuth dans Google Cloud Console (gratuit), coller l'ID et le secret, puis mettre `NEXT_PUBLIC_AUTH_GOOGLE=on`.
   - Apple : nécessite un compte Apple Developer (99 USD par an). Une fois configuré, mettre `NEXT_PUBLIC_AUTH_APPLE=on`. Tant que la variable vaut `off`, le bouton n'est pas affiché.
6. **Project Settings > API** : noter l'URL, la clé publishable et la clé secrète.

### 2. Resend (e-mails)

1. Créer un compte sur [resend.com](https://resend.com) et vérifier le nom de domaine (enregistrements DNS fournis par Resend).
2. Créer une clé API.
3. Offre gratuite : 3 000 e-mails par mois et 100 par jour. Avec 200 apprenants, les jours où plus de 100 personnes n'ont pas encore appris leurs mots, les rappels en trop ne partiront pas ; il faudra alors passer à l'offre payante.

### 3. Vercel (hébergement)

1. Pousser ce dossier sur un dépôt GitHub, puis l'importer sur [vercel.com](https://vercel.com).
2. Renseigner les variables de `.env.example` dans **Settings > Environment Variables**. `CRON_SECRET` : une longue chaîne aléatoire (ex. `openssl rand -hex 32`).
3. La tâche de rappel est déclarée dans `vercel.json` (tous les jours à 16 h UTC, soit 18 h l'été et 17 h l'hiver à Luxembourg).
4. **Settings > Domains** : ajouter le nom de domaine.

### 4. Développement local

```bash
cp .env.example .env.local   # puis remplir les valeurs
npm install
npm run dev                  # http://localhost:3000
npm test                     # règles d'apprentissage
npm run lint
```

## Relire les signalements d'erreur

Dans Supabase, **Table Editor > error_reports**. Après correction dans `data/words.json`, passer `status` à `corrigé`. Un back-office est prévu en phase 2.

## Licences des contenus

- Audio : Lëtzebuerger Online Dictionnaire, licence CC0, lu directement depuis `lod.lu`.
- Une partie des phrases d'exemple et les identifiants LOD viennent de [LuxFlash](https://github.com/alexff91/luxflash) (licence MIT).
- Les mots et les exemples n'ont pas encore été relus par un locuteur natif.
