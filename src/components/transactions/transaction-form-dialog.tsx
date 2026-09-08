"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  transactionSchema,
  type TransactionInput,
} from "@/lib/validations/transaction";
import type { Category, Transaction } from "@/lib/types/finance";

export function TransactionFormDialog({
  open,
  onOpenChange,
  shopId,
  categories,
  editing,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shopId: string;
  categories: Category[];
  editing: Transaction | null;
  onSaved: (transaction: Transaction) => void;
}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: { type: "expense", occurredAt: new Date().toISOString().slice(0, 10) },
  });

  const type = watch("type");

  React.useEffect(() => {
    if (open) {
      reset(
        editing
          ? {
              type: editing.type,
              amount: editing.amount,
              categoryId: editing.category_id ?? "",
              occurredAt: editing.occurred_at.slice(0, 10),
              note: editing.note ?? "",
            }
          : {
              type: "expense",
              amount: undefined,
              categoryId: "",
              occurredAt: new Date().toISOString().slice(0, 10),
              note: "",
            }
      );
    }
  }, [open, editing, reset]);

  const filteredCategories = categories.filter((c) => c.type === type);

  async function onSubmit(values: TransactionInput) {
    const supabase = createClient();
    const payload = {
      shop_id: shopId,
      type: values.type,
      amount: values.amount,
      category_id: values.categoryId,
      occurred_at: values.occurredAt,
      note: values.note?.trim() || null,
    };

    const query = editing
      ? supabase.from("transactions").update(payload).eq("id", editing.id)
      : supabase.from("transactions").insert(payload);

    const { data, error } = await query
      .select("id, type, amount, note, occurred_at, category_id, category:categories(id, name, type)")
      .single();

    if (error || !data) {
      toast.error("บันทึกรายการไม่สำเร็จ กรุณาลองใหม่");
      return;
    }

    onSaved(data as never);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "แก้ไขรายการ" : "เพิ่มรายการ"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setValue("type", "income");
                setValue("categoryId", "");
              }}
              className={cn(
                "rounded-xl border py-2.5 text-sm font-medium transition-colors",
                type === "income"
                  ? "border-success bg-success/15 text-success"
                  : "border-input text-muted-foreground"
              )}
            >
              รายรับ
            </button>
            <button
              type="button"
              onClick={() => {
                setValue("type", "expense");
                setValue("categoryId", "");
              }}
              className={cn(
                "rounded-xl border py-2.5 text-sm font-medium transition-colors",
                type === "expense"
                  ? "border-destructive bg-destructive/15 text-destructive"
                  : "border-input text-muted-foreground"
              )}
            >
              รายจ่าย
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="amount">จำนวนเงิน (บาท)</Label>
            <Input
              id="amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              placeholder="0.00"
              {...register("amount")}
            />
            {errors.amount && (
              <p className="text-sm text-destructive">{errors.amount.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="categoryId">หมวดหมู่</Label>
            <select
              id="categoryId"
              {...register("categoryId")}
              className="h-11 w-full rounded-xl border border-input bg-background px-3.5 text-base shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:text-sm"
            >
              <option value="">เลือกหมวดหมู่</option>
              {filteredCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-sm text-destructive">{errors.categoryId.message}</p>
            )}
            {filteredCategories.length === 0 && (
              <p className="text-xs text-muted-foreground">
                ยังไม่มีหมวดหมู่ประเภทนี้ — ไปเพิ่มที่ &quot;จัดการหมวดหมู่&quot; ก่อน
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="occurredAt">วันที่</Label>
            <Input id="occurredAt" type="date" {...register("occurredAt")} />
            {errors.occurredAt && (
              <p className="text-sm text-destructive">{errors.occurredAt.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="note">โน้ต (ไม่บังคับ)</Label>
            <Input id="note" placeholder="เช่น ค่าวัตถุดิบ" {...register("note")} />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              บันทึก
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
