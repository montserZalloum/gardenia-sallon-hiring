"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Save, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FieldBuilder, DEFAULT_FIELDS } from "./field-builder";
import type { Field } from "@/lib/types";
import { startOfTodayInSalonTZ } from "@/lib/dates";
import { toast } from "sonner";

function todayISO(offsetDays = 30) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export function JobForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [expiryDate, setExpiryDate] = useState(todayISO(30));
  const [hasExpiry, setHasExpiry] = useState(true);
  const [published, setPublished] = useState(true);
  const [fields, setFields] = useState<Field[]>(DEFAULT_FIELDS);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "عنوان الوظيفة مطلوب";
    if (!description.trim()) e.description = "الوصف مطلوب";
    if (hasExpiry) {
      if (!expiryDate) {
        e.expiryDate = "تاريخ الانتهاء مطلوب";
      } else {
        const d = new Date(expiryDate);
        if (Number.isNaN(d.getTime()) || d < startOfTodayInSalonTZ()) {
          e.expiryDate = "يجب أن يكون التاريخ في المستقبل";
        }
      }
    }
    if (fields.length === 0) {
      e.fields = "أضيفي حقلاً واحداً على الأقل";
    } else {
      for (const f of fields) {
        if (!f.label.trim()) {
          e.fields = "كل الحقول تحتاج اسماً";
          break;
        }
        if (
          (f.type === "select" ||
            f.type === "radio" ||
            f.type === "checkbox-group") &&
          (!f.options || f.options.length === 0)
        ) {
          e.fields = `الحقل "${f.label}" يحتاج خيار واحد على الأقل`;
          break;
        }
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) {
      toast.error("بعض الحقول تحتاج لمراجعة");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          expiryDate: hasExpiry ? expiryDate : null,
          published,
          fields,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data?.issues) {
          toast.error("بيانات غير صحيحة، راجعي الحقول");
        } else {
          toast.error("تعذّر نشر الوظيفة");
        }
        return;
      }
      toast.success("تم نشر الوظيفة 🌸");
      router.replace("/admin");
      router.refresh();
    } catch {
      toast.error("تعذّر الاتصال بالخادم");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <h2 className="mb-5 font-display text-xl text-foreground">
          تفاصيل الوظيفة
        </h2>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">عنوان الوظيفة *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="كوافيرة محترفة"
              aria-invalid={Boolean(errors.title)}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">الوصف *</Label>
            <Textarea
              id="description"
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="اكتبي وصفاً واضحاً للوظيفة، المهام، المتطلبات، ساعات العمل..."
              aria-invalid={Boolean(errors.description)}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description}</p>
            )}
          </div>
          <div className="space-y-3 rounded-2xl border border-border bg-muted/30 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-0.5">
                <Label htmlFor="hasExpiry" className="cursor-pointer">
                  تاريخ انتهاء تلقائي
                </Label>
                <p className="text-xs text-muted-foreground">
                  أوقفي هذا الخيار إذا أردتِ إغلاق الوظيفة يدوياً بدون تاريخ.
                </p>
              </div>
              <Switch
                id="hasExpiry"
                checked={hasExpiry}
                onCheckedChange={(v) => setHasExpiry(Boolean(v))}
              />
            </div>
            {hasExpiry && (
              <div className="space-y-1.5">
                <Label htmlFor="expiryDate">آخر يوم لاستقبال التقديمات *</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  aria-invalid={Boolean(errors.expiryDate)}
                />
                {errors.expiryDate && (
                  <p className="text-xs text-destructive">{errors.expiryDate}</p>
                )}
              </div>
            )}
          </div>

          <div className="flex items-start justify-between gap-3 rounded-2xl border border-border bg-muted/30 p-4">
            <div className="space-y-0.5">
              <Label htmlFor="published" className="cursor-pointer">
                منشورة
              </Label>
              <p className="text-xs text-muted-foreground">
                لو أوقفتِ هذا الخيار، الوظيفة لن تظهر للمتقدمين ولن تستقبل تقديمات.
              </p>
            </div>
            <Switch
              id="published"
              checked={published}
              onCheckedChange={(v) => setPublished(Boolean(v))}
            />
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <div className="mb-5 flex items-start justify-between gap-2">
          <div>
            <h2 className="font-display text-xl text-foreground">
              حقول التقديم
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              صممي الفورم الذي سيراه المتقدم. يمكنك إضافة وحذف وإعادة ترتيب
              الحقول.
            </p>
          </div>
        </div>
        <FieldBuilder fields={fields} onChange={setFields} />
        {errors.fields && (
          <p className="mt-3 text-xs text-destructive">{errors.fields}</p>
        )}
      </div>

      <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/admin"
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <ArrowRight className="size-4" />
          إلغاء
        </Link>
        <Button
          type="submit"
          size="lg"
          disabled={submitting}
          className="rounded-2xl text-base h-11"
        >
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              جاري النشر...
            </>
          ) : (
            <>
              <Save className="size-4" />
              نشر الوظيفة
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
