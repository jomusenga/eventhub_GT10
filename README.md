# EventHub

> **Dakar Institute of Technology (DIT) — Examen DevOps Master 1 Intelligence Artificielle**

Plateforme web de gestion des événements académiques et culturels du DIT. Architecture microservices (Node.js / PostgreSQL) + interface React.

---

## Architecture

```
┌─────────────┐     ┌──────────────────────┐     ┌──────────────┐
│  Frontend   │────►│  events-service      │────►│  events_db   │
│  React/Vite │     │  :3001               │     │  PostgreSQL  │
│  :80 / :5173│────►│  participants-service│────►│  participants│
│             │     │  :3002               │     │  _db         │
│             │────►│  registrations-service────►│  registrations│
└─────────────┘     │  :3003               │     │  _db         │
                    └──────────────────────┘     └──────────────┘
```

| Composant | Rôle | Port |
|---|---|---|
| `frontend` | Interface React (étudiant / admin) | 80 (Docker) / 5173 (dev) |
| `events-service` | CRUD événements, capacité, disponibilité | 3001 |
| `participants-service` | Profils participants (email unique, recherche) | 3002 |
| `registrations-service` | Inscriptions + contrôles inter-services + stats | 3003 |

`registrations-service` appelle les deux autres services pour vérifier l’existence du participant, la capacité de l’événement, et refuse l’inscription si l’événement est complet.

---

## Prérequis

- Docker & Docker Compose **ou**
- Node.js 20+, npm, et 3 instances PostgreSQL (si lancement manuel)

---

## Démarrage rapide (Docker — recommandé)

```bash
# À la racine du projet
cp .env.example .env
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost |
| events-service + Swagger | http://localhost:3001 · http://localhost:3001/api-docs |
| participants-service + Swagger | http://localhost:3002 · http://localhost:3002/api-docs |
| registrations-service + Swagger | http://localhost:3003 · http://localhost:3003/api-docs |

Arrêt : `docker compose down`  
Arrêt + suppression des volumes DB : `docker compose down -v`

---

## Développement local

### Backend

Chaque service a besoin d’une base PostgreSQL et d’un fichier `.env` (voir les variables dans `.env.example` à la racine).

```bash
cd backend/events-service && npm install && npm start
cd backend/participants-service && npm install && npm start
cd backend/registrations-service && npm install && npm start
```

### Frontend

```bash
cd frontend
cp .env.example .env   # URLs des 3 APIs
npm install
npm run dev            # http://localhost:5173
```

---

## Frontend — parcours utilisateur

Rôle stocké en `localStorage` (`etudiant` par défaut, bascule possible vers `admin`).

| Route | Accès | Description |
|---|---|---|
| `/` | Public | Liste des événements |
| `/events/:id` | Public | Détail + places restantes |
| `/events/:id/inscription` | Étudiant | S’inscrire |
| `/mes-inscriptions` | Étudiant | Voir / annuler ses inscriptions |
| `/dashboard` | Admin | Tableau de bord |
| `/admin/events` | Admin | Gestion des événements |
| `/events/new`, `/events/:id/edit` | Admin | Créer / modifier un événement |
| `/events/:id/inscrits` | Admin | Inscrits d’un événement |
| `/participants`, `/participants/new`, `/participants/:id/edit` | Admin | Gestion des participants |

---

## API REST

### Événements — `http://localhost:3001/api/events`

| Méthode | Chemin | Description |
|---|---|---|
| `GET` | `/` | Lister (`?date=YYYY-MM-DD`, `?location=...`) |
| `POST` | `/` | Créer |
| `GET` | `/:id` | Détail |
| `PUT` | `/:id` | Modifier |
| `DELETE` | `/:id` | Supprimer |
| `GET` | `/:id/availability` | Capacité / places restantes |

### Participants — `http://localhost:3002/api/participants`

| Méthode | Chemin | Description |
|---|---|---|
| `GET` | `/` | Lister / rechercher (`?search=...`) |
| `POST` | `/` | Créer (`type` : `étudiant`, `professeur`, `externe`) |
| `GET` | `/:id` | Détail |
| `PUT` | `/:id` | Modifier |
| `DELETE` | `/:id` | Supprimer |

### Inscriptions — `http://localhost:3003/api/registrations`

| Méthode | Chemin | Description |
|---|---|---|
| `POST` | `/` | Inscrire un participant |
| `DELETE` | `/:id` | Annuler |
| `GET` | `/event/:eventId` | Inscriptions d’un événement |
| `GET` | `/participant/:participantId` | Inscriptions d’un participant |
| `GET` | `/event/:eventId/count` | Nombre d’inscrits |
| `GET` | `/stats` | Statistiques globales |

---

## Tests

```bash
cd backend/events-service && npm test
cd backend/participants-service && npm test
cd backend/registrations-service && npm test
```

---

## CI/CD (GitHub Actions)

