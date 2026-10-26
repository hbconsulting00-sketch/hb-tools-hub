"""Build the reclassified data set from the 26.10 backup + CLASSIFICATION-DRAFT.md.

Writes data/assets.json, data/tabs.json and data/types.json — the repo fallback
and the exact payload to inject into Redis. Run: python3 scripts/build-reclassified.py
"""
import json, re, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
backup = json.loads((ROOT / "backups/backup-2026-10-26.json").read_text())
draft = (ROOT / "CLASSIFICATION-DRAFT.md").read_text()

# Section heading → tab key, then each "| # | name | type | description |" row under it.
tab_of, desc_of = {}, {}
section = None
for line in draft.splitlines():
    h = re.search(r"— `(\w+)`", line) if line.startswith("## ") else None
    if h:
        section = h.group(1)
        continue
    m = re.match(r"\| (\d+) \| [^|]+ \| \w+ \| (.+) \|$", line)
    if m and section:
        n = int(m.group(1))
        tab_of[n] = section
        if not m.group(2).startswith("*("):
            desc_of[n] = m.group(2).strip()

# Hebrew name (shown big) + English name (shown under it), by backup row number.
NAMES = {
    1: ("מרכז משחקי הבטיחות", "Safe Play Hub"),
    2: ("עוזר חקיקת בטיחות", "Safety IL"),
    3: ("בודק נהלי בטיחות", "HB Safety Tools"),
    4: ("ניהול ועדות בטיחות", "AI-Operation"),
    5: ("משימות מפגישות לצוות", "Meeting Ops Teams"),
    6: ("מסכם פגישות", "Meeting Summarizer"),
    7: ("עורך לשוני", "Hebrew Language Editor"),
    8: ("עוזר טרום-מכירה", "HB Pre-Sale Assistant"),
    9: ("סיכום ומשימות מפגישה", "MeetingOps"),
    10: ("מערכת למידה ללקוחות", "HB Mini LMS"),
    11: ("דף הצגה לארגון", "HBC Onepager"),
    12: ("מגנט לידים", "Lead Magnet"),
    13: ("צ'אטבוט ייעודי", "HB Chatbot"),
    15: ("בונה לומדות", "eLearning Builder 4"),
    16: ("מאתר סקילים", "find-skills"),
    17: ("עיצוב ממשקים", "frontend-design"),
    18: ("מנטור UX", "ux-design-mentor"),
    19: ("בונה משחקים קבוצתיים", "Multiplayer Games"),
    20: ("מומחה QA", "QA Expert"),
    21: ("מתכנן משחקי בטיחות", "Safety Game Architect"),
    22: ("המפיק — סרטוני AI", "AI Video Producer"),
    23: ("סוכן אפיון צרכים", "Requirements Agent"),
    24: ("מפיק לומדות", "eLearning Producer"),
    25: ("אסטרטג תוכן", "HB Content Strategist"),
    26: ("טלפרומפטר", "Teleprompter"),
    27: ("מתרגם מסמכים", "Document Translator"),
    28: ("מתקן כיווניות עברית", "Hebrew RTL Fixer"),
    29: ("נווט תקנות הבנייה 2026", "Safety Navigator 2026 · Demo"),
    30: ("מערכת גיוס HR", "HR Recruitment System"),
    31: ("מפיק טבלאות תפעול", "Operations Scheduler"),
    32: ("ריוויו ללומדות", "Review for e-learning"),
    33: ("סימולציית AI למודרכים", "AI Trainee Simulation"),
    34: ("דף הכלים לצוות", "hb-tools-briefing"),
    35: ("איסוף המלצות לקוחות", "Testimonial Collector"),
    36: ("אליאס בטיחות", "Safety Alias"),
    37: ("אתר הסטודיו", "HB Studio Website"),
    38: ("גלגל הבטיחות", "Safety Wheel"),
    39: ("טופס הצהרת בעל מקצוע מתאים", "Qualified Professional Declaration"),
    40: ("מתרגם מצגות", "Presentation Translator"),
    41: ("סקיל מצגות HB", "HB Presentations Skill"),
    42: ("מצגות הצעת מחיר — לפי לקוח", "Client Proposal Decks"),
    43: ("משחק סימולציה לתרגול SDS", "SDS Simulation Game"),
}

