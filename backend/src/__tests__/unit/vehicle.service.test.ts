import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as vehicleService from '../../usecases/vehicle.service.js';

vi.mock('../../infrastructure/db.js', () => ({
  prisma: {
    vehicle: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe('vehicle.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listVehicles', () => {
    it('returns empty array when orgId is null', async () => {
      const result = await vehicleService.listVehicles(null);
      expect(result).toEqual([]);
      const { prisma } = await import('../../infrastructure/db.js');
      expect(prisma.vehicle.findMany).not.toHaveBeenCalled();
    });

    it('returns vehicles for orgId', async () => {
      const { prisma } = await import('../../infrastructure/db.js');
      const mockVehicles = [
        {
          id: 'v1',
          orgId: 'org1',
          make: 'Ford',
          model: 'F-150',
          vin: null,
          registration: 'ABC-123',
          mileage: 1000,
          purchaseDate: null,
          status: 'ACTIVE',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      vi.mocked(prisma.vehicle.findMany).mockResolvedValue(mockVehicles as never);

      const result = await vehicleService.listVehicles('org1');
      expect(result).toEqual(mockVehicles);
      expect(prisma.vehicle.findMany).toHaveBeenCalledWith({
        where: { orgId: 'org1' },
        orderBy: { updatedAt: 'desc' },
      });
    });
  });

  describe('getVehicleById', () => {
    it('throws when vehicle not found', async () => {
      const { prisma } = await import('../../infrastructure/db.js');
      vi.mocked(prisma.vehicle.findUnique).mockResolvedValue(null);

      await expect(vehicleService.getVehicleById('none', 'org1')).rejects.toMatchObject({
        statusCode: 404,
        code: 'NOT_FOUND',
      });
    });

    it('throws when vehicle belongs to different org', async () => {
      const { prisma } = await import('../../infrastructure/db.js');
      vi.mocked(prisma.vehicle.findUnique).mockResolvedValue({
        id: 'v1',
        orgId: 'org2',
        make: 'Ford',
        model: 'F-150',
      } as never);

      await expect(vehicleService.getVehicleById('v1', 'org1')).rejects.toMatchObject({
        statusCode: 404,
        code: 'NOT_FOUND',
      });
    });

    it('returns vehicle when found and org matches', async () => {
      const { prisma } = await import('../../infrastructure/db.js');
      const mock = { id: 'v1', orgId: 'org1', make: 'Ford', model: 'F-150', vin: null, registration: null, mileage: 0, purchaseDate: null, status: 'ACTIVE', createdAt: new Date(), updatedAt: new Date() };
      vi.mocked(prisma.vehicle.findUnique).mockResolvedValue(mock as never);

      const result = await vehicleService.getVehicleById('v1', 'org1');
      expect(result).toEqual(mock);
    });
  });

  describe('createVehicle', () => {
    it('creates vehicle with required and optional fields', async () => {
      const { prisma } = await import('../../infrastructure/db.js');
      const created = { id: 'v-new', orgId: 'org1', make: 'Ford', model: 'F-150', vin: 'VIN123', registration: 'REG1', mileage: 100, purchaseDate: new Date(), status: 'ACTIVE', createdAt: new Date(), updatedAt: new Date() };
      vi.mocked(prisma.vehicle.create).mockResolvedValue(created as never);

      const result = await vehicleService.createVehicle({
        orgId: 'org1',
        make: 'Ford',
        model: 'F-150',
        vin: 'VIN123',
        registration: 'REG1',
        mileage: 100,
        purchaseDate: new Date(),
        status: 'ACTIVE',
      });

      expect(result).toEqual(created);
      expect(prisma.vehicle.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          orgId: 'org1',
          make: 'Ford',
          model: 'F-150',
          vin: 'VIN123',
          registration: 'REG1',
          mileage: 100,
          status: 'ACTIVE',
        }),
      });
    });
  });

  describe('deleteVehicle', () => {
    it('deletes vehicle when found', async () => {
      const { prisma } = await import('../../infrastructure/db.js');
      vi.mocked(prisma.vehicle.findUnique).mockResolvedValue({ id: 'v1', orgId: 'org1' } as never);
      vi.mocked(prisma.vehicle.delete).mockResolvedValue({} as never);

      const result = await vehicleService.deleteVehicle('v1', 'org1');
      expect(result).toEqual({ ok: true });
      expect(prisma.vehicle.delete).toHaveBeenCalledWith({ where: { id: 'v1' } });
    });
  });
});
