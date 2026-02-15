import type { Response } from 'express';
import { param, body, query, validationResult } from 'express-validator';
import type { AuthRequest } from '../../middleware/auth.js';
import { ApiError } from '../../utils/ApiError.js';
import * as documentService from '../../usecases/document.service.js';

export async function list(req: AuthRequest, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  const orgId = req.user?.orgId ?? null;
  const entityType = req.query.entityType as 'TRIP' | 'VEHICLE' | 'DRIVER' | undefined;
  const entityId = req.query.entityId as string | undefined;
  const docs = await documentService.listDocuments(orgId, entityType, entityId);
  res.json({ data: docs });
}

export async function getById(req: AuthRequest, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  const id = req.params.id as string;
  const orgId = req.user?.orgId ?? null;
  const doc = await documentService.getDocumentById(id, orgId);
  res.json({ data: doc });
}

export async function create(req: AuthRequest, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  const orgId = req.user?.orgId ?? null;
  if (!orgId) {
    throw new ApiError('Organization required to create documents', 403, 'ORG_REQUIRED');
  }
  const { entityType, entityId, fileName, fileUrl, mimeType } = req.body as {
    entityType: 'TRIP' | 'VEHICLE' | 'DRIVER';
    entityId: string;
    fileName: string;
    fileUrl?: string;
    mimeType?: string;
  };
  const doc = await documentService.createDocument({
    orgId,
    entityType,
    entityId,
    fileName,
    fileUrl,
    mimeType,
    uploadedBy: req.user?.id,
  });
  res.status(201).json({ data: doc });
}

export async function remove(req: AuthRequest, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  const id = req.params.id as string;
  const orgId = req.user?.orgId ?? null;
  await documentService.deleteDocument(id, orgId);
  res.json({ data: { ok: true } });
}
