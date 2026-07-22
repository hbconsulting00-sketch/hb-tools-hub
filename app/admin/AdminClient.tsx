"use client";
import { useState } from "react";
import { Asset } from "@/components/AssetCard";

const AUDIENCES = [
  { key: "instructors", label: "כלי מדריכים", emoji: "🎓" },
  { key: "management", label: "הנהלה", emoji: "📊" },
  { key: "daily-shared", label: "יומיומי", emoji: "⚡" },
  { key: "studio-only", label: "סטודיו", emoji: "🛠" },
];

const TYPES: Asset["type"][] = ["tool", "skill", "agent", "extension"];
const TYPE_LABELS: Record<Asset["type"], string> = {
  tool: "כלי",
  skill: "סקיל",
  agent: "סוכן",
  extension: "תוסף",
};

function emptyAsset(): Asset {
  return {
    name: "",
    type: "tool",
    description: "",
    access: "",
    access_note: null,
    audience: [],
    has_guide: false,
    guide_url: null,
    install_url: null,
    template_url: null,
    added_by: "admin",
  };
}

type View = "login" | "list" | "form";

export function AdminClient({ initialAssets }: { initialAssets: Asset[] }) {
  const [view, setView] = useState<View>("login");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [hasChanges, setHasChanges] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number>(-2); // -1 = new, >=0 = edit index
  const [form, setForm] = useState<Asset>(emptyAsset());

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // ── Auth ─────────────────────────────────────────────────────────
  async function tryAuth() {
    if (!password) return;
    setAuthLoading(true);
    setAuthError("");
    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setView("list");
      } else {
        setAuthError("סיסמה שגויה");
      }
    } catch {
      setAuthError("שגיאת חיבור");
    }
    setAuthLoading(false);
  }

  // ── Form helpers ──────────────────────────────────────────────────
  function startAdd() {
    setForm(emptyAsset());
    setEditingIndex(-1);
    setView("form");
  }

  function startEdit(index: number) {
    setForm({ ...assets[index] });
    setEditingIndex(index);
    setView("form");
  }

  function cancelForm() {
    setView("list");
  }

  function commitForm() {
    const updated = [...assets];
    if (editingIndex === -1) {
      updated.push(form);
    } else {
      updated[editingIndex] = form;
    }
    setAssets(updated);
    setHasChanges(true);
    setSaveMsg(null);
    setView("list");
  }

  function deleteAsset(index: number) {
    if (!confirm(`למחוק את "${assets[index].name}"?`)) return;
    setAssets(assets.filter((_, i) => i !== index));
    setHasChanges(true);
    setSaveMsg(null);
  }

  function updateForm<K extends keyof Asset>(key: K, value: Asset[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleAudience(key: string) {
    const current = form.audience;
    updateForm(
      "audience",
      current.includes(key) ? current.filter((k) => k !== key) : [...current, key]
    );
  }

  // ── Publish to GitHub ─────────────────────────────────────────────
  async function publishChanges() {
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await fetch("/api/admin/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, assets }),
      });
      if (res.ok) {
        setSaveMsg({ ok: true, text: "✅ נשמר! האתר יתעדכן תוך ~1-2 דקות" });
        setHasChanges(false);
      } else {
        const err = await res.json();
        setSaveMsg({ ok: false, text: `❌ ${err.error || "שגיאה בשמירה"}` });
      }
    } catch {
      setSaveMsg({ ok: false, text: "❌ שגיאת חיבור" });
    }
    setSaving(false);
  }

  // ═══════════════════════════════════════════════════════════════════
  // VIEWS
  // ═══════════════════════════════════════════════════════════════════

  // ── Login screen ──────────────────────────────────────────────────
  if (view === "login") {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: "var(--bg-color)" }}
      >
        <div className="card-glass rounded-2xl p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="logo-badge mx-auto mb-4" style={{ width: 52, height: 52, fontSize: 20 }}>HB</div>
            <h1 className="text-xl font-bold" style={{ color: "var(--page-text)" }}>
              Admin Panel
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-sec)" }}>
              HB Tools Hub
            </p>
          </div>

          <input
            type="password"
            placeholder="סיסמת מנהל"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && tryAuth()}
            className="admin-input w-full mb-3"
            autoFocus
          />

          {authError && (
            <p className="text-xs text-center mb-3" style={{ color: "#f87171" }}>
              {authError}
            </p>
          )}

          <button
            onClick={tryAuth}
            disabled={authLoading || !password}
            className="w-full py-2.5 rounded-xl font-bold text-sm text-white transition-opacity"
            style={{
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              opacity: authLoading || !password ? 0.6 : 1,
              cursor: authLoading || !password ? "not-allowed" : "pointer",
            }}
          >
            {authLoading ? "..." : "כניסה"}
          </button>
        </div>
      </div>
    );
  }

  // ── Form screen (add / edit) ───────────────────────────────────────
  if (view === "form") {
    const isNew = editingIndex === -1;
    const canSave = form.name.trim() !== "" && form.audience.length > 0;

    return (
      <div className="min-h-screen" style={{ background: "var(--bg-color)" }}>
        <div className="max-w-2xl mx-auto px-6 py-8">

          {/* Back */}
          <button
            onClick={cancelForm}
            className="flex items-center gap-2 text-sm mb-6 transition-colors"
            style={{ color: "var(--text-sec)" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "var(--page-text)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "var(--text-sec)")}
          >
            → חזרה לרשימה
          </button>

          <h2 className="text-lg font-bold mb-5" style={{ color: "var(--page-text)" }}>
            {isNew ? "הוספת כלי חדש" : `עריכה: ${assets[editingIndex]?.name}`}
          </h2>

          <div className="card-glass rounded-2xl p-6 space-y-5">

            {/* Name */}
            <div>
              <label className="admin-label">שם הכלי *</label>
              <input
                value={form.name}
                onChange={(e) => updateForm("name", e.target.value)}
                className="admin-input w-full"
                placeholder="Safe Play Hub"
              />
            </div>

            {/* Type */}
            <div>
              <label className="admin-label">סוג</label>
              <div className="flex gap-2 flex-wrap">
                {TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => updateForm("type", t)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all"
                    style={
                      form.type === t
                        ? { background: "#6366f1", borderColor: "#6366f1", color: "#fff" }
                        : { background: "transparent", borderColor: "var(--card-border)", color: "var(--text-sec)" }
                    }
                  >
                    {TYPE_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="admin-label">תיאור</label>
              <textarea
                value={form.description}
                onChange={(e) => updateForm("description", e.target.value)}
                rows={2}
                className="admin-input w-full"
                style={{ resize: "none" }}
                placeholder="תיאור קצר של הכלי..."
              />
            </div>

            {/* Access URL */}
            <div>
              <label className="admin-label">קישור גישה (URL)</label>
              <input
                value={form.access}
                onChange={(e) => updateForm("access", e.target.value)}
                className="admin-input w-full"
                placeholder="https://..."
                dir="ltr"
              />
            </div>

            {/* Access note */}
            <div>
              <label className="admin-label">הערת גישה / סיסמה (ריק = אין)</label>
              <input
                value={form.access_note ?? ""}
                onChange={(e) => updateForm("access_note", e.target.value || null)}
                className="admin-input w-full"
                placeholder="סיסמה: HB@..."
              />
            </div>

            {/* Audience */}
            <div>
              <label className="admin-label">קהל יעד *</label>
              <div className="flex gap-2 flex-wrap">
                {AUDIENCES.map((a) => {
                  const active = form.audience.includes(a.key);
                  return (
                    <button
                      key={a.key}
                      onClick={() => toggleAudience(a.key)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all"
                      style={
                        active
                          ? { background: "#6366f1", borderColor: "#6366f1", color: "#fff" }
                          : { background: "transparent", borderColor: "var(--card-border)", color: "var(--text-sec)" }
                      }
                    >
                      {a.emoji} {a.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Has guide toggle */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const next = !form.has_guide;
                  updateForm("has_guide", next);
                  if (!next) updateForm("guide_url", null);
                }}
                className="w-10 h-5 rounded-full transition-all relative shrink-0"
                style={{
                  background: form.has_guide ? "#6366f1" : "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                <span
                  className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                  style={{ right: form.has_guide ? "2px" : "auto", left: form.has_guide ? "auto" : "2px" }}
                />
              </button>
              <span className="text-sm" style={{ color: "var(--page-text)" }}>
                יש מדריך שימוש
              </span>
            </div>

            {/* Guide URL */}
            {form.has_guide && (
              <div>
                <label className="admin-label">קישור למדריך</label>
                <input
                  value={form.guide_url ?? ""}
                  onChange={(e) => updateForm("guide_url", e.target.value || null)}
                  className="admin-input w-full"
                  placeholder="https://youtu.be/..."
                  dir="ltr"
                />
              </div>
            )}

            {/* Install URL */}
            <div>
              <label className="admin-label">קישור להתקנה (GitHub) — ריק = אין</label>
              <input
                value={form.install_url ?? ""}
                onChange={(e) => updateForm("install_url", e.target.value || null)}
                className="admin-input w-full"
                placeholder="https://github.com/..."
                dir="ltr"
              />
            </div>

            {/* Template URL */}
            <div>
              <label className="admin-label">קישור לתבנית / קוד מקור (GitHub) — ריק = אין</label>
              <input
                value={form.template_url ?? ""}
                onChange={(e) => updateForm("template_url", e.target.value || null)}
                className="admin-input w-full"
                placeholder="https://github.com/..."
                dir="ltr"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={commitForm}
                disabled={!canSave}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white transition-opacity"
                style={{
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  opacity: canSave ? 1 : 0.5,
                  cursor: canSave ? "pointer" : "not-allowed",
                }}
              >
                {isNew ? "הוסף לרשימה" : "שמור שינויים"}
              </button>
              <button
                onClick={cancelForm}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold border"
                style={{ borderColor: "var(--card-border)", color: "var(--text-sec)", cursor: "pointer" }}
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── List screen ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ background: "var(--bg-color)" }}>
      <div className="max-w-3xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold" style={{ color: "var(--page-text)" }}>
              Admin Panel
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-sec)" }}>
              {assets.length} כלים
              {hasChanges && (
                <span className="mr-2 text-amber-400 font-semibold">● שינויים לא מפורסמים</span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {hasChanges && (
              <button
                onClick={publishChanges}
                disabled={saving}
                className="px-4 py-2 rounded-xl text-sm font-bold text-white transition-opacity"
                style={{
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  opacity: saving ? 0.7 : 1,
                  cursor: saving ? "not-allowed" : "pointer",
                }}
              >
                {saving ? "שומר..." : "⬆ פרסם שינויים"}
              </button>
            )}
            <button
              onClick={startAdd}
              className="px-4 py-2 rounded-xl text-sm font-bold text-white"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", cursor: "pointer" }}
            >
              + הוסף כלי
            </button>
            <a
              href="/"
              className="px-4 py-2 rounded-xl text-sm font-semibold border"
              style={{ borderColor: "var(--card-border)", color: "var(--text-sec)" }}
            >
              ← לאתר
            </a>
          </div>
        </div>

        {/* Save message */}
        {saveMsg && (
          <div
            className="mb-4 px-4 py-3 rounded-xl text-sm font-semibold"
            style={{
              background: saveMsg.ok ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
              border: `1px solid ${saveMsg.ok ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
              color: saveMsg.ok ? "#6ee7b7" : "#fca5a5",
            }}
          >
            {saveMsg.text}
          </div>
        )}

        {/* Asset list */}
        <div className="space-y-2">
          {assets.map((asset, i) => (
            <div
              key={i}
              className="card-glass rounded-xl px-4 py-3 flex items-center gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm" style={{ color: "var(--page-text)" }}>
                    {asset.name}
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(99,102,241,0.18)", color: "#a5b4fc" }}
                  >
                    {TYPE_LABELS[asset.type]}
                  </span>
                  {!asset.access && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(251,191,36,0.15)", color: "#fbbf24" }}
                    >
                      ללא קישור
                    </span>
                  )}
                </div>
                <p className="text-xs mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>
                  {asset.audience.join(" · ")}
                  {asset.access && ` · ${asset.access.replace("https://", "").split("/")[0]}`}
                </p>
              </div>
              <button
                onClick={() => startEdit(i)}
                className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all"
                style={{ borderColor: "var(--card-border)", color: "var(--text-sec)", cursor: "pointer" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "var(--page-text)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "var(--text-sec)")}
              >
                עריכה
              </button>
              <button
                onClick={() => deleteAsset(i)}
                className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all"
                style={{ borderColor: "rgba(239,68,68,0.25)", color: "#f87171", cursor: "pointer" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.1)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
              >
                מחק
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
