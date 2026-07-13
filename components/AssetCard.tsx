"use client";

import { useState } from "react";

export interface Asset {
  name: string;
  type: "tool" | "skill" | "agent";
  description: string;
  access: string;
  access_note: string | null;
  audience: string[];
  has_guide: boolean;
  guide_url?: string | null;
  install_url?: string | null;
  added_by: string;
}

const TYPE_CONFIG = {
  tool: {
    label: "כלי",
    labelBg: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
    btnLabel: "פתח",
    btnStyle: "bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white",
  },
  agent: {
    label: "סוכן",
    labelBg: "bg-purple-500/20 text-purple-300 border border-purple-500/30",
    btnLabel: "פתח סוכן",
    btnStyle: "bg-purple-500 hover:bg-purple-600 active:bg-purple-700 text-white",
  },
  skill: {
    label: "סקיל",
    labelBg: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
    btnLabel: null,
    btnStyle: "",
  },
};

export function AssetCard({
  asset,
  accentColor,
}: {
  asset: Asset;
  accentColor: string;
}) {
  const [copied, setCopied] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);
  const cfg = TYPE_CONFIG[asset.type];
  const hasAccess = asset.access && asset.access.trim() !== "";
  const isSkillReady = asset.type === "skill" && hasAccess && !asset.access_note;

  function copyCommand() {
    navigator.clipboard.writeText(asset.access);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }

  function copyPassword() {
    if (!asset.access_note) return;
    const val = asset.access_note.replace(/^סיסמה:\s*/i, "");
    navigator.clipboard.writeText(val);
    setCopiedPass(true);
    setTimeout(() => setCopiedPass(false), 2200);
  }

  return (
    <div className="card-glass rounded-2xl flex flex-col gap-3.5 p-5 relative overflow-hidden">

      {/* Top accent gradient bar */}
      <div
        className={`absolute top-0 right-0 left-0 h-0.5 bg-gradient-to-l ${accentColor} opacity-75`}
      />

      {/* Gloss overlay */}
      <div
        aria-hidden="true"
        className="absolute top-0 right-0 left-0 h-2/5 pointer-events-none rounded-t-2xl"
        style={{ background: "var(--card-gloss)" }}
      />

      {/* Header row */}
      <div className="flex items-start justify-between gap-2 pt-1">
        <h3 className="font-bold text-base leading-snug" style={{ color: "var(--page-text)" }}>
          {asset.name}
        </h3>
        <span className={`shrink-0 text-xs font-semibold px-2.5 py-0.5 rounded-full ${cfg.labelBg}`}>
          {cfg.label}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm leading-relaxed flex-1" style={{ color: "var(--text-sec)" }}>
        {asset.description}
      </p>

      {/* ── SKILL BLOCK ────────────────────────────────────── */}
      {asset.type === "skill" && (
        <div className="space-y-2.5">

          {/* Coming-soon state */}
          {!hasAccess && (
            <div
              className="rounded-xl p-4 text-center"
              style={{ background: "var(--empty-bg)", border: "1px solid var(--empty-border)" }}
            >
              <div className="text-2xl mb-1">🔧</div>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>בפיתוח — יגיע בקרוב</p>
            </div>
          )}

          {hasAccess && (
            <>
              {/* Step 1 — Install */}
              <div
                className="rounded-xl p-3 space-y-2"
                style={{ background: "var(--step-bg)", border: "1px solid var(--empty-border)" }}
              >
                <p className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>
                  שלב 1 — התקנה
                </p>
                {asset.install_url ? (
                  <>
                    <div className="text-xs space-y-1" style={{ color: "var(--step-text)" }}>
                      <div>① הורידי את תיקיית הסקיל מ-GitHub</div>
                      <div className="font-mono text-xs px-2 py-1 rounded" style={{ background: "var(--cmd-bg)", color: "#94a3b8", direction: "ltr", textAlign: "left" }}>
                        {"~\\.claude\\skills\\"}
                      </div>
                      <div>② העתיקי לתוך התיקייה למעלה</div>
                      <div>③ סגרי ופתחי מחדש Claude Code</div>
                    </div>
                    <a
                      href={asset.install_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 text-xs font-semibold py-1.5 px-3 rounded-lg transition-all w-full"
                      style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", color: "#6ee7b7" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(16,185,129,0.25)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(16,185,129,0.15)"; }}
                    >
                      <span>⬇️</span>
                      <span>הורד סקיל מ-GitHub</span>
                    </a>
                  </>
                ) : (
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    ℹ️ {asset.access_note || "קובץ ההתקנה יהיה זמין בקרוב"}
                  </p>
                )}
              </div>

              {/* Step 2 — Run (only if install_url exists) */}
              {asset.install_url && (
                <div
                  className="rounded-xl p-3 space-y-2"
                  style={{ background: "var(--step-bg)", border: "1px solid var(--empty-border)" }}
                >
                  <p className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>
                    שלב 2 — הפעלה
                  </p>

                  {/* Command display */}
                  <div
                    className="rounded-lg p-2.5 text-center"
                    style={{ background: "var(--cmd-bg)", border: "1px solid var(--cmd-border)" }}
                  >
                    <p className="text-xs mb-1" style={{ color: "var(--cmd-label)" }}>
                      הפקודה ב-Claude Code
                    </p>
                    <span
                      className="text-emerald-400 text-base font-bold tracking-wide"
                      style={{ fontFamily: "'DM Mono', 'Courier New', monospace" }}
                      dir="ltr"
                    >
                      {asset.access}
                    </span>
                  </div>

                  {/* Mini 3-step */}
                  <div className="grid grid-cols-3 gap-1 text-xs text-center">
                    {[
                      { n: "1️⃣", t: "פתחי Claude Code" },
                      { n: "2️⃣", t: "שיחה חדשה" },
                      { n: "3️⃣", t: `הקלידי ${asset.access}` },
                    ].map((s) => (
                      <div
                        key={s.n}
                        className="rounded-lg py-1.5 px-1"
                        style={{ background: "var(--cmd-bg)", color: "var(--step-text)" }}
                      >
                        <div className="mb-0.5">{s.n}</div>
                        <div className="leading-tight">{s.t}</div>
                      </div>
                    ))}
                  </div>

                  {/* Copy button */}
                  <button
                    onClick={copyCommand}
                    className="w-full text-xs font-semibold py-1.5 px-3 rounded-lg border transition-all"
                    style={
                      copied
                        ? { background: "rgba(16,185,129,0.2)", borderColor: "rgba(16,185,129,0.4)", color: "#6ee7b7" }
                        : { background: "var(--copy-bg)", borderColor: "var(--copy-border)", color: "var(--copy-text)" }
                    }
                    onMouseEnter={(e) => { if (!copied) (e.currentTarget as HTMLButtonElement).style.background = "var(--copy-hover)"; }}
                    onMouseLeave={(e) => { if (!copied) (e.currentTarget as HTMLButtonElement).style.background = "var(--copy-bg)"; }}
                  >
                    {copied ? "✅ הועתק!" : "📋 העתק פקודה"}
                  </button>
                </div>
              )}

              {/* access_note on skills without install_url (e.g. in-dev) */}
              {!asset.install_url && asset.access_note && (
                <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
                  ℹ️ {asset.access_note}
                </p>
              )}
            </>
          )}
        </div>
      )}

      {/* ── TOOL / AGENT BLOCK ───────────────────────────── */}
      {(asset.type === "tool" || asset.type === "agent") && (
        <div className="space-y-2">
          {hasAccess ? (
            <a
              href={asset.access}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-center gap-2 text-sm font-bold py-2.5 px-4 rounded-xl transition-all duration-200 ${cfg.btnStyle}`}
            >
              <span>{cfg.btnLabel}</span>
              <span className="opacity-80 text-base">↗</span>
            </a>
          ) : (
            <div
              className="rounded-xl p-3 text-center"
              style={{ background: "var(--empty-bg)", border: "1px dashed var(--empty-border)" }}
            >
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>🔧 בפיתוח — יגיע בקרוב</p>
            </div>
          )}

          {/* Password copy button */}
          {asset.access_note && (
            <button
              onClick={copyPassword}
              className="w-full text-xs py-2 px-3 rounded-xl border transition-all duration-200"
              style={
                copiedPass
                  ? { background: "rgba(16,185,129,0.18)", borderColor: "rgba(16,185,129,0.4)", color: "#6ee7b7" }
                  : { background: "var(--pass-bg)", borderColor: "var(--pass-border)", color: "var(--pass-text)" }
              }
              onMouseEnter={(e) => { if (!copiedPass) (e.currentTarget as HTMLButtonElement).style.background = "var(--copy-hover)"; }}
              onMouseLeave={(e) => { if (!copiedPass) (e.currentTarget as HTMLButtonElement).style.background = "var(--pass-bg)"; }}
            >
              {copiedPass ? "✅ סיסמה הועתקה!" : `🔑 ${asset.access_note}`}
            </button>
          )}
        </div>
      )}

      {/* ── GUIDE BUTTON ─────────────────────────────────── */}
      {asset.has_guide && asset.guide_url && (
        <a
          href={asset.guide_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 text-xs font-semibold py-2 px-4 rounded-xl border transition-all duration-200"
          style={{ background: "var(--guide-bg)", borderColor: "var(--guide-border)", color: "var(--guide-text)" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "var(--guide-hover)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "var(--guide-bg)"; }}
        >
          <span>📖</span>
          <span>מדריך שימוש</span>
          <span className="opacity-60">↗</span>
        </a>
      )}
    </div>
  );
}
