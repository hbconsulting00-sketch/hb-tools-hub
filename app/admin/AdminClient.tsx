"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Asset } from "@/components/AssetCard";
import { TabConfig, ColorPreset, COLOR_PRESETS, PRESET_LABELS, PRESET_HEX, ALL_PRESETS } from "@/lib/tabPresets";
import { AssetTypeConfig, TypeBehavior, BEHAVIORS, BEHAVIOR_LABELS, INSTALL_PRESETS, findType } from "@/lib/assetTypes";
import { BrandIcon, ICONS, ICON_KEYS } from "@/lib/icons";
import { LINK_PRESETS, iconForUrl, migrateLegacy } from "@/lib/assetLinks";

// ── Types ─────────────────────────────────────────────────────────────
interface SiteSettings {
  siteTitle: string;
  siteSubtitle: string;
}

/** Grid of line icons to pick from; clicking the picked one again clears it (back to the emoji). */
function IconPicker({ value, onChange }: { value?: string; onChange: (icon: string | undefined) => void }) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {ICON_KEYS.map((k) => {
        const on = value === k;
        return (
          <button key={k} type="button" title={ICONS[k].label} onClick={() => onChange(on ? undefined : k)}
            className="icon-ring" style={{ width: 36, height: 36, cursor: "pointer",
              ...(on ? { background: "var(--grad-brand)", color: "#fff", borderColor: "transparent" } : {}) }}>
            <BrandIcon icon={k} size={16} />
          </button>
        );
      })}
    </div>
  );
}

function emptyAsset(firstType: string): Asset {
  return { name: "", type: firstType, description: "", access: "", access_note: null,
    audience: [], has_guide: false, guide_url: null, install_url: null, template_url: null,
    install_notes: null, codes: [], links: [], added_by: "admin" };
}
function emptyTab(): TabConfig {
  return { key: "", label: "", emoji: "📌", icon: "layers", colorPreset: "sky", showAll: false };
}
function emptyType(): AssetTypeConfig {
  return { key: "", label: "", emoji: "🔗", icon: "link", colorPreset: "sky", behavior: "link", btnLabel: "פתח" };
}

type Section = "assets" | "types" | "tabs" | "settings";
type FormTarget = "asset" | "tab" | "type";

