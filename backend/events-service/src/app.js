import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import eventRoutes from './routes/eventRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { swaggerSpec } from './config/swaggerSpec.js';

const app = express();

app.use(cors());
app.use(express.json());

// Documentation Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Healthcheck
app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'events-service', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/events', eventRoutes);

// Error Middleware
app.use(errorHandler);

export default app;
