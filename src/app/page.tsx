import Link from "next/link";
import { redirect } from "next/navigation";
import { Camera, ShieldCheck, TrendingUp, Wallet } from "lucide-react";

import { ShopMascot } from "@/components/dashboard/shop-mascot";
import { createClient } from "@/lib/supabase/server";

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ล็อกอินอยู่แล้ว ไม่ต้องดูหน้าแนะนำ พาไป dashboard ตรงเลย
  if (user) {
    redirect("/dashboard");
  }

  const features = [
    {
      icon: Camera,
      title: "ถ่ายรูปสลิป AI อ่านให้เลย",
      desc: "ไม่ต้องพิมพ์เอง แนบรูปใบเสร็จ AI กรอกจำนวนเงิน/วันที่/หมวดหมู่ให้อัตโนมัติ",
    },
    {
      icon: TrendingUp,
      title: "เห็นกำไร-ขาดทุนสดๆ",
      desc: "ไม่ต้องรอปิดร้านมานั่งนับเงิน เปิดดูได้ตลอดว่าตอนนี้กำไรหรือยัง",
    },
    {
      icon: Wallet,
      title: "ตั้งราคาประจำต่อหมวดหมู่",
      desc: "ของที่ซื้อ/ขายซ้ำๆ ตั้งราคาไว้ครั้งเดียว ครั้งต่อไปกรอกให้อัตโนมัติ",
    },
    {
      icon: ShieldCheck,
      title: "ข้อมูลร้านของใครก็เป็นของคนนั้น",
      desc: "แต่ละร้านเห็นแค่ข้อมูลของตัวเอง ปลอดภัย ไม่ปนกัน",
    },
  ];

  return (
    <main className="min-h-dvh bg-background text-foreground">
      {/* Hero */}
      <section className="flex flex-col items-center gap-5 px-6 pb-10 pt-14 text-center">
        <ShopMascot className="size-24" />
        <h1 className="text-2xl font-semibold tracking-tight">
          ระบบจัดการการเงินร้านค้า
        </h1>
        <p className="max-w-sm text-balance text-[15px] leading-relaxed text-muted-foreground">
          จดรายรับ-รายจ่ายให้ร้านของคุณ ง่ายแค่ถ่ายรูปสลิป ไม่ต้องนั่งบวกเลขเองอีกต่อไป
        </p>

        <div className="mt-2 flex w-full max-w-xs flex-col gap-3">
          <Link
            href="/register"
            className="flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
          >
            สมัครใช้งานฟรี
          </Link>
          <Link
            href="/login"
            className="flex items-center justify-center rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground"
          >
            มีบัญชีอยู่แล้ว เข้าสู่ระบบ
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="flex flex-col gap-4 px-6 pb-14">
        {features.map((f) => (
          <div
            key={f.title}
            className="flex items-start gap-4 rounded-2xl bg-card p-4"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
              <f.icon className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold">{f.title}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          </div>
        ))}
      </section>

      <footer className="border-t border-border px-6 py-6 text-center text-xs text-muted-foreground">
        สมัครสมาชิกฟรี ใช้งานได้ทันทีบนมือถือ ไม่ต้องโหลดแอป
      </footer>
    </main>
  );
}
