import { AssetCard, Asset } from "@/components/AssetCard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { COLOR_PRESETS, TabConfig } from "@/lib/tabPresets";
import assetsDefault from "@/data/assets.json";
import tabsDefault from "@/data/tabs.json";
import settingsDefault from "@/data/settings.json";
import { redis } from "@/lib/redis";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;

  // Read live data from Redis, fall back to static JSON
  const assetsRaw = await redis.get<string | Asset[]>("assets");
  const tabsRaw   = await redis.get<string | TabConfig[]>("tabs");
  const settingsRaw = await redis.get<string | { siteTitle: string; siteSubtitle: string }>("settings");

  const assets   = (typeof assetsRaw   === "string" ? JSON.parse(assetsRaw)   : assetsRaw)   ?? (assetsDefault   as Asset[]);
  const tabs     = (typeof tabsRaw     === "string" ? JSON.parse(tabsRaw)     : tabsRaw)     ?? (tabsDefault     as TabConfig[]);
  const settings = (typeof settingsRaw === "string" ? JSON.parse(settingsRaw) : settingsRaw) ?? (settingsDefault as { siteTitle: string; siteSubtitle: string });

  const activeTabKey = params.tab ?? tabs[0]?.key ?? "";
  const activeTab    = tabs.find((t: TabConfig) => t.key === activeTabKey) ?? tabs[0];
  const activePreset = COLOR_PRESETS[activeTab.colorPreset];

  const tabAssets = activeTab.showAll
    ? assets
    : assets.filter((a: Asset) => a.audience.includes(activeTab.key));

  return (
    <div className="min-h-screen flex flex-col">

      {/* Header */}
      <header className="px-6 pt-7 pb-5 header-animate">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="logo-badge">HB</div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold tracking-tight leading-tight truncate"
                style={{ color: "var(--page-text)" }}>
                {settings.siteTitle}
              </h1>
              <p className="text-xs mt-0.5 truncate" style={{ color: "var(--text-sec)" }}>
                {settings.siteSubtitle}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href="/admin" className="px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all"
              style={{ borderColor: "var(--card-border)", color: "var(--text-sec)" }}>
              ⚙ Admin
            </a>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Tab bar */}
      <nav className="px-6 pb-5 tabs-animate">
        <div className="max-w-5xl mx-auto flex gap-2.5 flex-wrap">
          {tabs.map((tab: TabConfig) => {
            const preset = COLOR_PRESETS[tab.colorPreset];
            const count  = tab.showAll
              ? assets.length
              : assets.filter((a: Asset) => a.audience.includes(tab.key)).length;
            const isActive = activeTab.key === tab.key;
            return (
              <a key={tab.key} href={`?tab=${tab.key}`}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? `${preset.activeBg} text-white ${preset.glowClass}`
                    : `${preset.bg} text-slate-300 tab-inactive-text`
                }`}>
                <span className="text-base">{tab.emoji}</span>
                <span>{tab.label}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  isActive ? "bg-white/25 text-white" : "bg-white/10 text-slate-400 tab-count-inactive"
                }`}>
                  {count}
                </span>
              </a>
            );
          })}
        </div>
      </nav>

      {/* Accent line */}
      <div className={`mx-6 mb-7 h-px bg-gradient-to-l ${activePreset.color} max-w-5xl`}
        style={{ marginLeft: "auto", marginRight: "auto", opacity: "var(--divider-opacity)" }} />

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
            {tabAssets.map((asset: Asset) => (
              <AssetCard key={asset.name} asset={asset}
                accentColor={activePreset.color}
                isStudio={activeTab.showAll ?? false} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center text-xs py-5 border-t"
        style={{ color: "var(--footer-text)", borderColor: "var(--footer-border)" }}>
        HB Consulting &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
