import type { Response } from 'express';
import { param, body, validationResult } from 'express-validator';
import type { AuthRequest } from '../../middleware/auth.js';
import { ApiError } from '../../utils/ApiError.js';
import * as tripService from '../../usecases/trip.service.js';

const TRIP_STATUSES = ['PRE_TRIP', 'IN_PROGRESS', 'POST_TRIP', 'COMPLETED'];

export async function list(req: AuthRequest, res: Response): Promise<void> {
  const orgId = req.user?.orgId ?? null;
  const trips = await tripService.listTrips(orgId);
  res.json({ data: trips });
}

export async function getById(req: AuthRequest, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  const id = req.params.id as string;
  const orgId = req.user?.orgId ?? null;
  const trip = await tripService.getTripById(id, orgId);
  res.json({ data: trip });
}

export async function create(req: AuthRequest, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  const orgId = req.user?.orgId ?? null;
  if (!orgId) {
    throw new ApiError('Organization required to create trips', 403, 'ORG_REQUIRED');
  }
  const { vehicleId, driverId, startAt, startMileage, status, notes } = req.body as {
    vehicleId: string;
    driverId: string;
    startAt: string;
    startMileage?: number;
    status?: string;
    notes?: string;
  };
  const trip = await tripService.createTrip({
    orgId,
    vehicleId,
    driverId,
    startAt: new Date(startAt),
    startMileage,
    status: status && TRIP_STATUSES.includes(status) ? (status as 'PRE_TRIP' | 'IN_PROGRESS' | 'POST_TRIP' | 'COMPLETED') : undefined,
    notes,
  });
  res.status(201).json({ data: trip });
}

export async function update(req: AuthRequest, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  const id = req.params.id as string;
  const orgId = req.user?.orgId ?? null;
  const { endAt, endMileage, status, notes } = req.body as {
    endAt?: string;
    endMileage?: number;
    status?: string;
    notes?: string;
  };
  const trip = await tripService.updateTrip(id, orgId, {
    endAt: endAt !== undefined ? (endAt ? new Date(endAt) : null) : undefined,
    endMileage: endMileage !== undefined ? endMileage : undefined,
    status: status && TRIP_STATUSES.includes(status) ? (status as 'PRE_TRIP' | 'IN_PROGRESS' | 'POST_TRIP' | 'COMPLETED') : undefined,
    notes: notes !== undefined ? notes : undefined,
  });
  res.json({ data: trip });
}

export async function remove(req: AuthRequest, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  const id = req.params.id as string;
  const orgId = req.user?.orgId ?? null;
  await tripService.deleteTrip(id, orgId);
  res.json({ data: { ok: true } });
}
