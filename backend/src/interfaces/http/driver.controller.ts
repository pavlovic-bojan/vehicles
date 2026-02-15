import type { Response } from 'express';
import { param, body, validationResult } from 'express-validator';
import type { AuthRequest } from '../../middleware/auth.js';
import { ApiError } from '../../utils/ApiError.js';
import * as driverService from '../../usecases/driver.service.js';

const DRIVER_STATUSES = ['ACTIVE', 'PAUSED', 'FROZEN'];

export async function list(req: AuthRequest, res: Response): Promise<void> {
  const orgId = req.user?.orgId ?? null;
  const drivers = await driverService.listDrivers(orgId);
  res.json({ data: drivers });
}

export async function getById(req: AuthRequest, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  const id = req.params.id as string;
  const orgId = req.user?.orgId ?? null;
  const driver = await driverService.getDriverById(id, orgId);
  res.json({ data: driver });
}

export async function create(req: AuthRequest, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  const orgId = req.user?.orgId ?? null;
  if (!orgId) {
    throw new ApiError('Organization required to create drivers', 403, 'ORG_REQUIRED');
  }
  const { name, licenseNumber, licenseExpiry, phone, userId, status } = req.body as {
    name: string;
    licenseNumber?: string;
    licenseExpiry?: string;
    phone?: string;
    userId?: string;
    status?: string;
  };
  const driver = await driverService.createDriver({
    orgId,
    name,
    licenseNumber,
    licenseExpiry: licenseExpiry ? new Date(licenseExpiry) : undefined,
    phone,
    userId,
    status: status && DRIVER_STATUSES.includes(status) ? (status as 'ACTIVE' | 'PAUSED' | 'FROZEN') : undefined,
  });
  res.status(201).json({ data: driver });
}

export async function update(req: AuthRequest, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  const id = req.params.id as string;
  const orgId = req.user?.orgId ?? null;
  const { name, licenseNumber, licenseExpiry, phone, userId, status } = req.body as {
    name?: string;
    licenseNumber?: string;
    licenseExpiry?: string;
    phone?: string;
    userId?: string;
    status?: string;
  };
  const driver = await driverService.updateDriver(id, orgId, {
    name,
    licenseNumber,
    licenseExpiry: licenseExpiry !== undefined ? (licenseExpiry ? new Date(licenseExpiry) : null) : undefined,
    phone,
    userId: userId !== undefined ? userId ?? null : undefined,
    status: status && DRIVER_STATUSES.includes(status) ? (status as 'ACTIVE' | 'PAUSED' | 'FROZEN') : undefined,
  });
  res.json({ data: driver });
}

export async function remove(req: AuthRequest, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  const id = req.params.id as string;
  const orgId = req.user?.orgId ?? null;
  await driverService.deleteDriver(id, orgId);
  res.json({ data: { ok: true } });
}
