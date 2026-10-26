# HB Tools Hub — CLAUDE.md

## מה זה
דשבורד פנימי של HB Consulting — מסך אחד עם כל הכלים, הסוכנים והסקילים, מחולקים לפי קהל יעד.

URL: https://hb-tools-hub.vercel.app  
Admin: https://hb-tools-hub.vercel.app/admin  

## Stack
- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4 (CSS-first: `@import "tailwindcss"`)
- עיצוב לפי HB Brand Kit v1.1 — טוקנים ב-`app/globals.css`, לוגואים ב-`public/brand/`, אייקונים lucide-react
- Vercel (hosting) + Upstash Redis (storage)
- RTL Hebrew (`lang="he" dir="rtl"`)

## מבנה קבצים חשוב
```
app/
  page.tsx          ← דף ראשי (force-dynamic, קורא מ-Redis)
  admin/
    page.tsx        ← דף Admin (force-dynamic, קורא מ-Redis)
    AdminClient.tsx ← ממשק ניהול (client component)
  api/admin/
    assets/route.ts ← POST שומר ל-Redis
    export/route.ts ← GET גיבוי מלא
    migrate/route.ts← מעבר חד-פעמי ל-7 הכרטיסיות (בוצע 26.10)
    verify/route.ts ← POST מאמת סיסמה
components/
  AssetCard.tsx     ← כרטיס כלי: שמות, תגיות, קודים, קישורים, כפתור ראשי
  ThemeToggle.tsx   ← כפתור dark/light
data/
  assets.json       ← ברירת מחדל לכלים (fallback כשRedis ריק)
  tabs.json         ← ברירת מחדל לכרטיסיות
  settings.json     ← ברירת מחדל להגדרות
lib/
  redis.ts          ← redisGet / redisSet (Upstash)
  tabPresets.ts     ← TabConfig, featuredKey/orderTabs (כרטיסייה מודגשת)
  assetTypes.ts     ← AssetTypeConfig (סוגים)
  assetLinks.ts     ← codes/links + קריאה של השדות הישנים
  icons.tsx         ← רשימת האייקונים + BrandIcon
scripts/
  build-reclassified.py ← בונה את data/*.json מהגיבוי
HANDOFF.md          ← איפה עצרנו — לקרוא בתחילת כל סשן
```

## ארכיטקטורה — Storage
הנתונים חיים ב-Upstash Redis (לא בקוד):
- `redis.get("assets")` → מערך כלים
- `redis.get("tabs")` → מערך כרטיסיות
- `redis.get("types")` → מערך סוגים  
- `redis.get("settings")` → { siteTitle, siteSubtitle }

הדפים קוראים מ-Redis בכל request. אם Redis ריק → fallback לקבצי JSON בתיקיית `data/`.

## Environment Variables (Vercel)
| שם | מה זה |
|---|---|
| `KV_REST_API_URL` | Upstash Redis URL (מוגדר ע"י Upstash integration) |
| `KV_REST_API_TOKEN` | Upstash Redis token |
| `ADMIN_PASSWORD` | סיסמת Admin Panel (כרגע: HBC2026) |
| `GITHUB_TOKEN` | לא בשימוש יותר |

## Admin Panel
- כתובת: `/admin`
- סיסמה: `ADMIN_PASSWORD` מ-env
- ניתן לערוך: כלים, כרטיסיות, הגדרות אתר
- שינויים נשמרים מיידית ב-Redis (ללא redeploy)

## Asset Types
הסוגים נערכים באדמין (Redis `types`): `tool` · `tools` · `website` · `form` · `agent` ·
`skill` (behavior=command, פקודת `/`) · `extension` (behavior=download, ZIP).

## כלי (asset) — שדות עיקריים
`name` (עברית) · `name_en` · `description` (עד 120 תווים) · `type` · `access` (הכפתור הראשי) ·
`audience` (= הכרטיסיות) · `codes` · `links` · `install_notes` (שורה לכל שלב).
שדות ישנים (`access_note`, `guide_url`, `install_url`, `template_url`) עדיין נתמכים בתצוגה.

## פיתוח מקומי
```bash
npm run dev
```
לבנות מקומית עם Redis צריך להגדיר env vars.

## Deploy
כל push ל-`main` → Vercel מפרוס אוטומטית.
Repo: https://github.com/hbconsulting00-sketch/hb-tools-hub
