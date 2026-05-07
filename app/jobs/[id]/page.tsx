import Link from "next/link";
import { notFound } from "next/navigation";
import { ObjectId } from "mongodb";
import { ArrowRight, CalendarDays } from "lucide-react";
import { getDb } from "@/lib/mongodb";
import { Brand } from "@/components/shared/brand";
import { ApplicationForm } from "@/components/public/application-form";
import { formatDateAr } from "@/lib/format";
import { startOfTodayInSalonTZ } from "@/lib/dates";
import type { Job } from "@/lib/types";

export const dynamic = "force-dynamic";

async function fetchJob(id: string) {
  if (!ObjectId.isValid(id)) return null;
  const db = await getDb();
  const job = await db
    .collection<Job>("jobs")
    .findOne({ _id: new ObjectId(id) });
  if (!job) return null;
  const today = startOfTodayInSalonTZ();
  if (job.published === false || (job.expiryDate && job.expiryDate < today)) {
    return "expired" as const;
  }
  return {
    id: job._id.toString(),
    title: job.title,
    description: job.description,
    expiryDate: job.expiryDate ? job.expiryDate.toISOString() : null,
    fields: job.fields,
  };
}

export default async function JobApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await fetchJob(id);
  if (result === null) notFound();
  if (result === "expired") {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="px-4 py-6 md:py-10">
          <div className="mx-auto flex w-full max-w-3xl items-center justify-between">
            <Brand size="md" />
          </div>
        </header>
        <main className="flex-1 px-4 pb-20">
          <div className="mx-auto mt-12 max-w-xl rounded-3xl border border-border bg-card p-8 text-center shadow-sm md:mt-20 md:p-12">
            <p className="font-display text-2xl text-foreground md:text-3xl">
              هذه الوظيفة لم تعد متاحة
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              انتهى تاريخ التقديم. يمكنك تصفح الوظائف الأخرى المتاحة.
            </p>
            <Link
              href="/"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <ArrowRight className="size-4" />
              العودة للوظائف
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const job = result;
  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-4 py-6 md:py-10">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between">
          <Brand size="md" />
          <Link
            href="/"
            className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowRight className="size-4" />
            رجوع
          </Link>
        </div>
      </header>

      <main className="flex-1 px-4 pb-24">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-10">
            <h1 className="font-display text-3xl text-foreground md:text-4xl">
              {job.title}
            </h1>
            <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <CalendarDays className="size-3.5 shrink-0" />
              {job.expiryDate
                ? `آخر يوم للتقديم: ${formatDateAr(job.expiryDate)}`
                : "التقديم مفتوح حتى إشعار آخر"}
            </p>
            <p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {job.description}
            </p>
          </div>

          <div className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-10">
            <h2 className="mb-6 font-display text-xl text-foreground">
              نموذج التقديم
            </h2>
            <ApplicationForm jobId={job.id} fields={job.fields} />
          </div>
        </div>
      </main>
    </div>
  );
}