Pipeline défini dans [`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml).

**Déclencheurs** : push et pull request sur `main` et `develop`.

| Étape | Job | Quand |
|---|---|---|
| **CI — Tests** | `test-backend` (matrice des 3 microservices) | Toujours |
| **CI — Frontend** | `build-frontend` (`npm run build`) | Toujours |
| **CI — Docker** | `docker-build` (4 images, sans push) | Après tests + build OK |
| **CD — Registry** | `docker-push` vers **GHCR** | Push sur `main` / `develop` |
| **CD — Deploy staging** | `deploy` : pull + compose + healthcheck | Push sur `main` |
| **CD — Deploy prod** | **Railway** (auto depuis GitHub) | Push sur `main` |

### Déploiement automatisé (sans VPS)

Deux niveaux de CD :

1. **Staging CI** (GitHub Actions) : pull images GHCR + `compose up` + healthcheck sur le runner  
2. **Production Railway** : déploiement public permanent (voir ci-dessous)

Images publiées :

```
ghcr.io/<owner>/eventhub-events-service:latest
ghcr.io/<owner>/eventhub-participants-service:latest
ghcr.io/<owner>/eventhub-registrations-service:latest
ghcr.io/<owner>/eventhub-frontend:latest
```

> Astuce : rendez les packages GHCR **Public** (Settings du package) pour faciliter les pulls.

Script manuel (si un jour vous avez un VPS) : [`scripts/deploy.sh`](scripts/deploy.sh) + `docker-compose.prod.yml`.

---

## Déploiement Railway (recommandé)

Railway ne lit pas `docker-compose.yml` tel quel : **1 service Railway = 1 microservice** (ou 1 Postgres).

### 1. Créer le projet

1. Compte sur [railway.app](https://railway.app) (GitHub login)
2. **New Project** → **Deploy from GitHub repo** → `eventhub_GT10`
3. Ne déploie pas tout le repo d’un coup : tu vas ajouter les services un par un

### 2. Ajouter 3 bases PostgreSQL

**+ New** → **Database** → **PostgreSQL** (×3), renomme-les :
- `db-events`
- `db-participants`
- `db-registrations`

### 3. Ajouter les 4 apps (même repo GitHub)

Pour chaque service : **+ New** → **GitHub Repo** → même repo, puis dans **Settings** :

| Service Railway | Root Directory |
|---|---|
| `events-service` | `/backend/events-service` |
| `participants-service` | `/backend/participants-service` |
| `registrations-service` | `/backend/registrations-service` |
| `frontend` | `/frontend` |

Chaque dossier a déjà un `railway.json` (builder Dockerfile).

### 4. Variables d’environnement

**events-service**
```
DATABASE_URL=${{db-events.DATABASE_URL}}
NODE_ENV=production
```

**participants-service**
```
DATABASE_URL=${{db-participants.DATABASE_URL}}
NODE_ENV=production
```

**registrations-service**
```
DATABASE_URL=${{db-registrations.DATABASE_URL}}
NODE_ENV=production
EVENTS_SERVICE_URL=https://${{events-service.RAILWAY_PUBLIC_DOMAIN}}
PARTICIPANTS_SERVICE_URL=https://${{participants-service.RAILWAY_PUBLIC_DOMAIN}}
```

**frontend** (variables de **build**)
```
VITE_EVENTS_API_URL=https://${{events-service.RAILWAY_PUBLIC_DOMAIN}}
VITE_PARTICIPANTS_API_URL=https://${{participants-service.RAILWAY_PUBLIC_DOMAIN}}
VITE_REGISTRATIONS_API_URL=https://${{registrations-service.RAILWAY_PUBLIC_DOMAIN}}
```

### 5. Domaines publics

Sur chaque service API + frontend → **Settings → Networking → Generate Domain**.

Le frontend aura une URL du type `https://frontend-xxxx.up.railway.app`.

### 6. CI/CD Railway

Une fois le repo GitHub relié : **chaque push sur `main` redéploie automatiquement** les services Railway.

En parallèle, GitHub Actions continue de faire tests + images GHCR + staging.

---

## Structure du dépôt

```
EventHub/
├── .github/workflows/ci-cd.yml
├── scripts/deploy.sh
├── backend/
│   ├── events-service/          (+ railway.json)
│   ├── participants-service/    (+ railway.json)
│   └── registrations-service/   (+ railway.json)
├── frontend/                    (+ railway.json)
├── docs/
├── docker-compose.yml
├── docker-compose.prod.yml
├── .env.example
└── README.md
```

---

## Stack

- **Backend** : Node.js 20, Express, PostgreSQL 16, Swagger UI
- **Frontend** : React 18, Vite, React Router
- **Infra** : Docker multi-stage (`node:20-alpine`), Docker Compose, nginx
- **CI/CD** : GitHub Actions (tests, GHCR, staging) + Railway (prod publique)
