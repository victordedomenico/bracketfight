# BracketFight

Plateforme de tournois musicaux (brackets à élimination directe), clone open-source inspiré de Spotifights. Stack Next.js 15 + Supabase + Deezer.

## Démarrage local (Docker)

Tout tourne en local via la CLI Supabase, qui orchestre elle-même les conteneurs Docker (Postgres, GoTrue pour l'auth, PostgREST, Studio). **Aucun compte Supabase.com requis.**

### Pré-requis

- Node 20+ et npm
- Docker Desktop démarré (ou Colima/Orbstack en alternative)

### 1. Installer les dépendances

```bash
npm install
```

### 2. Démarrer la stack Supabase en local

```bash
npm run db:start
```

La première exécution télécharge les images Docker (~1 Go, quelques minutes). Ensuite c'est quasi-instantané. À la fin, la CLI affiche :

```
API URL: http://127.0.0.1:54321
DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
Studio URL: http://127.0.0.1:54323
anon key: eyJhbGciOi…
service_role key: eyJhbGciOi…
```

### 3. Configurer l'environnement Next.js

```bash
cp .env.local.example .env.local
```

Puis colle la valeur de `anon key` dans `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Le `URL` est déjà bon par défaut.

Tu peux réafficher ces valeurs à tout moment avec :

```bash
npm run db:status
```

### 4. Lancer Next.js

```bash
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000). Les tables sont déjà créées (la migration `supabase/migrations/20250101000000_init.sql` est appliquée automatiquement au `db:start`).

Studio Supabase : [http://127.0.0.1:54323](http://127.0.0.1:54323) pour inspecter les tables, gérer les utilisateurs, etc.

## Commandes Docker / base

| Commande | Effet |
|---|---|
| `npm run db:start` | Lance les conteneurs Supabase (Docker) et applique les migrations |
| `npm run db:stop` | Arrête les conteneurs |
| `npm run db:status` | Affiche URL, clés, ports |
| `npm run db:reset` | **Détruit** la base locale et rejoue toutes les migrations (+ seed.sql) |
| `npm run db:migrate nom_migration` | Crée un nouveau fichier de migration vide dans `supabase/migrations/` |

## Mise en production

Le même dossier `supabase/` est le point de départ pour la prod :

- **Option A — Supabase Cloud** : `npx supabase link --project-ref …` puis `npx supabase db push` pour pousser tes migrations.
- **Option B — self-hosted Docker** : clone [supabase/supabase](https://github.com/supabase/supabase/tree/master/docker), copie ton `migrations/` dedans, puis `docker compose up -d`.

Dans les deux cas le code applicatif est inchangé — seules les variables `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` pointent vers l'instance de prod.

## Scripts

- `npm run dev` — serveur de développement
- `npm run build` — build de production
- `npm run start` — serveur de production
- `npm run lint` — ESLint
- `npm test` — tests unitaires Vitest (`lib/bracket.ts`)

## Architecture

```
app/
  page.tsx                          accueil
  guide/                            guide pédagogique
  login/, signup/, (auth)/actions   auth via Supabase + server actions
  explore/                          catalogue public (brackets visibility='public')
  create-bracket/                   création (protégée)
  my-brackets/                      bibliothèque (protégée)
  bracket-game/[id]/                page de jeu (duels, vote, champion)
  api/deezer/search/                proxy Deezer (contourne le CORS)
components/
  Header, Footer, BracketCard       navigation / affichage
  TrackPicker                       recherche Deezer + sélection
  MatchCard, BracketGame            duels et orchestration des rounds
lib/
  supabase/{client,server,middleware}.ts
  deezer.ts                         typage + fetch serveur
  bracket.ts                        logique pure (seeds, rounds) + tests
supabase/migrations/0001_init.sql   schéma + RLS
middleware.ts                       refresh de session Supabase
```

## API musicale

Les pistes proviennent de l'[API Deezer publique](https://developers.deezer.com/api). Aucune clé n'est requise. Les extraits 30 s (MP3) sont diffusés directement depuis `dzcdn.net`.

## Périmètre v1 (ce qui est livré)

- Authentification email + mot de passe
- Création de brackets de 4, 8, 16 ou 32 pistes
- Recherche Deezer + preview audio
- Jeu : duels round par round jusqu'au champion
- Bibliothèque personnelle avec filtre privé/public
- Explorateur public avec recherche texte
- Guide pédagogique

## Non couvert (v2+)

Tierlists, blindtests, StreamFights live, i18n FR/EN, stats globales.
