import { NextResponse, type NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import { saveUpload, deleteApplicationFiles } from "@/lib/files";
import { buildApplicationValidator } from "@/lib/validation";
import { startOfTodayInSalonTZ } from "@/lib/dates";
import type { Application, FieldValue, Job } from "@/lib/types";

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
  const job = await db.collection<Job>("jobs").findOne({ _id: oid });
  if (!job) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  const apps = await db
    .collection<Application>("applications")
    .find({ jobId: oid })
    .sort({ submittedAt: -1 })
    .toArray();

  return NextResponse.json({
    job: {
      id: job._id.toString(),
      title: job.title,
      fields: job.fields,
      expiryDate: job.expiryDate ? job.expiryDate.toISOString() : null,
    },
    applications: apps.map((a) => ({
      id: a._id.toString(),
      jobId: a.jobId.toString(),
      data: a.data,
      status: a.status,
      read: a.read,
      notes: a.notes,
      submittedAt: a.submittedAt.toISOString(),
    })),
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const oid = parseObjectId(id);
  if (!oid) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  const db = await getDb();
  const job = await db.collection<Job>("jobs").findOne({ _id: oid });
  if (!job) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  const today = startOfTodayInSalonTZ();
  if (job.published === false || (job.expiryDate && job.expiryDate < today)) {
    return NextResponse.json({ error: "EXPIRED" }, { status: 410 });
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 });
  }

  const data: Record<string, FieldValue> = {};
  const validate = buildApplicationValidator();
  const fieldErrors: Record<string, string> = {};

  for (const field of job.fields) {
    const raw = formData.getAll(field.id);
    let value: FieldValue;
    if (field.type === "file") {
      const file = raw.find((v): v is File => v instanceof File && v.size > 0);
      if (field.required && !file) {
        fieldErrors[field.id] = `${field.label} مطلوب`;
        continue;
      }
      value = null;
      if (file) {
        try {
          value = await saveUpload(oid.toString() + "-temp", file);
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "تعذّر رفع الملف";
          fieldErrors[field.id] = message;
          continue;
        }
      }
    } else if (field.type === "checkbox-group") {
      const list = raw.filter((v): v is string => typeof v === "string");
      value = list;
      const err = validate(field, list);
      if (err) fieldErrors[field.id] = err;
    } else if (field.type === "checkbox") {
      const checked = raw.some((v) => v === "on" || v === "true");
      value = checked;
      const err = validate(field, checked);
      if (err) fieldErrors[field.id] = err;
    } else if (field.type === "number") {
      const single = raw[0];
      const str = typeof single === "string" ? single : "";
      const err = validate(field, str);
      if (err) {
        fieldErrors[field.id] = err;
        value = null;
      } else {
        value = str.length === 0 ? null : Number(str);
      }
    } else {
      const single = raw[0];
      const str = typeof single === "string" ? single : "";
      const err = validate(field, str);
      if (err) {
        fieldErrors[field.id] = err;
      }
      value = str.length === 0 ? null : str;
    }
    data[field.id] = value;
  }

  if (Object.keys(fieldErrors).length > 0) {
    // cleanup any saved file under temp folder
    await deleteApplicationFiles(oid.toString() + "-temp").catch(() => undefined);
    return NextResponse.json(
      { error: "VALIDATION", fieldErrors },
      { status: 400 }
    );
  }

  // Move temp files to final application folder
  const newAppId = new ObjectId();
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const tempRoot = path.join(process.cwd(), "uploads", oid.toString() + "-temp");
  const finalRoot = path.join(process.cwd(), "uploads", newAppId.toString());
  try {
    const exists = await fs
      .stat(tempRoot)
      .then(() => true)
      .catch(() => false);
    if (exists) {
      await fs.mkdir(finalRoot, { recursive: true });
      const entries = await fs.readdir(tempRoot);
      for (const entry of entries) {
        await fs.rename(
          path.join(tempRoot, entry),
          path.join(finalRoot, entry)
        );
      }
      await fs.rm(tempRoot, { recursive: true, force: true });
    }
  } catch (err) {
    console.error("[applications] failed to move uploads", err);
  }

  await db.collection<Omit<Application, "_id">>("applications").insertOne({
    _id: newAppId,
    jobId: oid,
    data,
    status: "new",
    read: false,
    notes: "",
    submittedAt: new Date(),
  } as unknown as Application);

  return NextResponse.json({ id: newAppId.toString() }, { status: 201 });
}
