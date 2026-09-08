import { redirect } from "next/navigation";

import { ReportsClient } from "@/components/reports/reports-client";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfileWithShop } from "@/lib/data/profile";
import type { Transaction } from "@/lib/types/finance";

export default async function ReportsPage() {
  const supabase = await createClient();
  const profile = await getCurrentProfileWithShop(supabase);

  if (!profile) redirect("/login");

  const { data } = await supabase
    .from("transactions")
    .select("id, type, amount, note, occurred_at, category_id, receipt_url, category:categories(id, name, type)")
    .eq("shop_id", profile.shopId)
    .order("occurred_at", { ascending: false })
    .limit(5000);

  return (
    <ReportsClient
      shopName={profile.shopName}
      transactions={(data ?? []) as unknown as Transaction[]}
    />
  );
}
