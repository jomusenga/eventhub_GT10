import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { eventsApi, registrationsApi } from '../services/api';
import { isAdmin } from '../utils/role';

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const admin = isAdmin();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [myRegistration, setMyRegistration] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const participantId = localStorage.getItem('eventhub_participant_id');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const eventData = await eventsApi.getById(id);
        let inscrits = 0;
        try {
          const { count } = await registrationsApi.getCountByEvent(id);
          inscrits = count ?? 0;
        } catch {
          inscrits = 0;
        }
        setEvent({ ...eventData, inscrits });
      } catch {
        setEvent(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  useEffect(() => {
    if (!participantId || admin) return;
    registrationsApi.getByParticipant(participantId)
      .then((regs) => {
        const found = regs.find((r) => String(r.eventId) === String(id));
        setMyRegistration(found || null);
      })
      .catch(() => setMyRegistration(null));
  }, [id, participantId, admin]);

  const handleCancelRegistration = async () => {
    if (!myRegistration) return;
    if (!window.confirm("Annuler ton inscription à cet événement ?")) return;
    setCancelling(true);
    setError(null);
    try {
      await registrationsApi.cancel(myRegistration.id);
      setMyRegistration(null);
      setEvent((prev) => (prev ? { ...prev, inscrits: Math.max(0, (prev.inscrits || 0) - 1) } : prev));
    } catch (err) {
      setError(err.message || "Impossible d'annuler l'inscription.");
    } finally {
      setCancelling(false);
    }
  };

  const handleCancelEvent = async () => {
    if (!window.confirm(
      "Annuler cet événement ?\n\nLes inscriptions sont conservées. Tu pourras le restaurer plus tard avec les mêmes inscrits."
    )) return;
    setBusy(true);
    setError(null);
    try {
      const updated = await eventsApi.cancel(id);
      setEvent((prev) => ({ ...prev, ...updated, status: 'CANCELLED' }));
    } catch (err) {
      setError(err.message || "Impossible d'annuler l'événement.");
    } finally {
      setBusy(false);
    }
  };

  const handleRestoreEvent = async () => {
    if (!window.confirm('Restaurer cet événement ? Les inscrits précédents restent liés.')) return;
    setBusy(true);
    setError(null);
    try {
      const updated = await eventsApi.restore(id);
      setEvent((prev) => ({ ...prev, ...updated, status: 'ACTIVE' }));
    } catch (err) {
      setError(err.message || "Impossible de restaurer l'événement.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <p className="state-message">Chargement…</p>;
  if (!event) return <p className="state-message">Événement introuvable.</p>;

  const cancelled = event.status === 'CANCELLED';
  const placesRestantes = event.capaciteMax - (event.inscrits || 0);
  const backTo = admin ? '/admin/events' : '/';

  return (
    <div className="container">
      <div className="page-header">
        <Link to={backTo} className="btn btn-secondary" style={{ marginBottom: '1.5rem', display: 'inline-block' }}>
          ← Retour aux événements
        </Link>
        <h1>{event.titre}</h1>
        {cancelled && <p style={{ color: 'var(--color-danger)' }}>Cet événement est annulé. Les inscriptions sont conservées.</p>}
      </div>

      <div className="event-card">
        <p>{event.description}</p>
        <div className="event-meta">
          <span><i className="fa-solid fa-calendar-days meta-icon" aria-hidden="true"></i>{event.date}</span>
          <span><i className="fa-solid fa-location-dot meta-icon" aria-hidden="true"></i>{event.lieu}</span>
          <span>
            <i className="fa-solid fa-users meta-icon" aria-hidden="true"></i>
            {cancelled
              ? `${event.inscrits || 0} inscription(s) conservée(s)`
              : `${placesRestantes} places restantes sur ${event.capaciteMax} (${event.inscrits || 0} inscrit${event.inscrits > 1 ? 's' : ''})`}
          </span>
          {cancelled && <span className="badge full">Annulé</span>}
          {!admin && myRegistration && <span className="badge">Tu es inscrit·e</span>}
        </div>

        {error && <p className="state-message" style={{ color: 'var(--color-danger)' }}>{error}</p>}

        <div className="actions-row">
          {admin ? (
            <>
              <button className="btn btn-secondary" onClick={() => navigate(`/events/${id}/edit`)}>
                Modifier
              </button>
              <button className="btn btn-secondary" onClick={() => navigate(`/events/${id}/inscrits`)}>
                Voir les inscrits
              </button>
              {cancelled ? (
                <button className="btn btn-primary" onClick={handleRestoreEvent} disabled={busy}>
                  {busy ? '…' : 'Restaurer l\'événement'}
                </button>
              ) : (
                <button
                  className="btn btn-secondary"
                  style={{ color: 'var(--color-danger)' }}
                  onClick={handleCancelEvent}
                  disabled={busy}
                >
                  {busy ? '…' : 'Annuler l\'événement'}
                </button>
              )}
            </>
          ) : cancelled ? (
            <p className="state-message" style={{ margin: 0 }}>Inscriptions fermées (événement annulé).</p>
          ) : myRegistration ? (
            <button
              className="btn btn-secondary"
              style={{ color: 'var(--color-danger)' }}
              onClick={handleCancelRegistration}
              disabled={cancelling}
            >
              {cancelling ? 'Annulation…' : "Annuler mon inscription"}
            </button>
          ) : (
            <button
              className="btn btn-primary"
              disabled={placesRestantes <= 0}
              onClick={() => navigate(`/events/${id}/inscription`)}
            >
              {placesRestantes <= 0 ? 'Complet' : "S'inscrire"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
