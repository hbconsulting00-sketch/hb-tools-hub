import { AdminClient } from "./AdminClient";
import assetsData from "@/data/assets.json";
import { Asset } from "@/components/AssetCard";

export default function AdminPage() {
  return <AdminClient initialAssets={assetsData as Asset[]} />;
}
