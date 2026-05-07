"use client";

import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "./status-badge";
import { StatusFilterTabs, type StatusFilter } from "./status-filter-tabs";
import { ApplicantDialog, extractName } from "./applicant-dialog";
import { formatRelativeAr } from "@/lib/format";
import type {
  ApplicationStatus,
  Field,
  FieldValue,
  SerializedApplication,
} from "@/lib/types";
import { cn } from "@/lib/utils";

interface ApplicantsTableProps {
  jobFields: Field[];
  initialApplications: SerializedApplication[];
}

export function ApplicantsTable({
  jobFields,
  initialApplications,
}: ApplicantsTableProps) {
  const [applications, setApplications] = useState<SerializedApplication[]>(
    initialApplications
  );
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c: Record<StatusFilter, number> = {
      all: applications.length,
      new: 0,
      contacted: 0,
      accepted: 0,
      rejected: 0,
    };
    for (const a of applications) {
      c[a.status] += 1;
    }
    return c;
  }, [applications]);

  const visible = useMemo(() => {
    if (filter === "all") return applications;
    return applications.filter((a) => a.status === filter);
  }, [applications, filter]);

  function handleUpdate(updated: SerializedApplication) {
    setApplications((prev) =>
      prev.map((a) => (a.id === updated.id ? updated : a))
    );
  }

  function handleDelete(id: string) {
    setApplications((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div className="space-y-4">
      <StatusFilterTabs
        value={filter}
        counts={counts}
        onChange={setFilter}
      />

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-border bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-8" />
              <TableHead className="text-start">الاسم</TableHead>
              <TableHead className="text-start hidden md:table-cell">
                البريد
              </TableHead>
              <TableHead className="text-start hidden md:table-cell">
                التلفون
              </TableHead>
              <TableHead className="text-start">قُدِّم</TableHead>
              <TableHead className="text-start">الحالة</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  لا يوجد متقدمون في هذا الفلتر.
                </TableCell>
              </TableRow>
            ) : (
              visible.map((app) => {
                const email = pickByType(app.data, jobFields, "email");
                const phone = pickByType(app.data, jobFields, "phone");
                return (
                  <TableRow
                    key={app.id}
                    className={cn(
                      "cursor-pointer border-border transition-colors hover:bg-muted/30",
                      !app.read && "bg-primary/[0.04]"
                    )}
                    onClick={() => setOpenId(app.id)}
                  >
                    <TableCell>
                      {!app.read && (
                        <span
                          className="inline-block size-2.5 rounded-full bg-primary"
                          title="غير مقروء"
                          aria-label="غير مقروء"
                        />
                      )}
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      {extractName(app.data, jobFields)}
                    </TableCell>
                    <TableCell
                      className="hidden md:table-cell text-muted-foreground"
                      dir="ltr"
                    >
                      {email ?? "—"}
                    </TableCell>
                    <TableCell
                      className="hidden md:table-cell text-muted-foreground"
                      dir="ltr"
                    >
                      {phone ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {formatRelativeAr(app.submittedAt)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={app.status} />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <ApplicantDialog
        applicationId={openId}
        fields={jobFields}
        onClose={() => setOpenId(null)}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </div>
  );
}

function pickByType(
  data: Record<string, FieldValue>,
  fields: Field[],
  type: ApplicationStatus | "email" | "phone"
): string | null {
  const f = fields.find((x) => x.type === (type as Field["type"]));
  if (!f) return null;
  const v = data[f.id];
  if (typeof v === "string" && v.trim()) return v.trim();
  return null;
}
