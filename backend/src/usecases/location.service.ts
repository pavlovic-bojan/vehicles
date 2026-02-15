import type { LocationType, LocationStatus } from '@prisma/client';
import { prisma } from '../infrastructure/db.js';
import { ApiError } from '../utils/ApiError.js';

export interface CreateLocationInput {
  orgId: string;
  name: string;
  type: LocationType;
  address?: string;
  status?: LocationStatus;
}

export interface UpdateLocationInput {
  name?: string;
  type?: LocationType;
  address?: string;
  status?: LocationStatus;
}

export async function listLocations(orgId: string | null, type?: LocationType) {
  if (!orgId) return [];
  return prisma.location.findMany({
    where: { orgId, ...(type && { type }) },
    orderBy: { name: 'asc' },
  });
}

export async function getLocationById(id: string, orgId: string | null) {
  const loc = await prisma.location.findUnique({ where: { id } });
  if (!loc) {
    throw new ApiError('Location not found', 404, 'NOT_FOUND');
  }
  if (orgId && loc.orgId !== orgId) {
    throw new ApiError('Location not found', 404, 'NOT_FOUND');
  }
  return loc;
}

export async function createLocation(data: CreateLocationInput) {
  return prisma.location.create({
    data: {
      orgId: data.orgId,
      name: data.name,
      type: data.type,
      address: data.address ?? null,
      status: data.status ?? 'ACTIVE',
    },
  });
}

export async function updateLocation(
  id: string,
  orgId: string | null,
  data: UpdateLocationInput
) {
  await getLocationById(id, orgId);
  return prisma.location.update({
    where: { id },
    data: {
      ...(data.name != null && { name: data.name }),
      ...(data.type != null && { type: data.type }),
      ...(data.address !== undefined && { address: data.address ?? null }),
      ...(data.status != null && { status: data.status }),
    },
  });
}

export async function deleteLocation(id: string, orgId: string | null) {
  await getLocationById(id, orgId);
  await prisma.location.delete({ where: { id } });
  return { ok: true };
}
