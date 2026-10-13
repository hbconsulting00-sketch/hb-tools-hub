import { NextRequest, NextResponse } from "next/server";
import { isAuthed, clearAdminCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Is this browser still signed in? Called once when /admin mounts. */
export async function GET(req: NextRequest) {
  return NextResponse.json({ authed: isAuthed(req) });
}

/** Sign out. */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  clearAdminCookie(res);
  return res;
}
