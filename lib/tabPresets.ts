export type ColorPreset = "green" | "indigo" | "amber" | "rose" | "sky" | "teal" | "violet" | "orange";

export interface TabConfig {
  key: string;
  label: string;
  emoji: string;
  colorPreset: ColorPreset;
  showAll?: boolean;
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
  sky:    { color: "from-sky-500 to-cyan-600",       glowClass: "tab-glow-sky",    bg: "bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40",          activeBg: "bg-gradient-to-l from-sky-500 to-cyan-600 border-transparent" },
  teal:   { color: "from-teal-500 to-emerald-600",   glowClass: "tab-glow-teal",   bg: "bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40",      activeBg: "bg-gradient-to-l from-teal-500 to-emerald-600 border-transparent" },
  violet: { color: "from-violet-500 to-purple-600",  glowClass: "tab-glow-violet", bg: "bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/40", activeBg: "bg-gradient-to-l from-violet-500 to-purple-600 border-transparent" },
  orange: { color: "from-orange-500 to-red-500",     glowClass: "tab-glow-orange", bg: "bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40", activeBg: "bg-gradient-to-l from-orange-500 to-red-500 border-transparent" },
};

export const PRESET_LABELS: Record<ColorPreset, string> = {
  green: "ירוק", indigo: "אינדיגו", amber: "ענבר", rose: "ורוד",
  sky: "שמיים", teal: "טיל", violet: "סגול", orange: "כתום",
};
