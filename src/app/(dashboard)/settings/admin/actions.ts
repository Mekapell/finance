"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function assertIsAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_admin) throw new Error("unauthorized");
}

export type CustomerLookup = {
  id: string;
  username: string;
  ownerName: string | null;
  phone: string | null;
  shopName: string | null;
};

export async function findCustomerByUsername(
  username: string
): Promise<{ user?: CustomerLookup; error?: string }> {
  await assertIsAdmin();

  const trimmed = username.trim();
  if (!trimmed) return { error: "กรุณากรอกชื่อผู้ใช้" };

  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("id, username, owner_name, phone")
    .ilike("username", trimmed)
    .maybeSingle();

  if (!profile) return { error: "ไม่พบชื่อผู้ใช้นี้ในระบบ" };

  const { data: shop } = await admin
    .from("shops")
    .select("name")
    .eq("owner_id", profile.id)
    .maybeSingle();

  return {
    user: {
      id: profile.id,
      username: profile.username,
      ownerName: profile.owner_name,
      phone: profile.phone,
      shopName: shop?.name ?? null,
    },
  };
}

export async function resetCustomerPassword(
  userId: string,
  newPassword: string
): Promise<{ success?: true; error?: string }> {
  await assertIsAdmin();

  if (newPassword.length < 8) {
    return { error: "รหัสผ่านต้องมีอย่างน้อย 8 ตัว" };
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(userId, {
    password: newPassword,
  });

  if (error) {
    return { error: "ตั้งรหัสผ่านใหม่ไม่สำเร็จ กรุณาลองใหม่" };
  }

  return { success: true };
}
