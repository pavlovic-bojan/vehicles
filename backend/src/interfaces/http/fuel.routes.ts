import { Router } from 'express';
import { param, body } from 'express-validator';
import { authenticate, type AuthRequest } from '../../middleware/auth.js';
import * as fuelService from '../../usecases/fuel.service.js';
import type { Response } from 'express';
import { ApiError } from '../../utils/ApiError.js';
import { validationResult } from 'express-validator';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/fuel-records:
 *   get:
 *     summary: List fuel records for the current organization
 *     tags: [Fuel]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of fuel records
 */
router.get('/', async (req: AuthRequest, res: Response) => {
  const orgId = req.user?.orgId ?? null;
  const records = await fuelService.listFuelRecords(orgId);
  res.json({ data: records });
});

/**
 * @swagger
 * /api/fuel-records/{id}:
 *   get:
 *     summary: Get fuel record by ID
 *     tags: [Fuel]
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
 *         description: Fuel record
 *       404:
 *         description: Not found
 */
router.get(
  '/:id',
  param('id').isUUID().withMessage('Valid ID is required'),
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    const record = await fuelService.getFuelRecordById(req.params.id, req.user?.orgId ?? null);
    res.json({ data: record });
  }
);

/**
 * @swagger
 * /api/fuel-records:
 *   post:
 *     summary: Create a fuel record
 *     tags: [Fuel]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [vehicleId, amountLiters]
 *             properties:
 *               vehicleId: { type: string, format: uuid }
 *               tripId: { type: string, format: uuid }
 *               amountLiters: { type: number, minimum: 0 }
 *               costCents: { type: integer, minimum: 0 }
 *               recordedAt: { type: string, format: date-time }
 *               notes: { type: string }
 *     responses:
 *       201:
 *         description: Fuel record created
 *       400:
 *         description: Validation error
 *       403:
 *         description: Organization required
 */
router.post(
  '/',
  [
    body('vehicleId').isUUID().withMessage('Valid vehicle ID is required'),
    body('tripId').optional().isUUID(),
    body('amountLiters').isFloat({ min: 0 }).withMessage('Amount must be >= 0'),
    body('costCents').optional().isInt({ min: 0 }),
    body('recordedAt').optional().isISO8601(),
    body('notes').optional().trim(),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    const orgId = req.user?.orgId ?? null;
    if (!orgId) throw new ApiError('Organization required', 403, 'ORG_REQUIRED');
    const { vehicleId, tripId, amountLiters, costCents, recordedAt, notes } = req.body;
    const record = await fuelService.createFuelRecord({
      orgId,
      vehicleId,
      tripId,
      amountLiters: Number(amountLiters),
      costCents: costCents != null ? Number(costCents) : undefined,
      recordedAt: recordedAt ? new Date(recordedAt) : undefined,
      notes,
    });
    res.status(201).json({ data: record });
  }
);

/**
 * @swagger
 * /api/fuel-records/{id}:
 *   delete:
 *     summary: Delete a fuel record
 *     tags: [Fuel]
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
 *         description: Fuel record deleted
 *       404:
 *         description: Not found
 */
router.delete(
  '/:id',
  param('id').isUUID().withMessage('Valid ID is required'),
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    await fuelService.deleteFuelRecord(req.params.id, req.user?.orgId ?? null);
    res.json({ data: { ok: true } });
  }
);

export default router;
