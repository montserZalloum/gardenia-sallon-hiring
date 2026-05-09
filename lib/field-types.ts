import type { FieldType } from "./types";

export const MAX_FILE_BYTES = 3 * 1024 * 1024;

export const ALLOWED_FILE_MIMES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export interface FieldTypeMeta {
  label: string;
  supportsOptions: boolean;
  supportsPlaceholder: boolean;
}

export const FIELD_TYPES: Record<FieldType, FieldTypeMeta> = {
  text: { label: "نص قصير", supportsOptions: false, supportsPlaceholder: true },
  textarea: { label: "نص طويل", supportsOptions: false, supportsPlaceholder: true },
  email: { label: "بريد إلكتروني", supportsOptions: false, supportsPlaceholder: true },
  phone: { label: "هاتف", supportsOptions: false, supportsPlaceholder: true },
  url: { label: "رابط", supportsOptions: false, supportsPlaceholder: true },
  number: { label: "رقم", supportsOptions: false, supportsPlaceholder: true },
  date: { label: "تاريخ", supportsOptions: false, supportsPlaceholder: false },
  select: { label: "قائمة منسدلة", supportsOptions: true, supportsPlaceholder: true },
  radio: { label: "اختيار واحد", supportsOptions: true, supportsPlaceholder: false },
  "checkbox-group": { label: "اختيارات متعددة", supportsOptions: true, supportsPlaceholder: false },
  checkbox: { label: "موافقة (مربع واحد)", supportsOptions: false, supportsPlaceholder: false },
  file: { label: "رفع ملف", supportsOptions: false, supportsPlaceholder: false },
};

export const FIELD_TYPE_ORDER: FieldType[] = [
  "text",
  "textarea",
  "email",
  "phone",
  "url",
  "number",
  "date",
  "select",
  "radio",
  "checkbox-group",
  "checkbox",
  "file",
];

export function isFileField(type: FieldType): boolean {
  return type === "file";
}

export function supportsOptions(type: FieldType): boolean {
  return FIELD_TYPES[type].supportsOptions;
}