# Removed from the site entirely: 33 (AI trainee simulation — the link leads nowhere).
REMOVED = {33}

# Usage text that lived inside descriptions moves to the install-notes field.
NOTES = {
    19: "הסקיל בפיתוח — יהיה זמין בקרוב",
    39: "\n".join([
        "למלא את הטופס",
        "לחתום בתחתית העמוד",
        'ללחוץ על "שמירה ושליחה" — הקובץ נשמר אצלכם, ועותק נכנס לתיקיית הריכוז במשרד',
    ]),
}

# Codes shown with a copy button: (label, value).
CODES = {
    1: [("סיסמה", "HB@Safety2026")],
    36: [("קוד כניסה", "HB-7Q8S-J68P")],
}

# Every extra link, with a label that says what it is. Replaces the old
# guide_url / install_url / template_url fields, which were used loosely
# (Drive folders in "install file", ZIPs in "source code").
L = lambda label, icon, url: {"label": label, "url": url, "icon": icon}
BRIEFING = "https://hb-tools-briefing.vercel.app/"
LINKS = {
    1:  [L("סרטון הדרכה", "video", "https://youtu.be/ZIb95ZtViNE"),
         L("קוד מקור", "code", "https://github.com/hbconsulting00-sketch/safeplay-hub")],
    2:  [L("דף הסבר על הכלי", "book", BRIEFING),
         L("קוד מקור", "code", "https://github.com/hbconsulting00-sketch/safety-assistant-legislation")],
    3:  [L("דף הסבר על הכלי", "book", BRIEFING),
         L("קוד מקור", "code", "https://github.com/hbconsulting00-sketch/hb-safety-tools")],
    4:  [L("דף הסבר על הכלי", "book", BRIEFING),
         L("קוד מקור", "code", "https://github.com/hbconsulting00-sketch/hb-ai-operations")],
    5:  [L("סרטון הדרכה", "video", "https://youtu.be/8EWKeZagsDQ")],
    7:  [L("קוד מקור", "code", "https://github.com/hbconsulting00-sketch/hebrew-language-editor")],
    8:  [L("סרטון הדרכה", "video", "https://youtu.be/wwTH1ty5jzY")],
    10: [L("סרטון הדרכה", "video", "https://youtu.be/E_KMQrCAVz4"),
         L("קוד מקור", "code", "https://github.com/hbconsulting00-sketch/hb-mini-lms")],
    15: [L("קבצי הסקיל", "download", "https://github.com/hbconsulting00-sketch/elearning-builder-4")],
    16: [L("קבצי הסקיל", "download", "https://github.com/hbconsulting00-sketch/hb-tools-hub/tree/main/skills/find-skills")],
    17: [L("קבצי הסקיל", "download", "https://github.com/hbconsulting00-sketch/hb-tools-hub/tree/main/skills/frontend-design")],
    18: [L("קבצי הסקיל", "download", "https://github.com/hbconsulting00-sketch/hb-tools-hub/tree/main/skills/ux-design-mentor")],
    19: [L("קבצי הסקיל", "download", "https://github.com/hbconsulting00-sketch/hb-multiplayer-games")],
    28: [L("קוד מקור", "code", "https://github.com/hbconsulting00-sketch/rtl-fixer-extension")],
    34: [L("דשבורד המשובים", "chart", "https://hb-tools-dashboard.vercel.app/")],
    36: [L("מדריך שימוש", "book", "https://docs.google.com/document/d/1aPrC3oiD9kg27-7IgXel5dn57ElZ1IWUaDychUQxvg0/edit?usp=sharing"),
         L("תיקייה בדרייב", "folder", "https://drive.google.com/drive/folders/1l3-7Q8Wc7h6iK5xBkaTXwd2gib_3HWho?usp=sharing")],
    38: [L("מדריך שימוש", "book", "https://claude.ai/artifact/MbNY44jJAAczzduapmGZ5y"),
         L("תיקייה בדרייב", "folder", "https://drive.google.com/drive/folders/1Pf8-vX8UoeTObEU1P1ccLBmVCYe9RiSI?usp=drive_link")],
    39: [L("תיקיית הריכוז בדרייב", "folder", "https://drive.google.com/drive/folders/1WJQ9obndGtUb7-hfJpYbMGXQe9tJB1mC?usp=drive_link")],
    43: [L("מדריך שימוש", "book", "https://claude.ai/artifact/TwTG3yaRbycoYnNBJa1FxR")],
}
# The RTL Fixer's main button downloads the ZIP directly; the three templates
# live only on GitHub, so their main button opens the repo.
ACCESS = {
    28: "https://github.com/hbconsulting00-sketch/rtl-fixer-extension/raw/main/rtl-fixer-extension.zip",
    11: "https://github.com/hbconsulting00-sketch/hbc-onepager",
    12: "https://github.com/hbconsulting00-sketch/hb-lead-magnet",
    13: "https://github.com/hbconsulting00-sketch/hb-chatbot-backend",
}

