import { Router } from 'express';
import { param, body } from 'express-validator';
import { authenticate, type AuthRequest } from '../../middleware/auth.js';
import * as vehicleController from './vehicle.controller.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/vehicles:
 *   get:
 *     summary: List vehicles for the current organization
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of vehicles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Vehicle'
 */
router.get('/', (req, res, next) =>
  vehicleController.list(req as AuthRequest, res).catch(next)
);

/**
 * @swagger
 * /api/vehicles/{id}:
 *   get:
 *     summary: Get vehicle by ID
 *     tags: [Vehicles]
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
 *         description: Vehicle
 *       404:
 *         description: Vehicle not found
 */
router.get(
  '/:id',
  param('id').isUUID().withMessage('Valid vehicle ID is required'),
  (req, res, next) =>
    vehicleController.getById(req as AuthRequest, res).catch(next)
);

/**
 * @swagger
 * /api/vehicles:
 *   post:
 *     summary: Create a vehicle
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [make, model]
 *             properties:
 *               make: { type: string }
 *               model: { type: string }
 *               vin: { type: string }
 *               registration: { type: string }
 *               mileage: { type: integer, minimum: 0 }
 *               purchaseDate: { type: string, format: date }
 *               status: { type: string, enum: [ACTIVE, PAUSED, FROZEN, IN_SERVICE] }
 *     responses:
 *       201:
 *         description: Vehicle created
 *       400:
 *         description: Validation error
 *       403:
 *         description: Organization required
 */
router.post(
  '/',
  [
    body('make').trim().notEmpty().withMessage('Make is required'),
    body('model').trim().notEmpty().withMessage('Model is required'),
    body('vin').optional().trim(),
    body('registration').optional().trim(),
    body('mileage').optional().isInt({ min: 0 }).withMessage('Mileage must be a non-negative integer'),
    body('purchaseDate').optional().isISO8601().withMessage('Invalid date'),
    body('status').optional().isIn(['ACTIVE', 'PAUSED', 'FROZEN', 'IN_SERVICE']).withMessage('Invalid status'),
  ],
  (req, res, next) =>
    vehicleController.create(req as AuthRequest, res).catch(next)
);

/**
 * @swagger
 * /api/vehicles/{id}:
 *   put:
 *     summary: Update a vehicle
 *     tags: [Vehicles]
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
 *               make: { type: string }
 *               model: { type: string }
 *               vin: { type: string }
 *               registration: { type: string }
 *               mileage: { type: integer, minimum: 0 }
 *               purchaseDate: { type: string, format: date }
 *               status: { type: string, enum: [ACTIVE, PAUSED, FROZEN, IN_SERVICE] }
 *     responses:
 *       200:
 *         description: Vehicle updated
 *       400:
 *         description: Validation error
 *       404:
 *         description: Vehicle not found
 */
router.put(
  '/:id',
  [
    param('id').isUUID().withMessage('Valid vehicle ID is required'),
    body('make').optional().trim().notEmpty(),
    body('model').optional().trim().notEmpty(),
    body('vin').optional().trim(),
    body('registration').optional().trim(),
    body('mileage').optional().isInt({ min: 0 }),
    body('purchaseDate').optional().isISO8601(),
    body('status').optional().isIn(['ACTIVE', 'PAUSED', 'FROZEN', 'IN_SERVICE']),
  ],
  (req, res, next) =>
    vehicleController.update(req as AuthRequest, res).catch(next)
);

/**
 * @swagger
 * /api/vehicles/{id}:
 *   delete:
 *     summary: Delete a vehicle
 *     tags: [Vehicles]
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
 *         description: Vehicle deleted
 *       404:
 *         description: Vehicle not found
 */
router.delete(
  '/:id',
  param('id').isUUID().withMessage('Valid vehicle ID is required'),
  (req, res, next) =>
    vehicleController.remove(req as AuthRequest, res).catch(next)
);

export default router;
