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
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";

export default function RegisterPage() {
  const [submitted, setSubmitted] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(values: RegisterInput) {
    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: { shop_name: values.shopName },
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
