"use client";

import * as React from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { cn, formatTHB } from "@/lib/utils";
import type { Category, TransactionType } from "@/lib/types/finance";

export function CategoryManagerDialog({
  open,
  onOpenChange,
  shopId,
  categories,
  onChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shopId: string;
  categories: Category[];
  onChange: (categories: Category[]) => void;
}) {
  const [type, setType] = React.useState<TransactionType>("expense");
  const [name, setName] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const [editingPriceId, setEditingPriceId] = React.useState<string | null>(null);
  const [editingPriceValue, setEditingPriceValue] = React.useState("");

  const filtered = categories.filter((c) => c.type === type);

  async function addCategory() {
    const trimmed = name.trim();
    if (!trimmed) return;

    const parsedPrice = price.trim() ? Number(price) : null;

    setSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("categories")
      .insert({
        shop_id: shopId,
        name: trimmed,
        type,
        default_amount: parsedPrice,
      })
      .select("id, name, type, default_amount")
      .single();
    setSaving(false);

    if (error || !data) {
      toast.error("เพิ่มหมวดหมู่ไม่สำเร็จ");
      return;
    }

    onChange([...categories, data]);
    setName("");
    setPrice("");
  }

  async function deleteCategory(id: string) {
    if (!window.confirm("ลบหมวดหมู่นี้? รายการที่ผูกไว้จะไม่ถูกลบ แต่จะไม่มีหมวดหมู่")) {
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.from("categories").delete().eq("id", id);

    if (error) {
      toast.error("ลบหมวดหมู่ไม่สำเร็จ");
      return;
    }

    onChange(categories.filter((c) => c.id !== id));
  }

  function startEditPrice(c: Category) {
    setEditingPriceId(c.id);
    setEditingPriceValue(c.default_amount != null ? String(c.default_amount) : "");
  }

  async function saveEditPrice(id: string) {
    const trimmed = editingPriceValue.trim();
    const parsed = trimmed ? Number(trimmed) : null;

    if (trimmed && (Number.isNaN(parsed) || parsed! < 0)) {
      toast.error("กรุณากรอกราคาให้ถูกต้อง");
      return;
    }

    const supabase = createClient();
    const { error } = await supabase
      .from("categories")
      .update({ default_amount: parsed })
      .eq("id", id);

    if (error) {
      toast.error("บันทึกราคาไม่สำเร็จ");
      return;
    }

    onChange(
      categories.map((c) => (c.id === id ? { ...c, default_amount: parsed } : c))
    );
    setEditingPriceId(null);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>จัดการหมวดหมู่</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setType("income")}
            className={cn(
              "rounded-xl border py-2 text-sm font-medium",
              type === "income"
                ? "border-success bg-success/15 text-success"
                : "border-input text-muted-foreground"
            )}
          >
            รายรับ
          </button>
          <button
            type="button"
            onClick={() => setType("expense")}
            className={cn(
              "rounded-xl border py-2 text-sm font-medium",
              type === "expense"
                ? "border-destructive bg-destructive/15 text-destructive"
                : "border-input text-muted-foreground"
            )}
          >
            รายจ่าย
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {filtered.length === 0 && (
            <p className="py-2 text-center text-sm text-muted-foreground">
              ยังไม่มีหมวดหมู่
            </p>
          )}
          {filtered.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between rounded-xl border border-border px-3.5 py-2.5"
            >
              <span className="text-sm">{c.name}</span>

              <div className="flex items-center gap-3">
                {editingPriceId === c.id ? (
                  <Input
                    autoFocus
                    type="number"
                    inputMode="decimal"
                    placeholder="ราคา"
                    value={editingPriceValue}
                    onChange={(e) => setEditingPriceValue(e.target.value)}
                    onBlur={() => saveEditPrice(c.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        saveEditPrice(c.id);
                      }
                    }}
                    className="h-8 w-24 text-sm"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => startEditPrice(c)}
                    className="text-xs text-muted-foreground underline-offset-2 hover:underline"
                  >
                    {c.default_amount != null
                      ? formatTHB(c.default_amount)
                      : "ตั้งราคาประจำ"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => deleteCategory(c.id)}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label="ลบหมวดหมู่"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Input
              placeholder="ชื่อหมวดหมู่ใหม่"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCategory();
                }
              }}
            />
            <Input
              type="number"
              inputMode="decimal"
              placeholder="ราคา (ไม่บังคับ)"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCategory();
                }
              }}
              className="w-32"
            />
            <Button type="button" size="icon" disabled={saving} onClick={addCategory}>
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Plus className="size-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            ถ้าใส่ราคาไว้ ตอนเพิ่มรายการแล้วเลือกหมวดหมู่นี้ จะกรอกราคาให้อัตโนมัติ
            (แก้ไขได้เสมอ) — กดที่ราคาในรายการด้านบนเพื่อแก้ทีหลังได้
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
