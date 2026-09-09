import { redirect } from "next/navigation";

import { TransactionsClient } from "@/components/transactions/transactions-client";
import { createClient } from "@/lib/supabase/server";

export default async function TransactionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: shop } = await supabase
    .from("shops")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!shop) {
    return (
      <div className="text-sm text-muted-foreground">
        ไม่พบร้านค้าของคุณ กรุณาติดต่อผู้ดูแลระบบ
      </div>
    );
  }

  const [{ data: categories }, { data: transactions }] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name, type")
      .eq("shop_id", shop.id)
      .order("name"),
    supabase
      .from("transactions")
      .select("id, type, amount, note, occurred_at, category_id, category:categories(id, name, type), receipts:transaction_receipts(id, url)")
      .eq("shop_id", shop.id)
      .order("occurred_at", { ascending: false })
      .limit(200),
  ]);

  return (
    <TransactionsClient
      shopId={shop.id}
      userId={user.id}
      initialCategories={categories ?? []}
      initialTransactions={(transactions ?? []) as never}
    />
  );
}
