import { queryDb } from '../config/db.js';

export const eventModel = {
  async findAll({ date, location, status = 'ACTIVE' }) {
    let query = 'SELECT * FROM events WHERE 1=1';
    const params = [];

    if (status && status !== 'ALL') {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }

    if (date) {
      params.push(date);
      query += ` AND DATE(date) = $${params.length}`;
    }

    if (location) {
      params.push(`%${location}%`);
      query += ` AND location ILIKE $${params.length}`;
    }

    query += ' ORDER BY date ASC';
    const { rows } = await queryDb(query, params);
    return rows;
  },

  async findById(id) {
    const { rows } = await queryDb('SELECT * FROM events WHERE id = $1', [id]);
    return rows[0] || null;
  },

  async create({ title, description, date, location, max_capacity }) {
    const query = `
      INSERT INTO events (title, description, date, location, max_capacity, status)
      VALUES ($1, $2, $3, $4, $5, 'ACTIVE')
      RETURNING *
    `;
    const values = [title, description || '', date, location, max_capacity];
    const { rows } = await queryDb(query, values);
    return rows[0];
  },

  async update(id, { title, description, date, location, max_capacity }) {
    const query = `
      UPDATE events
      SET title = COALESCE($1, title),
          description = COALESCE($2, description),
          date = COALESCE($3, date),
          location = COALESCE($4, location),
          max_capacity = COALESCE($5, max_capacity),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `;
    const values = [title, description, date, location, max_capacity, id];
    const { rows } = await queryDb(query, values);
    return rows[0] || null;
  },

  /** Soft delete : conserve l'id et les inscriptions liées */
  async cancel(id) {
    const { rows } = await queryDb(
      `UPDATE events SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      ['CANCELLED', id]
    );
    return rows[0] || null;
  },

  async restore(id) {
    const { rows } = await queryDb(
      `UPDATE events SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      ['ACTIVE', id]
    );
    return rows[0] || null;
  }
};
