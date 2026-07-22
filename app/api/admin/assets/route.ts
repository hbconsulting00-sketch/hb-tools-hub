import { NextRequest, NextResponse } from "next/server";

const OWNER = "hbconsulting00-sketch";
const REPO = "hb-tools-hub";

const FILE_MAP: Record<string, string> = {
  assets:   "data/assets.json",
  tabs:     "data/tabs.json",
  settings: "data/settings.json",
};

export async function POST(req: NextRequest) {
  const { password, target, data } = await req.json();

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const filePath = FILE_MAP[target];
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
    return NextResponse.json({ error: "Failed to read file from GitHub" }, { status: 500 });
  }
  const fileData = await fileRes.json();

  // Commit updated file to GitHub
  const content = Buffer.from(JSON.stringify(data, null, 2) + "\n").toString("base64");
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
        message: `Admin: update ${target} via HB Tools Hub`,
        content,
        sha: fileData.sha,
        committer: { name: "HB Admin", email: "admin@hb-tools.app" },
      }),
    }
  );

  if (!updateRes.ok) {
    const err = await updateRes.json();
    return NextResponse.json({ error: err.message || "GitHub update failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
