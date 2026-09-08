import { redirect } from "next/navigation";

import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfileWithShop } from "@/lib/data/profile";
import type { Transaction } from "@/lib/types/finance";

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabelTH(date: Date) {
  return new Intl.DateTimeFormat("th-TH", { month: "short" }).format(date);
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const profile = await getCurrentProfileWithShop(supabase);

  if (!profile) redirect("/login");

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  const fromDate = sixMonthsAgo.toISOString().slice(0, 10);

  const { data } = await supabase
    .from("transactions")
    .select("id, type, amount, note, occurred_at, category_id, category:categories(id, name, type)")
    .eq("shop_id", profile.shopId)
    .gte("occurred_at", fromDate)
    .order("occurred_at", { ascending: false });

  const transactions = (data ?? []) as unknown as Transaction[];

  // สร้างช่องเดือนล่าสุด 6 เดือนไว้ล่วงหน้า (กันเดือนที่ไม่มีข้อมูลหายไปจากกราฟ)
  const buckets = new Map<string, { label: string; income: number; expense: number }>();
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    buckets.set(monthKey(d), { label: monthLabelTH(d), income: 0, expense: 0 });
  }

  const now = new Date();
  const thisMonthKey = monthKey(now);
  let thisMonthIncome = 0;
  let thisMonthExpense = 0;

  for (const t of transactions) {
    const d = new Date(t.occurred_at);
    const key = monthKey(d);
    const bucket = buckets.get(key);
    if (bucket) {
      if (t.type === "income") bucket.income += t.amount;
      else bucket.expense += t.amount;
    }
    if (key === thisMonthKey) {
      if (t.type === "income") thisMonthIncome += t.amount;
      else thisMonthExpense += t.amount;
    }
  }

  const chartData = Array.from(buckets.values());
  const recent = transactions.slice(0, 5);

  return (
    <DashboardClient
      ownerName={profile.ownerName}
      shopName={profile.shopName}
      thisMonth={{
        income: thisMonthIncome,
        expense: thisMonthExpense,
        net: thisMonthIncome - thisMonthExpense,
      }}
      chartData={chartData}
      recent={recent}
    />
  );
}
