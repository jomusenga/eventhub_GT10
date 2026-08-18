import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL || 'postgresql://event_user:event_password@localhost:5432/events_db';

export const pool = new Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

let isPgConnected = false;
let memoryEvents = [
  { id: 1, title: 'Conférence DevOps & Microservices', description: 'Présentation de l\'architecture microservices conteneurisée DIT', date: '2026-08-20T09:00:00.000Z', location: 'Amphi A - DIT', max_capacity: 100, status: 'ACTIVE', created_at: new Date().toISOString() },
  { id: 2, title: 'Atelier IA & Edge Computing', description: 'Workshop pratique sur la frugalité des modèles LLM et Edge AI', date: '2026-08-22T14:00:00.000Z', location: 'Lab IA 2', max_capacity: 30, status: 'ACTIVE', created_at: new Date().toISOString() },
  { id: 3, title: 'Séminaire Mémoire & Recherche', description: 'Session d\'orientation académique Master 1 IA', date: '2026-08-25T11:00:00.000Z', location: 'Salle de Conférence DIT', max_capacity: 50, status: 'ACTIVE', created_at: new Date().toISOString() }
];

export const initDb = async () => {
  try {
    const client = await pool.connect();
    await client.query(`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        date TIMESTAMP NOT NULL,
        location VARCHAR(255) NOT NULL,
        max_capacity INT NOT NULL CHECK (max_capacity > 0),
        status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Bases déjà créées avant l'ajout de status
    await client.query(`
      ALTER TABLE events
      ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE';
    `);

    const checkCount = await client.query('SELECT COUNT(*)::int FROM events');
    if (checkCount.rows[0].count === 0) {
      await client.query(`
        INSERT INTO events (title, description, date, location, max_capacity, status) VALUES
        ('Conférence DevOps & Microservices', 'Présentation de l''architecture microservices conteneurisée DIT', '2026-08-20 09:00:00', 'Amphi A - DIT', 100, 'ACTIVE'),
        ('Atelier IA & Edge Computing', 'Workshop pratique sur la frugalité des modèles LLM et Edge AI', '2026-08-22 14:00:00', 'Lab IA 2', 30, 'ACTIVE'),
        ('Séminaire Mémoire & Recherche', 'Session d''orientation académique Master 1 IA', '2026-08-25 11:00:00', 'Salle de Conférence DIT', 50, 'ACTIVE');
      `);
    }
    client.release();
    isPgConnected = true;
    console.log('[events-service] Connecté à PostgreSQL.');
  } catch (err) {
    isPgConnected = false;
    console.log('[events-service] Base PostgreSQL non détectée localement, mode In-Memory actif.');
  }
};

export const queryDb = async (text, params = []) => {
  if (isPgConnected) {
    return pool.query(text, params);
  }

  const lowerText = text.toLowerCase();

  if (lowerText.includes('select * from events where id = $1')) {
    const found = memoryEvents.find(e => e.id === parseInt(params[0], 10));
    return { rows: found ? [found] : [] };
  }

  if (lowerText.includes('select * from events')) {
    let result = [...memoryEvents];
    if (lowerText.includes("status = 'active'") || lowerText.includes("status = $")) {
      // filtré plus bas via params si besoin
    }
    if (lowerText.includes('status = $')) {
      const statusParam = params.find((p) => p === 'ACTIVE' || p === 'CANCELLED');
      if (statusParam) {
        result = result.filter((e) => (e.status || 'ACTIVE') === statusParam);
      }
    } else if (lowerText.includes("status = 'active'")) {
      result = result.filter((e) => (e.status || 'ACTIVE') === 'ACTIVE');
    }
    if (params.length && lowerText.includes('date(date)')) {
      const dateParam = params.find((p) => /^\d{4}-\d{2}-\d{2}$/.test(String(p)));
      if (dateParam) result = result.filter((e) => String(e.date).startsWith(dateParam));
    }
    if (params.length && lowerText.includes('location ilike')) {
      const locParam = params.find((p) => String(p).includes('%'));
      if (locParam) {
        const term = String(locParam).replace(/%/g, '').toLowerCase();
        result = result.filter((e) => e.location.toLowerCase().includes(term));
      }
    }
    return { rows: result };
  }

  if (lowerText.includes('insert into events')) {
    const newEvent = {
      id: memoryEvents.length > 0 ? Math.max(...memoryEvents.map(e => e.id)) + 1 : 1,
      title: params[0],
      description: params[1] || '',
      date: params[2],
      location: params[3],
      max_capacity: parseInt(params[4], 10),
      status: params[5] || 'ACTIVE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    memoryEvents.push(newEvent);
    return { rows: [newEvent] };
  }

  if (lowerText.includes('set status =')) {
    const id = parseInt(params[params.length - 1], 10);
    const index = memoryEvents.findIndex((e) => e.id === id);
    if (index !== -1) {
      memoryEvents[index] = {
        ...memoryEvents[index],
        status: params[0],
        updated_at: new Date().toISOString()
      };
      return { rows: [memoryEvents[index]] };
    }
    return { rows: [] };
  }

  if (lowerText.includes('update events')) {
    const id = parseInt(params[5], 10);
    const index = memoryEvents.findIndex(e => e.id === id);
    if (index !== -1) {
      memoryEvents[index] = {
        ...memoryEvents[index],
        title: params[0] || memoryEvents[index].title,
        description: params[1] !== undefined ? params[1] : memoryEvents[index].description,
        date: params[2] || memoryEvents[index].date,
        location: params[3] || memoryEvents[index].location,
        max_capacity: params[4] ? parseInt(params[4], 10) : memoryEvents[index].max_capacity,
        updated_at: new Date().toISOString()
      };
      return { rows: [memoryEvents[index]] };
    }
    return { rows: [] };
  }

  if (lowerText.includes('delete from events')) {
    const id = parseInt(params[0], 10);
    const index = memoryEvents.findIndex(e => e.id === id);
    if (index !== -1) {
      const removed = memoryEvents.splice(index, 1);
      return { rows: removed };
    }
    return { rows: [] };
  }

  return { rows: [] };
};
