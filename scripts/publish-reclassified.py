"""Push data/assets.json, tabs.json and types.json to the live site's Redis.

Safe order: export a fresh backup → stop if the live assets changed since the
26.10 backup the reclassification was built from → POST each key.

  ADMIN_PASSWORD=... python3 scripts/publish-reclassified.py [--dry-run]
"""
import json, os, pathlib, sys, urllib.request, urllib.parse, datetime

SITE = "https://hb-tools-hub.vercel.app"
ROOT = pathlib.Path(__file__).resolve().parent.parent
password = os.environ["ADMIN_PASSWORD"]
dry = "--dry-run" in sys.argv

def call(path, body=None):
    req = urllib.request.Request(SITE + path, data=None if body is None else json.dumps(body).encode(),
                                 headers={"Content-Type": "application/json"}, method="GET" if body is None else "POST")
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read())

live = call("/api/admin/export?password=" + urllib.parse.quote(password))
stamp = datetime.datetime.now().strftime("%Y-%m-%d-%H%M")
out = ROOT / f"backups/backup-{stamp}.json"
out.write_text(json.dumps(live, ensure_ascii=False))
print("backup:", out.relative_to(ROOT))

base = json.loads((ROOT / "backups/backup-2026-10-26.json").read_text())
if live["assets"] != base["assets"]:
    names = lambda xs: {a["name"] for a in xs}
    print("STOP: live assets changed since the 26.10 backup.")
    print("  added:  ", sorted(names(live["assets"]) - names(base["assets"])))
    print("  removed:", sorted(names(base["assets"]) - names(live["assets"])))
    print("  (or fields edited) — merge those edits into the build first.")
    sys.exit(1)

for target in ("types", "tabs", "assets"):
    data = json.loads((ROOT / f"data/{target}.json").read_text())
    if dry:
        print(f"dry-run: would publish {target} ({len(data)})")
        continue
    print(target, call("/api/admin/assets", {"password": password, "target": target, "data": data}))
