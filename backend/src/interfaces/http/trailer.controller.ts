import type { Response } from 'express';
import { validationResult } from 'express-validator';
import type { AuthRequest } from '../../middleware/auth.js';
import { ApiError } from '../../utils/ApiError.js';
import * as trailerService from '../../usecases/trailer.service.js';

const TRAILER_STATUSES = ['ACTIVE', 'PAUSED', 'FROZEN', 'IN_SERVICE'];

export async function list(req: AuthRequest, res: Response): Promise<void> {
  const orgId = req.user?.orgId ?? null;
  const trailers = await trailerService.listTrailers(orgId);
  res.json({ data: trailers });
}

export async function getById(req: AuthRequest, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  const id = req.params.id as string;
  const orgId = req.user?.orgId ?? null;
  const trailer = await trailerService.getTrailerById(id, orgId);
  res.json({ data: trailer });
}

export async function create(req: AuthRequest, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  const orgId = req.user?.orgId ?? null;
  if (!orgId) {
    throw new ApiError('Organization required to create trailers', 403, 'ORG_REQUIRED');
  }
  const body = req.body as {
    make: string;
    model: string;
    registration?: string;
    mileage?: number;
    purchaseDate?: string;
    status?: string;
  };
  const trailer = await trailerService.createTrailer({
    orgId,
    make: body.make,
    model: body.model,
    registration: body.registration,
    mileage: body.mileage != null ? Number(body.mileage) : undefined,
    purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : undefined,
    status: body.status && TRAILER_STATUSES.includes(body.status)
      ? (body.status as 'ACTIVE' | 'PAUSED' | 'FROZEN' | 'IN_SERVICE')
      : undefined,
  });
  res.status(201).json({ data: trailer });
}

export async function update(req: AuthRequest, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  const id = req.params.id as string;
  const orgId = req.user?.orgId ?? null;
  const body = req.body as {
    make?: string;
    model?: string;
    registration?: string;
    mileage?: number;
    purchaseDate?: string;
    status?: string;
  };
  const trailer = await trailerService.updateTrailer(id, orgId, {
    make: body.make,
    model: body.model,
    registration: body.registration,
    mileage: body.mileage != null ? Number(body.mileage) : undefined,
    purchaseDate: body.purchaseDate !== undefined ? (body.purchaseDate ? new Date(body.purchaseDate) : null) : undefined,
    status: body.status && TRAILER_STATUSES.includes(body.status)
      ? (body.status as 'ACTIVE' | 'PAUSED' | 'FROZEN' | 'IN_SERVICE')
      : undefined,
  });
  res.json({ data: trailer });
}

export async function remove(req: AuthRequest, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  const id = req.params.id as string;
  const orgId = req.user?.orgId ?? null;
  await trailerService.deleteTrailer(id, orgId);
  res.json({ data: { ok: true } });
}
