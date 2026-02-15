import type { VehicleStatus } from '@prisma/client';
import { prisma } from '../infrastructure/db.js';
import { ApiError } from '../utils/ApiError.js';

export interface CreateTrailerInput {
  orgId: string;
  make: string;
  model: string;
  registration?: string;
  mileage?: number;
  purchaseDate?: Date;
  status?: VehicleStatus;
}

export interface UpdateTrailerInput {
  make?: string;
  model?: string;
  registration?: string;
  mileage?: number;
  purchaseDate?: Date;
  status?: VehicleStatus;
}

export async function listTrailers(orgId: string | null) {
  if (!orgId) return [];
  return prisma.trailer.findMany({
    where: { orgId },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function getTrailerById(id: string, orgId: string | null) {
  const trailer = await prisma.trailer.findUnique({
    where: { id },
  });
  if (!trailer) {
    throw new ApiError('Trailer not found', 404, 'NOT_FOUND');
  }
  if (orgId && trailer.orgId !== orgId) {
    throw new ApiError('Trailer not found', 404, 'NOT_FOUND');
  }
  return trailer;
}

export async function createTrailer(data: CreateTrailerInput) {
  return prisma.trailer.create({
    data: {
      orgId: data.orgId,
      make: data.make,
      model: data.model,
      registration: data.registration ?? null,
      mileage: data.mileage ?? 0,
      purchaseDate: data.purchaseDate ?? null,
      status: data.status ?? 'ACTIVE',
    },
  });
}

export async function updateTrailer(
  id: string,
  orgId: string | null,
  data: UpdateTrailerInput
) {
  await getTrailerById(id, orgId);
  return prisma.trailer.update({
    where: { id },
    data: {
      ...(data.make != null && { make: data.make }),
      ...(data.model != null && { model: data.model }),
      ...(data.registration !== undefined && { registration: data.registration || null }),
      ...(data.mileage != null && { mileage: data.mileage }),
      ...(data.purchaseDate !== undefined && { purchaseDate: data.purchaseDate ?? null }),
      ...(data.status != null && { status: data.status }),
    },
  });
}

export async function deleteTrailer(id: string, orgId: string | null) {
  await getTrailerById(id, orgId);
  await prisma.trailer.delete({
    where: { id },
  });
  return { ok: true };
}