assets = []
for n, a in enumerate(backup["assets"], 1):
    if n not in tab_of or n in REMOVED:  # 14 (old elearning-builder) is retired
        continue
    a = dict(a)
    he, en = NAMES[n]
    a["name"], a["name_en"] = he, en
    if n in desc_of:
        a["description"] = desc_of[n]
    a["audience"] = [tab_of[n]] + (["news"] if "news" in a["audience"] else [])
    if n in NOTES:
        a["install_notes"] = NOTES[n]
    if n in ACCESS:
        a["access"] = ACCESS[n]
    a["codes"] = [{"label": l, "value": v} for l, v in CODES.get(n, [])]
    a["links"] = LINKS.get(n, [])
    # Old fields are folded into codes/links above.
    a.update(access_note=None, has_guide=False, guide_url=None, install_url=None, template_url=None)
    assets.append(a)

tabs = [
    {"key": "games",         "label": "משחק ופעילות",       "emoji": "🎮", "icon": "gamepad",      "colorPreset": "violet", "showAll": False},
    {"key": "documents",     "label": "מסמכים וסיכומים",    "emoji": "📄", "icon": "file-text",    "colorPreset": "blue",   "showAll": False},
    {"key": "presentations", "label": "מצגות ולומדות",      "emoji": "🎬", "icon": "presentation", "colorPreset": "purple", "showAll": False},
    {"key": "operations",    "label": "ניהול ומעקב",        "emoji": "⚙️", "icon": "chart",        "colorPreset": "sky",    "showAll": False},
    {"key": "marketing",     "label": "שיווק ומכירות",      "emoji": "🏷", "icon": "megaphone",    "colorPreset": "amber",  "showAll": False},
    {"key": "studio",        "label": "עזרי עבודה וסטודיו", "emoji": "🧱", "icon": "wrench",       "colorPreset": "indigo", "showAll": False},
    {"key": "news",          "label": "מה חדש",             "emoji": "🆕", "icon": "sparkles",     "colorPreset": "violet", "showAll": False},
]

TYPE_ICONS = {"tool": "toolbox", "tools": "smartphone", "website": "globe", "form": "clipboard",
              "agent": "bot", "skill": "zap", "extension": "puzzle"}
types = [dict(t, icon=TYPE_ICONS.get(t["key"], "link")) for t in backup["types"]]

for name, data in (("assets", assets), ("tabs", tabs), ("types", types)):
    (ROOT / f"data/{name}.json").write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
print(len(assets), "assets,", len(tabs), "tabs,", len(types), "types")
for t in tabs:
    print(f'  {t["key"]:14} {sum(t["key"] in a["audience"] for a in assets)}')
