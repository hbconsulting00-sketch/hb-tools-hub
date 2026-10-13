import { ColorPreset, PRESET_HEX } from "./tabPresets";

/**
 * How a card of this type behaves — i.e. what the main button does.
 *   link     → a button that opens `access` in a new tab
 *   command  → a copyable Claude Code command box
 *   download → a button that downloads the file at `access`
 */
export type TypeBehavior = "link" | "command" | "download";

export interface AssetTypeConfig {
  key: string;
  label: string;
  emoji: string;
  colorPreset: ColorPreset;
  behavior: TypeBehavior;
  /** Text on the main button. Ignored for `command`. */
  btnLabel: string;
}

export const BEHAVIORS: { key: TypeBehavior; label: string; hint: string }[] = [
  { key: "link",     label: "קישור",  hint: "כפתור שפותח כתובת בלשונית חדשה" },
  { key: "command",  label: "פקודה",  hint: "תיבה עם פקודת Claude Code להעתקה" },
  { key: "download", label: "הורדה",  hint: "כפתור שמוריד את הקובץ שבקישור" },
];

export const BEHAVIOR_LABELS: Record<TypeBehavior, string> = {
  link: "קישור", command: "פקודה", download: "הורדה",
};

/** Fallback used when an asset points at a type that no longer exists. */
export const UNKNOWN_TYPE: AssetTypeConfig = {
  key: "__unknown",
  label: "כלי",
  emoji: "🔗",
  colorPreset: "blue",
  behavior: "link",
  btnLabel: "פתח",
};

export function findType(types: AssetTypeConfig[], key: string): AssetTypeConfig {
  return types.find((t) => t.key === key) ?? UNKNOWN_TYPE;
}

export function typeHex(t: AssetTypeConfig): string {
  return PRESET_HEX[t.colorPreset] ?? PRESET_HEX.blue;
}

/** Ready-made text she can drop into the "הוראות התקנה" field in one click. */
export const INSTALL_PRESETS: { label: string; text: string }[] = [
  {
    label: "תוסף כרום (ZIP)",
    text: [
      "עשי אנזיפ לקובץ לתיקייה נגישה במחשב",
      "כנסי לכרום → chrome://extensions",
      'הפעילי "Developer mode" (מצב מפתח)',
      'לחצי "Load unpacked" ← בחרי את התיקייה',
    ].join("\n"),
  },
  {
    label: "סקיל Claude Code",
    text: [
      "הורידי את תיקיית הסקיל מ-GitHub",
      "העתיקי אותה לתוך ~\\.claude\\skills\\",
      "סגרי ופתחי מחדש Claude Code",
    ].join("\n"),
  },
];
