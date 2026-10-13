import { redisGet } from "@/lib/redis";
import { AdminClient } from "./AdminClient";
import assetsDefault from "@/data/assets.json";
import tabsDefault from "@/data/tabs.json";
import typesDefault from "@/data/types.json";
import settingsDefault from "@/data/settings.json";
import { Asset } from "@/components/AssetCard";
import { TabConfig } from "@/lib/tabPresets";
import { AssetTypeConfig } from "@/lib/assetTypes";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const assets   = (await redisGet<Asset[]>("assets"))          ?? (assetsDefault as Asset[]);
  const tabs     = (await redisGet<TabConfig[]>("tabs"))        ?? (tabsDefault   as TabConfig[]);
  const types    = (await redisGet<AssetTypeConfig[]>("types")) ?? (typesDefault  as AssetTypeConfig[]);
  const settings = (await redisGet<{ siteTitle: string; siteSubtitle: string }>("settings")) ?? (settingsDefault as { siteTitle: string; siteSubtitle: string });

  return (
    <AdminClient
      initialAssets={assets}
      initialTabs={tabs}
      initialTypes={types}
      initialSettings={settings}
    />
  );
}
