import { Router } from 'express';
import { param, body } from 'express-validator';
import { authenticate, type AuthRequest } from '../../middleware/auth.js';
import * as tripController from './trip.controller.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/trips:
 *   get:
 *     summary: List trips for the current organization
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of trips
 */
router.get('/', (req, res, next) =>
  tripController.list(req as AuthRequest, res).catch(next)
);

/**
 * @swagger
 * /api/trips/{id}:
 *   get:
 *     summary: Get trip by ID
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Trip
 *       404:
 *         description: Trip not found
 */
router.get(
  '/:id',
  param('id').isUUID().withMessage('Valid trip ID is required'),
  (req, res, next) =>
    tripController.getById(req as AuthRequest, res).catch(next)
);

/**
 * @swagger
 * /api/trips:
 *   post:
 *     summary: Create a trip
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [vehicleId, driverId, startAt]
 *             properties:
 *               vehicleId: { type: string, format: uuid }
 *               driverId: { type: string, format: uuid }
 *               startAt: { type: string, format: date-time }
 *               startMileage: { type: integer, minimum: 0 }
 *               status: { type: string, enum: [PRE_TRIP, IN_PROGRESS, POST_TRIP, COMPLETED] }
 *               notes: { type: string }
 *     responses:
 *       201:
 *         description: Trip created
 *       400:
 *         description: Validation error
 *       403:
 *         description: Organization required
 */
router.post(
  '/',
  [
    body('vehicleId').isUUID().withMessage('Valid vehicle ID is required'),
    body('driverId').isUUID().withMessage('Valid driver ID is required'),
    body('startAt').isISO8601().withMessage('Valid startAt date is required'),
    body('startMileage').optional().isInt({ min: 0 }),
    body('status').optional().isIn(['PRE_TRIP', 'IN_PROGRESS', 'POST_TRIP', 'COMPLETED']),
    body('notes').optional().trim(),
  ],
  (req, res, next) =>
    tripController.create(req as AuthRequest, res).catch(next)
);

/**
 * @swagger
 * /api/trips/{id}:
 *   put:
 *     summary: Update a trip (end trip, mileage, status)
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               endAt: { type: string, format: date-time }
 *               endMileage: { type: integer, minimum: 0 }
 *               status: { type: string, enum: [PRE_TRIP, IN_PROGRESS, POST_TRIP, COMPLETED] }
 *               notes: { type: string }
 *     responses:
 *       200:
 *         description: Trip updated
 *       404:
 *         description: Trip not found
 */
router.put(
  '/:id',
  [
    param('id').isUUID().withMessage('Valid trip ID is required'),
    body('endAt').optional().isISO8601(),
    body('endMileage').optional().isInt({ min: 0 }),
    body('status').optional().isIn(['PRE_TRIP', 'IN_PROGRESS', 'POST_TRIP', 'COMPLETED']),
    body('notes').optional().trim(),
  ],
  (req, res, next) =>
    tripController.update(req as AuthRequest, res).catch(next)
);

/**
 * @swagger
 * /api/trips/{id}:
 *   delete:
 *     summary: Delete a trip
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Trip deleted
 *       404:
 *         description: Trip not found
 */
router.delete(
  '/:id',
  param('id').isUUID().withMessage('Valid trip ID is required'),
  (req, res, next) =>
    tripController.remove(req as AuthRequest, res).catch(next)
);

export default router;
