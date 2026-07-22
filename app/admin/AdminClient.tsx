"use client";
import { useState } from "react";
import { Asset } from "@/components/AssetCard";
import { TabConfig, ColorPreset, COLOR_PRESETS, PRESET_LABELS } from "@/lib/tabPresets";

// ── Types ─────────────────────────────────────────────────────────────
interface SiteSettings {
  siteTitle: string;
  siteSubtitle: string;
}

const AUDIENCES_BASE = [
  { key: "instructors",  label: "כלי מדריכים", emoji: "🎓" },
  { key: "management",   label: "הנהלה",       emoji: "📊" },
  { key: "daily-shared", label: "יומיומי",     emoji: "⚡" },
  { key: "studio-only",  label: "סטודיו",      emoji: "🛠" },
];

const TYPES: Asset["type"][] = ["tool", "skill", "agent", "extension"];
const TYPE_LABELS: Record<Asset["type"], string> = {
  tool: "כלי", skill: "סקיל", agent: "סוכן", extension: "תוסף",
};
const ALL_PRESETS = Object.keys(COLOR_PRESETS) as ColorPreset[];

function emptyAsset(): Asset {
  return { name: "", type: "tool", description: "", access: "", access_note: null,
    audience: [], has_guide: false, guide_url: null, install_url: null, template_url: null, added_by: "admin" };
}
function emptyTab(): TabConfig {
  return { key: "", label: "", emoji: "📌", colorPreset: "sky", showAll: false };
}

type Section = "assets" | "tabs" | "settings";
type FormTarget = "asset" | "tab";

