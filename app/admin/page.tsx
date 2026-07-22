import { redis } from "@/lib/redis";
import { AdminClient } from "./AdminClient";
import assetsDefault from "@/data/assets.json";
import tabsDefault from "@/data/tabs.json";
import settingsDefault from "@/data/settings.json";
import { Asset } from "@/components/AssetCard";
import { TabConfig } from "@/lib/tabPresets";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const assetsRaw   = await redis.get<string>("assets");
  const tabsRaw     = await redis.get<string>("tabs");
  const settingsRaw = await redis.get<string>("settings");

  const assets   = (assetsRaw   ? JSON.parse(assetsRaw)   : null) as Asset[]                                    ?? (assetsDefault   as Asset[]);
  const tabs     = (tabsRaw     ? JSON.parse(tabsRaw)     : null) as TabConfig[]                                ?? (tabsDefault     as TabConfig[]);
  const settings = (settingsRaw ? JSON.parse(settingsRaw) : null) as { siteTitle: string; siteSubtitle: string } ?? (settingsDefault as { siteTitle: string; siteSubtitle: string });

  return (
    <AdminClient
      initialAssets={assets}
      initialTabs={tabs}
      initialSettings={settings}
    />
  );
}
