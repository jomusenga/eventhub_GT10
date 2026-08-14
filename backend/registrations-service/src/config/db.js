import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL || 'postgresql://registration_user:registration_password@localhost:5432/registrations_db';

export const pool = new Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

let isPgConnected = false;
let memoryRegistrations = [
  { id: 1, event_id: 1, participant_id: 1, registration_date: new Date().toISOString(), status: 'CONFIRMED' },
  { id: 2, event_id: 1, participant_id: 2, registration_date: new Date().toISOString(), status: 'CONFIRMED' },
  { id: 3, event_id: 2, participant_id: 3, registration_date: new Date().toISOString(), status: 'CONFIRMED' }
];

export const initDb = async () => {
  try {
    const client = await pool.connect();
    await client.query(`
      CREATE TABLE IF NOT EXISTS registrations (
        id SERIAL PRIMARY KEY,
        event_id INT NOT NULL,
        participant_id INT NOT NULL,
        registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) DEFAULT 'CONFIRMED',
        UNIQUE(event_id, participant_id)
      );
    `);

    const checkCount = await client.query('SELECT COUNT(*)::int FROM registrations');
    if (checkCount.rows[0].count === 0) {
      await client.query(`
        INSERT INTO registrations (event_id, participant_id, status) VALUES
        (1, 1, 'CONFIRMED'),
        (1, 2, 'CONFIRMED'),
        (2, 3, 'CONFIRMED');
      `);
    }
    client.release();
    isPgConnected = true;
    console.log('[registrations-service] Connecté à PostgreSQL.');
  } catch (err) {
    isPgConnected = false;
    console.log('[registrations-service] Base PostgreSQL non détectée localement, mode In-Memory actif.');
  }
};

export const queryDb = async (text, params = []) => {
  if (isPgConnected) {
    return pool.query(text, params);
  }

  const lowerText = text.toLowerCase();

  if (lowerText.includes('count(*)::int as count from registrations where event_id = $1')) {
    const count = memoryRegistrations.filter(r => r.event_id === parseInt(params[0], 10) && r.status === 'CONFIRMED').length;
    return { rows: [{ count }] };
  }

  if (lowerText.includes('select * from registrations where event_id = $1 and participant_id = $2')) {
    const found = memoryRegistrations.find(r => r.event_id === parseInt(params[0], 10) && r.participant_id === parseInt(params[1], 10));
    return { rows: found ? [found] : [] };
  }

  if (lowerText.includes('select * from registrations where id = $1')) {
    const found = memoryRegistrations.find(r => r.id === parseInt(params[0], 10));
    return { rows: found ? [found] : [] };
  }

  if (lowerText.includes('insert into registrations')) {
    const newReg = {
      id: memoryRegistrations.length > 0 ? Math.max(...memoryRegistrations.map(r => r.id)) + 1 : 1,
      event_id: parseInt(params[0], 10),
      participant_id: parseInt(params[1], 10),
      registration_date: new Date().toISOString(),
      status: 'CONFIRMED'
    };
    memoryRegistrations.push(newReg);
    return { rows: [newReg] };
  }

  if (lowerText.includes('delete from registrations')) {
    const id = parseInt(params[0], 10);
    const index = memoryRegistrations.findIndex(r => r.id === id);
    if (index !== -1) {
      const removed = memoryRegistrations.splice(index, 1);
      return { rows: removed };
    }
    return { rows: [] };
  }

  if (lowerText.includes('select * from registrations where event_id = $1')) {
    const result = memoryRegistrations.filter(r => r.event_id === parseInt(params[0], 10));
    return { rows: result };
  }

  if (lowerText.includes('select * from registrations where participant_id = $1')) {
    const result = memoryRegistrations.filter(r => r.participant_id === parseInt(params[0], 10));
    return { rows: result };
  }

  if (lowerText.includes('total_registrations from registrations')) {
    return { rows: [{ total_registrations: memoryRegistrations.length }] };
  }

  if (lowerText.includes('group by event_id')) {
    const map = {};
    memoryRegistrations.forEach(r => {
      map[r.event_id] = (map[r.event_id] || 0) + 1;
    });
    const byEvent = Object.keys(map).map(eId => ({ event_id: parseInt(eId, 10), total: map[eId] }));
    return { rows: byEvent };
  }

  return { rows: [] };
};
