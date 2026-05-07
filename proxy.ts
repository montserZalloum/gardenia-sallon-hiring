import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import {
  SESSION_AUDIENCE,
  SESSION_COOKIE_NAME,
  SESSION_ISSUER,
} from "./lib/session-config";

async function isAuthed(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return false;
  const secret = process.env.SESSION_SECRET;
  if (!secret) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(secret), {
      issuer: SESSION_ISSUER,
      audience: SESSION_AUDIENCE,
    });
    return true;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;
  const isAdminPage =
    pathname.startsWith("/admin") && pathname !== "/admin/login";

  // Public API endpoints (no auth needed):
  //   GET  /api/jobs                                (active jobs)
  //   GET  /api/jobs/[id]                           (single job for application form)
  //   POST /api/jobs/[id]/applications              (applicant submits)
  //   POST /api/auth/login, /api/auth/logout
  // Admin API: everything else under /api/jobs and /api/applications
  const submitApplicationsRe = /^\/api\/jobs\/[^/]+\/applications\/?$/;

  let isAdminApi = false;
  if (pathname.startsWith("/api/jobs")) {
    if (submitApplicationsRe.test(pathname)) {
      // POST is public; GET (list applicants) is admin
      isAdminApi = method !== "POST";
    } else if (method === "GET") {
      // GET /api/jobs and GET /api/jobs/[id] are public; ?all=1 is admin
      isAdminApi = request.nextUrl.searchParams.get("all") === "1";
    } else {
      // POST /api/jobs and DELETE /api/jobs/[id] are admin
      isAdminApi = true;
    }
  } else if (pathname.startsWith("/api/applications")) {
    isAdminApi = true;
  }

  if (!isAdminPage && !isAdminApi) {
    return NextResponse.next();
  }

  const authed = await isAuthed(request);
  if (authed) return NextResponse.next();

  if (isAdminPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
}

export const config = {
  matcher: ["/admin/:path*", "/api/jobs/:path*", "/api/applications/:path*"],
};
