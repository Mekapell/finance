import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">แดชบอร์ด</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        เชื่อมต่อ Supabase สำเร็จ · ผู้ใช้: {user?.email ?? "ไม่พบ"}
      </p>
    </main>
  );
}
