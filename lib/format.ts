import { formatDistanceToNow, format } from "date-fns";
import { ar } from "date-fns/locale";
import type { ApplicationStatus } from "./types";

export function formatRelativeAr(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: ar });
}

export function formatDateAr(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "d MMMM yyyy", { locale: ar });
}

export function formatDateShortAr(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "dd/MM/yyyy", { locale: ar });
}

export const STATUS_LABEL_AR: Record<ApplicationStatus, string> = {
  new: "جديد",
  contacted: "تم التواصل",
  accepted: "مقبول",
  rejected: "مرفوض",
};

export const STATUS_OPTIONS: ApplicationStatus[] = [
  "new",
  "contacted",
  "accepted",
  "rejected",
];

export function truncate(text: string, max = 150): string {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "…";
}
