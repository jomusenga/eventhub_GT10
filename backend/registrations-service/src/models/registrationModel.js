import { queryDb } from '../config/db.js';

export const registrationModel = {
  async countByEventId(eventId) {
    const { rows } = await queryDb(
      'SELECT COUNT(*)::int AS count FROM registrations WHERE event_id = $1 AND status = $2',
      [eventId, 'CONFIRMED']
    );
    return rows[0] ? rows[0].count : 0;
  },

  async findByEventAndParticipant(eventId, participantId) {
    const { rows } = await queryDb(
      'SELECT * FROM registrations WHERE event_id = $1 AND participant_id = $2',
      [eventId, participantId]
    );
    return rows[0] || null;
  },

  async create({ event_id, participant_id }) {
    const query = `
      INSERT INTO registrations (event_id, participant_id, status)
      VALUES ($1, $2, 'CONFIRMED')
      RETURNING *
    `;
    const { rows } = await queryDb(query, [event_id, participant_id]);
    return rows[0];
  },

  async findById(id) {
    const { rows } = await queryDb('SELECT * FROM registrations WHERE id = $1', [id]);
    return rows[0] || null;
  },

  async delete(id) {
    const { rows } = await queryDb('DELETE FROM registrations WHERE id = $1 RETURNING *', [id]);
    return rows[0] || null;
  },

  async findByEvent(eventId) {
    const { rows } = await queryDb(
      'SELECT * FROM registrations WHERE event_id = $1 ORDER BY registration_date DESC',
      [eventId]
    );
    return rows;
  },

  async findByParticipant(participantId) {
    const { rows } = await queryDb(
      'SELECT * FROM registrations WHERE participant_id = $1 ORDER BY registration_date DESC',
      [participantId]
    );
    return rows;
  },

  async getStats() {
    const totalQuery = 'SELECT COUNT(*)::int AS total_registrations FROM registrations';
    const perEventQuery = `
      SELECT event_id, COUNT(*)::int AS total
      FROM registrations
      GROUP BY event_id
      ORDER BY total DESC
    `;

    const totalRes = await queryDb(totalQuery);
    const perEventRes = await queryDb(perEventQuery);

    return {
      totalRegistrations: totalRes.rows[0] ? totalRes.rows[0].total_registrations : 0,
      byEvent: perEventRes.rows
    };
  }
};
