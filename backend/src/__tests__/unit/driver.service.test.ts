import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as driverService from '../../usecases/driver.service.js';

vi.mock('../../infrastructure/db.js', () => ({
  prisma: {
    driver: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe('driver.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listDrivers', () => {
    it('returns empty array when orgId is null', async () => {
      const result = await driverService.listDrivers(null);
      expect(result).toEqual([]);
      const { prisma } = await import('../../infrastructure/db.js');
      expect(prisma.driver.findMany).not.toHaveBeenCalled();
    });

    it('returns drivers for orgId', async () => {
      const { prisma } = await import('../../infrastructure/db.js');
      const mockDrivers = [
        { id: 'd1', orgId: 'org1', name: 'John Driver', licenseNumber: 'L123', licenseExpiry: null, phone: null, userId: null, status: 'ACTIVE', createdAt: new Date(), updatedAt: new Date(), user: null },
      ];
      vi.mocked(prisma.driver.findMany).mockResolvedValue(mockDrivers as never);

      const result = await driverService.listDrivers('org1');
      expect(result).toEqual(mockDrivers);
      expect(prisma.driver.findMany).toHaveBeenCalledWith({
        where: { orgId: 'org1' },
        orderBy: { updatedAt: 'desc' },
        include: { user: { select: { id: true, email: true, name: true } } },
      });
    });
  });

  describe('getDriverById', () => {
    it('throws when driver not found', async () => {
      const { prisma } = await import('../../infrastructure/db.js');
      vi.mocked(prisma.driver.findUnique).mockResolvedValue(null);

      await expect(driverService.getDriverById('none', 'org1')).rejects.toMatchObject({
        statusCode: 404,
        code: 'NOT_FOUND',
      });
    });

    it('throws when driver belongs to different org', async () => {
      const { prisma } = await import('../../infrastructure/db.js');
      vi.mocked(prisma.driver.findUnique).mockResolvedValue({
        id: 'd1',
        orgId: 'org2',
        name: 'John',
      } as never);

      await expect(driverService.getDriverById('d1', 'org1')).rejects.toMatchObject({
        statusCode: 404,
        code: 'NOT_FOUND',
      });
    });

    it('returns driver when found and org matches', async () => {
      const { prisma } = await import('../../infrastructure/db.js');
      const mock = { id: 'd1', orgId: 'org1', name: 'John', licenseNumber: null, licenseExpiry: null, phone: null, userId: null, status: 'ACTIVE', createdAt: new Date(), updatedAt: new Date(), user: null };
      vi.mocked(prisma.driver.findUnique).mockResolvedValue(mock as never);

      const result = await driverService.getDriverById('d1', 'org1');
      expect(result).toEqual(mock);
    });
  });

  describe('createDriver', () => {
    it('creates driver with required and optional fields', async () => {
      const { prisma } = await import('../../infrastructure/db.js');
      const created = { id: 'd-new', orgId: 'org1', name: 'Jane', licenseNumber: 'L456', licenseExpiry: new Date(), phone: '+123', userId: null, status: 'ACTIVE', createdAt: new Date(), updatedAt: new Date(), user: null };
      vi.mocked(prisma.driver.create).mockResolvedValue(created as never);

      const result = await driverService.createDriver({
        orgId: 'org1',
        name: 'Jane',
        licenseNumber: 'L456',
        licenseExpiry: new Date(),
        phone: '+123',
        status: 'ACTIVE',
      });

      expect(result).toEqual(created);
      expect(prisma.driver.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          orgId: 'org1',
          name: 'Jane',
          licenseNumber: 'L456',
          phone: '+123',
          status: 'ACTIVE',
        }),
        include: { user: { select: { id: true, email: true, name: true } } },
      });
    });
  });

  describe('deleteDriver', () => {
    it('deletes driver when found', async () => {
      const { prisma } = await import('../../infrastructure/db.js');
      vi.mocked(prisma.driver.findUnique).mockResolvedValue({ id: 'd1', orgId: 'org1' } as never);
      vi.mocked(prisma.driver.delete).mockResolvedValue({} as never);

      const result = await driverService.deleteDriver('d1', 'org1');
      expect(result).toEqual({ ok: true });
      expect(prisma.driver.delete).toHaveBeenCalledWith({ where: { id: 'd1' } });
    });
  });
});
