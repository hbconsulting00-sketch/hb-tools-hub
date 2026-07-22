import { NextRequest, NextResponse } from "next/server";
import { redisSet } from "@/lib/redis";

const VALID_TARGETS = ["assets", "tabs", "settings"] as const;
type Target = (typeof VALID_TARGETS)[number];

export async function POST(req: NextRequest) {
  try {
    const { password, target, data } = await req.json();

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!VALID_TARGETS.includes(target as Target)) {
      return NextResponse.json({ error: `Unknown target: ${target}` }, { status: 400 });
    }

    const ok = await redisSet(target, data);
    if (!ok) {
      return NextResponse.json({ error: "Redis not configured or write failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: `Server error: ${String(err)}` }, { status: 500 });
  }
}
