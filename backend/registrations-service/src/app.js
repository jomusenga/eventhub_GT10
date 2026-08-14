import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import registrationRoutes from './routes/registrationRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { swaggerSpec } from './config/swaggerSpec.js';

const app = express();

app.use(cors());
app.use(express.json());

// Documentation Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Healthcheck
app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'registrations-service', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/registrations', registrationRoutes);

// Error Middleware
app.use(errorHandler);

export default app;
