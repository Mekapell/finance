"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { toThaiAuthError } from "@/lib/auth-errors";
import { profileSchema, type ProfileInput } from "@/lib/validations/profile";
import type { ProfileWithShop } from "@/lib/data/profile";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2MB

export function ProfileForm({ profile }: { profile: ProfileWithShop }) {
  const router = useRouter();
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(
    profile.avatarUrl
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      shopName: profile.shopName,
      ownerName: profile.ownerName ?? "",
      phone: profile.phone ?? "",
    },
  });

  const initial = (profile.ownerName || profile.shopName || "?")
    .trim()
    .charAt(0)
    .toUpperCase();

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      toast.error("ไฟล์รูปใหญ่เกินไป (สูงสุด 2MB)");
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function onSubmit(values: ProfileInput) {
    const supabase = createClient();
    let avatarUrl = profile.avatarUrl;

    try {
      if (avatarFile) {
        const ext = avatarFile.name.split(".").pop() || "jpg";
        const path = `${profile.id}/avatar.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(path, avatarFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(path);

        // กัน cache รูปเก่าโดยแปะ timestamp ต่อท้าย
        avatarUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;
      }

      const [{ error: shopError }, { error: profileError }] = await Promise.all([
        supabase
          .from("shops")
          .update({ name: values.shopName })
          .eq("owner_id", profile.id),
        supabase
          .from("profiles")
          .update({
            owner_name: values.ownerName || null,
            phone: values.phone || null,
            avatar_url: avatarUrl,
          })
          .eq("id", profile.id),
      ]);

      if (shopError) throw shopError;
      if (profileError) throw profileError;

      toast.success("บันทึกโปรไฟล์สำเร็จ");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : undefined;
      toast.error(toThaiAuthError(message));
    }
  }

  return (
    <Card className="max-w-lg rounded-2xl shadow-sm">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              {avatarPreview ? (
                <AvatarImage src={avatarPreview} alt={profile.shopName} />
              ) : (
                <AvatarFallback className="text-lg">{initial}</AvatarFallback>
              )}
            </Avatar>
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-input px-4 py-2.5 text-sm font-medium hover:bg-accent">
              <Upload className="size-4" />
              เปลี่ยนโลโก้ร้าน
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </label>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="shopName">ชื่อร้าน</Label>
            <Input id="shopName" {...register("shopName")} />
            {errors.shopName && (
              <p className="text-sm text-destructive">{errors.shopName.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ownerName">ชื่อเจ้าของ</Label>
            <Input id="ownerName" {...register("ownerName")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">เบอร์โทร</Label>
            <Input id="phone" type="tel" {...register("phone")} />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <Button type="submit" disabled={isSubmitting} className="mt-1">
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            บันทึก
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
