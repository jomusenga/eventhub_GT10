import app from './app.js';
import { initDb } from './config/db.js';

const PORT = process.env.PORT || 3003;

const startServer = async () => {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log(`[registrations-service] démarré sur http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('[registrations-service] Impossible de démarrer:', error);
    process.exit(1);
  }
};

startServer();
