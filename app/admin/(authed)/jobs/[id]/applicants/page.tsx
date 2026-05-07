import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ObjectId } from "mongodb";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/mongodb";
import { ApplicantsTable } from "@/components/admin/applicants-table";
import type {
  Application,
  Job,
  SerializedApplication,
} from "@/lib/types";

export const dynamic = "force-dynamic";

async function fetchData(id: string) {
  if (!ObjectId.isValid(id)) return null;
  const db = await getDb();
  const job = await db
    .collection<Job>("jobs")
    .findOne({ _id: new ObjectId(id) });
  if (!job) return null;
  const apps = await db
    .collection<Application>("applications")
    .find({ jobId: job._id })
    .sort({ submittedAt: -1 })
    .toArray();
  const serialized: SerializedApplication[] = apps.map((a) => ({
    id: a._id.toString(),
    jobId: a.jobId.toString(),
    data: a.data,
    status: a.status,
    read: a.read,
    notes: a.notes,
    submittedAt: a.submittedAt.toISOString(),
  }));
  return {
    job: {
      id: job._id.toString(),
      title: job.title,
      fields: job.fields,
    },
    applications: serialized,
  };
}

export default async function ApplicantsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await fetchData(id);
  if (!data) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-3xl text-foreground md:text-4xl">
            متقدمو {data.job.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {data.applications.length} متقدم بالمجمل
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
      <ApplicantsTable
        jobFields={data.job.fields}
        initialApplications={data.applications}
      />
    </div>
  );
}
