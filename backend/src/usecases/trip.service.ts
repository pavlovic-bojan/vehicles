import type { TripStatus } from '@prisma/client';
import { prisma } from '../infrastructure/db.js';
import { ApiError } from '../utils/ApiError.js';

export interface CreateTripInput {
  orgId: string;
  vehicleId: string;
  driverId: string;
  startAt: Date;
  startMileage?: number;
  status?: TripStatus;
  notes?: string;
}

export interface UpdateTripInput {
  endAt?: Date | null;
  endMileage?: number | null;
  status?: TripStatus;
  notes?: string | null;
}

export async function listTrips(orgId: string | null) {
  if (!orgId) return [];
  return prisma.trip.findMany({
    where: { orgId },
    orderBy: { startAt: 'desc' },
    include: {
      vehicle: { select: { id: true, make: true, model: true, registration: true } },
      driver: { select: { id: true, name: true } },
    },
  });
}

export async function getTripById(id: string, orgId: string | null) {
  const trip = await prisma.trip.findUnique({
    where: { id },
    include: {
      vehicle: true,
      driver: true,
    },
  });
  if (!trip) {
    throw new ApiError('Trip not found', 404, 'NOT_FOUND');
  }
  if (orgId && trip.orgId !== orgId) {
    throw new ApiError('Trip not found', 404, 'NOT_FOUND');
  }
  return trip;
}

export async function createTrip(data: CreateTripInput) {
  const [vehicle, driver] = await Promise.all([
    prisma.vehicle.findUnique({ where: { id: data.vehicleId } }),
    prisma.driver.findUnique({ where: { id: data.driverId } }),
  ]);
  if (!vehicle || vehicle.orgId !== data.orgId) {
    throw new ApiError('Vehicle not found', 400, 'VALIDATION');
  }
  if (!driver || driver.orgId !== data.orgId) {
    throw new ApiError('Driver not found', 400, 'VALIDATION');
  }
  return prisma.trip.create({
    data: {
      orgId: data.orgId,
      vehicleId: data.vehicleId,
      driverId: data.driverId,
      startAt: data.startAt,
      startMileage: data.startMileage ?? 0,
      status: data.status ?? 'PRE_TRIP',
      notes: data.notes ?? null,
    },
    include: {
      vehicle: { select: { id: true, make: true, model: true } },
      driver: { select: { id: true, name: true } },
    },
  });
}

export async function updateTrip(
  id: string,
  orgId: string | null,
  data: UpdateTripInput
) {
  await getTripById(id, orgId);
  return prisma.trip.update({
    where: { id },
    data: {
      ...(data.endAt !== undefined && { endAt: data.endAt }),
      ...(data.endMileage !== undefined && { endMileage: data.endMileage }),
      ...(data.status != null && { status: data.status }),
      ...(data.notes !== undefined && { notes: data.notes }),
    },
    include: {
      vehicle: { select: { id: true, make: true, model: true } },
      driver: { select: { id: true, name: true } },
    },
  });
}

export async function deleteTrip(id: string, orgId: string | null) {
  await getTripById(id, orgId);
  await prisma.trip.delete({ where: { id } });
  return { ok: true };
}
