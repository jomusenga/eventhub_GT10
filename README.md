<<<<<<< HEAD
# EventHub - Plateforme Microservices de Gestion d'Événements

> **Dakar Institute of Technology (DIT) — Examen DevOps Master 1 Intelligence Artificielle**

EventHub est une plateforme web moderne conçue pour centraliser et automatiser l'organisation des événements académiques et culturels du DIT. Elle repose sur une architecture microservices découpée, conteneurisée et prête pour l'intégration continue.

---

## 🏛️ Architecture du Projet

L'application est composée de trois microservices backend indépendants basés sur **Node.js 25** et **PostgreSQL**, ainsi qu'une interface web **React** :

```
[ Frontend React (Port 3000) ]
        │
        ├──► events-service        (Port 3001) ──► PostgreSQL (events_db)
        ├──► participants-service  (Port 3002) ──► PostgreSQL (participants_db)
        └──► registrations-service (Port 3003) ──► PostgreSQL (registrations_db)
```

### 1. `events-service` (Port 3001)
Gère le cycle de vie des événements académiques (création, édition, suppression, filtrage par date/lieu, consultation de la capacité maximale).

### 2. `participants-service` (Port 3002)
Gère les profils des participants (étudiants, professeurs, intervenants externes) avec contrôle d'unicité des adresses email et recherche dynamique.

### 3. `registrations-service` (Port 3003)
Assure la logique d'inscription en effectuant des contrôles inter-services en temps réel :
- Vérification de l'existence du participant auprès de `participants-service`.
- Vérification de l'existence et de la capacité disponible auprès de `events-service`.
- Invalidation automatique si l'événement est complet.
- Génération des statistiques d'inscription globales et par événement.

---

## 🚀 Démarrage Rapide

### Option A : Déploiement Complet avec Docker Compose (Recommandé)

Pour construire les images Docker et démarrer les 3 bases PostgreSQL, les 3 microservices backend et le frontend en une seule commande :

```bash
docker compose up --build
```

#### Accès aux services :
- **Frontend Web App** : [http://localhost:3000](http://localhost:3000)
- **events-service** : [http://localhost:3001](http://localhost:3001) | Swagger : [http://localhost:3001/api-docs](http://localhost:3001/api-docs)
- **participants-service** : [http://localhost:3002](http://localhost:3002) | Swagger : [http://localhost:3002/api-docs](http://localhost:3002/api-docs)
- **registrations-service** : [http://localhost:3003](http://localhost:3003) | Swagger : [http://localhost:3003/api-docs](http://localhost:3003/api-docs)

---

### Option B : Lancement Manuel en Développement Local

#### 1. Service Événements
```bash
cd backend/events-service
npm install
npm start
```

#### 2. Service Participants
```bash
cd backend/participants-service
npm install
npm start
```

#### 3. Service Inscriptions
```bash
cd backend/registrations-service
npm install
npm start
```

#### 4. Frontend React
```bash
cd frontend
npm install
npm run dev
```

---

## 📚 Endpoints API

### Service Événements (`http://localhost:3001/api/events`)
- `GET /` : Lister les événements (`?date=YYYY-MM-DD`, `?location=...`)
- `POST /` : Créer un nouvel événement
- `GET /:id` : Consulter les détails d'un événement
- `PUT /:id` : Modifier un événement
- `DELETE /:id` : Supprimer un événement
- `GET /:id/availability` : Vérifier la disponibilité et la capacité

### Service Participants (`http://localhost:3002/api/participants`)
- `GET /` : Lister / rechercher des participants (`?search=nom_ou_email`)
- `POST /` : Créer un profil participant (`type`: `étudiant`, `professeur`, `externe`)
- `GET /:id` : Consulter le profil d'un participant
- `PUT /:id` : Modifier le profil d'un participant
- `DELETE /:id` : Supprimer un participant

### Service Inscriptions (`http://localhost:3003/api/registrations`)
- `POST /` : Inscrire un participant à un événement
- `DELETE /:id` : Annuler une inscription
- `GET /event/:eventId` : Lister les inscriptions d'un événement
- `GET /participant/:participantId` : Lister les inscriptions d'un participant
- `GET /event/:eventId/count` : Obtenir le nombre d'inscrits en temps réel
- `GET /stats` : Statistiques d'inscriptions

---

## 🧪 Exécution des Tests Unitaires

Chaque microservice dispose de sa propre suite de tests unitaires :

```bash
# Service Événements
cd backend/events-service && npm test

# Service Participants
cd backend/participants-service && npm test

# Service Inscriptions
cd backend/registrations-service && npm test
```

---

## ⚙️ Intégration Continue (CI/CD)

Le projet intègre un pipeline GitHub Actions défini dans `.github/workflows/backend-ci.yml`. Il s'exécute automatiquement lors de chaque push ou Pull Request sur les branches `main` et `develop` :
1. Récupération du code source (`checkout`).
2. Configuration de l'environnement Node.js 25.
3. Installation des dépendances et exécution des tests unitaires pour chaque microservice.
4. Construction des images Docker multi-stage (`node:25-alpine`).

---

## 👥 Organisation de l'Équipe
- **Scrum Master** : Mouhamed Ndiaye
- **Frontend** : Yveline Tibera
- **Backend Lead** : Lory Doambe
- **Backend** : Houleymatou Diallo (`participants-service` & `registrations-service`)
- **DevOps** : Joseph Musenga Kabong
=======
# eventhub
Projet Examen DevOps EventHub - Master 1 IA - DIT - GT10
>>>>>>> origin/develop
