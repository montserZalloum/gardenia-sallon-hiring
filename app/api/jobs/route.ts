import { NextResponse, type NextRequest } from "next/server";
import { getDb, ensureIndexes } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import { jobInputSchema } from "@/lib/validation";
import { startOfTodayInSalonTZ } from "@/lib/dates";
import type { Job } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const showAll = request.nextUrl.searchParams.get("all") === "1";
  await ensureIndexes();
  const db = await getDb();
  const filter: Record<string, unknown> = {};
  if (!showAll) {
    const today = startOfTodayInSalonTZ();
    filter.published = { $ne: false };
    filter.$or = [
      { expiryDate: null },
      { expiryDate: { $exists: false } },
      { expiryDate: { $gte: today } },
    ];
  } else {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
  }

  const docs = await db
    .collection<Job>("jobs")
    .find(filter)
    .sort({ createdAt: -1 })
    .toArray();

  if (showAll) {
    const ids = docs.map((d) => d._id);
    const counts = await db
      .collection("applications")
      .aggregate<{
        _id: { jobId: typeof ids[number]; read: boolean };
        count: number;
      }>([
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

    return NextResponse.json({
      jobs: docs.map((d) => ({
        id: d._id.toString(),
        title: d.title,
        description: d.description,
        expiryDate: d.expiryDate ? d.expiryDate.toISOString() : null,
        published: d.published !== false,
        createdAt: d.createdAt.toISOString(),
        fields: d.fields,
        applicationsCount: map.get(d._id.toString())?.applicationsCount ?? 0,
        unreadCount: map.get(d._id.toString())?.unreadCount ?? 0,
      })),
    });
  }

  return NextResponse.json({
    jobs: docs.map((d) => ({
      id: d._id.toString(),
      title: d.title,
      description: d.description,
      expiryDate: d.expiryDate ? d.expiryDate.toISOString() : null,
    })),
  });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  const parsed = jobInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const db = await getDb();
  const ids = new Set<string>();
  for (const f of parsed.data.fields) {
    if (ids.has(f.id)) {
      return NextResponse.json(
        { error: "DUPLICATE_FIELD_ID" },
        { status: 400 }
      );
    }
    ids.add(f.id);
  }

  const result = await db.collection<Omit<Job, "_id">>("jobs").insertOne({
    title: parsed.data.title,
    description: parsed.data.description,
    expiryDate: parsed.data.expiryDate ? new Date(parsed.data.expiryDate) : null,
    published: parsed.data.published ?? true,
    fields: parsed.data.fields,
    createdAt: new Date(),
    applicationsCount: 0,
    unreadCount: 0,
  });

  return NextResponse.json({ id: result.insertedId.toString() }, { status: 201 });
}
