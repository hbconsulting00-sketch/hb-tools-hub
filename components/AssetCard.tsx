"use client";

import { useState } from "react";
import { AssetTypeConfig, findType, typeHex } from "@/lib/assetTypes";

export interface Asset {
  name: string;
  /** Key of an entry in the types list (editable in the admin panel). */
  type: string;
  description: string;
  access: string;
  access_note: string | null;
  audience: string[];
  has_guide: boolean;
  guide_url?: string | null;
  install_url?: string | null;
  template_url?: string | null;
  /** Free text, one step per line. Shown only when filled. */
  install_notes?: string | null;
  added_by: string;
}

/** Mix a hex colour with transparency, e.g. alpha("#3b82f6", 0.12). */
function alpha(hex: string, a: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

export function AssetCard({
  asset,
  accentColor,
  types,
  isStudio = false,
}: {
  asset: Asset;
  accentColor: string;
  types: AssetTypeConfig[];
  isStudio?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);

  const cfg = findType(types, asset.type);
  const hex = typeHex(cfg);

  // Extensions historically stored their ZIP link in template_url, not access.
  const target = asset.access?.trim() || (cfg.behavior === "download" ? asset.template_url?.trim() ?? "" : "");
  const hasTarget = target !== "";
  const steps = (asset.install_notes ?? "").split("\n").map((s) => s.trim()).filter(Boolean);

  function copyCommand() {
    navigator.clipboard.writeText(asset.access);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }

  function copyPassword() {
    if (!asset.access_note) return;
    navigator.clipboard.writeText(asset.access_note.replace(/^סיסמה:\s*/i, ""));
    setCopiedPass(true);
    setTimeout(() => setCopiedPass(false), 2200);
  }

  const comingSoon = (
    <div
      className="rounded-xl p-3 text-center"
      style={{ background: "var(--empty-bg)", border: "1px dashed var(--empty-border)" }}
    >
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>🔧 בפיתוח — יגיע בקרוב</p>
    </div>
  );

  return (
    <div className="card-glass rounded-2xl flex flex-col gap-3.5 p-5 relative overflow-hidden">

      {/* Top accent gradient bar — follows the active tab colour */}
      <div className={`absolute top-0 right-0 left-0 h-0.5 bg-gradient-to-l ${accentColor} opacity-75`} />

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
        <span
          className="shrink-0 text-xs font-semibold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1"
          style={{ background: alpha(hex, 0.14), color: hex, border: `1px solid ${alpha(hex, 0.3)}` }}
        >
          <span>{cfg.emoji}</span>
          <span>{cfg.label}</span>
        </span>
      </div>

      {/* Description */}
      <p className="text-sm leading-relaxed flex-1" style={{ color: "var(--text-sec)" }}>
        {asset.description}
      </p>

      {/* ── MAIN ACTION ──────────────────────────────────── */}
      {cfg.behavior === "command" ? (
        hasTarget ? (
          <div className="space-y-2">
            <div
              className="rounded-xl p-3 text-center"
              style={{ background: "var(--cmd-bg)", border: `1px solid ${alpha(hex, 0.3)}` }}
            >
              <p className="text-xs mb-1" style={{ color: "var(--cmd-label)" }}>הפקודה ב-Claude Code</p>
              <span
                className="text-base font-bold tracking-wide"
                style={{ fontFamily: "'DM Mono', 'Courier New', monospace", color: hex }}
                dir="ltr"
              >
                {asset.access}
              </span>
            </div>
            <button
              onClick={copyCommand}
              className="w-full text-sm font-bold py-2.5 px-4 rounded-xl border transition-all duration-200"
              style={
                copied
                  ? { background: alpha(hex, 0.2), borderColor: alpha(hex, 0.45), color: hex }
                  : { background: alpha(hex, 0.1), borderColor: alpha(hex, 0.28), color: hex }
              }
            >
              {copied ? "✅ הועתק!" : "📋 העתק פקודה"}
            </button>
          </div>
        ) : (
          comingSoon
        )
      ) : hasTarget ? (
        <a
          href={target}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-solid flex items-center justify-center gap-2 text-sm font-bold py-2.5 px-4 rounded-xl text-white"
          style={{ background: hex, boxShadow: `0 6px 18px ${alpha(hex, 0.35)}` }}
        >
          <span>{cfg.behavior === "download" ? "⬇" : ""}</span>
          <span>{cfg.btnLabel}</span>
          {cfg.behavior !== "download" && <span className="opacity-80 text-base">↗</span>}
        </a>
      ) : (
        comingSoon
      )}

      {/* Password / access note */}
      {asset.access_note && (
        <button
          onClick={copyPassword}
          className="w-full text-xs py-2 px-3 rounded-xl border transition-all duration-200"
          style={
            copiedPass
              ? { background: "rgba(16,185,129,0.18)", borderColor: "rgba(16,185,129,0.4)", color: "#059669" }
              : { background: "var(--pass-bg)", borderColor: "var(--pass-border)", color: "var(--pass-text)" }
          }
        >
          {copiedPass ? "✅ סיסמה הועתקה!" : `🔑 ${asset.access_note}`}
        </button>
      )}

      {/* ── INSTALL INSTRUCTIONS — only when she wrote some ── */}
      {steps.length > 0 && (
        <details className="install-details rounded-xl" style={{ background: "var(--step-bg)", border: "1px solid var(--empty-border)" }}>
          <summary
            className="cursor-pointer select-none text-xs font-bold px-3 py-2 flex items-center gap-1.5"
            style={{ color: "var(--text-sec)" }}
          >
            <span>🛠</span>
            <span>איך מתקינים?</span>
          </summary>
          <div className="px-3 pb-3 pt-0.5 space-y-1.5">
            {steps.map((s, i) => (
              <div key={i} className="flex items-start gap-2 text-xs" style={{ color: "var(--step-text)" }}>
                <span
                  className="shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5"
                  style={{ background: alpha(hex, 0.18), color: hex }}
                >
                  {i + 1}
                </span>
                <span>{s}</span>
              </div>
            ))}
          </div>
        </details>
      )}

      {/* ── SECONDARY LINKS — each appears only if filled ── */}
      {(asset.install_url || (isStudio && asset.template_url)) && (
        <div className="flex gap-2 flex-wrap">
          {asset.install_url && (
            <a
              href={asset.install_url}
              target="_blank"
              rel="noopener noreferrer"
              className="link-chip flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 px-3 rounded-xl border"
              style={{ background: "var(--empty-bg)", borderColor: "var(--empty-border)", color: "var(--text-sec)" }}
            >
              <span>⬇</span><span>קובץ התקנה</span>
            </a>
          )}
          {isStudio && asset.template_url && (
            <a
              href={asset.template_url}
              target="_blank"
              rel="noopener noreferrer"
              className="link-chip flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 px-3 rounded-xl border"
              style={{ background: "var(--empty-bg)", borderColor: "var(--empty-border)", color: "var(--text-sec)" }}
            >
              <span>📦</span><span>קוד מקור</span>
            </a>
          )}
        </div>
      )}

      {/* ── GUIDE BUTTON — only when there is a guide to open ── */}
      {asset.has_guide && asset.guide_url && (
        <a
          href={asset.guide_url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-outline flex items-center justify-center gap-2 text-sm font-bold py-2.5 px-4 rounded-xl"
          style={{ background: alpha(hex, 0.09), border: `1.5px solid ${alpha(hex, 0.38)}`, color: hex }}
        >
          <span>📖</span>
          <span>מדריך שימוש</span>
          <span className="opacity-70">↗</span>
        </a>
      )}
    </div>
  );
}
