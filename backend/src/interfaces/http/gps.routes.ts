import { Router } from 'express';
import { authenticate, type AuthRequest } from '../../middleware/auth.js';
import { prisma } from '../../infrastructure/db.js';
import type { Response } from 'express';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/gps/positions:
 *   get:
 *     summary: Get current vehicle positions (mock for MVP – real GPS integration later)
 *     tags: [GPS]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of vehicle positions (mock data for vehicles in org)
 */
router.get('/positions', async (req: AuthRequest, res: Response) => {
  const orgId = req.user?.orgId ?? null;
  if (!orgId) {
    return res.json({ data: [] });
  }
  const vehicles = await prisma.vehicle.findMany({
    where: { orgId, status: 'ACTIVE' },
    select: { id: true },
    take: 20,
  });
  // Mock positions: fixed coordinates per vehicle (deterministic from id hash)
  const positions = vehicles.map((v, i) => {
    const lat = 44.8 + (i * 0.01) + Math.sin(i) * 0.005;
    const lng = 20.45 + (i * 0.01) + Math.cos(i) * 0.005;
    return {
      vehicleId: v.id,
      lat: Math.round(lat * 1e6) / 1e6,
      lng: Math.round(lng * 1e6) / 1e6,
      updatedAt: new Date().toISOString(),
    };
  });
  res.json({ data: positions });
});

export default router;
