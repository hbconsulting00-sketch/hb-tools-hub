import { AssetCard, Asset } from "@/components/AssetCard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TabConfig } from "@/lib/tabPresets";
import { BrandIcon } from "@/lib/icons";
import { AssetTypeConfig } from "@/lib/assetTypes";
import assetsDefault from "@/data/assets.json";
import tabsDefault from "@/data/tabs.json";
import typesDefault from "@/data/types.json";
import settingsDefault from "@/data/settings.json";
import { redisGet } from "@/lib/redis";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;

  const assets   = (await redisGet<Asset[]>("assets"))           ?? (assetsDefault as Asset[]);
  const tabs     = (await redisGet<TabConfig[]>("tabs"))         ?? (tabsDefault   as TabConfig[]);
  const types    = (await redisGet<AssetTypeConfig[]>("types"))  ?? (typesDefault  as AssetTypeConfig[]);
  const settings = (await redisGet<{ siteTitle: string; siteSubtitle: string }>("settings")) ?? (settingsDefault as { siteTitle: string; siteSubtitle: string });

  const activeTabKey = params.tab ?? tabs[0]?.key ?? "";
  const activeTab    = tabs.find((t) => t.key === activeTabKey) ?? tabs[0];

  const tabAssets = activeTab.showAll
    ? assets
    : assets.filter((a) => a.audience.includes(activeTab.key));

  return (
    <div className="min-h-screen flex flex-col">

      {/* Header — logo top-right (Hebrew layout), per the brand kit */}
      <header className="px-4 sm:px-6 lg:px-10 pt-7 pb-6 header-animate">
        <div className="page-width flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo-on-dark.png" alt="HB Consulting" className="brand-logo logo-dark logo-full" width={720} height={147} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo-white.png" alt="HB Consulting" className="brand-logo logo-dark logo-small" width={720} height={147} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo-on-light.png" alt="HB Consulting" className="brand-logo logo-light" width={720} height={147} />
            <div className="hidden sm:block h-10 w-px shrink-0" style={{ background: "var(--hairline)" }} />
            <div className="min-w-0 hidden sm:block">
              <h1 className="site-title text-lg font-bold leading-tight truncate">{settings.siteTitle}</h1>
              <p className="text-xs mt-0.5 truncate" style={{ color: "var(--text-sec)" }}>{settings.siteSubtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a href="/admin" className="btn-ghost inline-flex items-center gap-1.5 px-3 h-10 rounded-xl text-xs font-semibold">
              <BrandIcon icon="settings" size={14} />
              <span>Admin</span>
            </a>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Tab bar */}
      <nav className="px-4 sm:px-6 lg:px-10 pb-6 tabs-animate">
        <div className="page-width flex gap-2.5 flex-wrap">
          {tabs.map((tab) => {
            const count    = tab.showAll ? assets.length : assets.filter((a) => a.audience.includes(tab.key)).length;
            const isActive = activeTab.key === tab.key;
            return (
              <a key={tab.key} href={`?tab=${tab.key}`} className={`tab-pill ${isActive ? "is-active" : ""}`}
                aria-current={isActive ? "page" : undefined}>
                <span className="icon-ring"><BrandIcon icon={tab.icon} emoji={tab.emoji} size={16} /></span>
                <span>{tab.label}</span>
                <span className="tab-count">{count}</span>
              </a>
            );
          })}
        </div>
      </nav>

      {/* Dot + stroke divider — the "·H" start of the logo */}
      <div className="px-4 sm:px-6 lg:px-10 mb-7">
        <div className="page-width brand-divider"><span /><span /></div>
      </div>

      {/* Card grid */}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-10 pb-14">
        <div className="page-width">
          {tabAssets.length === 0 ? (
            <div className="text-center py-24">
              <span className="icon-ring icon-ring-lg mx-auto mb-4"><BrandIcon icon="layers" size={22} /></span>
              <p className="text-lg font-semibold" style={{ color: "var(--text-sec)" }}>אין כלים בקטגוריה זו עדיין</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 card-grid">
              {tabAssets.map((asset) => (
                <AssetCard
                  key={asset.name}
                  asset={asset}
                  types={types}
                  tabs={tabs}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="site-footer">
        <div className="page-width px-4 sm:px-6 lg:px-10 flex items-center justify-between gap-3 py-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/symbol-white.png" alt="" className="footer-symbol logo-dark" width={256} height={138} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/symbol.png" alt="" className="footer-symbol logo-light" width={256} height={139} />
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            HB Consulting · People &amp; Performance Partner · {new Date().getFullYear()}
          </span>
        </div>
        <div className="brand-bar" />
      </footer>
    </div>
  );
}
