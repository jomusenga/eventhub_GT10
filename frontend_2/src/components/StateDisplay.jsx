// Composants réutilisables pour que toutes les pages affichent
// le chargement et les erreurs réseau de la même façon.

export function LoadingState({ label = 'Chargement…' }) {
  return <p className="state-message">{label}</p>;
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="state-message" style={{ color: 'var(--color-danger)' }}>
      <p>{message}</p>
      {onRetry && (
        <button className="btn btn-secondary" onClick={onRetry}>
          Réessayer
        </button>
      )}
    </div>
  );
}
