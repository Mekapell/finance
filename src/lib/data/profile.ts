import type { SupabaseClient } from "@supabase/supabase-js";

export type ProfileWithShop = {
  id: string;
  email: string;
  shopName: string;
  shopId: string;
  ownerName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  currency: string;
};

/**
 * ดึงข้อมูล profile + shop ของผู้ใช้ปัจจุบันมารวมเป็นก้อนเดียว
 * ใช้ทั้งใน Navbar และหน้า Settings
 */
export async function getCurrentProfileWithShop(
  supabase: SupabaseClient
): Promise<ProfileWithShop | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: profile }, { data: shop }] = await Promise.all([
    supabase
      .from("profiles")
      .select("owner_name, phone, avatar_url, currency")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("shops")
      .select("id, name")
      .eq("owner_id", user.id)
      .maybeSingle(),
  ]);

  return {
    id: user.id,
    email: user.email ?? "",
    shopName: shop?.name ?? "ร้านของฉัน",
    shopId: shop?.id ?? "",
    ownerName: profile?.owner_name ?? null,
    phone: profile?.phone ?? null,
    avatarUrl: profile?.avatar_url ?? null,
    currency: profile?.currency ?? "THB",
  };
}
