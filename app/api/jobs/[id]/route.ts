import { NextResponse, type NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import { deleteApplicationFiles } from "@/lib/files";
import { startOfTodayInSalonTZ } from "@/lib/dates";
import { updateJobSchema } from "@/lib/validation";
import type { Job } from "@/lib/types";

export const dynamic = "force-dynamic";

function parseObjectId(id: string): ObjectId | null {
  if (!ObjectId.isValid(id)) return null;
  return new ObjectId(id);
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const oid = parseObjectId(id);
  if (!oid) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  const db = await getDb();
  const job = await db.collection<Job>("jobs").findOne({ _id: oid });
  if (!job) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  const today = startOfTodayInSalonTZ();
  const isExpiredByDate = Boolean(job.expiryDate && job.expiryDate < today);
  const isPublished = job.published !== false;
  const session = await getSession();
  if (!session && (!isPublished || isExpiredByDate)) {
    return NextResponse.json({ error: "EXPIRED" }, { status: 410 });
  }

  return NextResponse.json({
    job: {
      id: job._id.toString(),
      title: job.title,
      description: job.description,
      expiryDate: job.expiryDate ? job.expiryDate.toISOString() : null,
      published: isPublished,
      fields: job.fields,
      isExpired: !isPublished || isExpiredByDate,
    },
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const { id } = await params;
  const oid = parseObjectId(id);
  if (!oid) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  const body = await request.json().catch(() => null);
  const parsed = updateJobSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const db = await getDb();
  const result = await db
    .collection<Job>("jobs")
    .updateOne({ _id: oid }, { $set: { published: parsed.data.published } });
  if (result.matchedCount === 0) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, published: parsed.data.published });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const { id } = await params;
  const oid = parseObjectId(id);
  if (!oid) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  const db = await getDb();
  const apps = await db
    .collection("applications")
    .find({ jobId: oid }, { projection: { _id: 1 } })
    .toArray();

  await Promise.all(
    apps.map((a) =>
      deleteApplicationFiles(a._id.toString()).catch(() => undefined)
    )
  );

  await db.collection("applications").deleteMany({ jobId: oid });
  const result = await db.collection("jobs").deleteOne({ _id: oid });
  if (result.deletedCount === 0) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
