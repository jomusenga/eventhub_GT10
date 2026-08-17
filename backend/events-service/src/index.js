import app from './app.js';
import { initDb } from './config/db.js';

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log(`[events-service] démarré sur http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('[events-service] Impossible de démarrer:', error);
    process.exit(1);
  }
};

startServer();
