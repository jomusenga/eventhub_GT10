import app from './app.js';
import { initDb } from './config/db.js';

const PORT = process.env.PORT || 3002;

const startServer = async () => {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log(`🚀 [participants-service] démarré sur http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Impossible de démarrer participants-service:', error);
    process.exit(1);
  }
};

startServer();
