"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Loader2, X } from "lucide-react";
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
import { cn, todayLocalISODate } from "@/lib/utils";
import {
  transactionSchema,
  type TransactionInput,
} from "@/lib/validations/transaction";
import type { Category, Transaction } from "@/lib/types/finance";

export function TransactionFormDialog({
  open,
  onOpenChange,
  shopId,
  userId,
  categories,
  editing,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shopId: string;
  userId: string;
  categories: Category[];
  editing: Transaction | null;
  onSaved: (transaction: Transaction) => void;
}) {
  const [receiptFile, setReceiptFile] = React.useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = React.useState<string | null>(null);
  const [removeReceipt, setRemoveReceipt] = React.useState(false);
  const [scanning, setScanning] = React.useState(false);

  const MAX_RECEIPT_BYTES = 5 * 1024 * 1024; // 5MB

  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function handleReceiptChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
      return;
    }
    if (file.size > MAX_RECEIPT_BYTES) {
      toast.error("ไฟล์รูปใหญ่เกินไป (สูงสุด 5MB)");
      return;
    }

    setReceiptFile(file);
    setReceiptPreview(URL.createObjectURL(file));
    setRemoveReceipt(false);
    scanReceipt(file);
  }

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: { type: "expense", occurredAt: todayLocalISODate() },
  });

  const type = watch("type");

  async function scanReceipt(file: File) {
    setScanning(true);
    try {
      const base64 = await fileToBase64(file);
      const res = await fetch("/api/scan-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: base64, mimeType: file.type }),
      });
      const json = await res.json();

      if (!json.result) {
        toast.error(json.error ?? "สแกนใบเสร็จไม่สำเร็จ กรุณากรอกเอง");
        return;
      }

      const result = json.result as {
        amount?: number;
        type?: "income" | "expense";
        date?: string;
        category?: string;
        note?: string;
      };

      const resultType = result.type === "income" ? "income" : "expense";
      setValue("type", resultType);
      if (typeof result.amount === "number") setValue("amount", result.amount);
      if (result.date) setValue("occurredAt", result.date);

      let noteValue = result.note ?? "";
      if (result.category) {
        const match = categories.find(
          (c) =>
            c.type === resultType &&
            (c.name.includes(result.category!) || result.category!.includes(c.name))
        );
        if (match) {
          setValue("categoryId", match.id);
        } else {
          noteValue = noteValue
            ? `${noteValue} (แนะนำหมวดหมู่: ${result.category})`
            : `แนะนำหมวดหมู่: ${result.category}`;
        }
      }
      setValue("note", noteValue);

      toast.success("สแกนใบเสร็จสำเร็จ ตรวจสอบข้อมูลก่อนบันทึกด้วยนะ");
    } catch {
      toast.error("สแกนใบเสร็จไม่สำเร็จ กรุณากรอกเอง");
    } finally {
      setScanning(false);
    }
  }

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
              occurredAt: todayLocalISODate(),
              note: "",
            }
      );
      setReceiptFile(null);
      setReceiptPreview(editing?.receipt_url ?? null);
      setRemoveReceipt(false);
    }
  }, [open, editing, reset]);

  const filteredCategories = categories.filter((c) => c.type === type);

  async function onSubmit(values: TransactionInput) {
    const supabase = createClient();
    let receiptUrl = editing?.receipt_url ?? null;

    if (removeReceipt) {
      receiptUrl = null;
    }

    if (receiptFile) {
      const ext = receiptFile.name.split(".").pop() || "jpg";
      const path = `${userId}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("receipts")
        .upload(path, receiptFile);

      if (uploadError) {
        toast.error("อัปโหลดรูปไม่สำเร็จ");
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("receipts")
        .getPublicUrl(path);
      receiptUrl = publicUrlData.publicUrl;
    }

    const payload = {
      shop_id: shopId,
      type: values.type,
      amount: values.amount,
      category_id: values.categoryId,
      occurred_at: values.occurredAt,
      note: values.note?.trim() || null,
      receipt_url: receiptUrl,
    };

    const query = editing
      ? supabase.from("transactions").update(payload).eq("id", editing.id)
      : supabase.from("transactions").insert(payload);

    const { data, error } = await query
      .select("id, type, amount, note, occurred_at, category_id, receipt_url, category:categories(id, name, type)")
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

          <div className="flex flex-col gap-1.5">
            <Label>รูปใบเสร็จ (ไม่บังคับ)</Label>
            <p className="text-xs text-muted-foreground">
              ถ่ายรูปหรือแนบรูปใบเสร็จ แล้ว AI จะช่วยกรอกจำนวนเงิน/วันที่/หมวดหมู่ให้อัตโนมัติ
              (ตรวจสอบความถูกต้องก่อนกดบันทึกทุกครั้ง)
            </p>
            {receiptPreview ? (
              <div className="relative w-fit">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={receiptPreview}
                  alt="ใบเสร็จ"
                  className="h-28 w-28 rounded-xl border border-border object-cover"
                />
                {scanning && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-xl bg-black/60 text-white">
                    <Loader2 className="size-5 animate-spin" />
                    <span className="text-xs">กำลังอ่าน...</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setReceiptFile(null);
                    setReceiptPreview(null);
                    setRemoveReceipt(true);
                  }}
                  disabled={scanning}
                  className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-destructive text-white shadow disabled:opacity-50"
                  aria-label="ลบรูป"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ) : (
              <label className="flex w-fit cursor-pointer items-center gap-2 rounded-xl border border-input px-4 py-2.5 text-sm font-medium hover:bg-accent">
                <Camera className="size-4" />
                ถ่ายภาพ / แนบรูป
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleReceiptChange}
                />
              </label>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting || scanning}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              บันทึก
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
