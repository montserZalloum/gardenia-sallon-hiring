import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import {
  getAdminEmail,
  getAdminPassword,
  signSession,
  timingSafeEqual,
} from "@/lib/auth";
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/session-config";
import { loginSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  let expectedEmail: string;
  let expectedPassword: string;
  try {
    expectedEmail = getAdminEmail();
    expectedPassword = getAdminPassword();
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "ADMIN_NOT_CONFIGURED" },
      { status: 500 }
    );
  }

  const emailOk = timingSafeEqual(
    parsed.data.email.trim().toLowerCase(),
    expectedEmail.trim().toLowerCase()
  );
  const passwordOk = timingSafeEqual(parsed.data.password, expectedPassword);

  if (!emailOk || !passwordOk) {
    return NextResponse.json(
      { error: "INVALID_CREDENTIALS" },
      { status: 401 }
    );
  }

  const token = await signSession({ sub: "admin", email: expectedEmail });
  const cookieStore = await cookies();
  cookieStore.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  return NextResponse.json({ ok: true });
}
