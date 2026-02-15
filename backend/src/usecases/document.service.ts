import type { DocumentEntityType } from '@prisma/client';
import { prisma } from '../infrastructure/db.js';
import { ApiError } from '../utils/ApiError.js';

export interface CreateDocumentInput {
  orgId: string;
  entityType: DocumentEntityType;
  entityId: string;
  fileName: string;
  fileUrl?: string;
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
