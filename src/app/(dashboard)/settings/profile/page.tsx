import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";

import { ProfileForm } from "@/components/settings/profile-form";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfileWithShop } from "@/lib/data/profile";

export default async function ProfileSettingsPage() {
  const supabase = await createClient();
  const profile = await getCurrentProfileWithShop(supabase);

  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">ตั้งค่าโปรไฟล์</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          จัดการข้อมูลร้านและข้อมูลส่วนตัวของคุณ
        </p>
      </div>

      <ProfileForm profile={profile} />

      {profile.isAdmin && (
        <Link
          href="/settings/admin"
          className="flex max-w-lg items-center gap-3 rounded-2xl border border-input p-4 text-sm font-medium hover:bg-accent"
        >
          <ShieldCheck className="size-5 text-primary" />
          แผงควบคุมแอดมิน — รีเซ็ตรหัสผ่านลูกค้า
        </Link>
      )}
    </div>
  );
}
