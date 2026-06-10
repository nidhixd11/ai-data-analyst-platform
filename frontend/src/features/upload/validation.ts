/**
 * File validation logic for the upload zone.
 * Kept separate from the UI component so it can be tested independently.
 */

/** Maximum upload size in bytes (50 MB, matches backend setting). */
export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

/** Allowed file extensions (lowercase, with leading dot). */
export const ALLOWED_EXTENSIONS = [".csv", ".xlsx", ".xls"] as const;

export type ValidationError =
  | "EXTENSION_NOT_ALLOWED"
  | "FILE_TOO_LARGE"
  | "FILE_EMPTY";

export interface ValidationResult {
  ok: boolean;
  error?: ValidationError;
  message?: string;
}

/**
 * Validate a file against our upload rules.
 * Returns { ok: true } if the file passes, otherwise an error code + human-readable message.
 */
export function validateFile(file: File): ValidationResult {
  // Check extension (case-insensitive).
  const name = file.name.toLowerCase();
  const matched = ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext));
  if (!matched) {
    return {
      ok: false,
      error: "EXTENSION_NOT_ALLOWED",
      message: `Unsupported file type. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}.`,
    };
  }

  // Check size.
  if (file.size === 0) {
    return {
      ok: false,
      error: "FILE_EMPTY",
      message: "This file is empty.",
    };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      ok: false,
      error: "FILE_TOO_LARGE",
      message: `File is ${sizeMb} MB. Maximum allowed is 50 MB.`,
    };
  }

  return { ok: true };
}

/** Format file size in a human-readable way (e.g. "1.4 MB"). */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
