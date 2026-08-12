import { queryDb } from '../config/db.js';

export const participantModel = {
  async findAll({ search }) {
    let query = 'SELECT * FROM participants WHERE 1=1';
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (name ILIKE $${params.length} OR email ILIKE $${params.length})`;
    }

    query += ' ORDER BY created_at DESC';
    const { rows } = await queryDb(query, params);
    return rows;
  },

  async findById(id) {
    const { rows } = await queryDb('SELECT * FROM participants WHERE id = $1', [id]);
    return rows[0] || null;
  },

  async findByEmail(email) {
    const { rows } = await queryDb('SELECT * FROM participants WHERE LOWER(email) = LOWER($1)', [email]);
    return rows[0] || null;
  },

  async create({ name, email, phone, type }) {
    const query = `
      INSERT INTO participants (name, email, phone, type)
      VALUES ($1, LOWER($2), $3, $4)
      RETURNING *
    `;
    const values = [name, email, phone || null, type];
    const { rows } = await queryDb(query, values);
    return rows[0];
  },

  async update(id, { name, email, phone, type }) {
    const query = `
      UPDATE participants
      SET name = COALESCE($1, name),
          email = COALESCE(LOWER($2), email),
          phone = COALESCE($3, phone),
          type = COALESCE($4, type),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `;
    const values = [name, email, phone, type, id];
    const { rows } = await queryDb(query, values);
    return rows[0] || null;
  },

  async delete(id) {
    const { rows } = await queryDb('DELETE FROM participants WHERE id = $1 RETURNING *', [id]);
    return rows[0] || null;
  }
};
