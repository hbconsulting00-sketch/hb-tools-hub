import { NextRequest, NextResponse } from "next/server";

const OWNER = "hbconsulting00-sketch";
const REPO = "hb-tools-hub";
const FILE_PATH = "data/assets.json";

export async function POST(req: NextRequest) {
  const { password, assets } = await req.json();

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "GITHUB_TOKEN env var not configured" }, { status: 500 });
  }

  // Fetch current file SHA (required for GitHub update API)
  const fileRes = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`,
    { headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" } }
  );
  if (!fileRes.ok) {
    return NextResponse.json({ error: "Failed to read file from GitHub" }, { status: 500 });
  }
  const fileData = await fileRes.json();

  // Commit updated assets.json back to GitHub
  const content = Buffer.from(JSON.stringify(assets, null, 2) + "\n").toString("base64");
  const updateRes = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/vnd.github+json",
      },
      body: JSON.stringify({
        message: "Admin: update assets via HB Tools Hub",
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
