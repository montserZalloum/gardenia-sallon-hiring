"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { STATUS_LABEL_AR, STATUS_OPTIONS } from "@/lib/format";
import type { ApplicationStatus } from "@/lib/types";

export type StatusFilter = "all" | ApplicationStatus;

export function StatusFilterTabs({
  value,
  counts,
  onChange,
}: {
  value: StatusFilter;
  counts: Record<StatusFilter, number>;
  onChange: (v: StatusFilter) => void;
}) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as StatusFilter)}>
      <TabsList className="flex w-full flex-wrap gap-1 bg-muted/40 p-1">
        <TabsTrigger value="all" className="gap-2">
          الكل
          <span className="text-[11px] text-muted-foreground">
            ({counts.all})
          </span>
        </TabsTrigger>
        {STATUS_OPTIONS.map((s) => (
          <TabsTrigger key={s} value={s} className="gap-2">
            {STATUS_LABEL_AR[s]}
            <span className="text-[11px] text-muted-foreground">
              ({counts[s]})
            </span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
