import { NextRequest, NextResponse } from "next/server";
import { redisGet } from "@/lib/redis";
import { isAuthed } from "@/lib/auth";
import assetsDefault from "@/data/assets.json";
import tabsDefault from "@/data/tabs.json";
import typesDefault from "@/data/types.json";
import settingsDefault from "@/data/settings.json";

export const dynamic = "force-dynamic";

/**
 * Full dump of everything in Redis — the backup you take before a bulk edit.
 * Auth: admin session cookie, or ?password= for scripted use.
 */
export async function GET(req: NextRequest) {
  const pw = req.nextUrl.searchParams.get("password");
  const authorized = isAuthed(req) || (!!pw && pw === process.env.ADMIN_PASSWORD);
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [assets, tabs, types, settings] = await Promise.all([
    redisGet<unknown>("assets"),
    redisGet<unknown>("tabs"),
    redisGet<unknown>("types"),
    redisGet<unknown>("settings"),
  ]);

  return NextResponse.json({
    exportedAt: new Date().toISOString(),
    // `source` tells you whether a key is live in Redis or still falling back to the repo.
    source: {
      assets: assets ? "redis" : "default",
      tabs: tabs ? "redis" : "default",
      types: types ? "redis" : "default",
      settings: settings ? "redis" : "default",
    },
    assets: assets ?? assetsDefault,
    tabs: tabs ?? tabsDefault,
    types: types ?? typesDefault,
    settings: settings ?? settingsDefault,
  });
}
