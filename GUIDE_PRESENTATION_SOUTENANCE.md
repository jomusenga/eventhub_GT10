# 🎓 Guide de Présentation & Soutenance Examen DevOps DIT - EventHub

> **Auteur / Intervenante** : Houleymatou Diallo & Équipe DevOps DIT  
> **Plateforme** : EventHub - Plateforme Microservices de Gestion d'Événements  
> **Technologies** : Node.js 25, PostgreSQL, React, Docker (Alpine 25), GitHub Actions  

---

## 📌 1. Pitch d'Introduction (30 secondes)

> *"Bonjour à toutes et à tous, membres du jury.  
> Actuellement, l'organisation des événements au Dakar Institute of Technology (conférences, ateliers, séminaires) est fragmentée entre plusieurs outils (Google Forms, Excel, emails), ce qui rend difficile le suivi des inscriptions en temps réel.  
> 
> Pour résoudre ce problème, nous avons conçu **EventHub** : une solution web moderne basée sur une **architecture microservices découplée**, conteneurisée avec Docker et intégrée via un pipeline CI/CD GitHub Actions."*

---

## 🏛️ 2. L'Architecture Technique en un Coup d'Œil

Expliquez au jury l'indépendance des microservices et la répartition des bases de données :

```
[ Frontend React (Port 3000) ]
        │
        ├──► events-service (Port 3001) ──► PostgreSQL (events_db)
        ├──► participants-service (Port 3002) ──► PostgreSQL (participants_db)
        └──► registrations-service (Port 3003) ──► PostgreSQL (registrations_db)
                   │
                   ├──(Vérifie l'existence)──► participants-service
                   └──(Vérifie la capacité)──► events-service
```

---

## 🎬 3. Déroulement Pas-à-Pas de la Démonstration (Script 5-7 mins)

### 🔹 Étape 1 : Présentation de l'Interface Frontend EventHub
- **Action** : Ouvrez votre navigateur sur `http://localhost:3000` (ou en local).
- **Discours** : *"L'interface utilisateur a été conçue pour être ergonomique, avec une typographie grande et lisible et des icônes explicites. Le **Tableau de Bord** affiche en temps réel le nombre d'événements, le total des participants et le taux de remplissage global."*

### 🔹 Étape 2 : Démonstration du Service Participants (`participants-service`)
- **Action** : Cliquez sur l'onglet **Participants**.
- **Discours** : *"En tant que membre de l'équipe backend responsable des participants et des inscriptions, j'ai implémenté ce service. On peut y ajouter des étudiants, des professeurs ou des intervenants externes avec contrôle de l'unicité de l'email."*
- **Action Démo** : Créez un nouveau participant `houleymatou.diallo@dit.sn` de type `étudiant`.

### 🔹 Étape 3 : Démonstration de la Logique Métier d'Inscription (`registrations-service`)
- **Action** : Cliquez sur l'onglet **Inscriptions**, puis sur **Nouvelle Inscription**.
- **Discours** : *"C'est le cœur de notre logique microservices. Lorsqu'on inscrit un participant à un événement, `registrations-service` effectue deux requêtes HTTP inter-services :*
  1. *Il interroge `participants-service` pour valider l'existence du participant.*
  2. *Il interroge `events-service` pour vérifier que la capacité maximale n'est pas dépassée.*
  3. *Si l'événement est complet, l'inscription est automatiquement rejetée."*

### 🔹 Étape 4 : Démonstration des Swagger UI Interactifs
- **Action** : Ouvrez dans des onglets séparés :
  - `http://localhost:3002/api-docs` (participants-service)
  - `http://localhost:3003/api-docs` (registrations-service)
  - `http://localhost:3001/api-docs` (events-service)
- **Discours** : *"Chaque microservice embarque sa propre documentation OpenAPI / Swagger UI interactive. Nous avons également généré le fichier unifié `docs/swagger.json` importable dans Postman."*

### 🔹 Étape 5 : Démonstration DevOps (Docker & CI/CD)
- **Action** : Montrez le fichier `docker-compose.yml` et le workflow GitHub Actions `.github/workflows/backend-ci.yml`.
- **Discours** : *"Chaque service backend possède son `Dockerfile` multi-stage basé sur **Node.js 25 Alpine**. Le pipeline GitHub Actions exécute automatiquement les tests unitaires et le build des conteneurs à chaque push sur les branches `develop` et `main`."*

---

## 🔍 4. Anticipation des Questions du Jury & Réponses Idéales

| Question probable du Jury | Réponse idéale à donner |
| :--- | :--- |
| **Pourquoi avoir utilisé 3 bases de données séparées ?** | *"Pour respecter le principe de découplage strict des microservices (Database per Service pattern). Cela permet à chaque service d'évoluer, de scaler ou de migrer sa base sans impacter les autres."* |
| **Comment gérez-vous la panne d'un microservice ?** | *"Dans `registrations-service`, les requêtes inter-services vers `events-service` et `participants-service` sont isolées dans des clients HTTP avec gestion des erreurs (`try/catch`). Si un service est hors-ligne, une erreur claire 503 ou 404 est retournée sans faire crasher le service d'inscription."* |
| **Pourquoi être passé sur Node.js 25 ?** | *"Pour bénéficier des dernières optimisations de performance de la V8, de la gestion native de l'API `fetch` et de la version Alpine la plus récente (`node:25-alpine`)."* |

---

## ✅ 5. Check-list Technique de Vérification (Avant de démarrer devant le jury)

1. **Vérifier les tests unitaires backend** :
   ```bash
   cd /Users/mac/develop/WORKSPACE/IA_MASTER/PROJETS/eventhub
   (cd backend/events-service && npm test)
   (cd backend/participants-service && npm test)
   (cd backend/registrations-service && npm test)
   ```
2. **Tester le build Frontend React** :
   ```bash
   cd /Users/mac/develop/WORKSPACE/IA_MASTER/PROJETS/eventhub/frontend
   npm run build
   ```
3. **Lancer la plateforme complète avec Docker Compose** :
   ```bash
   cd /Users/mac/develop/WORKSPACE/IA_MASTER/PROJETS/eventhub
   docker compose up --build
   ```
