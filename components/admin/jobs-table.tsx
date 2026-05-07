"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2, Eye, Loader2, Pencil } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CopyLinkButton } from "./copy-link-button";
import { formatDateShortAr } from "@/lib/format";
import { startOfTodayInSalonTZ } from "@/lib/dates";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface JobRow {
  id: string;
  title: string;
  expiryDate: string | null;
  published: boolean;
  applicationsCount: number;
  unreadCount: number;
}

function EditJobButton({ job }: { job: JobRow }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [published, setPublished] = useState(job.published);
  const [saving, setSaving] = useState(false);

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (next) setPublished(job.published);
  }

  async function onSave() {
    if (published === job.published) {
      setOpen(false);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published }),
      });
      if (!res.ok) {
        toast.error("تعذّر تحديث الوظيفة");
        return;
      }
      toast.success("تم التحديث");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("تعذّر الاتصال بالخادم");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            title="تعديل الوظيفة"
            aria-label="تعديل الوظيفة"
          >
            <Pencil className="size-4" />
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>تعديل: {job.title}</DialogTitle>
          <DialogDescription>
            يمكنكِ تغيير حالة النشر فقط من هنا.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-start justify-between gap-3 rounded-2xl border border-border bg-muted/30 p-4">
          <div className="space-y-0.5">
            <Label htmlFor={`published-${job.id}`} className="cursor-pointer">
              منشورة
            </Label>
            <p className="text-xs text-muted-foreground">
              لو أوقفتِ هذا الخيار، الوظيفة لن تظهر للمتقدمين ولن تستقبل تقديمات.
            </p>
          </div>
          <Switch
            id={`published-${job.id}`}
            checked={published}
            onCheckedChange={(v) => setPublished(Boolean(v))}
            disabled={saving}
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={saving}
          >
            إلغاء
          </Button>
          <Button onClick={onSave} disabled={saving}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : "حفظ"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteJobButton({ job }: { job: JobRow }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function onDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/jobs/${job.id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("تعذّر حذف الوظيفة");
        return;
      }
      toast.success("تم الحذف");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("تعذّر الاتصال بالخادم");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            title="حذف الوظيفة"
            aria-label="حذف الوظيفة"
          >
            <Trash2 className="size-4 text-destructive" />
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>حذف الوظيفة؟</AlertDialogTitle>
          <AlertDialogDescription>
            {job.applicationsCount > 0 ? (
              <>
                ستُحذف الوظيفة وكل المتقدمين عليها ({job.applicationsCount})
                وملفاتهم. هذه العملية لا يمكن التراجع عنها.
              </>
            ) : (
              "لا يمكن التراجع عن هذه العملية."
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>إلغاء</AlertDialogCancel>
          <AlertDialogAction
            onClick={onDelete}
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
  );
}

export function JobsTable({ jobs }: { jobs: JobRow[] }) {
  const today = startOfTodayInSalonTZ();

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="border-border bg-muted/40 hover:bg-muted/40">
            <TableHead className="text-start">العنوان</TableHead>
            <TableHead className="text-start">الحالة</TableHead>
            <TableHead className="text-start">تاريخ الانتهاء</TableHead>
            <TableHead className="text-start">المتقدمون</TableHead>
            <TableHead className="text-start w-[160px]">إجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="py-10 text-center text-sm text-muted-foreground"
              >
                لا توجد وظائف بعد. ابدئي بإنشاء أول وظيفة.
              </TableCell>
            </TableRow>
          ) : (
            jobs.map((job) => {
              const expiry = job.expiryDate ? new Date(job.expiryDate) : null;
              const isExpiredByDate = Boolean(expiry && expiry < today);
              const isActive = job.published && !isExpiredByDate;
              return (
                <TableRow key={job.id} className="border-border">
                  <TableCell className="font-medium text-foreground">
                    {job.title}
                  </TableCell>
                  <TableCell>
                    {!job.published ? (
                      <Badge variant="outline" className="status-rejected">
                        غير منشورة
                      </Badge>
                    ) : isActive ? (
                      <Badge variant="outline" className="status-new">
                        نشطة
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="status-rejected">
                        منتهية
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {job.expiryDate ? formatDateShortAr(job.expiryDate) : "—"}
                  </TableCell>
                  <TableCell>
                    <span className="text-foreground">
                      {job.applicationsCount}
                    </span>
                    {job.unreadCount > 0 && (
                      <span className="ms-2 inline-flex items-center rounded-full bg-primary/15 px-2 py-0.5 text-[11px] text-primary">
                        {job.unreadCount} جديد
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/admin/jobs/${job.id}/applicants`}
                        className={cn(
                          buttonVariants({
                            variant: "ghost",
                            size: "icon-sm",
                          })
                        )}
                        title="عرض المتقدمين"
                        aria-label="عرض المتقدمين"
                      >
                        <Eye className="size-4" />
                      </Link>
                      <CopyLinkButton jobId={job.id} />
                      <EditJobButton job={job} />
                      <DeleteJobButton job={job} />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