// ── Component ─────────────────────────────────────────────────────────
export function AdminClient({
  initialAssets, initialTabs, initialSettings,
}: {
  initialAssets: Asset[];
  initialTabs: TabConfig[];
  initialSettings: SiteSettings;
}) {
  // Auth
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  // Navigation
  const [section, setSection] = useState<Section>("assets");

  // Data
  const [assets, setAssets]     = useState<Asset[]>(initialAssets);
  const [tabs, setTabs]         = useState<TabConfig[]>(initialTabs);
  const [settings, setSettings] = useState<SiteSettings>(initialSettings);

  // Pending changes per target
  const [dirty, setDirty] = useState<Set<string>>(new Set());

  // Form state
  const [formTarget, setFormTarget] = useState<FormTarget>("asset");
  const [editingIndex, setEditingIndex] = useState<number>(-2); // -2=hidden, -1=new, >=0=edit
  const [assetForm, setAssetForm] = useState<Asset>(emptyAsset());
  const [tabForm, setTabForm]     = useState<TabConfig>(emptyTab());

  // Save status
  const [saving, setSaving]   = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // ── Auth ──────────────────────────────────────────────────────────
  async function tryAuth() {
    if (!password) return;
    setAuthLoading(true); setAuthError("");
    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) { setAuthed(true); } else { setAuthError("סיסמה שגויה"); }
    } catch { setAuthError("שגיאת חיבור"); }
    setAuthLoading(false);
  }

  // ── Save to KV ───────────────────────────────────────────────────
  async function saveTarget(target: string, data: unknown) {
    setSaving(true); setSaveMsg(null);
    try {
      const res = await fetch("/api/admin/assets", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, target, data }),
      });
      let result: Record<string, string> = {};
      try { result = await res.json(); } catch { /* non-json body */ }
      if (res.ok) {
        setSaveMsg({ ok: true, text: "✅ נשמר ב-GitHub! האתר יתעדכן תוך ~1-2 דקות" });
        setDirty((d) => { const n = new Set(d); n.delete(target); return n; });
      } else {
        setSaveMsg({ ok: false, text: `❌ ${result.error || `שגיאה ${res.status}`}` });
      }
    } catch (err) {
      setSaveMsg({ ok: false, text: `❌ שגיאת חיבור: ${err}` });
    }
    setSaving(false);
  }

  function markDirty(target: string) {
    setDirty((d) => new Set([...d, target]));
    setSaveMsg(null);
  }

  // ── Asset form ────────────────────────────────────────────────────
  function openAssetAdd()        { setAssetForm(emptyAsset()); setEditingIndex(-1); setFormTarget("asset"); }
  function openAssetEdit(i: number) { setAssetForm({ ...assets[i] }); setEditingIndex(i); setFormTarget("asset"); }
  function closeForm()           { setEditingIndex(-2); }

  function commitAsset() {
    const updated = [...assets];
    if (editingIndex === -1) { updated.push(assetForm); } else { updated[editingIndex] = assetForm; }
    setAssets(updated); markDirty("assets"); closeForm();
  }

  function deleteAsset(i: number) {
    if (!confirm(`למחוק את "${assets[i].name}"?`)) return;
    setAssets(assets.filter((_, idx) => idx !== i)); markDirty("assets");
  }

  function updateAsset<K extends keyof Asset>(k: K, v: Asset[K]) { setAssetForm((f) => ({ ...f, [k]: v })); }
  function toggleAudience(key: string) {
    const cur = assetForm.audience;
    updateAsset("audience", cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key]);
  }

  // ── Tab form ──────────────────────────────────────────────────────
  function openTabAdd()          { setTabForm(emptyTab()); setEditingIndex(-1); setFormTarget("tab"); }
  function openTabEdit(i: number) { setTabForm({ ...tabs[i] }); setEditingIndex(i); setFormTarget("tab"); }

  function commitTab() {
    const updated = [...tabs];
    if (editingIndex === -1) { updated.push(tabForm); } else { updated[editingIndex] = tabForm; }
    setTabs(updated); markDirty("tabs"); closeForm();
  }

  function deleteTab(i: number) {
    if (!confirm(`למחוק את הכרטיסייה "${tabs[i].label}"?`)) return;
    setTabs(tabs.filter((_, idx) => idx !== i)); markDirty("tabs");
  }

  function moveTab(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= tabs.length) return;
    const updated = [...tabs];
    [updated[i], updated[j]] = [updated[j], updated[i]];
    setTabs(updated); markDirty("tabs");
  }

  // ── Audience options (base + dynamic from tabs) ───────────────────
  const audienceOptions = [
    ...AUDIENCES_BASE,
    ...tabs.filter((t) => !AUDIENCES_BASE.find((a) => a.key === t.key))
           .map((t) => ({ key: t.key, label: t.label, emoji: t.emoji })),
  ];

  // ═════════════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════════════

  // Login
  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--bg-color)" }}>
        <div className="card-glass rounded-2xl p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="logo-badge mx-auto mb-4">HB</div>
            <h1 className="text-xl font-bold" style={{ color: "var(--page-text)" }}>Admin Panel</h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-sec)" }}>HB Tools Hub</p>
          </div>
          <input type="password" placeholder="סיסמת מנהל" value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && tryAuth()}
            className="admin-input w-full mb-3" autoFocus />
          {authError && <p className="text-xs text-center mb-3" style={{ color: "#f87171" }}>{authError}</p>}
          <button onClick={tryAuth} disabled={authLoading || !password}
            className="w-full py-2.5 rounded-xl font-bold text-sm text-white"
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", opacity: authLoading||!password ? 0.6 : 1, cursor: authLoading||!password ? "not-allowed":"pointer" }}>
            {authLoading ? "..." : "כניסה"}
          </button>
        </div>
      </div>
    );
  }

  // Form overlay
  if (editingIndex > -2) {
    const isNew = editingIndex === -1;

    if (formTarget === "tab") {
      const preset = COLOR_PRESETS[tabForm.colorPreset];
      return (
        <div className="min-h-screen" style={{ background: "var(--bg-color)" }}>
          <div className="max-w-xl mx-auto px-6 py-8">
            <button onClick={closeForm} className="text-sm mb-5 block" style={{ color: "var(--text-sec)" }}>← חזרה</button>
            <h2 className="text-lg font-bold mb-5" style={{ color: "var(--page-text)" }}>
              {isNew ? "כרטיסייה חדשה" : `עריכה: ${tabs[editingIndex]?.label}`}
            </h2>
            <div className="card-glass rounded-2xl p-6 space-y-5">
              {/* Label */}
              <div>
                <label className="admin-label">שם הכרטיסייה *</label>
                <input value={tabForm.label} onChange={(e) => setTabForm((f) => ({ ...f, label: e.target.value }))}
                  className="admin-input w-full" placeholder="כלי מדריכים" />
              </div>
              {/* Key */}
              <div>
                <label className="admin-label">מזהה (key) — אותיות קטנות ומקפים בלבד *</label>
                <input value={tabForm.key} onChange={(e) => setTabForm((f) => ({ ...f, key: e.target.value.toLowerCase().replace(/\s+/g, "-") }))}
                  className="admin-input w-full" placeholder="instructors" dir="ltr"
                  disabled={!isNew} style={{ opacity: isNew ? 1 : 0.5 }} />
                {!isNew && <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>לא ניתן לשנות key קיים (ישפיע על שיוך כלים)</p>}
              </div>
              {/* Emoji */}
              <div>
                <label className="admin-label">אמוג&apos;י</label>
                <input value={tabForm.emoji} onChange={(e) => setTabForm((f) => ({ ...f, emoji: e.target.value }))}
                  className="admin-input w-full" placeholder="🎓" style={{ fontSize: 20 }} />
              </div>
              {/* Color preset */}
              <div>
                <label className="admin-label">צבע</label>
                <div className="flex gap-2 flex-wrap">
                  {ALL_PRESETS.map((p) => {
                    const pr = COLOR_PRESETS[p];
                    return (
                      <button key={p} onClick={() => setTabForm((f) => ({ ...f, colorPreset: p }))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all bg-gradient-to-l ${pr.color}`}
                        style={{ color:"#fff", opacity: tabForm.colorPreset === p ? 1 : 0.35, borderColor:"transparent" }}>
                        {PRESET_LABELS[p]}
                      </button>
                    );
                  })}
                </div>
                {/* Preview */}
                <div className="mt-3">
                  <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold text-white bg-gradient-to-l ${preset.color} ${preset.glowClass}`}>
                    <span>{tabForm.emoji}</span><span>{tabForm.label || "תצוגה מקדימה"}</span>
                  </span>
                </div>
              </div>
              {/* Show all */}
              <div className="flex items-center gap-3">
                <button onClick={() => setTabForm((f) => ({ ...f, showAll: !f.showAll }))}
                  className="w-10 h-5 rounded-full relative shrink-0 transition-all"
                  style={{ background: tabForm.showAll ? "#6366f1":"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.15)" }}>
                  <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                    style={{ right: tabForm.showAll ? "2px":"auto", left: tabForm.showAll ? "auto":"2px" }} />
                </button>
                <span className="text-sm" style={{ color:"var(--page-text)" }}>הצג את כל הכלים (סופר-סט)</span>
              </div>
              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button onClick={commitTab} disabled={!tabForm.label || !tabForm.key}
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white"
                  style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)", opacity:(!tabForm.label||!tabForm.key)?0.5:1, cursor:(!tabForm.label||!tabForm.key)?"not-allowed":"pointer" }}>
                  {isNew ? "הוסף כרטיסייה" : "שמור"}
                </button>
                <button onClick={closeForm} className="px-5 py-2.5 rounded-xl text-sm font-semibold border"
                  style={{ borderColor:"var(--card-border)", color:"var(--text-sec)", cursor:"pointer" }}>ביטול</button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Asset form
    const canSave = assetForm.name.trim() !== "" && assetForm.audience.length > 0;
    return (
      <div className="min-h-screen" style={{ background: "var(--bg-color)" }}>
        <div className="max-w-2xl mx-auto px-6 py-8">
          <button onClick={closeForm} className="text-sm mb-5 block" style={{ color:"var(--text-sec)" }}>← חזרה</button>
          <h2 className="text-lg font-bold mb-5" style={{ color:"var(--page-text)" }}>
            {isNew ? "כלי חדש" : `עריכה: ${assets[editingIndex]?.name}`}
          </h2>
          <div className="card-glass rounded-2xl p-6 space-y-5">
            <div>
              <label className="admin-label">שם הכלי *</label>
              <input value={assetForm.name} onChange={(e) => updateAsset("name", e.target.value)} className="admin-input w-full" placeholder="Safe Play Hub" />
            </div>
            <div>
              <label className="admin-label">סוג</label>
              <div className="flex gap-2 flex-wrap">
                {TYPES.map((t) => (
                  <button key={t} onClick={() => updateAsset("type", t)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all"
                    style={assetForm.type===t ? { background:"#6366f1", borderColor:"#6366f1", color:"#fff" } : { background:"transparent", borderColor:"var(--card-border)", color:"var(--text-sec)" }}>
                    {TYPE_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="admin-label">תיאור</label>
              <textarea value={assetForm.description} onChange={(e) => updateAsset("description", e.target.value)}
                rows={2} className="admin-input w-full" style={{ resize:"none" }} placeholder="תיאור קצר..." />
            </div>
            <div>
              <label className="admin-label">קישור גישה (URL)</label>
              <input value={assetForm.access} onChange={(e) => updateAsset("access", e.target.value)} className="admin-input w-full" placeholder="https://..." dir="ltr" />
            </div>
            <div>
              <label className="admin-label">הערת גישה / סיסמה</label>
              <input value={assetForm.access_note ?? ""} onChange={(e) => updateAsset("access_note", e.target.value||null)} className="admin-input w-full" placeholder="סיסמה: HB@..." />
            </div>
            <div>
              <label className="admin-label">קהל יעד *</label>
              <div className="flex gap-2 flex-wrap">
                {audienceOptions.map((a) => (
                  <button key={a.key} onClick={() => toggleAudience(a.key)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all"
                    style={assetForm.audience.includes(a.key) ? { background:"#6366f1", borderColor:"#6366f1", color:"#fff" } : { background:"transparent", borderColor:"var(--card-border)", color:"var(--text-sec)" }}>
                    {a.emoji} {a.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => { updateAsset("has_guide", !assetForm.has_guide); if(assetForm.has_guide) updateAsset("guide_url",null); }}
                className="w-10 h-5 rounded-full relative shrink-0 transition-all"
                style={{ background: assetForm.has_guide ? "#6366f1":"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.15)" }}>
                <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                  style={{ right: assetForm.has_guide ? "2px":"auto", left: assetForm.has_guide ? "auto":"2px" }} />
              </button>
              <span className="text-sm" style={{ color:"var(--page-text)" }}>יש מדריך שימוש</span>
            </div>
            {assetForm.has_guide && (
              <div>
                <label className="admin-label">קישור למדריך</label>
                <input value={assetForm.guide_url ?? ""} onChange={(e) => updateAsset("guide_url", e.target.value||null)} className="admin-input w-full" placeholder="https://youtu.be/..." dir="ltr" />
              </div>
            )}
            <div>
              <label className="admin-label">קישור להתקנה (GitHub)</label>
              <input value={assetForm.install_url ?? ""} onChange={(e) => updateAsset("install_url", e.target.value||null)} className="admin-input w-full" placeholder="https://github.com/..." dir="ltr" />
            </div>
            <div>
              <label className="admin-label">קישור לתבנית / קוד מקור (GitHub)</label>
              <input value={assetForm.template_url ?? ""} onChange={(e) => updateAsset("template_url", e.target.value||null)} className="admin-input w-full" placeholder="https://github.com/..." dir="ltr" />
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={commitAsset} disabled={!canSave}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white"
                style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)", opacity:canSave?1:0.5, cursor:canSave?"pointer":"not-allowed" }}>
                {isNew ? "הוסף כלי" : "שמור"}
              </button>
              <button onClick={closeForm} className="px-5 py-2.5 rounded-xl text-sm font-semibold border"
                style={{ borderColor:"var(--card-border)", color:"var(--text-sec)", cursor:"pointer" }}>ביטול</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Main panel ────────────────────────────────────────────────────
  const NAV: { key: Section; label: string; emoji: string }[] = [
    { key: "assets",   label: "כלים",       emoji: "🧰" },
    { key: "tabs",     label: "כרטיסיות",   emoji: "🗂" },
    { key: "settings", label: "הגדרות",     emoji: "⚙️" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-color)" }}>
      <div className="max-w-3xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold" style={{ color:"var(--page-text)" }}>Admin Panel</h1>
            <p className="text-sm mt-0.5" style={{ color:"var(--text-sec)" }}>
              {dirty.size > 0 && <span className="text-amber-400 font-semibold">● שינויים לא מפורסמים · </span>}
              HB Tools Hub
            </p>
          </div>
          <a href="/" className="px-4 py-2 rounded-xl text-sm font-semibold border"
            style={{ borderColor:"var(--card-border)", color:"var(--text-sec)" }}>← לאתר</a>
        </div>

        {/* Save message */}
        {saveMsg && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm font-semibold"
            style={{ background: saveMsg.ok ? "rgba(16,185,129,0.12)":"rgba(239,68,68,0.12)",
              border:`1px solid ${saveMsg.ok?"rgba(16,185,129,0.3)":"rgba(239,68,68,0.3)"}`,
              color: saveMsg.ok ? "#6ee7b7":"#fca5a5" }}>
            {saveMsg.text}
          </div>
        )}

        {/* Section nav */}
        <div className="flex gap-2 mb-6">
          {NAV.map((n) => (
            <button key={n.key} onClick={() => setSection(n.key)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border transition-all"
              style={section===n.key
                ? { background:"#6366f1", borderColor:"#6366f1", color:"#fff" }
                : { background:"transparent", borderColor:"var(--card-border)", color:"var(--text-sec)" }}>
              <span>{n.emoji}</span><span>{n.label}</span>
              {dirty.has(n.key==="assets"?"assets":n.key==="tabs"?"tabs":"settings") &&
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 ml-1" />}
            </button>
          ))}
        </div>

        {/* ── ASSETS ── */}
        {section === "assets" && (
          <>
            <div className="flex justify-between items-center mb-3">
              <p className="text-sm font-semibold" style={{ color:"var(--text-sec)" }}>{assets.length} כלים</p>
              <div className="flex gap-2">
                {dirty.has("assets") && (
                  <button onClick={() => saveTarget("assets", assets)} disabled={saving}
                    className="px-4 py-2 rounded-xl text-sm font-bold text-white"
                    style={{ background:"linear-gradient(135deg,#10b981,#059669)", opacity:saving?0.7:1, cursor:saving?"not-allowed":"pointer" }}>
                    {saving ? "שומר..." : "⬆ פרסם"}
                  </button>
                )}
                <button onClick={openAssetAdd} className="px-4 py-2 rounded-xl text-sm font-bold text-white"
                  style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)", cursor:"pointer" }}>+ כלי חדש</button>
              </div>
            </div>
            <div className="space-y-2">
              {assets.map((asset, i) => (
                <div key={i} className="card-glass rounded-xl px-4 py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm" style={{ color:"var(--page-text)" }}>{asset.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background:"rgba(99,102,241,0.18)", color:"#a5b4fc" }}>
                        {TYPE_LABELS[asset.type]}
                      </span>
                      {!asset.access && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background:"rgba(251,191,36,0.15)", color:"#fbbf24" }}>ללא קישור</span>}
                    </div>
                    <p className="text-xs mt-0.5 truncate" style={{ color:"var(--text-muted)" }}>
                      {asset.audience.join(" · ")}{asset.access && ` · ${asset.access.replace("https://","").split("/")[0]}`}
                    </p>
                  </div>
                  <button onClick={() => openAssetEdit(i)} className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold border"
                    style={{ borderColor:"var(--card-border)", color:"var(--text-sec)", cursor:"pointer" }}>עריכה</button>
                  <button onClick={() => deleteAsset(i)} className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold border"
                    style={{ borderColor:"rgba(239,68,68,0.25)", color:"#f87171", cursor:"pointer" }}>מחק</button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── TABS ── */}
        {section === "tabs" && (
          <>
            <div className="flex justify-between items-center mb-3">
              <p className="text-sm font-semibold" style={{ color:"var(--text-sec)" }}>{tabs.length} כרטיסיות</p>
              <div className="flex gap-2">
                {dirty.has("tabs") && (
                  <button onClick={() => saveTarget("tabs", tabs)} disabled={saving}
                    className="px-4 py-2 rounded-xl text-sm font-bold text-white"
                    style={{ background:"linear-gradient(135deg,#10b981,#059669)", opacity:saving?0.7:1, cursor:saving?"not-allowed":"pointer" }}>
                    {saving ? "שומר..." : "⬆ פרסם"}
                  </button>
                )}
                <button onClick={openTabAdd} className="px-4 py-2 rounded-xl text-sm font-bold text-white"
                  style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)", cursor:"pointer" }}>+ כרטיסייה חדשה</button>
              </div>
            </div>
            <div className="space-y-2">
              {tabs.map((tab, i) => {
                const pr = COLOR_PRESETS[tab.colorPreset];
                return (
                  <div key={i} className="card-glass rounded-xl px-4 py-3 flex items-center gap-3">
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => moveTab(i, -1)} disabled={i===0}
                        className="w-6 h-6 rounded text-xs flex items-center justify-center"
                        style={{ background:"rgba(255,255,255,0.07)", color:"var(--text-sec)", opacity:i===0?0.3:1, cursor:i===0?"not-allowed":"pointer" }}>↑</button>
                      <button onClick={() => moveTab(i, 1)} disabled={i===tabs.length-1}
                        className="w-6 h-6 rounded text-xs flex items-center justify-center"
                        style={{ background:"rgba(255,255,255,0.07)", color:"var(--text-sec)", opacity:i===tabs.length-1?0.3:1, cursor:i===tabs.length-1?"not-allowed":"pointer" }}>↓</button>
                    </div>
                    <span className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full text-white bg-gradient-to-l ${pr.color}`}>
                      {tab.emoji} {tab.label}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs truncate" style={{ color:"var(--text-muted)" }}>
                        key: {tab.key}{tab.showAll ? " · סופר-סט" : ""}
                      </p>
                    </div>
                    <button onClick={() => openTabEdit(i)} className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold border"
                      style={{ borderColor:"var(--card-border)", color:"var(--text-sec)", cursor:"pointer" }}>עריכה</button>
                    <button onClick={() => deleteTab(i)} className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold border"
                      style={{ borderColor:"rgba(239,68,68,0.25)", color:"#f87171", cursor:"pointer" }}>מחק</button>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ── SETTINGS ── */}
        {section === "settings" && (
          <div className="card-glass rounded-2xl p-6 space-y-5">
            <div>
              <label className="admin-label">כותרת האתר</label>
              <input value={settings.siteTitle}
                onChange={(e) => { setSettings((s) => ({ ...s, siteTitle: e.target.value })); markDirty("settings"); }}
                className="admin-input w-full" placeholder="HB Tools Hub" />
            </div>
            <div>
              <label className="admin-label">כתובת משנה</label>
              <input value={settings.siteSubtitle}
                onChange={(e) => { setSettings((s) => ({ ...s, siteSubtitle: e.target.value })); markDirty("settings"); }}
                className="admin-input w-full" placeholder="מרכז הכלים הפנימי" />
            </div>
            {dirty.has("settings") && (
              <button onClick={() => saveTarget("settings", settings)} disabled={saving}
                className="w-full py-2.5 rounded-xl font-bold text-sm text-white"
                style={{ background:"linear-gradient(135deg,#10b981,#059669)", opacity:saving?0.7:1, cursor:saving?"not-allowed":"pointer" }}>
                {saving ? "שומר..." : "⬆ פרסם שינויים"}
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
