import { NextRequest, NextResponse } from "next/server";

const OWNER = "hbconsulting00-sketch";
const REPO = "hb-tools-hub";

const FILE_MAP: Record<string, string> = {
  assets:   "data/assets.json",
  tabs:     "data/tabs.json",
  settings: "data/settings.json",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password, target, data } = body;

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const filePath = FILE_MAP[target as string];
    if (!filePath) {
      return NextResponse.json({ error: `Unknown target: ${target}` }, { status: 400 });
    }

    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      return NextResponse.json({ error: "GITHUB_TOKEN not configured" }, { status: 500 });
    }

    // Get current file SHA
    const fileRes = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${filePath}`,
      { headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" } }
    );
    if (!fileRes.ok) {
      const ghErr = await fileRes.text();
      return NextResponse.json({ error: `GitHub read failed (${fileRes.status}): ${ghErr}` }, { status: 500 });
    }
    const fileData = await fileRes.json() as { sha: string };

    // Encode as UTF-8 bytes → binary string → base64 (handles Hebrew)
    const jsonStr = JSON.stringify(data, null, 2) + "\n";
    const bytes = new TextEncoder().encode(jsonStr);
    const encoded = btoa(Array.from(bytes, (b) => String.fromCharCode(b)).join(""));

    const updateRes = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${filePath}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/vnd.github+json",
        },
        body: JSON.stringify({
          message: `Admin: update ${target}`,
          content: encoded,
          sha: fileData.sha,
          committer: { name: "HB Admin", email: "admin@hb-tools.app" },
        }),
      }
    );

    if (!updateRes.ok) {
      const ghErr = await updateRes.text();
      return NextResponse.json({ error: `GitHub write failed (${updateRes.status}): ${ghErr}` }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Admin API unhandled error:", err);
    return NextResponse.json({ error: `Server error: ${String(err)}` }, { status: 500 });
  }
}
