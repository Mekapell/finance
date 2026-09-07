import { redirect } from "next/navigation";

import { BottomNav } from "@/components/dashboard/bottom-nav";
import { Navbar } from "@/components/dashboard/navbar";
import { Sidebar } from "@/components/dashboard/sidebar";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfileWithShop } from "@/lib/data/profile";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const profile = await getCurrentProfileWithShop(supabase);

  // เผื่อไว้: middleware ป้องกัน route กลุ่มนี้อยู่แล้ว แต่กันเหนียวอีกชั้น
  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-dvh">
      <Sidebar shopName={profile.shopName} />
      <div className="flex flex-1 flex-col">
        <Navbar profile={profile} />
        <main className="flex-1 p-4 pb-24 md:p-6 md:pb-6">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}
