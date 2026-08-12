# 🎓 Guide de Présentation & Soutenance Backend EventHub

> **Auteur / Intervenante** : Houleymatou Diallo & Équipe Backend DIT  
> **Plateforme** : EventHub - Architecture Microservices API  
> **Technologies** : Node.js 25, PostgreSQL, Docker (Alpine 25), Swagger / OpenAPI, GitHub Actions  

---

## 📌 1. Pitch d'Introduction (30 secondes)

> *"Bonjour à toutes et à tous, membres du jury.  
> Dans le cadre du projet EventHub, la gestion des événements du Dakar Institute of Technology a été pensée sous forme d'une **architecture microservices backend indépendante**, conteneurisée et hautement disponible.  
> 
> En tant que développeuse backend, je suis principalement responsable de la conception et de la réalisation de 2 microservices clés : le **Service Participants** (`participants-service`) et le **Service Inscriptions** (`registrations-service`)."*

---

## 🏛️ 2. L'Architecture Backend Microservices

```
events-service (Port 3001) ──► PostgreSQL (events_db)
participants-service (Port 3002) ──► PostgreSQL (participants_db)
registrations-service (Port 3003) ──► PostgreSQL (registrations_db)
           │
           ├──(Vérifie l'existence)──► participants-service
           └──(Vérifie la capacité)──► events-service
```

---

## 🎬 3. Déroulement Pas-à-Pas de la Démonstration (Script 5 mins)

### 🔹 Étape 1 : Démonstration du Service Participants (`participants-service`)
- **Action** : Ouvrez Swagger UI sur `http://localhost:3002/api-docs` ou effectuez une requête `GET http://localhost:3002/api/participants`.
- **Discours** : *"Ce service gère la création et la gestion des profils participants (étudiants, professeurs, externes) avec validation stricte du type et contrôle d'unicité des adresses email."*

### 🔹 Étape 2 : Démonstration de la Logique d'Inscription & Capacité (`registrations-service`)
- **Action** : Ouvrez Swagger UI sur `http://localhost:3003/api-docs` et testez `POST /api/registrations` avec `{"event_id": 1, "participant_id": 1}`.
- **Discours** : *"C'est le cœur de notre communication inter-services :*
  1. *Il interroge `participants-service` pour valider le participant.*
  2. *Il interroge `events-service` pour vérifier que la capacité n'est pas dépassée.*
  3. *Si l'événement est complet, l'inscription est automatiquement refusée."*

### 🔹 Étape 3 : Démonstration des Statistiques
- **Action** : Testez `GET http://localhost:3003/api/registrations/stats`.
- **Discours** : *"L'API retourne en temps réel le nombre total d'inscriptions et la répartition par événement pour alimenter les tableaux de bord."*

---

## 🔍 4. Check-list de Vérification (Avant Soutenance)

```bash
# Vérifier les tests unitaires
(cd backend/events-service && npm test)
(cd backend/participants-service && npm test)
(cd backend/registrations-service && npm test)
```
