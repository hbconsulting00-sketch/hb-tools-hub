export type ColorPreset =
  | "green" | "indigo" | "amber" | "rose"
  | "sky" | "teal" | "violet" | "orange"
  | "blue" | "purple";

export interface TabConfig {
  key: string;
  label: string;
  emoji: string;
  /** Line-icon key from lib/icons.tsx. When empty the emoji is shown instead. */
  icon?: string;
  colorPreset: ColorPreset;
  showAll?: boolean;
  /** Featured tab: shown first, opened by default, outlined in the Aurora gradient. One at most. */
  featured?: boolean;
}

/**
 * The featured tab's key. Until any tab has the flag set in the admin panel,
 * "news" (מה חדש) is the featured one.
 */
export function featuredKey(tabs: TabConfig[]): string | undefined {
  if (tabs.some((t) => t.featured !== undefined)) return tabs.find((t) => t.featured)?.key;
  return tabs.find((t) => t.key === "news")?.key;
}

/** Tabs in display order: the featured one first, the rest as arranged in the admin panel. */
export function orderTabs(tabs: TabConfig[]): TabConfig[] {
  const f = featuredKey(tabs);
  return [...tabs.filter((t) => t.key === f), ...tabs.filter((t) => t.key !== f)];
}

export const COLOR_PRESETS: Record<ColorPreset, {
  color: string;
  glowClass: string;
  bg: string;
  activeBg: string;
}> = {
  green:  { color: "from-green-500 to-emerald-600",  glowClass: "tab-glow-green",  bg: "bg-green-500/20 hover:bg-green-500/30 border border-green-500/40",  activeBg: "bg-gradient-to-l from-green-500 to-emerald-600 border-transparent" },
  indigo: { color: "from-indigo-500 to-violet-600",  glowClass: "tab-glow-indigo", bg: "bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40", activeBg: "bg-gradient-to-l from-indigo-500 to-violet-600 border-transparent" },
  amber:  { color: "from-amber-400 to-orange-500",   glowClass: "tab-glow-amber",  bg: "bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40",   activeBg: "bg-gradient-to-l from-amber-400 to-orange-500 border-transparent" },
  rose:   { color: "from-rose-500 to-pink-600",      glowClass: "tab-glow-rose",   bg: "bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40",      activeBg: "bg-gradient-to-l from-rose-500 to-pink-600 border-transparent" },
  sky:    { color: "from-sky-500 to-cyan-600",       glowClass: "tab-glow-sky",    bg: "bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40",         activeBg: "bg-gradient-to-l from-sky-500 to-cyan-600 border-transparent" },
  teal:   { color: "from-teal-500 to-emerald-600",   glowClass: "tab-glow-teal",   bg: "bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40",      activeBg: "bg-gradient-to-l from-teal-500 to-emerald-600 border-transparent" },
  violet: { color: "from-violet-500 to-purple-600",  glowClass: "tab-glow-violet", bg: "bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/40", activeBg: "bg-gradient-to-l from-violet-500 to-purple-600 border-transparent" },
  orange: { color: "from-orange-500 to-red-500",     glowClass: "tab-glow-orange", bg: "bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40", activeBg: "bg-gradient-to-l from-orange-500 to-red-500 border-transparent" },
  blue:   { color: "from-blue-500 to-indigo-600",    glowClass: "tab-glow-blue",   bg: "bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40",      activeBg: "bg-gradient-to-l from-blue-500 to-indigo-600 border-transparent" },
  purple: { color: "from-purple-500 to-fuchsia-600", glowClass: "tab-glow-purple", bg: "bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40", activeBg: "bg-gradient-to-l from-purple-500 to-fuchsia-600 border-transparent" },
};

export const PRESET_LABELS: Record<ColorPreset, string> = {
  green: "ירוק", indigo: "אינדיגו", amber: "ענבר", rose: "ורוד",
  sky: "שמיים", teal: "טורקיז", violet: "סגול", orange: "כתום",
  blue: "כחול", purple: "לילך",
};

/**
 * One solid hex per preset, used for asset-type badges and buttons.
 * Rendered as inline style (not Tailwind classes) so the same value
 * stays readable in both light and dark mode.
 */
export const PRESET_HEX: Record<ColorPreset, string> = {
  green:  "#10b981",
  indigo: "#6366f1",
  amber:  "#f59e0b",
  rose:   "#f43f5e",
  sky:    "#0ea5e9",
  teal:   "#14b8a6",
  violet: "#8b5cf6",
  orange: "#f97316",
  blue:   "#3b82f6",
  purple: "#a855f7",
};

export const ALL_PRESETS = Object.keys(COLOR_PRESETS) as ColorPreset[];
