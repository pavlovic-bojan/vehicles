import { api } from '../boot/axios';

export type DocumentEntityType = 'TRIP' | 'VEHICLE' | 'DRIVER';

export interface Document {
  id: string;
  orgId: string;
  entityType: DocumentEntityType;
  entityId: string;
  fileName: string;
  fileUrl: string | null;
  contentHash: string | null;
  mimeType: string | null;
  uploadedBy: string | null;
  createdAt: string;
  user?: { id: string; name: string; email?: string } | null;
}

export interface CreateDocumentPayload {
  entityType: DocumentEntityType;
  entityId: string;
  fileName: string;
  fileUrl?: string;
  contentHash?: string;
  mimeType?: string;
}

export interface VerifyIntegrityResult {
  ok: boolean;
  tampered?: boolean;
  message: string;
}

export const documentsApi = {
  list: (params?: { entityType?: DocumentEntityType; entityId?: string }) =>
    api.get<{ data: Document[] }>('/api/documents', { params }),

  getById: (id: string) =>
    api.get<{ data: Document }>(`/api/documents/${id}`),

  create: (payload: CreateDocumentPayload) =>
    api.post<{ data: Document }>('/api/documents', payload),

  delete: (id: string) =>
    api.delete<{ data: { ok: boolean } }>(`/api/documents/${id}`),

  verifyIntegrity: (id: string) =>
    api.get<{ data: VerifyIntegrityResult }>(`/api/documents/${id}/verify-integrity`),
};
