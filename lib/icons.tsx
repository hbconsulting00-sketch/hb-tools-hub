import {
  Gamepad2, FileText, Presentation, ChartNoAxesCombined, Megaphone, Wrench, Sparkles,
  BriefcaseBusiness, Smartphone, Globe, ClipboardCheck, Bot, Zap, Puzzle, Link2,
  HardHat, ShieldCheck, Siren, Flame, FlaskConical, GraduationCap, BookOpen,
  Users, Briefcase, Lightbulb, Rocket, Star, Heart, Target, Layers, Palette,
  Video, MessageSquare, Calendar, Search, Settings, Bell, Compass,
  type LucideIcon,
} from "lucide-react";

/**
 * The icons a tab or asset type can pick from. Rounded line icons, 2px stroke —
 * the brand kit's icon style. Keys are stored in Redis, so never rename one.
 */
export const ICONS: Record<string, { Icon: LucideIcon; label: string }> = {
  gamepad:      { Icon: Gamepad2,            label: "משחק" },
  "file-text":  { Icon: FileText,            label: "מסמך" },
  presentation: { Icon: Presentation,        label: "מצגת" },
  chart:        { Icon: ChartNoAxesCombined, label: "גרף" },
  megaphone:    { Icon: Megaphone,           label: "מגפון" },
  wrench:       { Icon: Wrench,              label: "מפתח ברגים" },
  sparkles:     { Icon: Sparkles,            label: "חדש" },
  toolbox:      { Icon: BriefcaseBusiness,   label: "ארגז כלים" },
  smartphone:   { Icon: Smartphone,          label: "נייד" },
  globe:        { Icon: Globe,               label: "אתר" },
  clipboard:    { Icon: ClipboardCheck,      label: "טופס" },
  bot:          { Icon: Bot,                 label: "סוכן" },
  zap:          { Icon: Zap,                 label: "ברק" },
  puzzle:       { Icon: Puzzle,              label: "תוסף" },
  link:         { Icon: Link2,               label: "קישור" },
  "hard-hat":   { Icon: HardHat,             label: "קסדה" },
  shield:       { Icon: ShieldCheck,         label: "מגן" },
  siren:        { Icon: Siren,               label: "אזעקה" },
  flame:        { Icon: Flame,               label: "אש" },
  flask:        { Icon: FlaskConical,        label: "מבחנה" },
  graduation:   { Icon: GraduationCap,       label: "הדרכה" },
  book:         { Icon: BookOpen,            label: "ספר" },
  users:        { Icon: Users,               label: "אנשים" },
  briefcase:    { Icon: Briefcase,           label: "תיק" },
  lightbulb:    { Icon: Lightbulb,           label: "רעיון" },
  rocket:       { Icon: Rocket,              label: "רקטה" },
  star:         { Icon: Star,                label: "כוכב" },
  heart:        { Icon: Heart,               label: "לב" },
  target:       { Icon: Target,              label: "מטרה" },
  layers:       { Icon: Layers,              label: "שכבות" },
  palette:      { Icon: Palette,             label: "עיצוב" },
  video:        { Icon: Video,               label: "וידאו" },
  message:      { Icon: MessageSquare,       label: "צ'אט" },
  calendar:     { Icon: Calendar,            label: "לוח שנה" },
  search:       { Icon: Search,              label: "חיפוש" },
  settings:     { Icon: Settings,            label: "הגדרות" },
  bell:         { Icon: Bell,                label: "התראה" },
  compass:      { Icon: Compass,             label: "מצפן" },
};

export const ICON_KEYS = Object.keys(ICONS);

/** Shows the picked line icon; falls back to the old emoji when none is set. */
export function BrandIcon({
  icon,
  emoji,
  size = 18,
  className,
}: {
  icon?: string | null;
  emoji?: string;
  size?: number;
  className?: string;
}) {
  const entry = icon ? ICONS[icon] : undefined;
  if (!entry) return <span className={className} style={{ fontSize: size * 0.9, lineHeight: 1 }}>{emoji ?? "•"}</span>;
  const { Icon } = entry;
  return <Icon size={size} strokeWidth={2} absoluteStrokeWidth className={className} aria-hidden="true" />;
}
