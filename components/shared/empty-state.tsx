import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-dashed border-border bg-card/40 px-6 py-12 text-center",
        className
      )}
    >
      {icon && (
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          {icon}
        </div>
      )}
      <p className="text-lg font-medium text-foreground">{title}</p>
      {description && (
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
