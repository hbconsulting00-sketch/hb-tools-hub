"use client";

import { useState } from "react";
import { Copy, Check, KeyRound, ArrowUpLeft, Download, BookOpen, Package, ChevronDown, ListChecks, Hammer } from "lucide-react";
import { AssetTypeConfig, findType } from "@/lib/assetTypes";
import { TabConfig } from "@/lib/tabPresets";
import { BrandIcon } from "@/lib/icons";

export interface Asset {
  /** Hebrew name — the big title on the card. */
  name: string;
  /** English name — the small line under the title. Optional. */
  name_en?: string | null;
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

export function AssetCard({
  asset,
  types,
  tabs,
  isStudio = false,
}: {
  asset: Asset;
  types: AssetTypeConfig[];
  tabs: TabConfig[];
  isStudio?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);

  const cfg = findType(types, asset.type);
  // The card's category is the first tab it belongs to that isn't "what's new".
  const category = tabs.find((t) => t.key !== "news" && asset.audience.includes(t.key))
    ?? tabs.find((t) => asset.audience.includes(t.key));

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
    <div className="card-well rounded-xl p-3 text-center" style={{ borderStyle: "dashed" }}>
      <p className="text-sm inline-flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
        <Hammer size={14} aria-hidden="true" /> בפיתוח — יגיע בקרוב
      </p>
    </div>
  );

  return (
    <div className="card-glass rounded-[24px] flex flex-col gap-3.5 p-5 relative overflow-hidden">

      {/* Brand gradient hairline + gloss */}
      <div aria-hidden="true" className="card-gloss" />
      <div aria-hidden="true" className="card-topline" />

      {/* Header: category icon ring, Hebrew name, English name */}
      <div className="flex items-start gap-3 pt-0.5">
        <span className="icon-ring icon-ring-lg shrink-0">
          <BrandIcon icon={category?.icon} emoji={category?.emoji} size={22} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-[17px] leading-snug" style={{ color: "var(--page-text)" }}>
            {asset.name}
          </h3>
          {asset.name_en && (
            <p className="name-en text-[12px] mt-0.5 truncate" dir="ltr" style={{ textAlign: "right" }}>
              {asset.name_en}
            </p>
          )}
        </div>
      </div>

      {/* Tags: category (prominent) + type (small, grey) */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {category && (
          <span className="tag-category">
            <BrandIcon icon={category.icon} emoji={category.emoji} size={13} />
            <span>{category.label}</span>
          </span>
        )}
        <span className="tag-type">
          <BrandIcon icon={cfg.icon} emoji={cfg.emoji} size={11} />
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
            <div className="card-well rounded-xl p-3 text-center">
              <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>הפקודה ב-Claude Code</p>
              <span className="cmd-text text-base font-bold tracking-wide" dir="ltr">
                {asset.access}
              </span>
            </div>
            <button
              onClick={copyCommand}
              className="btn-brand w-full flex items-center justify-center gap-2 text-sm font-semibold py-2.5 px-4 rounded-xl"
            >
              {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
              <span>{copied ? "הועתק!" : "העתק פקודה"}</span>
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
          className="btn-brand flex items-center justify-center gap-2 text-sm font-semibold py-2.5 px-4 rounded-xl"
        >
          {cfg.behavior === "download" && <Download size={16} aria-hidden="true" />}
          <span>{cfg.btnLabel}</span>
          {cfg.behavior !== "download" && <ArrowUpLeft size={16} className="opacity-85" aria-hidden="true" />}
        </a>
      ) : (
        comingSoon
      )}

      {/* Password / access note */}
      {asset.access_note && (
        <button
          onClick={copyPassword}
          className={`btn-ghost w-full flex items-center justify-center gap-1.5 text-xs py-2 px-3 rounded-xl ${copiedPass ? "is-done" : ""}`}
        >
          {copiedPass ? <Check size={13} aria-hidden="true" /> : <KeyRound size={13} aria-hidden="true" />}
          <span>{copiedPass ? "סיסמה הועתקה!" : asset.access_note}</span>
        </button>
      )}

      {/* ── INSTALL INSTRUCTIONS — only when she wrote some ── */}
      {steps.length > 0 && (
        <details className="install-details card-well rounded-xl">
          <summary
            className="cursor-pointer select-none text-xs font-semibold px-3 py-2 flex items-center gap-1.5"
            style={{ color: "var(--text-sec)" }}
          >
            <ListChecks size={14} aria-hidden="true" />
            <span>איך משתמשים?</span>
            <ChevronDown size={14} className="chev ms-auto" aria-hidden="true" />
          </summary>
          <div className="px-3 pb-3 pt-0.5 space-y-1.5">
            {steps.map((s, i) => (
              <div key={i} className="flex items-start gap-2 text-xs" style={{ color: "var(--text-sec)" }}>
                <span className="step-num shrink-0">{i + 1}</span>
                <span className="break-words min-w-0">{s}</span>
              </div>
            ))}
          </div>
        </details>
      )}

      {/* ── SECONDARY LINKS — each appears only if filled ── */}
      {(asset.install_url || (isStudio && asset.template_url)) && (
        <div className="flex gap-2 flex-wrap">
          {asset.install_url && (
            <a href={asset.install_url} target="_blank" rel="noopener noreferrer"
              className="btn-ghost flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 px-3 rounded-xl">
              <Download size={13} aria-hidden="true" /><span>קובץ התקנה</span>
            </a>
          )}
          {isStudio && asset.template_url && (
            <a href={asset.template_url} target="_blank" rel="noopener noreferrer"
              className="btn-ghost flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 px-3 rounded-xl">
              <Package size={13} aria-hidden="true" /><span>קוד מקור</span>
            </a>
          )}
        </div>
      )}

      {/* ── GUIDE BUTTON — only when there is a guide to open ── */}
      {asset.has_guide && asset.guide_url && (
        <a href={asset.guide_url} target="_blank" rel="noopener noreferrer"
          className="btn-outline-brand flex items-center justify-center gap-2 text-sm font-semibold py-2.5 px-4 rounded-xl">
          <BookOpen size={16} aria-hidden="true" />
          <span>מדריך שימוש</span>
          <ArrowUpLeft size={14} className="opacity-70" aria-hidden="true" />
        </a>
      )}
    </div>
  );
}
