import { z } from "zod";
import type { Field, FieldType } from "./types";
import { FIELD_TYPE_ORDER, supportsOptions } from "./field-types";
import { startOfTodayInSalonTZ } from "./dates";

export const fieldSchema = z
  .object({
    id: z.string().min(1),
    type: z.enum(FIELD_TYPE_ORDER as [FieldType, ...FieldType[]]),
    label: z.string().min(1, "اسم الحقل مطلوب").max(120),
    required: z.boolean(),
    placeholder: z.string().max(120).optional(),
    helpText: z.string().max(200).optional(),
    options: z.array(z.string().min(1).max(120)).optional(),
  })
  .refine(
    (f) => {
      if (supportsOptions(f.type)) {
        return Array.isArray(f.options) && f.options.length > 0;
      }
      return true;
    },
    { message: "هذا النوع يتطلب خيار واحد على الأقل", path: ["options"] }
  );

export const jobInputSchema = z.object({
  title: z.string().min(1, "عنوان الوظيفة مطلوب").max(200),
  description: z.string().min(1, "الوصف مطلوب").max(5000),
  expiryDate: z
    .string()
    .nullable()
    .refine(
      (v) => {
        if (v === null || v === "") return true;
        const d = new Date(v);
        if (Number.isNaN(d.getTime())) return false;
        return d >= startOfTodayInSalonTZ();
      },
      { message: "يجب أن يكون التاريخ في المستقبل" }
    ),
  published: z.boolean().optional().default(true),
  fields: z.array(fieldSchema).min(1, "أضيفي حقلاً واحداً على الأقل"),
});

export type JobInput = z.infer<typeof jobInputSchema>;

export const updateJobSchema = z.object({
  published: z.boolean(),
});

export const loginSchema = z.object({
  email: z.string().email("صيغة بريد إلكتروني غير صحيحة"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

export const updateApplicationSchema = z
  .object({
    status: z.enum(["new", "contacted", "accepted", "rejected"]).optional(),
    read: z.boolean().optional(),
    notes: z.string().max(5000).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "لا يوجد ما يُحدَّث" });

const phoneRegex = /^[+\d\s\-()]{6,20}$/;

export function buildApplicationValidator() {
  function validateField(field: Field, value: unknown): string | null {
    const isEmpty =
      value === undefined ||
      value === null ||
      value === "" ||
      (Array.isArray(value) && value.length === 0);

    if (field.required && isEmpty) {
      return `${field.label} مطلوب`;
    }
    if (isEmpty) return null;

    switch (field.type) {
      case "email":
        if (typeof value !== "string" || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) {
          return "صيغة بريد إلكتروني غير صحيحة";
        }
        return null;
      case "phone":
        if (typeof value !== "string" || !phoneRegex.test(value)) {
          return "صيغة رقم الهاتف غير صحيحة";
        }
        return null;
      case "url":
        if (typeof value !== "string") return "صيغة رابط غير صحيحة";
        try {
          const u = new URL(value);
          if (u.protocol !== "http:" && u.protocol !== "https:") {
            return "الرابط يجب أن يبدأ بـ http أو https";
          }
        } catch {
          return "صيغة رابط غير صحيحة";
        }
        return null;
      case "number":
        if (typeof value !== "string" && typeof value !== "number") {
          return "يجب إدخال رقم";
        }
        if (Number.isNaN(Number(value))) return "يجب إدخال رقم";
        return null;
      case "date":
        if (typeof value !== "string") return "تاريخ غير صحيح";
        if (Number.isNaN(new Date(value).getTime())) return "تاريخ غير صحيح";
        return null;
      case "select":
      case "radio":
        if (typeof value !== "string") return "اختيار غير صحيح";
        if (!field.options?.includes(value)) return "اختيار غير صحيح";
        return null;
      case "checkbox-group":
        if (!Array.isArray(value)) return "اختيار غير صحيح";
        for (const v of value) {
          if (!field.options?.includes(v)) return "اختيار غير صحيح";
        }
        return null;
      case "checkbox":
        if (typeof value !== "boolean") return "قيمة غير صحيحة";
        if (field.required && !value) return `${field.label} مطلوب`;
        return null;
      case "text":
      case "textarea":
        if (typeof value !== "string") return "قيمة غير صحيحة";
        return null;
      case "file":
        return null; // ملف يُتحقق منه في طبقة multipart
      default:
        return null;
    }
  }
  return validateField;
}
