import { Link } from 'react-router-dom';

export default function EventCard({ event }) {
  const cancelled = event.status === 'CANCELLED';
  const placesRestantes = event.capaciteMax - (event.inscrits || 0);
  const complet = !cancelled && placesRestantes <= 0;

  return (
    <Link to={`/events/${event.id}`}>
      <div className="event-card" style={cancelled ? { opacity: 0.75 } : undefined}>
        <h3>{event.titre}</h3>
        <p>{event.description}</p>
        <div className="event-meta">
          <span><i className="fa-solid fa-calendar-days meta-icon" aria-hidden="true"></i>{event.date}</span>
          <span><i className="fa-solid fa-location-dot meta-icon" aria-hidden="true"></i>{event.lieu}</span>
          {cancelled ? (
            <span className="badge full">Annulé · {event.inscrits || 0} inscrit(s) conservés</span>
          ) : (
            <span className={`badge ${complet ? 'full' : ''}`}>
              {complet
                ? `Complet (${event.inscrits || 0}/${event.capaciteMax})`
                : `${event.inscrits || 0}/${event.capaciteMax} inscrits · ${placesRestantes} restantes`}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
