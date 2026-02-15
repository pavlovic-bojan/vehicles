import type { VehicleStatus } from '@prisma/client';
import { prisma } from '../infrastructure/db.js';
import { ApiError } from '../utils/ApiError.js';

export interface CreateVehicleInput {
  orgId: string;
  make: string;
  model: string;
  vin?: string;
  registration?: string;
  mileage?: number;
  purchaseDate?: Date;
  status?: VehicleStatus;
}

export interface UpdateVehicleInput {
  make?: string;
  model?: string;
  vin?: string;
  registration?: string;
  mileage?: number;
  purchaseDate?: Date;
  status?: VehicleStatus;
}

export async function listVehicles(orgId: string | null) {
  if (!orgId) return [];
  const vehicles = await prisma.vehicle.findMany({
    where: { orgId },
    orderBy: { updatedAt: 'desc' },
  });
  return vehicles;
}

export async function getVehicleById(id: string, orgId: string | null) {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
  });
  if (!vehicle) {
    throw new ApiError('Vehicle not found', 404, 'NOT_FOUND');
  }
  if (orgId && vehicle.orgId !== orgId) {
    throw new ApiError('Vehicle not found', 404, 'NOT_FOUND');
  }
  return vehicle;
}

export async function createVehicle(data: CreateVehicleInput) {
  const vehicle = await prisma.vehicle.create({
    data: {
      orgId: data.orgId,
      make: data.make,
      model: data.model,
      vin: data.vin ?? null,
      registration: data.registration ?? null,
      mileage: data.mileage ?? 0,
      purchaseDate: data.purchaseDate ?? null,
      status: data.status ?? 'ACTIVE',
    },
  });
  return vehicle;
}

export async function updateVehicle(
  id: string,
  orgId: string | null,
  data: UpdateVehicleInput
) {
  await getVehicleById(id, orgId);
  const vehicle = await prisma.vehicle.update({
    where: { id },
    data: {
      ...(data.make != null && { make: data.make }),
      ...(data.model != null && { model: data.model }),
      ...(data.vin !== undefined && { vin: data.vin || null }),
      ...(data.registration !== undefined && { registration: data.registration || null }),
      ...(data.mileage != null && { mileage: data.mileage }),
      ...(data.purchaseDate !== undefined && { purchaseDate: data.purchaseDate ?? null }),
      ...(data.status != null && { status: data.status }),
    },
  });
  return vehicle;
}

export async function deleteVehicle(id: string, orgId: string | null) {
  await getVehicleById(id, orgId);
  await prisma.vehicle.delete({
    where: { id },
  });
  return { ok: true };
}
