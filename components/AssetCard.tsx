"use client";

import { useState } from "react";
import { Copy, Check, ArrowUpLeft, Download, ChevronDown, ListChecks, Hammer } from "lucide-react";
import { AssetTypeConfig, findType } from "@/lib/assetTypes";
import { TabConfig } from "@/lib/tabPresets";
import { BrandIcon } from "@/lib/icons";
import { AssetLink, AssetCode, cardLinks, cardCodes } from "@/lib/assetLinks";

export interface Asset {
  /** Hebrew name — the big title on the card. */
  name: string;
  /** English name — the small line under the title. Optional. */
  name_en?: string | null;
  /** Key of an entry in the types list (editable in the admin panel). */
  type: string;
  description: string;
  access: string;
  /** Old single code field — still read; new codes go in `codes`. */
  access_note: string | null;
  /** Passwords / codes, each with a copy button on the card. */
  codes?: AssetCode[] | null;
  /** Everything else worth one click: guide, Drive folder, source code… */
  links?: AssetLink[] | null;
  audience: string[];
  has_guide: boolean;
  guide_url?: string | null;
  install_url?: string | null;
  template_url?: string | null;
  /** Free text, one step per line. Shown only when filled. */
  install_notes?: string | null;
  added_by: string;
}

/** "drive.google.com" — a quiet hint of where a link goes. */
function host(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return ""; }
}

export function AssetCard({
  asset,
  types,
  tabs,
}: {
  asset: Asset;
  types: AssetTypeConfig[];
  tabs: TabConfig[];
}) {
  const [copied, setCopied] = useState<string | null>(null);

  const cfg = findType(types, asset.type);
  // The card's category is the first tab it belongs to that isn't "what's new".
  const category = tabs.find((t) => t.key !== "news" && asset.audience.includes(t.key))
    ?? tabs.find((t) => asset.audience.includes(t.key));

  // Extensions historically stored their ZIP link in template_url, not access.
  const target = asset.access?.trim() || (cfg.behavior === "download" ? asset.template_url?.trim() ?? "" : "");
  const hasTarget = target !== "";
  const steps = (asset.install_notes ?? "").split("\n").map((s) => s.trim()).filter(Boolean);
  const links = cardLinks(asset, target);
  const codes = cardCodes(asset);

  /** Copy a value; `id` marks which button shows the tick. */
  function copy(id: string, value: string) {
    navigator.clipboard.writeText(value);
    setCopied(id);
    setTimeout(() => setCopied((c) => (c === id ? null : c)), 2200);
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
      <p className="text-sm leading-relaxed" style={{ color: "var(--text-sec)" }}>
        {asset.description}
      </p>

      {/* ── CODES — passwords and entry codes, copy in one click ── */}
      {codes.length > 0 && (
        <div className="card-well rounded-xl divide-y" style={{ borderColor: "var(--well-border)" }}>
          {codes.map((c, i) => (
            <div key={i} className="code-row flex items-center gap-2 px-3 py-2">
              <BrandIcon icon="key" size={14} className="shrink-0 opacity-70" />
              <span className="text-xs shrink-0" style={{ color: "var(--text-muted)" }}>{c.label}</span>
              <span className="code-value text-sm font-semibold truncate min-w-0 flex-1" dir="ltr" style={{ textAlign: "right" }}>
                {c.value}
              </span>
              <button onClick={() => copy(`code${i}`, c.value)} className="copy-btn" aria-label={`העתק ${c.label}`} title="העתק">
                {copied === `code${i}` ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── LINKS — guide, Drive folder, source… each one row ── */}
      {links.length > 0 && (
        <ul className="space-y-1.5">
          {links.map((l, i) => (
            <li key={i}>
              <a href={l.url} target="_blank" rel="noopener noreferrer" className="link-row">
                <span className="icon-ring" style={{ width: 28, height: 28 }}><BrandIcon icon={l.icon} size={14} /></span>
                <span className="text-sm font-medium shrink-0 max-w-[70%] truncate">{l.label}</span>
                <span className="link-host text-[11px] flex-1 min-w-0 truncate" dir="ltr" style={{ textAlign: "left" }}>{host(l.url)}</span>
                <ArrowUpLeft size={14} className="shrink-0 opacity-60" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      )}

      {/* ── STEPS — only when she wrote some ── */}
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

      {/* ── MAIN ACTION — pinned to the bottom so cards line up ── */}
      <div className="mt-auto pt-1">
        {cfg.behavior === "command" ? (
          hasTarget ? (
            <div className="space-y-2">
              <div className="card-well rounded-xl p-3 text-center">
                <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>הפקודה ב-Claude Code</p>
                <span className="cmd-text text-base font-bold tracking-wide" dir="ltr">{asset.access}</span>
              </div>
              <button onClick={() => copy("cmd", asset.access)}
                className="btn-brand w-full flex items-center justify-center gap-2 text-sm font-semibold py-2.5 px-4 rounded-xl">
                {copied === "cmd" ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
                <span>{copied === "cmd" ? "הועתק!" : "העתק פקודה"}</span>
              </button>
            </div>
          ) : (
            comingSoon
          )
        ) : hasTarget ? (
          <a href={target} target="_blank" rel="noopener noreferrer"
            className="btn-brand flex items-center justify-center gap-2 text-sm font-semibold py-2.5 px-4 rounded-xl">
            {cfg.behavior === "download" && <Download size={16} aria-hidden="true" />}
            <span>{cfg.btnLabel}</span>
            {cfg.behavior !== "download" && <ArrowUpLeft size={16} className="opacity-85" aria-hidden="true" />}
          </a>
        ) : (
          comingSoon
        )}
      </div>
    </div>
  );
}
