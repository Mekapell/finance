"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { AuthCard } from "@/components/auth/auth-card";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { toThaiAuthError } from "@/lib/auth-errors";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/lib/validations/auth";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = React.useState(false);
  const [invalidLink, setInvalidLink] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  // ลิงก์รีเซ็ตจะพาเรามาที่นี่ผ่าน /auth/callback ซึ่งแลก code เป็น session ให้แล้ว
  // ตรวจสอบว่ามี session (จากลิงก์ที่ถูกต้อง) ก่อนให้ตั้งรหัสผ่านใหม่ได้
  React.useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setReady(true);
      } else {
        setInvalidLink(true);
      }
    });
  }, []);

  async function onSubmit(values: ResetPasswordInput) {
    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({
      password: values.password,
    });

    if (error) {
      toast.error(toThaiAuthError(error.message));
      return;
    }

    toast.success("ตั้งรหัสผ่านใหม่สำเร็จ");
    router.push("/login");
  }

  if (invalidLink) {
    return (
      <AuthCard title="ลิงก์ไม่ถูกต้องหรือหมดอายุ">
        <p className="text-center text-sm text-muted-foreground">
          กรุณาขอลิงก์รีเซ็ตรหัสผ่านใหม่อีกครั้ง
        </p>
        <Button asChild className="mt-4 w-full">
          <a href="/forgot-password">ขอลิงก์ใหม่</a>
        </Button>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="ตั้งรหัสผ่านใหม่" description="กรอกรหัสผ่านใหม่ของคุณ">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">รหัสผ่านใหม่</Label>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            disabled={!ready}
            {...register("password")}
          />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirmPassword">ยืนยันรหัสผ่านใหม่</Label>
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            disabled={!ready}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button type="submit" disabled={!ready || isSubmitting} className="mt-2">
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          บันทึกรหัสผ่านใหม่
        </Button>
      </form>
    </AuthCard>
  );
}
