import type { DriverStatus } from '@prisma/client';
import { prisma } from '../infrastructure/db.js';
import { ApiError } from '../utils/ApiError.js';

export interface CreateDriverInput {
  orgId: string;
  name: string;
  licenseNumber?: string;
  licenseExpiry?: Date;
  phone?: string;
  userId?: string;
  status?: DriverStatus;
}

export interface UpdateDriverInput {
  name?: string;
  licenseNumber?: string;
  licenseExpiry?: Date;
  phone?: string;
  userId?: string;
  status?: DriverStatus;
}

export async function listDrivers(orgId: string | null) {
  if (!orgId) return [];
  return prisma.driver.findMany({
    where: { orgId },
    orderBy: { updatedAt: 'desc' },
    include: { user: { select: { id: true, email: true, name: true } } },
  });
}

export async function getDriverById(id: string, orgId: string | null) {
  const driver = await prisma.driver.findUnique({
    where: { id },
    include: { user: { select: { id: true, email: true, name: true } } },
  });
  if (!driver) {
    throw new ApiError('Driver not found', 404, 'NOT_FOUND');
  }
  if (orgId && driver.orgId !== orgId) {
    throw new ApiError('Driver not found', 404, 'NOT_FOUND');
  }
  return driver;
}

export async function createDriver(data: CreateDriverInput) {
  return prisma.driver.create({
    data: {
      orgId: data.orgId,
      name: data.name,
      licenseNumber: data.licenseNumber ?? null,
      licenseExpiry: data.licenseExpiry ?? null,
      phone: data.phone ?? null,
      userId: data.userId ?? null,
      status: data.status ?? 'ACTIVE',
    },
    include: { user: { select: { id: true, email: true, name: true } } },
  });
}

export async function updateDriver(
  id: string,
  orgId: string | null,
  data: UpdateDriverInput
) {
  await getDriverById(id, orgId);
  return prisma.driver.update({
    where: { id },
    data: {
      ...(data.name != null && { name: data.name }),
      ...(data.licenseNumber !== undefined && { licenseNumber: data.licenseNumber || null }),
      ...(data.licenseExpiry !== undefined && { licenseExpiry: data.licenseExpiry ?? null }),
      ...(data.phone !== undefined && { phone: data.phone || null }),
      ...(data.userId !== undefined && { userId: data.userId ?? null }),
      ...(data.status != null && { status: data.status }),
    },
    include: { user: { select: { id: true, email: true, name: true } } },
  });
}

export async function deleteDriver(id: string, orgId: string | null) {
  await getDriverById(id, orgId);
  await prisma.driver.delete({ where: { id } });
  return { ok: true };
}
