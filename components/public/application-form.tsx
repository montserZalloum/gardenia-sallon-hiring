"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DynamicField } from "@/components/public/dynamic-field";
import { buildApplicationValidator } from "@/lib/validation";
import { MAX_FILE_BYTES, ALLOWED_FILE_MIMES } from "@/lib/field-types";
import type { Field } from "@/lib/types";

interface ApplicationFormProps {
  jobId: string;
  fields: Field[];
}

type FormValues = Record<string, unknown>;

export function ApplicationForm({ jobId, fields }: ApplicationFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});

  const validate = useMemo(() => buildApplicationValidator(), []);

  const defaultValues = useMemo<FormValues>(() => {
    const v: FormValues = {};
    for (const f of fields) {
      if (f.type === "checkbox") v[f.id] = false;
      else if (f.type === "checkbox-group") v[f.id] = [];
      else if (f.type === "file") v[f.id] = null;
      else v[f.id] = "";
    }
    return v;
  }, [fields]);

  const form = useForm<FormValues>({ defaultValues });

  async function onSubmit(values: FormValues) {
    setServerErrors({});
    const errors: Record<string, string> = {};

    for (const field of fields) {
      const value = values[field.id];
      if (field.type === "file") {
        const file = value instanceof File ? value : null;
        if (field.required && !file) {
          errors[field.id] = `${field.label} مطلوب`;
        } else if (file) {
          if (file.size > MAX_FILE_BYTES) {
            errors[field.id] = `الملف "${file.name}" يتجاوز 3 ميجا`;
          } else if (!ALLOWED_FILE_MIMES.includes(file.type)) {
            errors[field.id] = "نوع الملف غير مسموح";
          }
        }
        continue;
      }
      const err = validate(field, value);
      if (err) errors[field.id] = err;
    }

    if (Object.keys(errors).length > 0) {
      for (const [k, v] of Object.entries(errors)) {
        form.setError(k, { type: "validate", message: v });
      }
      toast.error("بعض الحقول تحتاج لمراجعة");
      return;
    }

    const fd = new FormData();
    for (const field of fields) {
      const value = values[field.id];
      if (field.type === "file") {
        if (value instanceof File) fd.append(field.id, value);
      } else if (field.type === "checkbox-group") {
        if (Array.isArray(value)) {
          for (const v of value) fd.append(field.id, String(v));
        }
      } else if (field.type === "checkbox") {
        fd.append(field.id, value ? "true" : "false");
      } else if (value !== null && value !== undefined && value !== "") {
        fd.append(field.id, String(value));
      }
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}/applications`, {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 410) {
          toast.error("هذه الوظيفة لم تعد متاحة");
          router.push("/");
          return;
        }
        if (data?.fieldErrors) {
          setServerErrors(data.fieldErrors);
          for (const [k, v] of Object.entries(
            data.fieldErrors as Record<string, string>
          )) {
            form.setError(k, { type: "server", message: v });
          }
          toast.error("بعض الحقول تحتاج لمراجعة");
          return;
        }
        toast.error("تعذّر إرسال الطلب، حاولي لاحقاً");
        return;
      }
      router.push(`/jobs/${jobId}/success`);
    } catch (err) {
      console.error(err);
      toast.error("تعذّر الاتصال بالخادم");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-5"
      noValidate
    >
      {fields.map((f) => {
        const error =
          (form.formState.errors[f.id]?.message as string | undefined) ??
          serverErrors[f.id];
        return (
          <DynamicField
            key={f.id}
            field={f}
            control={form.control}
            error={error}
          />
        );
      })}

      <Button
        type="submit"
        size="lg"
        disabled={submitting}
        className="w-full rounded-2xl text-base h-12"
      >
        {submitting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            جاري الإرسال...
          </>
        ) : (
          <>
            <Send className="size-4" />
            إرسال الطلب
          </>
        )}
      </Button>
    </form>
  );
}
