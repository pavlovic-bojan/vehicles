import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './interfaces/http/auth.routes.js';
import vehicleRoutes from './interfaces/http/vehicle.routes.js';
import driverRoutes from './interfaces/http/driver.routes.js';
import tripRoutes from './interfaces/http/trip.routes.js';
import fuelRoutes from './interfaces/http/fuel.routes.js';
import locationRoutes from './interfaces/http/location.routes.js';
import gpsRoutes from './interfaces/http/gps.routes.js';
import documentRoutes from './interfaces/http/document.routes.js';
import reportRoutes from './interfaces/http/report.routes.js';
import trailerRoutes from './interfaces/http/trailer.routes.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: { title: 'Vehicles API', version: '1.0.0' },
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string' },
            name: { type: 'string' },
            picture: { type: 'string', nullable: true },
            role: { type: 'string', enum: ['ADMIN', 'DRIVER', 'AUDITOR'] },
            orgId: { type: 'string', nullable: true },
          },
        },
        Vehicle: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            orgId: { type: 'string' },
            make: { type: 'string' },
            model: { type: 'string' },
            vin: { type: 'string', nullable: true },
            registration: { type: 'string', nullable: true },
            mileage: { type: 'integer' },
            purchaseDate: { type: 'string', format: 'date-time', nullable: true },
            status: { type: 'string', enum: ['ACTIVE', 'PAUSED', 'FROZEN', 'IN_SERVICE'] },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Driver: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            orgId: { type: 'string' },
            userId: { type: 'string', format: 'uuid', nullable: true },
            name: { type: 'string' },
            licenseNumber: { type: 'string', nullable: true },
            licenseExpiry: { type: 'string', format: 'date-time', nullable: true },
            phone: { type: 'string', nullable: true },
            status: { type: 'string', enum: ['ACTIVE', 'PAUSED', 'FROZEN'] },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            user: { type: 'object', nullable: true, properties: { id: { type: 'string' }, email: { type: 'string' }, name: { type: 'string' } } },
          },
        },
      },
    },
  },
  apis: ['./src/interfaces/http/*.ts'],
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/fuel-records', fuelRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/gps', gpsRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/trailers', trailerRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use(errorHandler);

export { app };
