import { Router } from 'express';
import { param, body } from 'express-validator';
import { authenticate, type AuthRequest } from '../../middleware/auth.js';
import * as trailerController from './trailer.controller.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/trailers:
 *   get:
 *     summary: List trailers for the current organization
 *     tags: [Trailers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of trailers
 */
router.get('/', (req, res, next) =>
  trailerController.list(req as AuthRequest, res).catch(next)
);

/**
 * @swagger
 * /api/trailers/{id}:
 *   get:
 *     summary: Get trailer by ID
 *     tags: [Trailers]
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
 *         description: Trailer
 *       404:
 *         description: Trailer not found
 */
router.get(
  '/:id',
  param('id').isUUID().withMessage('Valid trailer ID is required'),
  (req, res, next) =>
    trailerController.getById(req as AuthRequest, res).catch(next)
);

/**
 * @swagger
 * /api/trailers:
 *   post:
 *     summary: Create a trailer
 *     tags: [Trailers]
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
 *               registration: { type: string }
 *               mileage: { type: integer, minimum: 0 }
 *               purchaseDate: { type: string, format: date }
 *               status: { type: string, enum: [ACTIVE, PAUSED, FROZEN, IN_SERVICE] }
 *     responses:
 *       201:
 *         description: Trailer created
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
    body('registration').optional().trim(),
    body('mileage').optional().isInt({ min: 0 }).withMessage('Mileage must be a non-negative integer'),
    body('purchaseDate').optional().isISO8601().withMessage('Invalid date'),
    body('status').optional().isIn(['ACTIVE', 'PAUSED', 'FROZEN', 'IN_SERVICE']).withMessage('Invalid status'),
  ],
  (req, res, next) =>
    trailerController.create(req as AuthRequest, res).catch(next)
);

/**
 * @swagger
 * /api/trailers/{id}:
 *   put:
 *     summary: Update a trailer
 *     tags: [Trailers]
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
 *               registration: { type: string }
 *               mileage: { type: integer, minimum: 0 }
 *               purchaseDate: { type: string, format: date }
 *               status: { type: string, enum: [ACTIVE, PAUSED, FROZEN, IN_SERVICE] }
 *     responses:
 *       200:
 *         description: Trailer updated
 *       400:
 *         description: Validation error
 *       404:
 *         description: Trailer not found
 */
router.put(
  '/:id',
  [
    param('id').isUUID().withMessage('Valid trailer ID is required'),
    body('make').optional().trim().notEmpty(),
    body('model').optional().trim().notEmpty(),
    body('registration').optional().trim(),
    body('mileage').optional().isInt({ min: 0 }),
    body('purchaseDate').optional().isISO8601(),
    body('status').optional().isIn(['ACTIVE', 'PAUSED', 'FROZEN', 'IN_SERVICE']),
  ],
  (req, res, next) =>
    trailerController.update(req as AuthRequest, res).catch(next)
);

/**
 * @swagger
 * /api/trailers/{id}:
 *   delete:
 *     summary: Delete a trailer
 *     tags: [Trailers]
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
 *         description: Trailer deleted
 *       404:
 *         description: Trailer not found
 */
router.delete(
  '/:id',
  param('id').isUUID().withMessage('Valid trailer ID is required'),
  (req, res, next) =>
    trailerController.remove(req as AuthRequest, res).catch(next)
);

export default router;
