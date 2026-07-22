import { AdminClient } from "./AdminClient";
import assetsData from "@/data/assets.json";
import tabsData from "@/data/tabs.json";
import settingsData from "@/data/settings.json";
import { Asset } from "@/components/AssetCard";
import { TabConfig } from "@/lib/tabPresets";

export default function AdminPage() {
  return (
    <AdminClient
      initialAssets={assetsData as Asset[]}
      initialTabs={tabsData as TabConfig[]}
      initialSettings={settingsData as { siteTitle: string; siteSubtitle: string }}
    />
  );
}
