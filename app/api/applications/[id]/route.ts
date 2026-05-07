import { NextResponse, type NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import { deleteApplicationFiles } from "@/lib/files";
import { updateApplicationSchema } from "@/lib/validation";
import type { Application } from "@/lib/types";

export const dynamic = "force-dynamic";

function parseObjectId(id: string): ObjectId | null {
  if (!ObjectId.isValid(id)) return null;
  return new ObjectId(id);
}

export async function GET(
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
  const app = await db
    .collection<Application>("applications")
    .findOne({ _id: oid });
  if (!app) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  return NextResponse.json({
    application: {
      id: app._id.toString(),
      jobId: app.jobId.toString(),
      data: app.data,
      status: app.status,
      read: app.read,
      notes: app.notes,
      submittedAt: app.submittedAt.toISOString(),
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
  const parsed = updateApplicationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const db = await getDb();
  const result = await db
    .collection<Application>("applications")
    .findOneAndUpdate(
      { _id: oid },
      { $set: parsed.data },
      { returnDocument: "after" }
    );
  if (!result) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  return NextResponse.json({
    application: {
      id: result._id.toString(),
      jobId: result.jobId.toString(),
      data: result.data,
      status: result.status,
      read: result.read,
      notes: result.notes,
      submittedAt: result.submittedAt.toISOString(),
    },
  });
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
  const result = await db
    .collection<Application>("applications")
    .deleteOne({ _id: oid });
  if (result.deletedCount === 0) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  await deleteApplicationFiles(id).catch(() => undefined);
  return NextResponse.json({ ok: true });
}
