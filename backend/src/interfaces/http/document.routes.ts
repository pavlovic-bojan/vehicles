import { Router } from 'express';
import { param, body, query } from 'express-validator';
import { authenticate, type AuthRequest } from '../../middleware/auth.js';
import * as documentController from './document.controller.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/documents:
 *   get:
 *     summary: List documents (optionally filter by entityType, entityId)
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: entityType
 *         schema:
 *           type: string
 *           enum: [TRIP, VEHICLE, DRIVER]
 *       - in: query
 *         name: entityId
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of documents
 */
router.get(
  '/',
  query('entityType').optional().isIn(['TRIP', 'VEHICLE', 'DRIVER']),
  query('entityId').optional().isUUID(),
  (req, res, next) =>
    documentController.list(req as AuthRequest, res).catch(next)
);

/**
 * @swagger
 * /api/documents/{id}:
 *   get:
 *     summary: Get document by ID
 *     tags: [Documents]
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
 *         description: Document
 *       404:
 *         description: Not found
 */
router.get(
  '/:id',
  param('id').isUUID().withMessage('Valid ID is required'),
  (req, res, next) =>
    documentController.getById(req as AuthRequest, res).catch(next)
);

/**
 * @swagger
 * /api/documents:
 *   post:
 *     summary: Create document metadata (link to trip/vehicle/driver)
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [entityType, entityId, fileName]
 *             properties:
 *               entityType: { type: string, enum: [TRIP, VEHICLE, DRIVER] }
 *               entityId: { type: string, format: uuid }
 *               fileName: { type: string }
 *               fileUrl: { type: string }
 *               mimeType: { type: string }
 *     responses:
 *       201:
 *         description: Document created
 *       400:
 *         description: Validation error
 *       403:
 *         description: Organization required
 */
router.post(
  '/',
  [
    body('entityType').isIn(['TRIP', 'VEHICLE', 'DRIVER']).withMessage('entityType must be TRIP, VEHICLE, or DRIVER'),
    body('entityId').isUUID().withMessage('Valid entityId is required'),
    body('fileName').trim().notEmpty().withMessage('fileName is required'),
    body('fileUrl').optional().trim(),
    body('mimeType').optional().trim(),
  ],
  (req, res, next) =>
    documentController.create(req as AuthRequest, res).catch(next)
);

/**
 * @swagger
 * /api/documents/{id}:
 *   delete:
 *     summary: Delete document
 *     tags: [Documents]
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
 *         description: Document deleted
 *       404:
 *         description: Not found
 */
router.delete(
  '/:id',
  param('id').isUUID().withMessage('Valid ID is required'),
  (req, res, next) =>
    documentController.remove(req as AuthRequest, res).catch(next)
);

export default router;
