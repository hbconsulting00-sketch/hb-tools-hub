import { redisGet } from "@/lib/redis";
import { AdminClient } from "./AdminClient";
import assetsDefault from "@/data/assets.json";
import tabsDefault from "@/data/tabs.json";
import settingsDefault from "@/data/settings.json";
import { Asset } from "@/components/AssetCard";
import { TabConfig } from "@/lib/tabPresets";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const assets   = (await redisGet<Asset[]>("assets"))                                       ?? (assetsDefault   as Asset[]);
  const tabs     = (await redisGet<TabConfig[]>("tabs"))                                     ?? (tabsDefault     as TabConfig[]);
  const settings = (await redisGet<{ siteTitle: string; siteSubtitle: string }>("settings")) ?? (settingsDefault as { siteTitle: string; siteSubtitle: string });

  return <AdminClient initialAssets={assets} initialTabs={tabs} initialSettings={settings} />;
}
