import type { Response } from 'express';
import { param, body, validationResult } from 'express-validator';
import type { AuthRequest } from '../../middleware/auth.js';
import { ApiError } from '../../utils/ApiError.js';
import * as locationService from '../../usecases/location.service.js';

export async function list(req: AuthRequest, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  const orgId = req.user?.orgId ?? null;
  const type = req.query.type as 'PARKING' | 'SERVICE' | undefined;
  const locations = await locationService.listLocations(orgId, type);
  res.json({ data: locations });
}

export async function getById(req: AuthRequest, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  const id = req.params.id as string;
  const orgId = req.user?.orgId ?? null;
  const location = await locationService.getLocationById(id, orgId);
  res.json({ data: location });
}

export async function create(req: AuthRequest, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  const orgId = req.user?.orgId ?? null;
  if (!orgId) {
    throw new ApiError('Organization required to create locations', 403, 'ORG_REQUIRED');
  }
  const { name, type, address, status } = req.body as {
    name: string;
    type: 'PARKING' | 'SERVICE';
    address?: string;
    status?: string;
  };
  const location = await locationService.createLocation({
    orgId,
    name,
    type,
    address,
    status: status as 'ACTIVE' | 'PAUSED' | 'FROZEN' | undefined,
  });
  res.status(201).json({ data: location });
}

export async function update(req: AuthRequest, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  const id = req.params.id as string;
  const orgId = req.user?.orgId ?? null;
  const { name, type, address, status } = req.body as {
    name?: string;
    type?: 'PARKING' | 'SERVICE';
    address?: string;
    status?: string;
  };
  const location = await locationService.updateLocation(id, orgId, {
    name,
    type,
    address,
    status: status as 'ACTIVE' | 'PAUSED' | 'FROZEN' | undefined,
  });
  res.json({ data: location });
}

export async function remove(req: AuthRequest, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  const id = req.params.id as string;
  const orgId = req.user?.orgId ?? null;
  await locationService.deleteLocation(id, orgId);
  res.json({ data: { ok: true } });
}
