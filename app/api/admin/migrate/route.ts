import { NextRequest, NextResponse } from "next/server";
import { redisGet, redisSet } from "@/lib/redis";
import { isAuthed } from "@/lib/auth";
import baseline from "@/backups/backup-2026-10-26.json";
import assetsNew from "@/data/assets.json";
import tabsNew from "@/data/tabs.json";
import typesNew from "@/data/types.json";

export const dynamic = "force-dynamic";

/** JSON with sorted keys, so two copies of the same data compare equal. */
function canonical(v: unknown): string {
  return JSON.stringify(v, (_k, val) =>
    val && typeof val === "object" && !Array.isArray(val)
      ? Object.fromEntries(Object.entries(val).sort(([a], [b]) => a.localeCompare(b)))
      : val,
  );
}

type Named = { name: string };

/**
 * One-time switch to the 7-tab structure (data/*.json). Refuses to run when the
 * live assets changed since the 26.10 backup the new data was built from, so an
 * edit made in the admin panel since then is never overwritten.
 * GET reports whether the switch is still pending; POST performs it.
 */
export async function GET(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const tabs = await redisGet<{ key: string }[]>("tabs");
  return NextResponse.json({ pending: !tabs?.some((t) => t.key === "games") });
}

export async function POST(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const live = await redisGet<Named[]>("assets");
  if (!live) return NextResponse.json({ error: "לא נמצאו כלים ב-Redis — לא מעדכנים" }, { status: 409 });

  if (canonical(live) !== canonical(baseline.assets)) {
    const now = new Set(live.map((a) => a.name));
    const then = new Set((baseline.assets as Named[]).map((a) => a.name));
    return NextResponse.json({
      error: "הכלים באתר השתנו מאז הגיבוי של 26.10 — עצרתי כדי לא לדרוס את השינויים",
      added: [...now].filter((n) => !then.has(n)),
      removed: [...then].filter((n) => !now.has(n)),
    }, { status: 409 });
  }

  for (const [key, data] of [["types", typesNew], ["tabs", tabsNew], ["assets", assetsNew]] as const) {
    if (!(await redisSet(key, data))) {
      return NextResponse.json({ error: `השמירה של ${key} נכשלה` }, { status: 500 });
    }
  }
  return NextResponse.json({ ok: true, assets: assetsNew.length, tabs: tabsNew.length });
}
