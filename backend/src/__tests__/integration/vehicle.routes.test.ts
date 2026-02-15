import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import * as vehicleService from '../../usecases/vehicle.service.js';
import { ApiError } from '../../utils/ApiError.js';

vi.mock('../../usecases/vehicle.service.js');

vi.mock('../../middleware/auth.js', () => ({
  authenticate: (req: unknown, _res: unknown, next: () => void) => {
    (req as { user?: { id: string; orgId: string | null } }).user = {
      id: 'user-1',
      email: 'admin@test.com',
      name: 'Admin',
      role: 'ADMIN',
      orgId: 'org-1',
    };
    next();
  },
}));

const getApp = async () => {
  const { app } = await import('../../app.js');
  return app;
};

const authHeader = () => {
  return { Authorization: 'Bearer test-token' };
};

describe('Vehicle routes integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/vehicles', () => {
    it('returns list of vehicles', async () => {
      const app = await getApp();
      const mockVehicles = [
        { id: 'v1', orgId: 'org-1', make: 'Ford', model: 'F-150', vin: null, registration: null, mileage: 0, purchaseDate: null, status: 'ACTIVE', createdAt: new Date(), updatedAt: new Date() },
      ];
      vi.mocked(vehicleService.listVehicles).mockResolvedValue(mockVehicles as never);

      const res = await request(app)
        .get('/api/vehicles')
        .set(authHeader())
        .expect(200);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].make).toBe('Ford');
    });
  });

  describe('POST /api/vehicles', () => {
    it('returns 201 when valid body', async () => {
      const app = await getApp();
      const created = { id: 'v-new', orgId: 'org-1', make: 'Ford', model: 'F-150', vin: null, registration: null, mileage: 0, purchaseDate: null, status: 'ACTIVE', createdAt: new Date(), updatedAt: new Date() };
      vi.mocked(vehicleService.createVehicle).mockResolvedValue(created as never);

      const res = await request(app)
        .post('/api/vehicles')
        .set(authHeader())
        .send({ make: 'Ford', model: 'F-150' })
        .expect(201);

      expect(res.body.data.make).toBe('Ford');
      expect(vehicleService.createVehicle).toHaveBeenCalledWith(expect.objectContaining({ make: 'Ford', model: 'F-150', orgId: 'org-1' }));
    });

    it('returns 400 when validation fails', async () => {
      const app = await getApp();
      await request(app)
        .post('/api/vehicles')
        .set(authHeader())
        .send({ make: '', model: '' })
        .expect(400);
    });
  });

  const validUuid = '550e8400-e29b-41d4-a716-446655440000';

  describe('GET /api/vehicles/:id', () => {
    it('returns vehicle when found', async () => {
      const app = await getApp();
      const mock = { id: validUuid, orgId: 'org-1', make: 'Ford', model: 'F-150', vin: null, registration: null, mileage: 0, purchaseDate: null, status: 'ACTIVE', createdAt: new Date(), updatedAt: new Date() };
      vi.mocked(vehicleService.getVehicleById).mockResolvedValue(mock as never);

      const res = await request(app)
        .get(`/api/vehicles/${validUuid}`)
        .set(authHeader())
        .expect(200);

      expect(res.body.data.id).toBe(validUuid);
    });

    it('returns 404 when not found', async () => {
      const app = await getApp();
      vi.mocked(vehicleService.getVehicleById).mockRejectedValue(new ApiError('Vehicle not found', 404, 'NOT_FOUND'));

      await request(app)
        .get('/api/vehicles/00000000-0000-0000-0000-000000000000')
        .set(authHeader())
        .expect(404);
    });
  });

  describe('PUT /api/vehicles/:id', () => {
    it('returns 200 when valid update', async () => {
      const app = await getApp();
      const updated = { id: validUuid, orgId: 'org-1', make: 'Ford', model: 'F-250', vin: null, registration: null, mileage: 5000, purchaseDate: null, status: 'ACTIVE', createdAt: new Date(), updatedAt: new Date() };
      vi.mocked(vehicleService.updateVehicle).mockResolvedValue(updated as never);

      const res = await request(app)
        .put(`/api/vehicles/${validUuid}`)
        .set(authHeader())
        .send({ model: 'F-250', mileage: 5000 })
        .expect(200);

      expect(res.body.data.model).toBe('F-250');
    });
  });

  describe('DELETE /api/vehicles/:id', () => {
    it('returns 200 when deleted', async () => {
      const app = await getApp();
      vi.mocked(vehicleService.deleteVehicle).mockResolvedValue({ ok: true });

      const res = await request(app)
        .delete(`/api/vehicles/${validUuid}`)
        .set(authHeader())
        .expect(200);

      expect(res.body.data.ok).toBe(true);
    });
  });
});
