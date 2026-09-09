"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { AuthCard } from "@/components/auth/auth-card";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { toThaiAuthError } from "@/lib/auth-errors";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";

function LoginForm() {
  const searchParams = useSearchParams();
  const [formError, setFormError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { rememberMe: true },
  });

  async function onSubmit(values: LoginInput) {
    setFormError(null);

    try {
      const supabase = createClient();

      // หา email จาก username ก่อน (ต้องหาก่อนจะยืนยันตัวตนได้ เพราะ Supabase Auth ล็อกอินด้วย email เท่านั้น)
      const { data: email, error: lookupError } = await supabase.rpc(
        "get_email_by_username",
        { p_username: values.username }
      );

      if (lookupError || !email) {
        setFormError("ไม่พบชื่อผู้ใช้นี้ในระบบ");
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: values.password,
      });

      if (error) {
        setFormError(toThaiAuthError(error.message));
        return;
      }

      const redirectTo = searchParams.get("redirect") || "/dashboard";
      // ใช้ full page navigation แทน router.push เพื่อให้ middleware อ่าน cookie session ใหม่ได้แน่นอน
      window.location.href = redirectTo;
    } catch {
      setFormError(
        "เชื่อมต่อระบบไม่ได้ กรุณาตรวจสอบอินเทอร์เน็ตหรือลองใหม่อีกครั้ง"
      );
    }
  }

  return (
    <AuthCard title="เข้าสู่ระบบ" description="ยินดีต้อนรับกลับมา">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        {formError && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {formError}
          </p>
        )}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="username">ชื่อผู้ใช้</Label>
          <Input
            id="username"
            placeholder="ชื่อผู้ใช้ของคุณ"
            autoComplete="username"
            {...register("username")}
          />
          {errors.username && (
            <p className="text-sm text-destructive">{errors.username.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">รหัสผ่าน</Label>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Controller
              name="rememberMe"
              control={control}
              render={({ field }) => (
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            จดจำฉันไว้
          </label>
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-primary hover:underline"
          >
            ลืมรหัสผ่าน?
          </Link>
        </div>

        <Button type="submit" disabled={isSubmitting} className="mt-2">
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          เข้าสู่ระบบ
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          ยังไม่มีบัญชี?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            สมัครสมาชิก
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={null}>
      <LoginForm />
    </React.Suspense>
  );
}
