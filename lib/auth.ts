import { createHmac, timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";
import type { NextResponse } from "next/server";

export const ADMIN_COOKIE = "hb_admin";

/**
 * Session token derived from ADMIN_PASSWORD. Changing the password in Vercel
 * invalidates every outstanding cookie, which is the behaviour we want.
 */
export function adminToken(): string | null {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return null;
  return createHmac("sha256", pw).update("hb-tools-hub-admin-v1").digest("hex");
}

function sameToken(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

/** True when the request carries a valid admin session cookie. */
export function isAuthed(req: NextRequest): boolean {
  const expected = adminToken();
  const got = req.cookies.get(ADMIN_COOKIE)?.value;
  return !!expected && !!got && sameToken(expected, got);
}

/**
 * Session cookie — deliberately no maxAge/expires, so the browser drops it
 * when it closes. That is the lifetime Michal chose.
 */
export function setAdminCookie(res: NextResponse): void {
  const t = adminToken();
  if (!t) return;
  res.cookies.set(ADMIN_COOKIE, t, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

export function clearAdminCookie(res: NextResponse): void {
  res.cookies.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}
