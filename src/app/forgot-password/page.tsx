"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";

import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { toThaiAuthError } from "@/lib/auth-errors";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/validations/auth";

export default function ForgotPasswordPage() {
  const [sent, setSent] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(values: ForgotPasswordInput) {
    const supabase = createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    if (error) {
      toast.error(toThaiAuthError(error.message));
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <AuthCard title="ส่งลิงก์แล้ว">
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-success/15 text-success">
            <MailCheck className="size-6" />
          </div>
          <p className="text-sm text-muted-foreground">
            ส่งลิงก์รีเซ็ตรหัสผ่านไปที่อีเมลแล้ว กรุณาตรวจสอบกล่องจดหมาย
          </p>
          <Button asChild variant="outline" className="mt-2 w-full">
            <Link href="/login">กลับไปหน้าเข้าสู่ระบบ</Link>
          </Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="ลืมรหัสผ่าน?"
      description="กรอกอีเมลที่ใช้สมัคร เราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ให้"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
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

        <Button type="submit" disabled={isSubmitting} className="mt-2">
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          ส่งลิงก์รีเซ็ตรหัสผ่าน
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          นึกออกแล้ว?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            เข้าสู่ระบบ
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
