import crypto from 'crypto';
import type { DocumentEntityType } from '@prisma/client';
import axios from 'axios';
import { prisma } from '../infrastructure/db.js';
import { ApiError } from '../utils/ApiError.js';

export interface CreateDocumentInput {
  orgId: string;
  entityType: DocumentEntityType;
  entityId: string;
  fileName: string;
  fileUrl?: string;
  contentHash?: string;
  mimeType?: string;
  uploadedBy?: string;
}

export async function listDocuments(orgId: string | null, entityType?: DocumentEntityType, entityId?: string) {
  if (!orgId) return [];
  return prisma.document.findMany({
    where: {
      orgId,
      ...(entityType && { entityType }),
      ...(entityId && { entityId }),
    },
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function getDocumentById(id: string, orgId: string | null) {
  const doc = await prisma.document.findUnique({
    where: { id },
    include: { user: { select: { id: true, name: true } } },
  });
  if (!doc) {
    throw new ApiError('Document not found', 404, 'NOT_FOUND');
  }
  if (orgId && doc.orgId !== orgId) {
    throw new ApiError('Document not found', 404, 'NOT_FOUND');
  }
  return doc;
}

export async function createDocument(data: CreateDocumentInput) {
  return prisma.document.create({
    data: {
      orgId: data.orgId,
      entityType: data.entityType,
      entityId: data.entityId,
      fileName: data.fileName,
      fileUrl: data.fileUrl ?? null,
      contentHash: data.contentHash ?? null,
      mimeType: data.mimeType ?? null,
      uploadedBy: data.uploadedBy ?? null,
    },
    include: { user: { select: { id: true, name: true } } },
  });
}

export async function deleteDocument(id: string, orgId: string | null) {
  await getDocumentById(id, orgId);
  await prisma.document.delete({ where: { id } });
  return { ok: true };
}

export interface VerifyIntegrityResult {
  ok: boolean;
  tampered?: boolean;
  message: string;
}

export async function verifyDocumentIntegrity(
  id: string,
  orgId: string | null,
  userId?: string
): Promise<VerifyIntegrityResult> {
  const doc = await getDocumentById(id, orgId);
  if (!doc.contentHash) {
    await prisma.documentIntegrityLog.create({
      data: { documentId: id, passed: false, message: 'No hash stored', userId: userId ?? null },
    });
    return { ok: false, message: 'No content hash stored for this document. Integrity cannot be verified.' };
  }
  if (!doc.fileUrl) {
    await prisma.documentIntegrityLog.create({
      data: { documentId: id, passed: false, message: 'No file URL', userId: userId ?? null },
    });
    return { ok: false, message: 'No file URL. Cannot fetch file to verify.' };
  }
  try {
    const response = await axios.get(doc.fileUrl, { responseType: 'arraybuffer', timeout: 30_000 });
    const buffer = Buffer.from(response.data);
    const computedHash = crypto.createHash('sha256').update(buffer).digest('hex');
    const passed = computedHash.toLowerCase() === doc.contentHash.toLowerCase();
    await prisma.documentIntegrityLog.create({
      data: {
        documentId: id,
        passed,
        message: passed ? 'Hash matches' : 'Hash mismatch - file may have been modified',
        userId: userId ?? null,
      },
    });
    if (passed) {
      return { ok: true, tampered: false, message: 'File integrity verified. Hash matches.' };
    }
    return { ok: true, tampered: true, message: 'Integrity check failed. File may have been modified (tampering detected).' };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch file';
    await prisma.documentIntegrityLog.create({
      data: { documentId: id, passed: false, message, userId: userId ?? null },
    });
    return { ok: false, message: `Could not verify: ${message}` };
  }
}
