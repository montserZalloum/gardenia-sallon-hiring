import { NextResponse, type NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import { isFileValue, readStoredFile } from "@/lib/files";
import type { Application } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; fieldId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const { id, fieldId } = await params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  const db = await getDb();
  const app = await db
    .collection<Application>("applications")
    .findOne({ _id: new ObjectId(id) });
  if (!app) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  const value = app.data?.[fieldId];
  if (!isFileValue(value)) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  try {
    const { buffer, size } = await readStoredFile(id, value.storedAs);
    const headers = new Headers();
    headers.set("Content-Type", value.mime || "application/octet-stream");
    headers.set("Content-Length", String(size));
    headers.set(
      "Content-Disposition",
      `attachment; filename*=UTF-8''${encodeURIComponent(value.name)}`
    );
    return new Response(new Uint8Array(buffer), { headers });
  } catch (err) {
    console.error("[file] failed to read", err);
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
}
