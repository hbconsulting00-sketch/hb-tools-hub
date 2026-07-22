import { kv } from "@vercel/kv";
import { AdminClient } from "./AdminClient";
import assetsDefault from "@/data/assets.json";
import tabsDefault from "@/data/tabs.json";
import settingsDefault from "@/data/settings.json";
import { Asset } from "@/components/AssetCard";
import { TabConfig } from "@/lib/tabPresets";

export default async function AdminPage() {
  const assets =
    (await kv.get<Asset[]>("assets")) ?? (assetsDefault as Asset[]);
  const tabs =
    (await kv.get<TabConfig[]>("tabs")) ?? (tabsDefault as TabConfig[]);
  const settings =
    (await kv.get<{ siteTitle: string; siteSubtitle: string }>("settings")) ??
    (settingsDefault as { siteTitle: string; siteSubtitle: string });

  return (
    <AdminClient
      initialAssets={assets}
      initialTabs={tabs}
      initialSettings={settings}
    />
  );
}
