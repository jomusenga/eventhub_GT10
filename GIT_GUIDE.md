# 🚀 Architecture Git & Guide de Contribution - EventHub

Ce document décrit l'architecture Git officielle du projet **EventHub** conforme au diagramme de l'équipe DIT.

---

## 🌳 Architecture des Branches Git

```
main ────────── develop ┬── feature/events-service
                        ├── feature/participants-service
                        ├── feature/registrations-service
                        ├── feature/frontend
                        ├── feature/docker
                        └── feature/ci
```

### Description des Branches :
- **`main`** : Branche de production. Seules les Pull Requests validées depuis `develop` y sont fusionnées.
- **`develop`** : Branche principale d'intégration continue. Reçoit les Pull Requests des branches `feature/*`.
- **`feature/events-service`** : Développement du microservice événements (Lory Doambe).
- **`feature/participants-service`** : Développement du microservice participants (Houleymatou Diallo).
- **`feature/registrations-service`** : Développement du microservice inscriptions & stats (Houleymatou Diallo).
- **`feature/frontend`** : Développement de l'interface React (Yveline Tibera).
- **`feature/docker`** : Dockerfiles et orchestration Docker Compose (Joseph Musenga).
- **`feature/ci`** : Workflows CI/CD GitHub Actions (Joseph Musenga).

---

## 💻 Instructions Git pour Houleymatou Diallo

Les branches locales ont déjà été créées sur votre dépôt. Pour travailler sur vos fonctionnalités et pousser vers GitHub :

### 1. Travailler sur le service Participants
```bash
cd /Users/mac/develop/WORKSPACE/IA_MASTER/PROJETS/eventhub

# Basculer sur la branche participants-service
git checkout feature/participants-service

# Ajouter et commiter vos modifications
git add backend/participants-service/
git commit -m "feat(participants): add CRUD endpoints, search filter and Swagger UI"
```

### 2. Travailler sur le service Inscriptions
```bash
# Basculer sur la branche registrations-service
git checkout feature/registrations-service

# Ajouter et commiter vos modifications
git add backend/registrations-service/
git commit -m "feat(registrations): add inter-service validation and stats API"
```

### 3. Pousser les branches vers votre dépôt GitHub
```bash
# Lier à votre dépôt distant GitHub
git remote add origin https://github.com/<VOTRE_ORGANISATION_OU_USERNAME>/eventhub.git

# Pousser develop et vos branches de fonctionnalités
git push -u origin develop
git push -u origin feature/participants-service
git push -u origin feature/registrations-service
```

---

## 🔀 Flux de travail des Pull Requests (PR)

1. Ouvrez une **Pull Request** depuis `feature/participants-service` vers `develop`.
2. Le pipeline CI/CD GitHub Actions s'exécute automatiquement et valide les tests unitaires.
3. Le Scrum Master (Mouhamed Ndiaye) ou le Backend Lead (Lory Doambe) valide la PR et effectue le Merge sur `develop`.
