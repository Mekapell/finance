import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * ใช้ service_role key เท่านั้น — ข้าม RLS ได้ทั้งหมด
 * ห้าม import ไฟล์นี้จากไฟล์ที่มี "use client" เด็ดขาด
 * ใช้ได้แค่ใน Server Component / Server Action / Route Handler เท่านั้น
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("ไม่ได้ตั้งค่า SUPABASE_SERVICE_ROLE_KEY");
  }

  return createSupabaseClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
