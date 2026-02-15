import { prisma } from '../infrastructure/db.js';
import { ApiError } from '../utils/ApiError.js';

export interface CreateFuelRecordInput {
  orgId: string;
  vehicleId: string;
  tripId?: string;
  amountLiters: number;
  costCents?: number;
  recordedAt?: Date;
  notes?: string;
}

export async function listFuelRecords(orgId: string | null) {
  if (!orgId) return [];
  return prisma.fuelRecord.findMany({
    where: { orgId },
    orderBy: { recordedAt: 'desc' },
    include: {
      vehicle: { select: { id: true, make: true, model: true } },
      trip: { select: { id: true, startAt: true } },
    },
  });
}

export async function getFuelRecordById(id: string, orgId: string | null) {
  const record = await prisma.fuelRecord.findUnique({
    where: { id },
    include: { vehicle: true, trip: true },
  });
  if (!record) {
    throw new ApiError('Fuel record not found', 404, 'NOT_FOUND');
  }
  if (orgId && record.orgId !== orgId) {
    throw new ApiError('Fuel record not found', 404, 'NOT_FOUND');
  }
  return record;
}

export async function createFuelRecord(data: CreateFuelRecordInput) {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
  if (!vehicle || vehicle.orgId !== data.orgId) {
    throw new ApiError('Vehicle not found', 400, 'VALIDATION');
  }
  if (data.tripId) {
    const trip = await prisma.trip.findUnique({ where: { id: data.tripId } });
    if (!trip || trip.orgId !== data.orgId) {
      throw new ApiError('Trip not found', 400, 'VALIDATION');
    }
  }
  return prisma.fuelRecord.create({
    data: {
      orgId: data.orgId,
      vehicleId: data.vehicleId,
      tripId: data.tripId ?? null,
      amountLiters: data.amountLiters,
      costCents: data.costCents ?? null,
      recordedAt: data.recordedAt ?? new Date(),
      notes: data.notes ?? null,
    },
    include: {
      vehicle: { select: { id: true, make: true, model: true } },
      trip: { select: { id: true } },
    },
  });
}

export async function deleteFuelRecord(id: string, orgId: string | null) {
  await getFuelRecordById(id, orgId);
  await prisma.fuelRecord.delete({ where: { id } });
  return { ok: true };
}
