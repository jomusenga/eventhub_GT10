import { Link } from 'react-router-dom';

export default function EventCard({ event }) {
  const placesRestantes = event.capaciteMax - (event.inscrits || 0);
  const complet = placesRestantes <= 0;

  return (
    <Link to={`/events/${event.id}`}>
      <div className="event-card">
        <h3>{event.titre}</h3>
        <p>{event.description}</p>
        <div className="event-meta">
          <span>📅 {event.date}</span>
          <span>📍 {event.lieu}</span>
          <span className={`badge ${complet ? 'full' : ''}`}>
            {complet ? 'Complet' : `${placesRestantes} places restantes`}
          </span>
        </div>
      </div>
    </Link>
  );
}
