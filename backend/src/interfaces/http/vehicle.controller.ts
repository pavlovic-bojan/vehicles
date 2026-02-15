import type { Response } from 'express';
import { param, body, validationResult } from 'express-validator';
import type { AuthRequest } from '../../middleware/auth.js';
import { ApiError } from '../../utils/ApiError.js';
import * as vehicleService from '../../usecases/vehicle.service.js';

const VEHICLE_STATUSES = ['ACTIVE', 'PAUSED', 'FROZEN', 'IN_SERVICE'];

export async function list(req: AuthRequest, res: Response): Promise<void> {
  const orgId = req.user?.orgId ?? null;
  const vehicles = await vehicleService.listVehicles(orgId);
  res.json({ data: vehicles });
}

export async function getById(req: AuthRequest, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  const id = req.params.id as string;
  const orgId = req.user?.orgId ?? null;
  const vehicle = await vehicleService.getVehicleById(id, orgId);
  res.json({ data: vehicle });
}

export async function create(req: AuthRequest, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  const orgId = req.user?.orgId ?? null;
  if (!orgId) {
    throw new ApiError('Organization required to create vehicles', 403, 'ORG_REQUIRED');
  }
  const { make, model, vin, registration, mileage, purchaseDate, status } = req.body as {
    make: string;
    model: string;
    vin?: string;
    registration?: string;
    mileage?: number;
    purchaseDate?: string;
    status?: string;
  };
  const vehicle = await vehicleService.createVehicle({
    orgId,
    make,
    model,
    vin,
    registration,
    mileage: mileage != null ? Number(mileage) : undefined,
    purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined,
    status: status && VEHICLE_STATUSES.includes(status) ? (status as 'ACTIVE' | 'PAUSED' | 'FROZEN' | 'IN_SERVICE') : undefined,
  });
  res.status(201).json({ data: vehicle });
}

export async function update(req: AuthRequest, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  const id = req.params.id as string;
  const orgId = req.user?.orgId ?? null;
  const { make, model, vin, registration, mileage, purchaseDate, status } = req.body as {
    make?: string;
    model?: string;
    vin?: string;
    registration?: string;
    mileage?: number;
    purchaseDate?: string;
    status?: string;
  };
  const vehicle = await vehicleService.updateVehicle(id, orgId, {
    make,
    model,
    vin,
    registration,
    mileage: mileage != null ? Number(mileage) : undefined,
    purchaseDate: purchaseDate !== undefined ? (purchaseDate ? new Date(purchaseDate) : null) : undefined,
    status: status && VEHICLE_STATUSES.includes(status) ? (status as 'ACTIVE' | 'PAUSED' | 'FROZEN' | 'IN_SERVICE') : undefined,
  });
  res.json({ data: vehicle });
}

export async function remove(req: AuthRequest, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  const id = req.params.id as string;
  const orgId = req.user?.orgId ?? null;
  await vehicleService.deleteVehicle(id, orgId);
  res.json({ data: { ok: true } });
}
