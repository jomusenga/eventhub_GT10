import { Component } from 'react';

// Attrape toute erreur JavaScript inattendue survenant pendant le rendu
// d'un composant enfant, pour éviter que toute l'appli plante en silence
// (écran blanc). Placé une seule fois autour de <App /> dans main.jsx.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Erreur inattendue interceptée par ErrorBoundary :', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container">
          <div className="page-header">
            <h1>Une erreur est survenue</h1>
            <p>
              Quelque chose s'est mal passé côté interface. Essaie de recharger la page.
              Si le problème persiste, vérifie que les microservices backend sont bien démarrés.
            </p>
            <button className="btn btn-primary" onClick={() => window.location.reload()}>
              Recharger la page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
