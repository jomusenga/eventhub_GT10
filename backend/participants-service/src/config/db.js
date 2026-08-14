import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL || 'postgresql://participant_user:participant_password@localhost:5432/participants_db';

export const pool = new Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

let isPgConnected = false;
let memoryParticipants = [
  { id: 1, name: 'Houleymatou Diallo', email: 'houleymatou.diallo@dit.sn', phone: '+221 77 123 45 67', type: 'étudiant', created_at: new Date().toISOString() },
  { id: 2, name: 'Mouhamed Ndiaye', email: 'mouhamed.ndiaye@dit.sn', phone: '+221 78 987 65 43', type: 'professeur', created_at: new Date().toISOString() },
  { id: 3, name: 'Lory Doambe', email: 'lory.doambe@dit.sn', phone: '+221 76 555 44 33', type: 'étudiant', created_at: new Date().toISOString() },
  { id: 4, name: 'Yveline Tibera', email: 'yveline.tibera@dit.sn', phone: '+221 70 111 22 33', type: 'externe', created_at: new Date().toISOString() }
];

export const initDb = async () => {
  try {
    const client = await pool.connect();
    await client.query(`
      CREATE TABLE IF NOT EXISTS participants (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(50),
        type VARCHAR(50) NOT NULL CHECK (type IN ('étudiant', 'professeur', 'externe')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const checkCount = await client.query('SELECT COUNT(*)::int FROM participants');
    if (checkCount.rows[0].count === 0) {
      await client.query(`
        INSERT INTO participants (name, email, phone, type) VALUES
        ('Houleymatou Diallo', 'houleymatou.diallo@dit.sn', '+221 77 123 45 67', 'étudiant'),
        ('Mouhamed Ndiaye', 'mouhamed.ndiaye@dit.sn', '+221 78 987 65 43', 'professeur'),
        ('Lory Doambe', 'lory.doambe@dit.sn', '+221 76 555 44 33', 'étudiant'),
        ('Yveline Tibera', 'yveline.tibera@dit.sn', '+221 70 111 22 33', 'externe');
      `);
    }
    client.release();
    isPgConnected = true;
    console.log('[participants-service] Connecté à PostgreSQL.');
  } catch (err) {
    isPgConnected = false;
    console.log('[participants-service] Base PostgreSQL non détectée localement, mode In-Memory actif.');
  }
};

export const queryDb = async (text, params = []) => {
  if (isPgConnected) {
    return pool.query(text, params);
  }

  const lowerText = text.toLowerCase();

  if (lowerText.includes('select * from participants where id = $1')) {
    const found = memoryParticipants.find(p => p.id === parseInt(params[0], 10));
    return { rows: found ? [found] : [] };
  }

  if (lowerText.includes('select * from participants where lower(email) = lower($1)')) {
    const found = memoryParticipants.find(p => p.email.toLowerCase() === String(params[0]).toLowerCase());
    return { rows: found ? [found] : [] };
  }

  if (lowerText.includes('select * from participants')) {
    let result = [...memoryParticipants];
    if (params[0] && lowerText.includes('name ilike')) {
      const term = params[0].replace(/%/g, '').toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(term) || p.email.toLowerCase().includes(term));
    }
    return { rows: result };
  }

  if (lowerText.includes('insert into participants')) {
    const newP = {
      id: memoryParticipants.length > 0 ? Math.max(...memoryParticipants.map(p => p.id)) + 1 : 1,
      name: params[0],
      email: String(params[1]).toLowerCase(),
      phone: params[2] || null,
      type: params[3],
      created_at: new Date().toISOString()
    };
    memoryParticipants.push(newP);
    return { rows: [newP] };
  }

  if (lowerText.includes('update participants')) {
    const id = parseInt(params[4], 10);
    const index = memoryParticipants.findIndex(p => p.id === id);
    if (index !== -1) {
      memoryParticipants[index] = {
        ...memoryParticipants[index],
        name: params[0] || memoryParticipants[index].name,
        email: params[1] ? String(params[1]).toLowerCase() : memoryParticipants[index].email,
        phone: params[2] !== undefined ? params[2] : memoryParticipants[index].phone,
        type: params[3] || memoryParticipants[index].type,
        updated_at: new Date().toISOString()
      };
      return { rows: [memoryParticipants[index]] };
    }
    return { rows: [] };
  }

  if (lowerText.includes('delete from participants')) {
    const id = parseInt(params[0], 10);
    const index = memoryParticipants.findIndex(p => p.id === id);
    if (index !== -1) {
      const removed = memoryParticipants.splice(index, 1);
      return { rows: removed };
    }
    return { rows: [] };
  }

  return { rows: [] };
};
