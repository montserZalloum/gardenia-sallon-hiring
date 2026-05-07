import Link from "next/link";
import { Plus } from "lucide-react";
import { getDb, ensureIndexes } from "@/lib/mongodb";
import { JobsTable, type JobRow } from "@/components/admin/jobs-table";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Job } from "@/lib/types";

export const dynamic = "force-dynamic";

async function fetchAllJobs(): Promise<JobRow[]> {
  await ensureIndexes();
  const db = await getDb();
  const docs = await db
    .collection<Job>("jobs")
    .find({})
    .sort({ createdAt: -1 })
    .toArray();
  if (docs.length === 0) return [];

  const ids = docs.map((d) => d._id);
  type CountRow = {
    _id: { jobId: typeof ids[number]; read: boolean };
    count: number;
  };
  const counts = await db
    .collection("applications")
    .aggregate<CountRow>([
      { $match: { jobId: { $in: ids } } },
      { $group: { _id: { jobId: "$jobId", read: "$read" }, count: { $sum: 1 } } },
    ])
    .toArray();

  const map = new Map<
    string,
    { applicationsCount: number; unreadCount: number }
  >();
  for (const id of ids) {
    map.set(id.toString(), { applicationsCount: 0, unreadCount: 0 });
  }
  for (const c of counts) {
    const k = c._id.jobId.toString();
    const entry = map.get(k);
    if (!entry) continue;
    entry.applicationsCount += c.count;
    if (!c._id.read) entry.unreadCount += c.count;
  }

  return docs.map((d) => ({
    id: d._id.toString(),
    title: d.title,
    expiryDate: d.expiryDate ? d.expiryDate.toISOString() : null,
    published: d.published !== false,
    applicationsCount: map.get(d._id.toString())?.applicationsCount ?? 0,
    unreadCount: map.get(d._id.toString())?.unreadCount ?? 0,
  }));
}

export default async function AdminJobsPage() {
  const jobs = await fetchAllJobs();
  const totalUnread = jobs.reduce((acc, j) => acc + j.unreadCount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-3xl text-foreground md:text-4xl">
            إدارة الوظائف
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {jobs.length} {jobs.length === 1 ? "وظيفة" : "وظائف"}
            {totalUnread > 0 && (
              <span className="ms-2 inline-flex items-center rounded-full bg-primary/15 px-2 py-0.5 text-[11px] text-primary">
                {totalUnread} متقدم جديد
              </span>
            )}
          </p>
        </div>
        <Link
          href="/admin/jobs/new"
          className={cn(
            buttonVariants({ size: "lg" }),
            "rounded-2xl text-base h-11"
          )}
        >
          <Plus className="size-4" />
          وظيفة جديدة
        </Link>
      </div>
      <JobsTable jobs={jobs} />
    </div>
  );
}
