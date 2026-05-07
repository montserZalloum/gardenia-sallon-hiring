import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { STATUS_LABEL_AR } from "@/lib/format";
import type { ApplicationStatus } from "@/lib/types";

const statusClasses: Record<ApplicationStatus, string> = {
  new: "status-new",
  contacted: "status-contacted",
  accepted: "status-accepted",
  rejected: "status-rejected",
};

export function StatusBadge({
  status,
  className,
}: {
  status: ApplicationStatus;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full px-2.5 py-0.5 text-[11px] font-medium",
        statusClasses[status],
        className
      )}
    >
      {STATUS_LABEL_AR[status]}
    </Badge>
  );
}
