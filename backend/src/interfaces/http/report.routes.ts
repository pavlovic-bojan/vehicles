import { Router } from 'express';
import { authenticate, type AuthRequest } from '../../middleware/auth.js';
import * as reportController from './report.controller.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/reports/summary:
 *   get:
 *     summary: "Report summary (counts - vehicles, drivers, trips, fuel records, locations)"
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Summary counts
 */
router.get('/summary', (req, res, next) =>
  reportController.getSummary(req as AuthRequest, res).catch(next)
);

/**
 * @swagger
 * /api/reports/fuel:
 *   get:
 *     summary: Fuel report aggregated by vehicle (optionally filter by date range)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Fuel report by vehicle
 */
router.get('/fuel', (req, res, next) =>
  reportController.getFuelReport(req as AuthRequest, res).catch(next)
);

/**
 * @swagger
 * /api/reports/trips:
 *   get:
 *     summary: Trips report (total and by status; optionally filter by date range)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Trips report
 */
router.get('/trips', (req, res, next) =>
  reportController.getTripsReport(req as AuthRequest, res).catch(next)
);

export default router;
