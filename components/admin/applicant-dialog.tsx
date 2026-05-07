"use client";

import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { Trash2, Download, Loader2, FileText, Check } from "lucide-react";
import {
  formatDateAr,
  formatRelativeAr,
  STATUS_LABEL_AR,
  STATUS_OPTIONS,
} from "@/lib/format";
import {
  isFileValue,
  type ApplicationStatus,
  type Field,
  type FieldValue,
  type SerializedApplication,
} from "@/lib/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ApplicantDialogProps {
  applicationId: string | null;
  fields: Field[];
  onClose: () => void;
  onUpdate: (a: SerializedApplication) => void;
  onDelete: (id: string) => void;
}

export function ApplicantDialog({
  applicationId,
  fields,
  onClose,
  onUpdate,
  onDelete,
}: ApplicantDialogProps) {
  const [application, setApplication] = useState<SerializedApplication | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [notesValue, setNotesValue] = useState("");
  const [notesSaved, setNotesSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const notesTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!applicationId) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    (async () => {
      try {
        const res = await fetch(`/api/applications/${applicationId}`);
        if (!res.ok) {
          toast.error("تعذّر تحميل بيانات المتقدم");
          if (!cancelled) onClose();
          return;
        }
        const json = (await res.json()) as { application: SerializedApplication };
        if (cancelled) return;
        setApplication(json.application);
        setNotesValue(json.application.notes ?? "");
        if (!json.application.read) {
          fetch(`/api/applications/${applicationId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ read: true }),
          })
            .then((r) => (r.ok ? r.json() : null))
            .then((data) => {
              if (cancelled || !data?.application) return;
              setApplication(data.application);
              onUpdate(data.application);
            })
            .catch(() => undefined);
        }
      } catch {
        toast.error("تعذّر الاتصال بالخادم");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId]);

  async function changeStatus(next: ApplicationStatus) {
    if (!application) return;
    setSavingStatus(true);
    try {
      const res = await fetch(`/api/applications/${application.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        toast.error("تعذّر تحديث الحالة");
        return;
      }
      const json = (await res.json()) as { application: SerializedApplication };
      setApplication(json.application);
      onUpdate(json.application);
      toast.success("تم تحديث الحالة");
    } catch {
      toast.error("تعذّر الاتصال بالخادم");
    } finally {
      setSavingStatus(false);
    }
  }

  function onNotesChange(value: string) {
    setNotesValue(value);
    setNotesSaved(false);
    if (notesTimer.current) clearTimeout(notesTimer.current);
    notesTimer.current = setTimeout(async () => {
      if (!application) return;
      try {
        const res = await fetch(`/api/applications/${application.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notes: value }),
        });
        if (!res.ok) {
          toast.error("تعذّر حفظ الملاحظات");
          return;
        }
        const json = (await res.json()) as { application: SerializedApplication };
        setApplication(json.application);
        onUpdate(json.application);
        setNotesSaved(true);
        setTimeout(() => setNotesSaved(false), 1500);
      } catch {
        toast.error("تعذّر الاتصال بالخادم");
      }
    }, 600);
  }

  async function onConfirmDelete() {
    if (!application) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/applications/${application.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        toast.error("تعذّر الحذف");
        return;
      }
      toast.success("تم الحذف");
      onDelete(application.id);
      setConfirmDelete(false);
      onClose();
    } catch {
      toast.error("تعذّر الاتصال بالخادم");
    } finally {
      setDeleting(false);
    }
  }

  const open = applicationId !== null;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {application
              ? extractName(application.data, fields)
              : "تفاصيل المتقدم"}
          </DialogTitle>
          {application && (
            <p className="text-xs text-muted-foreground">
              قُدِّم {formatRelativeAr(application.submittedAt)}
            </p>
          )}
        </DialogHeader>

        {loading || !application ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : (
          <div className="space-y-5 max-h-[70vh] overflow-y-auto pe-1">
            <section className="space-y-2">
              <label className="text-xs text-muted-foreground">الحالة</label>
              <Select
                value={application.status}
                onValueChange={(v) => changeStatus(v as ApplicationStatus)}
                disabled={savingStatus}
              >
                <SelectTrigger className="w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABEL_AR[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </section>

            <Separator />

            <section className="space-y-3">
              <h3 className="font-medium text-foreground">📋 البيانات</h3>
              <dl className="grid gap-3 text-sm">
                {fields.map((field) => (
                  <FieldRow
                    key={field.id}
                    field={field}
                    value={application.data?.[field.id] as FieldValue}
                    applicationId={application.id}
                  />
                ))}
              </dl>
            </section>

            <Separator />

            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-foreground">📝 الملاحظات</h3>
                {notesSaved && (
                  <span className="inline-flex items-center gap-1 text-xs text-success-foreground">
                    <Check className="size-3" />
                    تم الحفظ
                  </span>
                )}
              </div>
              <Textarea
                rows={4}
                value={notesValue}
                onChange={(e) => onNotesChange(e.target.value)}
                placeholder="اكتبي ملاحظاتك على هذا المتقدم..."
              />
            </section>

            <div className="flex justify-end pt-2">
              <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
                <AlertDialogTrigger
                  render={
                    <Button variant="destructive" size="default">
                      <Trash2 className="size-4" />
                      حذف المتقدم
                    </Button>
                  }
                />
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>حذف المتقدم؟</AlertDialogTitle>
                    <AlertDialogDescription>
                      ستُحذف بياناته وملفاته نهائياً. لا يمكن التراجع.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={deleting}>
                      إلغاء
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={onConfirmDelete}
                      disabled={deleting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {deleting ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        "تأكيد الحذف"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function FieldRow({
  field,
  value,
  applicationId,
}: {
  field: Field;
  value: FieldValue;
  applicationId: string;
}) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-3 sm:grid-cols-[180px_1fr]">
      <dt className="text-xs text-muted-foreground">{field.label}</dt>
      <dd className="text-sm text-foreground break-words">
        <FieldValueDisplay
          field={field}
          value={value}
          applicationId={applicationId}
        />
      </dd>
    </div>
  );
}

function FieldValueDisplay({
  field,
  value,
  applicationId,
}: {
  field: Field;
  value: FieldValue;
  applicationId: string;
}) {
  if (value === null || value === undefined || value === "") {
    return <span className="text-muted-foreground">—</span>;
  }
  switch (field.type) {
    case "checkbox":
      return <span>{value ? "نعم" : "لا"}</span>;
    case "checkbox-group":
      if (!Array.isArray(value) || value.length === 0)
        return <span className="text-muted-foreground">—</span>;
      return (
        <div className="flex flex-wrap gap-1.5">
          {(value as string[]).map((v) => (
            <span
              key={v}
              className="inline-flex items-center rounded-full border border-border bg-card px-2.5 py-0.5 text-xs"
            >
              {v}
            </span>
          ))}
        </div>
      );
    case "date":
      return <span>{formatDateAr(value as string)}</span>;
    case "url":
      return (
        <a
          href={String(value)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline-offset-4 hover:underline break-all"
          dir="ltr"
        >
          {String(value)}
        </a>
      );
    case "email":
      return (
        <a
          href={`mailto:${value}`}
          className="text-primary underline-offset-4 hover:underline break-all"
          dir="ltr"
        >
          {String(value)}
        </a>
      );
    case "phone":
      return (
        <a
          href={`tel:${String(value).replace(/\s+/g, "")}`}
          className="text-primary underline-offset-4 hover:underline"
          dir="ltr"
        >
          {String(value)}
        </a>
      );
    case "file": {
      if (!isFileValue(value))
        return <span className="text-muted-foreground">—</span>;
      const sizeKb = Math.round(value.size / 1024);
      return (
        <a
          href={`/api/applications/${applicationId}/files/${field.id}`}
          download={value.name}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-1.5 text-xs text-foreground hover:bg-muted"
          )}
        >
          <FileText className="size-4 text-primary" />
          <span className="font-medium">{value.name}</span>
          <span className="text-muted-foreground">({sizeKb} ك.ب)</span>
          <Download className="size-3.5 ms-auto" />
        </a>
      );
    }
    default:
      return <span className="whitespace-pre-line">{String(value)}</span>;
  }
}

export function extractName(
  data: Record<string, FieldValue>,
  fields: Field[]
): string {
  // 1) explicit name field
  const labelMatch = fields.find(
    (f) =>
      (f.type === "text" || f.type === "textarea") &&
      /اسم|name/i.test(f.label)
  );
  if (labelMatch) {
    const v = data[labelMatch.id];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  // 2) first text/email value
  for (const f of fields) {
    if (f.type === "text" || f.type === "email") {
      const v = data[f.id];
      if (typeof v === "string" && v.trim()) return v.trim();
    }
  }
  return "متقدم بدون اسم";
}
