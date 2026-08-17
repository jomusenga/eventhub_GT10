# EventHub — Frontend

Interface React de la plateforme EventHub (DIT — Master 1 IA).

## Structure

```
src/
  main.jsx          -> point d'entrée (+ ErrorBoundary global)
  App.jsx            -> routes de l'application
  index.css          -> styles globaux (couleurs, typographie)
  services/api.js    -> tous les appels vers les 3 microservices
  components/
    Navbar.jsx           -> barre de navigation
    EventCard.jsx        -> carte affichée dans la liste d'événements
    ErrorBoundary.jsx    -> attrape les erreurs inattendues (écran de secours)
    StateDisplay.jsx     -> composants "chargement" / "erreur" réutilisables
  pages/
    EventsList.jsx        -> liste des événements (page d'accueil) — /
    EventForm.jsx          -> création ET modification d'un événement — /events/new, /events/:id/edit
    EventDetail.jsx         -> détail d'un événement (places restantes) — /events/:id
    Registration.jsx        -> formulaire d'inscription — /events/:id/inscription
    MesInscriptions.jsx     -> liste + annulation des inscriptions — /mes-inscriptions
    ParticipantsList.jsx    -> liste + recherche de participants — /participants
```

## Pages et routes

| Route | Page | Fonction |
|---|---|---|
| `/` | EventsList | Liste des événements |
| `/events/new` | EventForm | Créer un événement |
| `/events/:id` | EventDetail | Voir un événement + s'inscrire |
| `/events/:id/edit` | EventForm | Modifier un événement |
| `/events/:id/inscription` | Registration | Formulaire d'inscription |
| `/mes-inscriptions` | MesInscriptions | Voir et annuler ses inscriptions |
| `/participants` | ParticipantsList | Liste et recherche des participants |

## Lancer en local

```bash
npm install
npm run dev
```

L'application s'ouvre sur http://localhost:5173

Tant que les microservices ne sont pas branchés, la page d'accueil affiche
automatiquement des données de démonstration (voir `MOCK_EVENTS` dans
`EventsList.jsx`).

## Connecter les vraies APIs

1. Copie `.env.example` en `.env`
2. Renseigne les bonnes URLs (données par Lory / Houleymatou / Joseph)
3. Relance `npm run dev`

## Docker

```bash
docker build -t eventhub-frontend .
docker run -p 8080:80 eventhub-frontend
```

L'application sera disponible sur http://localhost:8080
