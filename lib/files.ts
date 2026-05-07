import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { ALLOWED_FILE_MIMES, MAX_FILE_BYTES } from "./field-types";
import type { FileValue } from "./types";

export const UPLOADS_ROOT = path.join(process.cwd(), "uploads");

function sanitizeName(name: string): string {
  const trimmed = name.replace(/[^A-Za-z0-9._\-؀-ۿ]/g, "_").slice(-64);
  return trimmed.length > 0 ? trimmed : "file";
}

export async function saveUpload(
  applicationId: string,
  file: File
): Promise<FileValue> {
  if (file.size > MAX_FILE_BYTES) {
    throw new Error(`الملف "${file.name}" يتجاوز الحد الأقصى (3 ميجا)`);
  }
  if (!ALLOWED_FILE_MIMES.includes(file.type)) {
    throw new Error(`نوع الملف "${file.type}" غير مسموح`);
  }
  const dir = path.join(UPLOADS_ROOT, applicationId);
  await fs.mkdir(dir, { recursive: true });
  const safe = sanitizeName(file.name);
  const storedAs = `${randomUUID()}-${safe}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(dir, storedAs), buffer);
  return {
    _type: "file",
    name: file.name,
    size: file.size,
    mime: file.type,
    storedAs,
  };
}

export async function deleteApplicationFiles(
  applicationId: string
): Promise<void> {
  const dir = path.join(UPLOADS_ROOT, applicationId);
  await fs.rm(dir, { recursive: true, force: true });
}

export function getStoredFilePath(
  applicationId: string,
  storedAs: string
): string {
  const dir = path.join(UPLOADS_ROOT, applicationId);
  const target = path.join(dir, storedAs);
  const resolved = path.resolve(target);
  const expectedRoot = path.resolve(dir) + path.sep;
  if (!resolved.startsWith(expectedRoot)) {
    throw new Error("INVALID_PATH");
  }
  return resolved;
}

export async function readStoredFile(
  applicationId: string,
  storedAs: string
): Promise<{ buffer: Buffer; size: number }> {
  const filePath = getStoredFilePath(applicationId, storedAs);
  const buffer = await fs.readFile(filePath);
  return { buffer, size: buffer.byteLength };
}

export { isFileValue } from "./types";
