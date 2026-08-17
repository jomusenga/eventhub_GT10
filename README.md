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
| **CD — Registry** | `docker-push` vers **GitHub Container Registry** | Push sur `main` / `develop` uniquement |

Images publiées (exemple) :

```
ghcr.io/<owner>/eventhub-events-service:latest
ghcr.io/<owner>/eventhub-participants-service:latest
ghcr.io/<owner>/eventhub-registrations-service:latest
ghcr.io/<owner>/eventhub-frontend:latest
```

Tags aussi générés : nom de branche (`main`, `develop`) et SHA du commit. Le tag `latest` n’est poussé que depuis `main`.

> Les packages GHCR doivent être **publics** ou le compte Docker doit être authentifié pour les tirer. Le token `GITHUB_TOKEN` suffit pour le push depuis Actions.

---

## Structure du dépôt

```
EventHub/
├── .github/workflows/ci-cd.yml
├── backend/
│   ├── events-service/
│   ├── participants-service/
│   └── registrations-service/
├── frontend/                 # React + Vite + nginx (prod)
├── docs/
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Stack

- **Backend** : Node.js 20, Express, PostgreSQL 16, Swagger UI
- **Frontend** : React 18, Vite, React Router
- **Infra** : Docker multi-stage (`node:20-alpine`), Docker Compose, nginx
- **CI/CD** : GitHub Actions → tests, build Docker, push GHCR
