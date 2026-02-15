import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import * as driverService from '../../usecases/driver.service.js';

vi.mock('../../usecases/driver.service.js');

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

const authHeader = () => ({ Authorization: 'Bearer test-token' });

describe('Driver routes integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/drivers', () => {
    it('returns list of drivers', async () => {
      const app = await getApp();
      const mockDrivers = [
        { id: 'd1', orgId: 'org-1', name: 'John Driver', licenseNumber: null, licenseExpiry: null, phone: null, userId: null, status: 'ACTIVE', createdAt: new Date(), updatedAt: new Date(), user: null },
      ];
      vi.mocked(driverService.listDrivers).mockResolvedValue(mockDrivers as never);

      const res = await request(app)
        .get('/api/drivers')
        .set(authHeader())
        .expect(200);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].name).toBe('John Driver');
    });
  });

  describe('POST /api/drivers', () => {
    it('returns 201 when valid body', async () => {
      const app = await getApp();
      const created = { id: 'd-new', orgId: 'org-1', name: 'Jane', licenseNumber: null, licenseExpiry: null, phone: null, userId: null, status: 'ACTIVE', createdAt: new Date(), updatedAt: new Date(), user: null };
      vi.mocked(driverService.createDriver).mockResolvedValue(created as never);

      const res = await request(app)
        .post('/api/drivers')
        .set(authHeader())
        .send({ name: 'Jane' })
        .expect(201);

      expect(res.body.data.name).toBe('Jane');
      expect(driverService.createDriver).toHaveBeenCalledWith(expect.objectContaining({ name: 'Jane', orgId: 'org-1' }));
    });

    it('returns 400 when validation fails', async () => {
      const app = await getApp();
      await request(app)
        .post('/api/drivers')
        .set(authHeader())
        .send({ name: '' })
        .expect(400);
    });
  });

  const validUuid = '550e8400-e29b-41d4-a716-446655440000';

  describe('GET /api/drivers/:id', () => {
    it('returns 200 when driver found', async () => {
      const app = await getApp();
      const mock = { id: validUuid, orgId: 'org-1', name: 'John', licenseNumber: null, licenseExpiry: null, phone: null, userId: null, status: 'ACTIVE', createdAt: new Date(), updatedAt: new Date(), user: null };
      vi.mocked(driverService.getDriverById).mockResolvedValue(mock as never);

      const res = await request(app)
        .get(`/api/drivers/${validUuid}`)
        .set(authHeader())
        .expect(200);

      expect(res.body.data.name).toBe('John');
    });

    it('returns 400 for invalid uuid', async () => {
      const app = await getApp();
      await request(app)
        .get('/api/drivers/not-uuid')
        .set(authHeader())
        .expect(400);
    });
  });

  describe('PUT /api/drivers/:id', () => {
    it('returns 200 when update succeeds', async () => {
      const app = await getApp();
      const updated = { id: validUuid, orgId: 'org-1', name: 'Jane Updated', licenseNumber: null, licenseExpiry: null, phone: null, userId: null, status: 'ACTIVE', createdAt: new Date(), updatedAt: new Date(), user: null };
      vi.mocked(driverService.updateDriver).mockResolvedValue(updated as never);

      const res = await request(app)
        .put(`/api/drivers/${validUuid}`)
        .set(authHeader())
        .send({ name: 'Jane Updated' })
        .expect(200);

      expect(res.body.data.name).toBe('Jane Updated');
    });
  });

  describe('DELETE /api/drivers/:id', () => {
    it('returns 200 when delete succeeds', async () => {
      const app = await getApp();
      vi.mocked(driverService.deleteDriver).mockResolvedValue({ ok: true } as never);

      await request(app)
        .delete(`/api/drivers/${validUuid}`)
        .set(authHeader())
        .expect(200);
    });
  });
});
