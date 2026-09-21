/**
 * File uploads (CC-02).
 *
 * The bytes never pass through our backend. It signs a short-lived URL scoped
 * to one object, the browser PUTs straight to Supabase Storage, and the
 * resulting attachment id is handed to whatever form the file belongs to.
 *
 * See campus_cure_backend/docs/specs/CC-02-file-storage.md.
 */

import axios from "axios";
import { api } from "./auth";

export type AttachmentEntity =
  | "DOUBT"
  | "ANSWER"
  | "COMPLAINT"
  | "COMPLAINT_RESOLUTION";

/** What a list endpoint returns alongside its entity. No URL — see below. */
export interface AttachmentSummary {
  id: string;
  mimeType: string;
  originalName: string;
  sizeBytes: number;
}

export interface SignedUpload {
  attachmentId: string;
  uploadUrl: string;
  token: string;
  expiresInSeconds: number;
}

/**
 * Mirrors the server's allow-list. This copy exists to fail fast in the picker
 * rather than after a round trip — the server's copy is the one that decides.
 */
export const ALLOWED_MIME: readonly string[] = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "application/pdf",
];

export const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;
export const MAX_ATTACHMENTS_PER_ENTITY = 5;

const errorMessage = (e: unknown, fallback: string): string => {
  if (axios.isAxiosError(e)) {
    return (e.response?.data as { error?: string })?.error ?? fallback;
  }
  return fallback;
};

/** Ask the backend to reserve a slot and sign a URL for it. */
export const signUpload = async (params: {
  entityType: AttachmentEntity;
  file: File;
}): Promise<SignedUpload> => {
  try {
    const { data } = await api.post<SignedUpload>("/uploads/sign", {
      entityType: params.entityType,
      mimeType: params.file.type,
      sizeBytes: params.file.size,
      originalName: params.file.name,
    });
    return data;
  } catch (e) {
    throw new Error(errorMessage(e, "Could not start the upload."));
  }
};

/**
 * PUT the bytes to the signed URL.
 *
 * Deliberately uses a bare axios instance, not `api`: this request goes to
 * Supabase, and attaching our Authorization header would leak a CampusCure
 * access token to a third-party host.
 */
export const uploadToSignedUrl = async (
  uploadUrl: string,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<void> => {
  try {
    await axios.put(uploadUrl, file, {
      headers: { "Content-Type": file.type },
      onUploadProgress: (event) => {
        if (!onProgress || !event.total) return;
        onProgress(Math.round((event.loaded / event.total) * 100));
      },
    });
  } catch {
    throw new Error("Upload failed. Please check your connection.");
  }
};

/** Sign, then upload. Returns the attachment id the form should submit. */
export const uploadFile = async (
  entityType: AttachmentEntity,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<string> => {
  const signed = await signUpload({ entityType, file });
  await uploadToSignedUrl(signed.uploadUrl, file, onProgress);
  return signed.attachmentId;
};

export interface DownloadTarget extends AttachmentSummary {
  url: string;
  expiresInSeconds: number;
}

/**
 * Mint a signed download URL.
 *
 * Called at render time and never cached beyond the URL's own lifetime: these
 * expire in minutes, so a URL held in a query cache would be dead by the time
 * anyone clicked it.
 */
export const getDownloadUrl = async (
  attachmentId: string,
): Promise<DownloadTarget> => {
  const { data } = await api.get<DownloadTarget>(
    `/attachments/${attachmentId}`,
  );
  return data;
};

/** Client-side pre-check. A courtesy, never the enforcement. */
export const validateFile = (file: File): string | null => {
  if (!ALLOWED_MIME.includes(file.type)) {
    return `${file.name}: unsupported file type. Use JPG, PNG, WebP, HEIC or PDF.`;
  }
  if (file.size > MAX_ATTACHMENT_BYTES) {
    return `${file.name}: larger than ${Math.floor(MAX_ATTACHMENT_BYTES / (1024 * 1024))} MB.`;
  }
  return null;
};
