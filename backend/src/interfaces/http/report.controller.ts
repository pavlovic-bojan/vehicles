import type { Response } from 'express';
import type { AuthRequest } from '../../middleware/auth.js';
import * as reportService from '../../usecases/report.service.js';

export async function getSummary(req: AuthRequest, res: Response): Promise<void> {
  const orgId = req.user?.orgId ?? null;
  const summary = await reportService.getSummary(orgId);
  res.json({ data: summary });
}

export async function getFuelReport(req: AuthRequest, res: Response): Promise<void> {
  const orgId = req.user?.orgId ?? null;
  const from = req.query.from ? new Date(String(req.query.from)) : undefined;
  const to = req.query.to ? new Date(String(req.query.to)) : undefined;
  const data = await reportService.getFuelReport(orgId, from, to);
  res.json({ data });
}

export async function getTripsReport(req: AuthRequest, res: Response): Promise<void> {
  const orgId = req.user?.orgId ?? null;
  const from = req.query.from ? new Date(String(req.query.from)) : undefined;
  const to = req.query.to ? new Date(String(req.query.to)) : undefined;
  const data = await reportService.getTripsReport(orgId, from, to);
  res.json({ data });
}
