import { Router } from 'express';
import { param, body } from 'express-validator';
import { authenticate, type AuthRequest } from '../../middleware/auth.js';
import * as driverController from './driver.controller.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/drivers:
 *   get:
 *     summary: List drivers for the current organization
 *     tags: [Drivers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of drivers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Driver'
 */
router.get('/', (req, res, next) =>
  driverController.list(req as AuthRequest, res).catch(next)
);

/**
 * @swagger
 * /api/drivers/{id}:
 *   get:
 *     summary: Get driver by ID
 *     tags: [Drivers]
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
 *         description: Driver
 *       404:
 *         description: Driver not found
 */
router.get(
  '/:id',
  param('id').isUUID().withMessage('Valid driver ID is required'),
  (req, res, next) =>
    driverController.getById(req as AuthRequest, res).catch(next)
);

/**
 * @swagger
 * /api/drivers:
 *   post:
 *     summary: Create a driver
 *     tags: [Drivers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *               licenseNumber: { type: string }
 *               licenseExpiry: { type: string, format: date }
 *               phone: { type: string }
 *               userId: { type: string, format: uuid }
 *               status: { type: string, enum: [ACTIVE, PAUSED, FROZEN] }
 *     responses:
 *       201:
 *         description: Driver created
 *       400:
 *         description: Validation error
 *       403:
 *         description: Organization required
 */
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('licenseNumber').optional().trim(),
    body('licenseExpiry').optional().isISO8601().withMessage('Invalid date'),
    body('phone').optional().trim(),
    body('userId').optional().isUUID(),
    body('status').optional().isIn(['ACTIVE', 'PAUSED', 'FROZEN']).withMessage('Invalid status'),
  ],
  (req, res, next) =>
    driverController.create(req as AuthRequest, res).catch(next)
);

/**
 * @swagger
 * /api/drivers/{id}:
 *   put:
 *     summary: Update a driver
 *     tags: [Drivers]
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
 *               name: { type: string }
 *               licenseNumber: { type: string }
 *               licenseExpiry: { type: string, format: date }
 *               phone: { type: string }
 *               userId: { type: string, format: uuid }
 *               status: { type: string, enum: [ACTIVE, PAUSED, FROZEN] }
 *     responses:
 *       200:
 *         description: Driver updated
 *       400:
 *         description: Validation error
 *       404:
 *         description: Driver not found
 */
router.put(
  '/:id',
  [
    param('id').isUUID().withMessage('Valid driver ID is required'),
    body('name').optional().trim().notEmpty(),
    body('licenseNumber').optional().trim(),
    body('licenseExpiry').optional().isISO8601(),
    body('phone').optional().trim(),
    body('userId').optional().isUUID(),
    body('status').optional().isIn(['ACTIVE', 'PAUSED', 'FROZEN']),
  ],
  (req, res, next) =>
    driverController.update(req as AuthRequest, res).catch(next)
);

/**
 * @swagger
 * /api/drivers/{id}:
 *   delete:
 *     summary: Delete a driver
 *     tags: [Drivers]
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
 *         description: Driver deleted
 *       404:
 *         description: Driver not found
 */
router.delete(
  '/:id',
  param('id').isUUID().withMessage('Valid driver ID is required'),
  (req, res, next) =>
    driverController.remove(req as AuthRequest, res).catch(next)
);

export default router;
