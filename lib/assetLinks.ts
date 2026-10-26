/** A link shown on the card under "everything you need" — guide, Drive folder, source… */
export interface AssetLink {
  label: string;
  url: string;
  /** Icon key from lib/icons.tsx. */
  icon?: string;
}

/** A password or code shown on the card with a copy button. */
export interface AssetCode {
  label: string;
  value: string;
}

/** The fields this module reads — kept structural so it doesn't import the card. */
interface LinkSource {
  access?: string;
  access_note?: string | null;
  has_guide?: boolean;
  guide_url?: string | null;
  install_url?: string | null;
  template_url?: string | null;
  links?: AssetLink[] | null;
  codes?: AssetCode[] | null;
}

/**
 * The building blocks the admin panel offers for a card. Picking one adds an
 * empty row of that kind; the card shows it once it's filled in.
 */
export const CARD_COMPONENTS: { kind: "code" | "link" | "steps"; label: string; icon: string }[] = [
  { kind: "code",  label: "סיסמה",          icon: "key" },
  { kind: "code",  label: "קוד כניסה",      icon: "key" },
  { kind: "link",  label: "מדריך שימוש",    icon: "book" },
  { kind: "link",  label: "סרטון הדרכה",    icon: "video" },
  { kind: "link",  label: "תיקייה בדרייב",  icon: "folder" },
  { kind: "link",  label: "תשובות הטופס",   icon: "folder" },
  { kind: "link",  label: "קובץ להורדה",    icon: "download" },
  { kind: "link",  label: "קוד מקור",       icon: "code" },
  { kind: "link",  label: "דשבורד",         icon: "chart" },
  { kind: "link",  label: "אתר",            icon: "globe" },
  { kind: "link",  label: "קישור אחר",      icon: "link" },
  { kind: "steps", label: "הוראות שימוש",   icon: "clipboard" },
];

/** Icons a link row can wear. */
export const LINK_ICON_KEYS = ["book", "video", "folder", "file-text", "download", "code", "chart", "globe", "link"];

/** Guess an icon from the URL when none was picked. */
export function iconForUrl(url: string): string {
  if (/youtu\.?be/.test(url)) return "video";
  if (/drive\.google\.com\/drive\/folders/.test(url)) return "folder";
  if (/docs\.google\.com|drive\.google\.com\/file/.test(url)) return "file-text";
  if (/github\.com/.test(url)) return /\.zip($|\?)/.test(url) ? "download" : "code";
  return "link";
}

/** "סיסמה: X" → { label: "סיסמה", value: "X" }; a bare value gets the label "קוד". */
export function parseCode(note: string): AssetCode {
  const m = note.match(/^([^:：]{1,30})[:：]\s*(.+)$/);
  return m ? { label: m[1].trim(), value: m[2].trim() } : { label: "קוד", value: note.trim() };
}

/**
 * Every link a card shows, oldest fields included: assets saved before the
 * links list existed still keep their guide / install / source buttons.
 * `skipUrl` is the main button's target, so it isn't listed twice.
 */
export function cardLinks(a: LinkSource, skipUrl = ""): AssetLink[] {
  const out: AssetLink[] = [...(a.links ?? [])];
  const add = (url: string | null | undefined, label: string, icon?: string) => {
    const u = url?.trim();
    if (u && u !== skipUrl && !out.some((l) => l.url === u)) out.push({ label, url: u, icon: icon ?? iconForUrl(u) });
  };
  if (a.has_guide) add(a.guide_url, "מדריך שימוש", "book");
  add(a.install_url, "קובץ התקנה", "download");
  add(a.template_url, "קוד מקור");
  return out.filter((l) => l.url.trim() !== "");
}

export function cardCodes(a: LinkSource): AssetCode[] {
  const out: AssetCode[] = [...(a.codes ?? [])];
  if (a.access_note?.trim()) out.push(parseCode(a.access_note));
  return out.filter((c) => c.value.trim() !== "");
}

/** Fold the old single-purpose fields into `links` / `codes` (used when the admin opens an asset). */
export function migrateLegacy<T extends LinkSource>(a: T, skipUrl = ""): T {
  return {
    ...a,
    links: cardLinks(a, skipUrl),
    codes: cardCodes(a),
    access_note: null,
    has_guide: false,
    guide_url: null,
    install_url: null,
    template_url: skipUrl && a.template_url?.trim() === skipUrl ? a.template_url : null,
  };
}
