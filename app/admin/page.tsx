import { redis } from "@/lib/redis";
import { AdminClient } from "./AdminClient";
import assetsDefault from "@/data/assets.json";
import tabsDefault from "@/data/tabs.json";
import settingsDefault from "@/data/settings.json";
import { Asset } from "@/components/AssetCard";
import { TabConfig } from "@/lib/tabPresets";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const assetsRaw   = await redis.get<string | Asset[]>("assets");
  const tabsRaw     = await redis.get<string | TabConfig[]>("tabs");
  const settingsRaw = await redis.get<string | { siteTitle: string; siteSubtitle: string }>("settings");

  const assets   = (typeof assetsRaw   === "string" ? JSON.parse(assetsRaw)   : assetsRaw)   ?? (assetsDefault   as Asset[]);
  const tabs     = (typeof tabsRaw     === "string" ? JSON.parse(tabsRaw)     : tabsRaw)     ?? (tabsDefault     as TabConfig[]);
  const settings = (typeof settingsRaw === "string" ? JSON.parse(settingsRaw) : settingsRaw) ?? (settingsDefault as { siteTitle: string; siteSubtitle: string });

  return (
    <AdminClient
      initialAssets={assets}
      initialTabs={tabs}
      initialSettings={settings}
    />
  );
}