// ── Component ─────────────────────────────────────────────────────────
export function AdminClient({
  initialAssets, initialTabs, initialTypes, initialSettings,
}: {
  initialAssets: Asset[];
  initialTabs: TabConfig[];
  initialTypes: AssetTypeConfig[];
  initialSettings: SiteSettings;
}) {
  // Auth
  const [authed, setAuthed] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  // Resume an existing browser session instead of asking for the password again.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/session")
      .then((r) => r.json())
      .then((d) => { if (!cancelled && d?.authed) setAuthed(true); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setCheckingSession(false); });
    return () => { cancelled = true; };
  }, []);

  // Navigation
  const [section, setSection] = useState<Section>("assets");

  // Data
  const [assets, setAssets]     = useState<Asset[]>(initialAssets);
  const [tabs, setTabs]         = useState<TabConfig[]>(initialTabs);
  const [types, setTypes]       = useState<AssetTypeConfig[]>(initialTypes);
  const [settings, setSettings] = useState<SiteSettings>(initialSettings);

  // Pending changes per target
  const [dirty, setDirty] = useState<Set<string>>(new Set());

  // Form state
  const [formTarget, setFormTarget] = useState<FormTarget>("asset");
  const [editingIndex, setEditingIndex] = useState<number>(-2); // -2=hidden, -1=new, >=0=edit
  const [assetForm, setAssetForm] = useState<Asset>(emptyAsset(initialTypes[0]?.key ?? "tool"));
  const [tabForm, setTabForm]     = useState<TabConfig>(emptyTab());
  const [typeForm, setTypeForm]   = useState<AssetTypeConfig>(emptyType());

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
      if (res.ok) { setAuthed(true); setPassword(""); } else { setAuthError("סיסמה שגויה"); }
    } catch { setAuthError("שגיאת חיבור"); }
    setAuthLoading(false);
  }

  async function logout() {
    await fetch("/api/admin/session", { method: "DELETE" }).catch(() => {});
    setAuthed(false);
  }

  // ── Save to Redis ────────────────────────────────────────────────
  async function saveTarget(target: string, data: unknown) {
    setSaving(true); setSaveMsg(null);
    try {
      const res = await fetch("/api/admin/assets", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target, data }),
      });
      let result: Record<string, string> = {};
      try { result = await res.json(); } catch { /* non-json body */ }
      if (res.ok) {
        setSaveMsg({ ok: true, text: "✅ פורסם — האתר כבר מעודכן" });
        setDirty((d) => { const n = new Set(d); n.delete(target); return n; });
      } else if (res.status === 401) {
        setAuthed(false);
        setSaveMsg({ ok: false, text: "❌ ההתחברות פגה — התחברי שוב" });
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
  function openAssetAdd() {
    setAssetForm(emptyAsset(types[0]?.key ?? "tool"));
    setEditingIndex(-1); setFormTarget("asset");
  }
  function openAssetEdit(i: number) {
    // Old guide/install/source/password fields open as rows in the new lists.
    const a = assets[i];
    const t = findType(types, a.type);
    const target = a.access?.trim() || (t.behavior === "download" ? a.template_url?.trim() ?? "" : "");
    setAssetForm(migrateLegacy({ ...a }, target));
    setEditingIndex(i); setFormTarget("asset");
  }
  function closeForm() { setEditingIndex(-2); }

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
  function openTabAdd()           { setTabForm(emptyTab()); setEditingIndex(-1); setFormTarget("tab"); }
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

  // ── Type form ─────────────────────────────────────────────────────
  function openTypeAdd()           { setTypeForm(emptyType()); setEditingIndex(-1); setFormTarget("type"); }
  function openTypeEdit(i: number) { setTypeForm({ ...types[i] }); setEditingIndex(i); setFormTarget("type"); }

  function commitType() {
    const updated = [...types];
    if (editingIndex === -1) { updated.push(typeForm); } else { updated[editingIndex] = typeForm; }
    setTypes(updated); markDirty("types"); closeForm();
  }
  function deleteType(i: number) {
    const inUse = assets.filter((a) => a.type === types[i].key);
    if (inUse.length > 0) {
      alert(`אי אפשר למחוק את "${types[i].label}" — ${inUse.length} כלים משתמשים בו:\n\n${inUse.slice(0, 8).map((a) => "• " + a.name).join("\n")}${inUse.length > 8 ? "\n…" : ""}\n\nשני אותם לסוג אחר קודם.`);
      return;
    }
    if (!confirm(`למחוק את הסוג "${types[i].label}"?`)) return;
    setTypes(types.filter((_, idx) => idx !== i)); markDirty("types");
  }
  function moveType(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= types.length) return;
    const updated = [...types];
    [updated[i], updated[j]] = [updated[j], updated[i]];
    setTypes(updated); markDirty("types");
  }

  // ── Audience options — one per tab ─────────────────────────────────
  const audienceOptions = tabs.map((t) => ({ key: t.key, label: t.label, emoji: t.emoji, icon: t.icon }));

  // ═════════════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════════════

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-color)" }}>
        <p className="text-sm" style={{ color: "var(--text-sec)" }}>רגע…</p>
      </div>
    );
  }

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
          {authError && <p className="text-xs text-center mb-3" style={{ color: "#ef4444" }}>{authError}</p>}
          <button onClick={tryAuth} disabled={authLoading || !password}
            className="w-full py-2.5 rounded-xl font-bold text-sm text-white"
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", opacity: authLoading||!password ? 0.6 : 1, cursor: authLoading||!password ? "not-allowed":"pointer" }}>
            {authLoading ? "..." : "כניסה"}
          </button>
          <p className="text-xs text-center mt-4" style={{ color: "var(--text-muted)" }}>
            נשארת מחוברת עד שתסגרי את הדפדפן
          </p>
        </div>
      </div>
    );
  }

  // ── FORM OVERLAYS ────────────────────────────────────────────────
  if (editingIndex > -2) {
    const isNew = editingIndex === -1;

    // ── Tab form ──
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
              <div>
                <label className="admin-label">שם הכרטיסייה *</label>
                <input value={tabForm.label} onChange={(e) => setTabForm((f) => ({ ...f, label: e.target.value }))}
                  className="admin-input w-full" placeholder="כלי מדריכים" />
              </div>
              <div>
                <label className="admin-label">מזהה (key) — אותיות קטנות ומקפים בלבד *</label>
                <input value={tabForm.key} onChange={(e) => setTabForm((f) => ({ ...f, key: e.target.value.toLowerCase().replace(/\s+/g, "-") }))}
                  className="admin-input w-full" placeholder="instructors" dir="ltr"
                  disabled={!isNew} style={{ opacity: isNew ? 1 : 0.5 }} />
                {!isNew && <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>לא ניתן לשנות key קיים (ישפיע על שיוך כלים)</p>}
              </div>
              <div>
                <label className="admin-label">אייקון</label>
                <IconPicker value={tabForm.icon} onChange={(icon) => setTabForm((f) => ({ ...f, icon }))} />
                <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>בלי אייקון — מוצג האמוג&apos;י:</p>
                <input value={tabForm.emoji} onChange={(e) => setTabForm((f) => ({ ...f, emoji: e.target.value }))}
                  className="admin-input w-24 mt-1" placeholder="🎓" style={{ fontSize: 18 }} />
              </div>
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
                <div className="mt-3">
                  <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold text-white bg-gradient-to-l ${preset.color} ${preset.glowClass}`}>
                    <BrandIcon icon={tabForm.icon} emoji={tabForm.emoji} size={16} /><span>{tabForm.label || "תצוגה מקדימה"}</span>
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setTabForm((f) => ({ ...f, showAll: !f.showAll }))}
                  className="w-10 h-5 rounded-full relative shrink-0 transition-all"
                  style={{ background: tabForm.showAll ? "#6366f1":"var(--toggle-off)", border:"1px solid var(--toggle-border)" }}>
                  <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                    style={{ right: tabForm.showAll ? "2px":"auto", left: tabForm.showAll ? "auto":"2px" }} />
                </button>
                <span className="text-sm" style={{ color:"var(--page-text)" }}>הצג את כל הכלים (סופר-סט)</span>
              </div>
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

    // ── Type form ──
    if (formTarget === "type") {
      const hex = PRESET_HEX[typeForm.colorPreset];
      const keyTaken = isNew && types.some((t) => t.key === typeForm.key);
      const canSaveType = typeForm.label.trim() !== "" && /^[a-z0-9-]+$/.test(typeForm.key) && !keyTaken;
      return (
        <div className="min-h-screen" style={{ background: "var(--bg-color)" }}>
          <div className="max-w-xl mx-auto px-6 py-8">
            <button onClick={closeForm} className="text-sm mb-5 block" style={{ color: "var(--text-sec)" }}>← חזרה</button>
            <h2 className="text-lg font-bold mb-5" style={{ color: "var(--page-text)" }}>
              {isNew ? "סוג חדש" : `עריכה: ${types[editingIndex]?.label}`}
            </h2>
            <div className="card-glass rounded-2xl p-6 space-y-5">
              <div>
                <label className="admin-label">שם הסוג *</label>
                <input value={typeForm.label}
                  onChange={(e) => {
                    const label = e.target.value;
                    setTypeForm((f) => ({ ...f, label }));
                  }}
                  className="admin-input w-full" placeholder="אתר שיווקי" />
              </div>
              <div>
                <label className="admin-label">מזהה (key) — אנגלית קטנה ומקפים *</label>
                <input value={typeForm.key}
                  onChange={(e) => setTypeForm((f) => ({ ...f, key: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") }))}
                  className="admin-input w-full" placeholder="marketing-site" dir="ltr"
                  disabled={!isNew} style={{ opacity: isNew ? 1 : 0.5 }} />
                {!isNew && <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>לא ניתן לשנות key קיים (ישבור את השיוך של הכלים)</p>}
                {keyTaken && <p className="text-xs mt-1" style={{ color: "#ef4444" }}>המזהה הזה כבר תפוס</p>}
              </div>
              <div>
                <label className="admin-label">אייקון</label>
                <IconPicker value={typeForm.icon} onChange={(icon) => setTypeForm((f) => ({ ...f, icon }))} />
                <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>בלי אייקון — מוצג האמוג&apos;י:</p>
                <input value={typeForm.emoji} onChange={(e) => setTypeForm((f) => ({ ...f, emoji: e.target.value }))}
                  className="admin-input w-24 mt-1" placeholder="🌐" style={{ fontSize: 18 }} />
              </div>
              <div>
                <label className="admin-label">איך הכרטיס יתנהג</label>
                <div className="space-y-2">
                  {BEHAVIORS.map((b) => (
                    <button key={b.key} onClick={() => setTypeForm((f) => ({ ...f, behavior: b.key as TypeBehavior }))}
                      className="w-full text-right px-4 py-2.5 rounded-xl border transition-all"
                      style={typeForm.behavior === b.key
                        ? { background: "rgba(99,102,241,0.14)", borderColor: "#6366f1" }
                        : { background: "transparent", borderColor: "var(--card-border)" }}>
                      <div className="text-sm font-bold" style={{ color: "var(--page-text)" }}>{b.label}</div>
                      <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{b.hint}</div>
                    </button>
                  ))}
                </div>
              </div>
              {typeForm.behavior !== "command" && (
                <div>
                  <label className="admin-label">טקסט על הכפתור</label>
                  <input value={typeForm.btnLabel} onChange={(e) => setTypeForm((f) => ({ ...f, btnLabel: e.target.value }))}
                    className="admin-input w-full" placeholder="פתח אתר" />
                </div>
              )}
              <div>
                <label className="admin-label">צבע</label>
                <div className="flex gap-2 flex-wrap">
                  {ALL_PRESETS.map((p) => (
                    <button key={p} onClick={() => setTypeForm((f) => ({ ...f, colorPreset: p as ColorPreset }))}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all"
                      style={{ background: PRESET_HEX[p], color: "#fff", borderColor: "transparent",
                               opacity: typeForm.colorPreset === p ? 1 : 0.35 }}>
                      {PRESET_LABELS[p]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live preview of the card bits this type controls */}
              <div className="rounded-xl p-4 space-y-3" style={{ background: "var(--step-bg)", border: "1px solid var(--empty-border)" }}>
                <p className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>תצוגה מקדימה</p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full"
                  style={{ background: `${hex}24`, color: hex, border: `1px solid ${hex}4d` }}>
                  <BrandIcon icon={typeForm.icon} emoji={typeForm.emoji} size={12} /><span>{typeForm.label || "שם הסוג"}</span>
                </span>
                {typeForm.behavior === "command" ? (
                  <div className="rounded-lg p-2.5 text-center" style={{ background: "var(--cmd-bg)", border: `1px solid ${hex}4d` }}>
                    <span className="text-sm font-bold" style={{ color: hex, fontFamily: "'DM Mono', monospace" }} dir="ltr">/example</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-sm font-bold py-2.5 px-4 rounded-xl text-white"
                    style={{ background: hex, boxShadow: `0 6px 18px ${hex}59` }}>
                    <span>{typeForm.behavior === "download" ? "⬇" : ""}</span>
                    <span>{typeForm.btnLabel || "פתח"}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-1">
                <button onClick={commitType} disabled={!canSaveType}
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white"
                  style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)", opacity:canSaveType?1:0.5, cursor:canSaveType?"pointer":"not-allowed" }}>
                  {isNew ? "הוסף סוג" : "שמור"}
                </button>
                <button onClick={closeForm} className="px-5 py-2.5 rounded-xl text-sm font-semibold border"
                  style={{ borderColor:"var(--card-border)", color:"var(--text-sec)", cursor:"pointer" }}>ביטול</button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // ── Asset form ──
    const canSave = assetForm.name.trim() !== "" && assetForm.audience.length > 0;
    const activeType = findType(types, assetForm.type);
    return (
      <div className="min-h-screen" style={{ background: "var(--bg-color)" }}>
        <div className="max-w-2xl mx-auto px-6 py-8">
          <button onClick={closeForm} className="text-sm mb-5 block" style={{ color:"var(--text-sec)" }}>← חזרה</button>
          <h2 className="text-lg font-bold mb-5" style={{ color:"var(--page-text)" }}>
            {isNew ? "כלי חדש" : `עריכה: ${assets[editingIndex]?.name}`}
          </h2>
          <div className="card-glass rounded-2xl p-6 space-y-5">
            <div>
              <label className="admin-label">שם בעברית *</label>
              <input value={assetForm.name} onChange={(e) => updateAsset("name", e.target.value)} className="admin-input w-full" placeholder="מרכז משחקי הבטיחות" />
            </div>
            <div>
              <label className="admin-label">שם באנגלית — מוצג מתחת לשם העברי</label>
              <input value={assetForm.name_en ?? ""} onChange={(e) => updateAsset("name_en", e.target.value || null)}
                className="admin-input w-full" placeholder="Safe Play Hub" dir="ltr" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="admin-label" style={{ marginBottom: 0 }}>סוג</label>
                <button onClick={() => { openTypeAdd(); }} className="text-xs font-semibold" style={{ color: "#6366f1" }}>
                  + סוג חדש
                </button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {types.map((t) => (
                  <button key={t.key} onClick={() => updateAsset("type", t.key)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all inline-flex items-center gap-1"
                    style={assetForm.type === t.key
                      ? { background: PRESET_HEX[t.colorPreset], borderColor: PRESET_HEX[t.colorPreset], color:"#fff" }
                      : { background:"transparent", borderColor:"var(--card-border)", color:"var(--text-sec)" }}>
                    <BrandIcon icon={t.icon} emoji={t.emoji} size={13} /><span>{t.label}</span>
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
              <label className="admin-label">
                {activeType.behavior === "command" ? "הפקודה ב-Claude Code"
                  : activeType.behavior === "download" ? "קישור להורדת הקובץ"
                  : "קישור גישה (URL)"}
              </label>
              <input value={assetForm.access} onChange={(e) => updateAsset("access", e.target.value)} className="admin-input w-full"
                placeholder={activeType.behavior === "command" ? "/elearning" : "https://..."} dir="ltr" />
            </div>

            <div>
              <label className="admin-label">קהל יעד *</label>
              <div className="flex gap-2 flex-wrap">
                {audienceOptions.map((a) => (
                  <button key={a.key} onClick={() => toggleAudience(a.key)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all"
                    style={assetForm.audience.includes(a.key) ? { background:"#6366f1", borderColor:"#6366f1", color:"#fff" } : { background:"transparent", borderColor:"var(--card-border)", color:"var(--text-sec)" }}>
                    <BrandIcon icon={a.icon} emoji={a.emoji} size={12} className="inline -mt-0.5" /> {a.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Codes & passwords — each shows with a copy button */}
            <div>
              <label className="admin-label">סיסמאות וקודים</label>
              <div className="space-y-2">
                {(assetForm.codes ?? []).map((c, i) => (
                  <div key={i} className="flex gap-2">
                    <input value={c.label} placeholder="סיסמה / קוד חברה X" className="admin-input w-36 shrink-0"
                      onChange={(e) => updateAsset("codes", (assetForm.codes ?? []).map((x, j) => j === i ? { ...x, label: e.target.value } : x))} />
                    <input value={c.value} placeholder="HB-1234" dir="ltr" className="admin-input flex-1 min-w-0"
                      onChange={(e) => updateAsset("codes", (assetForm.codes ?? []).map((x, j) => j === i ? { ...x, value: e.target.value } : x))} />
                    <button onClick={() => updateAsset("codes", (assetForm.codes ?? []).filter((_, j) => j !== i))}
                      className="px-3 rounded-lg text-xs border" style={{ borderColor:"rgba(239,68,68,0.3)", color:"#ef4444" }}>✕</button>
                  </div>
                ))}
                <button onClick={() => updateAsset("codes", [...(assetForm.codes ?? []), { label: "סיסמה", value: "" }])}
                  className="text-xs font-semibold" style={{ color: "var(--accent)" }}>+ הוספת סיסמה / קוד</button>
              </div>
            </div>

            {/* Links — guide, Drive folder, source… each one row on the card */}
            <div>
              <label className="admin-label">קישורים נוספים בכרטיס</label>
              <div className="space-y-3">
                {(assetForm.links ?? []).map((l, i) => {
                  const set = (patch: Partial<typeof l>) =>
                    updateAsset("links", (assetForm.links ?? []).map((x, j) => j === i ? { ...x, ...patch } : x));
                  return (
                    <div key={i} className="rounded-xl p-3 space-y-2" style={{ background: "var(--well-bg)", border: "1px solid var(--well-border)" }}>
                      <div className="flex gap-2">
                        <select value={l.icon ?? ""} onChange={(e) => set({ icon: e.target.value || undefined })}
                          className="admin-input w-28 shrink-0" aria-label="אייקון">
                          {["book","video","folder","file-text","download","code","chart","globe","link"].map((k) => (
                            <option key={k} value={k}>{ICONS[k].label}</option>
                          ))}
                        </select>
                        <input value={l.label} onChange={(e) => set({ label: e.target.value })} placeholder="מה זה? (תיקיית התשובות בדרייב)"
                          className="admin-input flex-1 min-w-0" />
                        <button onClick={() => updateAsset("links", (assetForm.links ?? []).filter((_, j) => j !== i))}
                          className="px-3 rounded-lg text-xs border" style={{ borderColor:"rgba(239,68,68,0.3)", color:"#ef4444" }}>✕</button>
                      </div>
                      <input value={l.url} dir="ltr" placeholder="https://..." className="admin-input w-full"
                        onChange={(e) => set({ url: e.target.value, ...(l.icon ? {} : { icon: iconForUrl(e.target.value) }) })} />
                    </div>
                  );
                })}
                <div className="flex gap-1.5 flex-wrap">
                  {LINK_PRESETS.map((p) => (
                    <button key={p.label} onClick={() => updateAsset("links", [...(assetForm.links ?? []), { label: p.label, icon: p.icon, url: "" }])}
                      className="text-xs px-2.5 py-1 rounded-lg border inline-flex items-center gap-1"
                      style={{ borderColor:"var(--card-border)", color:"var(--text-sec)" }}>
                      <BrandIcon icon={p.icon} size={12} /> + {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Install instructions — optional, free text */}
            <div>
              <label className="admin-label">הוראות שימוש / התקנה (אופציונלי)</label>
              <textarea value={assetForm.install_notes ?? ""} onChange={(e) => updateAsset("install_notes", e.target.value||null)}
                rows={4} className="admin-input w-full" style={{ resize:"vertical" }}
                placeholder={"שורה אחת לכל שלב.\nאם תשאירי ריק — לא יופיעו הוראות בכרטיס."} />
              <div className="flex gap-2 flex-wrap mt-2">
                {INSTALL_PRESETS.map((p) => (
                  <button key={p.label} onClick={() => updateAsset("install_notes", p.text)}
                    className="text-xs px-2.5 py-1 rounded-lg border"
                    style={{ borderColor:"var(--card-border)", color:"var(--text-sec)" }}>
                    הדבק: {p.label}
                  </button>
                ))}
                {assetForm.install_notes && (
                  <button onClick={() => updateAsset("install_notes", null)}
                    className="text-xs px-2.5 py-1 rounded-lg border"
                    style={{ borderColor:"rgba(239,68,68,0.3)", color:"#ef4444" }}>
                    נקה
                  </button>
                )}
              </div>
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
    { key: "assets",   label: "כלים",     emoji: "🧰" },
    { key: "types",    label: "סוגים",    emoji: "🏷" },
    { key: "tabs",     label: "כרטיסיות", emoji: "🗂" },
    { key: "settings", label: "הגדרות",   emoji: "⚙️" },
  ];

  const publishBtn = (target: string, data: unknown) => dirty.has(target) && (
    <button onClick={() => saveTarget(target, data)} disabled={saving}
      className="px-4 py-2 rounded-xl text-sm font-bold text-white"
      style={{ background:"linear-gradient(135deg,#10b981,#059669)", opacity:saving?0.7:1, cursor:saving?"not-allowed":"pointer" }}>
      {saving ? "שומר..." : "⬆ פרסם"}
    </button>
  );

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-color)" }}>
      <div className="max-w-3xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold" style={{ color:"var(--page-text)" }}>Admin Panel</h1>
            <p className="text-sm mt-0.5" style={{ color:"var(--text-sec)" }}>
              {dirty.size > 0 && <span className="text-amber-500 font-semibold">● שינויים לא מפורסמים · </span>}
              HB Tools Hub
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={logout} className="px-4 py-2 rounded-xl text-sm font-semibold border"
              style={{ borderColor:"var(--card-border)", color:"var(--text-sec)", cursor:"pointer" }}>התנתקות</button>
            <Link href="/" className="px-4 py-2 rounded-xl text-sm font-semibold border"
              style={{ borderColor:"var(--card-border)", color:"var(--text-sec)" }}>← לאתר</Link>
          </div>
        </div>

        {/* Save message */}
        {saveMsg && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm font-semibold"
            style={{ background: saveMsg.ok ? "rgba(16,185,129,0.12)":"rgba(239,68,68,0.12)",
              border:`1px solid ${saveMsg.ok?"rgba(16,185,129,0.3)":"rgba(239,68,68,0.3)"}`,
              color: saveMsg.ok ? "#059669":"#dc2626" }}>
            {saveMsg.text}
          </div>
        )}

        {/* Section nav */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {NAV.map((n) => (
            <button key={n.key} onClick={() => setSection(n.key)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border transition-all"
              style={section===n.key
                ? { background:"#6366f1", borderColor:"#6366f1", color:"#fff" }
                : { background:"transparent", borderColor:"var(--card-border)", color:"var(--text-sec)" }}>
              <span>{n.emoji}</span><span>{n.label}</span>
              {dirty.has(n.key) && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 ml-1" />}
            </button>
          ))}
        </div>

        {/* ── ASSETS ── */}
        {section === "assets" && (
          <>
            <div className="flex justify-between items-center mb-3">
              <p className="text-sm font-semibold" style={{ color:"var(--text-sec)" }}>{assets.length} כלים</p>
              <div className="flex gap-2">
                {publishBtn("assets", assets)}
                <button onClick={openAssetAdd} className="px-4 py-2 rounded-xl text-sm font-bold text-white"
                  style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)", cursor:"pointer" }}>+ כלי חדש</button>
              </div>
            </div>
            <div className="space-y-2">
              {assets.map((asset, i) => {
                const t = findType(types, asset.type);
                return (
                  <div key={i} className="card-glass rounded-xl px-4 py-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm" style={{ color:"var(--page-text)" }}>{asset.name}</span>
                        {asset.name_en && <span className="name-en text-xs" dir="ltr">{asset.name_en}</span>}
                        <span className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background:`${PRESET_HEX[t.colorPreset]}24`, color: PRESET_HEX[t.colorPreset] }}>
                          <BrandIcon icon={t.icon} emoji={t.emoji} size={11} className="inline -mt-0.5" /> {t.label}
                        </span>
                        {!asset.access && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background:"rgba(251,191,36,0.15)", color:"#d97706" }}>ללא קישור</span>}
                      </div>
                      <p className="text-xs mt-0.5 truncate" style={{ color:"var(--text-muted)" }}>
                        {asset.audience.join(" · ")}{asset.access && ` · ${asset.access.replace("https://","").split("/")[0]}`}
                      </p>
                    </div>
                    <button onClick={() => openAssetEdit(i)} className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold border"
                      style={{ borderColor:"var(--card-border)", color:"var(--text-sec)", cursor:"pointer" }}>עריכה</button>
                    <button onClick={() => deleteAsset(i)} className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold border"
                      style={{ borderColor:"rgba(239,68,68,0.25)", color:"#ef4444", cursor:"pointer" }}>מחק</button>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ── TYPES ── */}
        {section === "types" && (
          <>
            <div className="flex justify-between items-center mb-3">
              <p className="text-sm font-semibold" style={{ color:"var(--text-sec)" }}>{types.length} סוגים</p>
              <div className="flex gap-2">
                {publishBtn("types", types)}
                <button onClick={openTypeAdd} className="px-4 py-2 rounded-xl text-sm font-bold text-white"
                  style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)", cursor:"pointer" }}>+ סוג חדש</button>
              </div>
            </div>
            <p className="text-xs mb-4" style={{ color:"var(--text-muted)" }}>
              הסוג קובע את הצבע, התווית והכפתור בכרטיס. הסדר כאן הוא הסדר בטופס עריכת כלי.
            </p>
            <div className="space-y-2">
              {types.map((t, i) => {
                const count = assets.filter((a) => a.type === t.key).length;
                return (
                  <div key={t.key} className="card-glass rounded-xl px-4 py-3 flex items-center gap-3">
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => moveType(i, -1)} disabled={i===0}
                        className="w-6 h-6 rounded text-xs flex items-center justify-center"
                        style={{ background:"var(--copy-bg)", color:"var(--text-sec)", opacity:i===0?0.3:1, cursor:i===0?"not-allowed":"pointer" }}>↑</button>
                      <button onClick={() => moveType(i, 1)} disabled={i===types.length-1}
                        className="w-6 h-6 rounded text-xs flex items-center justify-center"
                        style={{ background:"var(--copy-bg)", color:"var(--text-sec)", opacity:i===types.length-1?0.3:1, cursor:i===types.length-1?"not-allowed":"pointer" }}>↓</button>
                    </div>
                    <span className="shrink-0 text-xs font-bold px-2.5 py-1 rounded-full text-white"
                      style={{ background: PRESET_HEX[t.colorPreset] }}>
                      <BrandIcon icon={t.icon} emoji={t.emoji} size={12} className="inline -mt-0.5" /> {t.label}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs truncate" style={{ color:"var(--text-muted)" }}>
                        {BEHAVIOR_LABELS[t.behavior]}
                        {t.behavior !== "command" && ` · "${t.btnLabel}"`}
                        {` · ${count} כלים`}
                      </p>
                    </div>
                    <button onClick={() => openTypeEdit(i)} className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold border"
                      style={{ borderColor:"var(--card-border)", color:"var(--text-sec)", cursor:"pointer" }}>עריכה</button>
                    <button onClick={() => deleteType(i)} className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold border"
                      style={{ borderColor:"rgba(239,68,68,0.25)", color:"#ef4444", cursor:"pointer" }}>מחק</button>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ── TABS ── */}
        {section === "tabs" && (
          <>
            <div className="flex justify-between items-center mb-3">
              <p className="text-sm font-semibold" style={{ color:"var(--text-sec)" }}>{tabs.length} כרטיסיות</p>
              <div className="flex gap-2">
                {publishBtn("tabs", tabs)}
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
                        style={{ background:"var(--copy-bg)", color:"var(--text-sec)", opacity:i===0?0.3:1, cursor:i===0?"not-allowed":"pointer" }}>↑</button>
                      <button onClick={() => moveTab(i, 1)} disabled={i===tabs.length-1}
                        className="w-6 h-6 rounded text-xs flex items-center justify-center"
                        style={{ background:"var(--copy-bg)", color:"var(--text-sec)", opacity:i===tabs.length-1?0.3:1, cursor:i===tabs.length-1?"not-allowed":"pointer" }}>↓</button>
                    </div>
                    <span className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full text-white bg-gradient-to-l ${pr.color}`}>
                      <BrandIcon icon={tab.icon} emoji={tab.emoji} size={12} className="inline -mt-0.5" /> {tab.label}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs truncate" style={{ color:"var(--text-muted)" }}>
                        key: {tab.key}{tab.showAll ? " · סופר-סט" : ""}
                      </p>
                    </div>
                    <button onClick={() => openTabEdit(i)} className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold border"
                      style={{ borderColor:"var(--card-border)", color:"var(--text-sec)", cursor:"pointer" }}>עריכה</button>
                    <button onClick={() => deleteTab(i)} className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold border"
                      style={{ borderColor:"rgba(239,68,68,0.25)", color:"#ef4444", cursor:"pointer" }}>מחק</button>
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
