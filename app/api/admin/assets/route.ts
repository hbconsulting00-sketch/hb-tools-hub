import { NextRequest, NextResponse } from "next/server";

const OWNER = "hbconsulting00-sketch";
const REPO  = "hb-tools-hub";

const FILE_MAP: Record<string, string> = {
  assets:   "data/assets.json",
  tabs:     "data/tabs.json",
  settings: "data/settings.json",
};

// Pure-JS UTF-8 → Base64 encoder.
// Zero dependencies on Buffer, btoa, or any runtime API — works everywhere.
function utf8ToBase64(str: string): string {
  const B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  // Step 1: encode string to UTF-8 bytes
  const bytes: number[] = [];
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    if (c < 0x80) {
      bytes.push(c);
    } else if (c < 0x800) {
      bytes.push(0xC0 | (c >> 6), 0x80 | (c & 0x3F));
    } else if (c >= 0xD800 && c <= 0xDBFF && i + 1 < str.length) {
      const c2 = str.charCodeAt(++i);
      const cp = 0x10000 + ((c - 0xD800) << 10) + (c2 - 0xDC00);
      bytes.push(
        0xF0 | (cp >> 18),
        0x80 | ((cp >> 12) & 0x3F),
        0x80 | ((cp >>  6) & 0x3F),
        0x80 | ( cp        & 0x3F),
      );
    } else {
      bytes.push(0xE0 | (c >> 12), 0x80 | ((c >> 6) & 0x3F), 0x80 | (c & 0x3F));
    }
  }
  // Step 2: encode bytes to base64 (3 bytes → 4 chars)
  let out = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i], b1 = bytes[i + 1] ?? 0, b2 = bytes[i + 2] ?? 0;
    out += B64[b0 >> 2];
    out += B64[((b0 & 3) << 4) | (b1 >> 4)];
    out += i + 1 < bytes.length ? B64[((b1 & 0xF) << 2) | (b2 >> 6)] : "=";
    out += i + 2 < bytes.length ? B64[b2 & 0x3F] : "=";
  }
  return out;
}

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

    // Get current file SHA from GitHub
    const fileRes = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${filePath}`,
      { headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" } },
    );
    if (!fileRes.ok) {
      const ghErr = await fileRes.text();
      return NextResponse.json(
        { error: `GitHub read failed (${fileRes.status}): ${ghErr}` },
        { status: 500 },
      );
    }
    const fileData = (await fileRes.json()) as { sha: string };

    // Encode JSON → UTF-8 → Base64 (pure JS, no runtime deps)
    const jsonStr  = JSON.stringify(data, null, 2) + "\n";
    const encoded  = utf8ToBase64(jsonStr);

    // Write updated file to GitHub
    const updateRes = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${filePath}`,
      {
        method: "PUT",
        headers: {
          Authorization:  `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept:         "application/vnd.github+json",
        },
        body: JSON.stringify({
          message:   `Admin: update ${target}`,
          content:   encoded,
          sha:       fileData.sha,
          committer: { name: "HB Admin", email: "admin@hb-tools.app" },
        }),
      },
    );

    if (!updateRes.ok) {
      const ghErr = await updateRes.text();
      return NextResponse.json(
        { error: `GitHub write failed (${updateRes.status}): ${ghErr}` },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Admin API error:", err);
    return NextResponse.json({ error: `Server error: ${String(err)}` }, { status: 500 });
  }
}
