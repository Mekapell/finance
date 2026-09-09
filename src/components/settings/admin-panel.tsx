"use client";

import * as React from "react";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  findCustomerByUsername,
  resetCustomerPassword,
  type CustomerLookup,
} from "@/app/(dashboard)/settings/admin/actions";

export function AdminPanel() {
  const [username, setUsername] = React.useState("");
  const [searching, setSearching] = React.useState(false);
  const [found, setFound] = React.useState<CustomerLookup | null>(null);
  const [newPassword, setNewPassword] = React.useState("");
  const [resetting, setResetting] = React.useState(false);
  const [lastReset, setLastReset] = React.useState<{
    username: string;
    password: string;
  } | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearching(true);
    setFound(null);
    setLastReset(null);
    try {
      const result = await findCustomerByUsername(username);
      if (result.error || !result.user) {
        toast.error(result.error ?? "ไม่พบชื่อผู้ใช้นี้");
        return;
      }
      setFound(result.user);
    } catch {
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setSearching(false);
    }
  }

  function generateRandomPassword() {
    // สุ่มรหัสผ่านที่จำง่ายพอสมควร ตัวเลข 6 หลัก + ตัวอักษรนำหน้า 2 ตัว
    const letters = "abcdefghjkmnpqrstuvwxyz";
    const prefix =
      letters[Math.floor(Math.random() * letters.length)] +
      letters[Math.floor(Math.random() * letters.length)];
    const digits = Math.floor(100000 + Math.random() * 900000).toString();
    setNewPassword(prefix + digits);
  }

  async function handleReset() {
    if (!found) return;
    if (newPassword.length < 8) {
      toast.error("รหัสผ่านต้องมีอย่างน้อย 8 ตัว");
      return;
    }
    setResetting(true);
    try {
      const result = await resetCustomerPassword(found.id, newPassword);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setLastReset({ username: found.username, password: newPassword });
      setNewPassword("");
      toast.success("ตั้งรหัสผ่านใหม่สำเร็จ");
    } catch {
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setResetting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="max-w-lg rounded-2xl shadow-sm">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex flex-col gap-3">
            <Label htmlFor="search-username">ชื่อผู้ใช้ของลูกค้า</Label>
            <div className="flex gap-2">
              <Input
                id="search-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="เช่น shopowner1"
                autoComplete="off"
              />
              <Button type="submit" disabled={searching || !username.trim()}>
                {searching ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Search className="size-4" />
                )}
                ค้นหา
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {found && (
        <Card className="max-w-lg rounded-2xl shadow-sm">
          <CardContent className="flex flex-col gap-4 pt-6">
            <div>
              <p className="text-sm text-muted-foreground">พบผู้ใช้</p>
              <p className="font-medium">@{found.username}</p>
              <p className="text-sm text-muted-foreground">
                {found.shopName ?? "ไม่มีชื่อร้าน"}
                {found.ownerName ? ` · ${found.ownerName}` : ""}
                {found.phone ? ` · ${found.phone}` : ""}
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new-password">ตั้งรหัสผ่านใหม่</Label>
              <div className="flex gap-2">
                <Input
                  id="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="อย่างน้อย 8 ตัว"
                />
                <Button type="button" variant="outline" onClick={generateRandomPassword}>
                  สุ่ม
                </Button>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleReset}
              disabled={resetting || newPassword.length < 8}
            >
              {resetting && <Loader2 className="size-4 animate-spin" />}
              ตั้งรหัสผ่านใหม่ให้ลูกค้า
            </Button>
          </CardContent>
        </Card>
      )}

      {lastReset && (
        <Card className="max-w-lg rounded-2xl border-success/40 bg-success/10 shadow-sm">
          <CardContent className="pt-6 text-sm">
            <p className="font-medium text-success">ตั้งรหัสผ่านใหม่สำเร็จ ✅</p>
            <p className="mt-2 text-muted-foreground">
              ส่งข้อความนี้ให้ลูกค้าทางไลน์ได้เลย:
            </p>
            <p className="mt-1 rounded-lg bg-background p-3 font-mono">
              ชื่อผู้ใช้: {lastReset.username}
              <br />
              รหัสผ่านใหม่: {lastReset.password}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
