import { Router } from 'express';
import { param, body, query } from 'express-validator';
import { authenticate, type AuthRequest } from '../../middleware/auth.js';
import * as locationController from './location.controller.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/locations:
 *   get:
 *     summary: List parking/service locations for the current organization
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [PARKING, SERVICE]
 *     responses:
 *       200:
 *         description: List of locations
 */
router.get(
  '/',
  query('type').optional().isIn(['PARKING', 'SERVICE']),
  (req, res, next) =>
    locationController.list(req as AuthRequest, res).catch(next)
);

/**
 * @swagger
 * /api/locations/{id}:
 *   get:
 *     summary: Get location by ID
 *     tags: [Locations]
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
 *         description: Location
 *       404:
 *         description: Not found
 */
router.get(
  '/:id',
  param('id').isUUID().withMessage('Valid ID is required'),
  (req, res, next) =>
    locationController.getById(req as AuthRequest, res).catch(next)
);

/**
 * @swagger
 * /api/locations:
 *   post:
 *     summary: Create a location (parking or service)
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, type]
 *             properties:
 *               name: { type: string }
 *               type: { type: string, enum: [PARKING, SERVICE] }
 *               address: { type: string }
 *               status: { type: string, enum: [ACTIVE, PAUSED, FROZEN] }
 *     responses:
 *       201:
 *         description: Location created
 *       400:
 *         description: Validation error
 *       403:
 *         description: Organization required
 */
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('type').isIn(['PARKING', 'SERVICE']).withMessage('Type must be PARKING or SERVICE'),
    body('address').optional().trim(),
    body('status').optional().isIn(['ACTIVE', 'PAUSED', 'FROZEN']),
  ],
  (req, res, next) =>
    locationController.create(req as AuthRequest, res).catch(next)
);

/**
 * @swagger
 * /api/locations/{id}:
 *   put:
 *     summary: Update a location
 *     tags: [Locations]
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
 *               type: { type: string, enum: [PARKING, SERVICE] }
 *               address: { type: string }
 *               status: { type: string, enum: [ACTIVE, PAUSED, FROZEN] }
 *     responses:
 *       200:
 *         description: Location updated
 *       404:
 *         description: Not found
 */
router.put(
  '/:id',
  [
    param('id').isUUID().withMessage('Valid ID is required'),
    body('name').optional().trim().notEmpty(),
    body('type').optional().isIn(['PARKING', 'SERVICE']),
    body('address').optional().trim(),
    body('status').optional().isIn(['ACTIVE', 'PAUSED', 'FROZEN']),
  ],
  (req, res, next) =>
    locationController.update(req as AuthRequest, res).catch(next)
);

/**
 * @swagger
 * /api/locations/{id}:
 *   delete:
 *     summary: Delete a location
 *     tags: [Locations]
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
 *         description: Location deleted
 *       404:
 *         description: Not found
 */
router.delete(
  '/:id',
  param('id').isUUID().withMessage('Valid ID is required'),
  (req, res, next) =>
    locationController.remove(req as AuthRequest, res).catch(next)
);

export default router;
