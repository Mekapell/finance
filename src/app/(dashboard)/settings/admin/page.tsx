import { redirect } from "next/navigation";

import { AdminPanel } from "@/components/settings/admin-panel";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfileWithShop } from "@/lib/data/profile";

export default async function AdminPage() {
  const supabase = await createClient();
  const profile = await getCurrentProfileWithShop(supabase);

  if (!profile) {
    redirect("/login");
  }
  if (!profile.isAdmin) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">แผงควบคุมแอดมิน</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          ค้นหาลูกค้าด้วยชื่อผู้ใช้ แล้วตั้งรหัสผ่านใหม่ให้ได้ทันที
          (ไม่ต้องรู้รหัสผ่านเดิมของลูกค้า)
        </p>
      </div>

      <AdminPanel />
    </div>
  );
}
