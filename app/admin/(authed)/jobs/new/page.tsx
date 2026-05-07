import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { JobForm } from "@/components/admin/job-form";

export default function NewJobPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-3xl text-foreground md:text-4xl">
            وظيفة جديدة
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            صممي الوظيفة وحدّدي الحقول التي يجب على المتقدم تعبئتها.
          </p>
        </div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowRight className="size-4" />
          رجوع للوظائف
        </Link>
      </div>
      <JobForm />
    </div>
  );
}
