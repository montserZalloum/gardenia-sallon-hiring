import Link from "next/link";
import { CalendarDays, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { formatDateAr, truncate } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface JobCardProps {
  id: string;
  title: string;
  description: string;
  expiryDate: string | null;
}

export function JobCard({ id, title, description, expiryDate }: JobCardProps) {
  return (
    <Card className="group flex h-full flex-col overflow-hidden border-border/70 bg-card shadow-sm transition-all hover:border-primary/30 hover:shadow-md">
      <CardHeader className="space-y-2">
        <CardTitle className="font-display text-2xl text-foreground">
          {title}
        </CardTitle>
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <CalendarDays className="size-3.5 shrink-0" />
          {expiryDate
            ? `آخر يوم للتقديم: ${formatDateAr(expiryDate)}`
            : "التقديم مفتوح"}
        </p>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm leading-relaxed text-muted-foreground">
          {truncate(description, 150)}
        </p>
      </CardContent>
      <CardFooter>
        <Link
          href={`/jobs/${id}`}
          className={cn(
            buttonVariants({ size: "lg" }),
            "w-full rounded-2xl text-base h-11"
          )}
        >
          تقديم
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
        </Link>
      </CardFooter>
    </Card>
  );
}
