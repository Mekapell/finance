"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";

import { AuthCard } from "@/components/auth/auth-card";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { toThaiAuthError } from "@/lib/auth-errors";
import { registerSchema, usernameSchema, type RegisterInput } from "@/lib/validations/auth";

export default function RegisterPage() {
  const [submitted, setSubmitted] = React.useState(false);
  const [usernameStatus, setUsernameStatus] = React.useState<
    "idle" | "checking" | "available" | "taken" | "invalid"
  >("idle");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const usernameValue = watch("username");

  // เช็คว่า username ว่างอยู่ไหมแบบ debounce ระหว่างพิมพ์
  React.useEffect(() => {
    const parsed = usernameSchema.safeParse(usernameValue);
    if (!parsed.success) {
      setUsernameStatus(usernameValue ? "invalid" : "idle");
      return;
    }

    setUsernameStatus("checking");
    const timer = setTimeout(async () => {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("is_username_available", {
        p_username: parsed.data,
      });
      if (error) {
        setUsernameStatus("idle");
        return;
      }
      setUsernameStatus(data ? "available" : "taken");
    }, 500);

    return () => clearTimeout(timer);
  }, [usernameValue]);

  async function onSubmit(values: RegisterInput) {
    if (usernameStatus === "taken") {
      toast.error("ชื่อผู้ใช้นี้ถูกใช้งานแล้ว กรุณาเลือกชื่อผู้ใช้อื่น");
      return;
    }

    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: { username: values.username, shop_name: values.shopName },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });

    if (error) {
      toast.error(toThaiAuthError(error.message));
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <AuthCard title="สมัครสมาชิกสำเร็จ">
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-success/15 text-success">
            <MailCheck className="size-6" />
          </div>
          <p className="text-sm text-muted-foreground">
            ส่งลิงก์ยืนยันไปที่อีเมลแล้ว กรุณาตรวจสอบกล่องจดหมาย
          </p>
          <Button asChild variant="outline" className="mt-2 w-full">
            <Link href="/login">กลับไปหน้าเข้าสู่ระบบ</Link>
          </Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="สมัครสมาชิก" description="เริ่มจัดการการเงินร้านค้าของคุณ">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="username">ชื่อผู้ใช้ (สำหรับเข้าสู่ระบบ)</Label>
          <Input
            id="username"
            placeholder="เช่น shopowner1"
            autoComplete="username"
            {...register("username")}
          />
          {errors.username && (
            <p className="text-sm text-destructive">{errors.username.message}</p>
          )}
          {!errors.username && usernameStatus === "checking" && (
            <p className="text-xs text-muted-foreground">กำลังตรวจสอบ...</p>
          )}
          {!errors.username && usernameStatus === "available" && (
            <p className="text-xs text-success">ใช้ชื่อนี้ได้</p>
          )}
          {!errors.username && usernameStatus === "taken" && (
            <p className="text-xs text-destructive">ชื่อผู้ใช้นี้ถูกใช้งานแล้ว</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="shopName">ชื่อร้าน</Label>
          <Input
            id="shopName"
            placeholder="เช่น ร้านกาแฟบ้านสวน"
            {...register("shopName")}
          />
          {errors.shopName && (
            <p className="text-sm text-destructive">{errors.shopName.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">อีเมล</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            ใช้สำหรับกู้รหัสผ่านเท่านั้น ไม่ได้ใช้ตอนเข้าสู่ระบบ
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">รหัสผ่าน</Label>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirmPassword">ยืนยันรหัสผ่าน</Label>
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button type="submit" disabled={isSubmitting} className="mt-2">
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          สมัครสมาชิก
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          มีบัญชีอยู่แล้ว?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            เข้าสู่ระบบ
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
