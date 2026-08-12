# 🚀 Guide Git & Intégration Backend EventHub (Node.js 25)

Ce document fournit toutes les étapes pas-à-pas pour initialiser le dépôt Git, structurer les commits et effectuer les Pull Requests sur GitHub en suivant les meilleures pratiques DevOps et le découpage de l'équipe DIT.

---

## 📌 1. Configuration de l'environnement

- **Node.js** : `v25.9.0` (Alpine Image: `node:25-alpine`)
- **OpenAPI / Swagger** : Accessible interactivement sur chaque microservice :
  - `http://localhost:3001/api-docs` (events-service)
  - `http://localhost:3002/api-docs` (participants-service)
  - `http://localhost:3003/api-docs` (registrations-service)
- **Fichier Swagger unifié** : `docs/swagger.json` (importable dans Postman / Insomnia).

---

## 🌿 2. Stratégie de Branches Git

Conformément à la consigne de l'examen DevOps :
- `main` : Production (déploiement automatique)
- `develop` : Intégration continue
- `feature/participants-service` : Branche de fonctionnalités pour **Houleymatou Diallo**
- `feature/registrations-service` : Branche de fonctionnalités pour **Houleymatou Diallo**
- `feature/events-service` : Branche de fonctionnalités pour **Lory Doambe**

---

## 💻 3. Commandes Git pas-à-pas pour Houleymatou Diallo

### Étape A : Initialiser le dépôt Git local
```bash
cd /Users/mac/develop/WORKSPACE/IA_MASTER/PROJETS/eventhub

# Initialiser le dépôt si ce n'est pas déjà fait
git init

# Créer la branche 'develop'
git checkout -b develop
```

### Étape B : Branche & Commits pour `participants-service`
```bash
# Se placer sur sa branche de feature
git checkout -b feature/participants-service

# Ajouter les fichiers du service participants
git add backend/participants-service/ docs/swagger.json

# Effectuer des commits clairs et professionnels (Conventional Commits)
git commit -m "feat(participants): add participant model, routes and controllers"
git commit -m "feat(participants): add validation for student/professor/external types"
git commit -m "docs(participants): add OpenAPI Swagger documentation on /api-docs"
git commit -m "ci(docker): update Dockerfile to Node 25 Alpine"
```

### Étape C : Branche & Commits pour `registrations-service`
```bash
git checkout develop
git checkout -b feature/registrations-service

# Ajouter les fichiers du service inscriptions
git add backend/registrations-service/

# Commits
git commit -m "feat(registrations): implement HTTP clients for inter-service communication"
git commit -m "feat(registrations): add capacity check logic before event registration"
git commit -m "feat(registrations): add registration statistics and cancellation endpoints"
git commit -m "docs(registrations): mount Swagger UI on /api-docs"
```

### Étape D : Pousser vers GitHub & créer les Pull Requests (PR)
```bash
# Ajouter l'URL de votre dépôt GitHub distant
git remote add origin https://github.com/<VOTRE_ORGANISATION_OU_USERNAME>/eventhub.git

# Pousser la branche develop
git push -u origin develop

# Pousser vos branches de fonctionnalités
git push -u origin feature/participants-service
git push -u origin feature/registrations-service
```

> 💡 **Sur GitHub** : Ouvrez une **Pull Request** de `feature/participants-service` vers `develop`, et faites valider par le Scrum Master (Mouhamed) et le Backend Lead (Lory).

---

## 🧪 4. Exécuter les tests avant chaque commit

Pour garantir la Definition of Done (DoD) :

```bash
# Test participants-service
cd backend/participants-service && npm test

# Test registrations-service
cd backend/registrations-service && npm test
```

---

## 📋 5. Fichiers et Dockerfiles mis à jour (Node 25)

Tous les `Dockerfile` utilisent désormais la version **`node:25-alpine`** :
- `backend/events-service/Dockerfile`
- `backend/participants-service/Dockerfile`
- `backend/registrations-service/Dockerfile`
- `.github/workflows/backend-ci.yml` (Configuré avec `node-version: '25'`)
