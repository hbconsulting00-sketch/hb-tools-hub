import { AssetCard, Asset } from "@/components/AssetCard";
import { ThemeToggle } from "@/components/ThemeToggle";
import assetsData from "@/data/assets.json";

const assets = assetsData as Asset[];

const TABS = [
  {
    key: "instructors",
    label: "כלי מדריכים",
    emoji: "🎓",
    color: "from-green-500 to-emerald-600",
    glowClass: "tab-glow-instructors",
    bg: "bg-green-500/20 hover:bg-green-500/30 border border-green-500/40",
    activeBg: "bg-gradient-to-l from-green-500 to-emerald-600 border-transparent",
  },
  {
    key: "management",
    label: "הנהלה",
    emoji: "📊",
    color: "from-indigo-500 to-violet-600",
    glowClass: "tab-glow-management",
    bg: "bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40",
    activeBg: "bg-gradient-to-l from-indigo-500 to-violet-600 border-transparent",
  },
  {
    key: "daily-shared",
    label: "יומיומי",
    emoji: "⚡",
    color: "from-amber-400 to-orange-500",
    glowClass: "tab-glow-daily",
    bg: "bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40",
    activeBg: "bg-gradient-to-l from-amber-400 to-orange-500 border-transparent",
  },
  {
    key: "studio-only",
    label: "סטודיו",
    emoji: "🛠",
    color: "from-rose-500 to-pink-600",
    glowClass: "tab-glow-studio",
    bg: "bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40",
    activeBg: "bg-gradient-to-l from-rose-500 to-pink-600 border-transparent",
  },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  const activeTab: TabKey = (params.tab as TabKey) ?? "instructors";
  const activeTabConfig = TABS.find((t) => t.key === activeTab)!;
  const tabAssets = assets.filter((a) => a.audience.includes(activeTab));

  return (
    <div className="min-h-screen flex flex-col">

      {/* Header */}
      <header className="px-6 pt-7 pb-5 header-animate">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          {/* Logo + Title */}
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="logo-badge">HB</div>
            <div className="min-w-0">
              <h1
                className="text-xl font-bold tracking-tight leading-tight truncate"
                style={{ color: "var(--page-text)" }}
              >
                HB Tools Hub
              </h1>
              <p className="text-xs mt-0.5 truncate" style={{ color: "var(--text-sec)" }}>
                מרכז הכלים הפנימי
              </p>
            </div>
          </div>

          {/* Theme toggle */}
          <ThemeToggle />
        </div>
      </header>

      {/* Tab bar */}
      <nav className="px-6 pb-5 tabs-animate">
        <div className="max-w-5xl mx-auto flex gap-2.5 flex-wrap">
          {TABS.map((tab) => {
            const count = assets.filter((a) => a.audience.includes(tab.key)).length;
            const isActive = activeTab === tab.key;
            return (
              <a
                key={tab.key}
                href={`?tab=${tab.key}`}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? `${tab.activeBg} text-white ${tab.glowClass}`
                    : `${tab.bg} text-slate-300 tab-inactive-text`
                }`}
              >
                <span className="text-base">{tab.emoji}</span>
                <span>{tab.label}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    isActive ? "bg-white/25 text-white" : "bg-white/10 text-slate-400 tab-count-inactive"
                  }`}
                >
                  {count}
                </span>
              </a>
            );
          })}
        </div>
      </nav>

      {/* Active-tab accent line */}
      <div
        className={`mx-6 mb-7 h-px bg-gradient-to-l ${activeTabConfig.color} max-w-5xl`}
        style={{ marginLeft: "auto", marginRight: "auto", opacity: "var(--divider-opacity)" }}
      />

      {/* Card grid */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 pb-14">
        {tabAssets.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-lg font-semibold" style={{ color: "var(--text-sec)" }}>
              אין כלים בקטגוריה זו עדיין
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 card-grid">
            {tabAssets.map((asset) => (
              <AssetCard key={asset.name} asset={asset} accentColor={activeTabConfig.color} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        className="text-center text-xs py-5 border-t"
        style={{
          color: "var(--footer-text)",
          borderColor: "var(--footer-border)",
        }}
      >
        HB Consulting &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
