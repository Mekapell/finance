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

const MAX_RECEIPTS = 5;
const MAX_RECEIPT_BYTES = 5 * 1024 * 1024; // 5MB
const TRANSACTION_SELECT =
  "id, type, amount, note, occurred_at, category_id, category:categories(id, name, type), receipts:transaction_receipts(id, url)";

type ExistingReceipt = { id: string; url: string };

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
  const [existingReceipts, setExistingReceipts] = React.useState<ExistingReceipt[]>([]);
  const [removedIds, setRemovedIds] = React.useState<string[]>([]);
  const [newFiles, setNewFiles] = React.useState<{ file: File; preview: string }[]>([]);
  const [scanning, setScanning] = React.useState(false);

  const keptExisting = existingReceipts.filter((r) => !removedIds.includes(r.id));
  const totalCount = keptExisting.length + newFiles.length;

  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function handleReceiptChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = ""; // กันเลือกไฟล์เดิมซ้ำแล้ว onChange ไม่ทำงาน
    if (files.length === 0) return;

    const remainingSlots = MAX_RECEIPTS - totalCount;
    if (remainingSlots <= 0) {
      toast.error(`แนบรูปได้สูงสุด ${MAX_RECEIPTS} รูปต่อรายการ`);
      return;
    }

    const wasEmpty = totalCount === 0;
    const accepted: { file: File; preview: string }[] = [];

    for (const file of files) {
      if (accepted.length >= remainingSlots) {
        toast.error(`แนบรูปได้สูงสุด ${MAX_RECEIPTS} รูปต่อรายการ เลือกมาบางรูปถูกข้าม`);
        break;
      }
      if (!file.type.startsWith("image/")) {
        toast.error(`ข้ามไฟล์ที่ไม่ใช่รูปภาพ: ${file.name}`);
        continue;
      }
      if (file.size > MAX_RECEIPT_BYTES) {
        toast.error(`ไฟล์ "${file.name}" ใหญ่เกินไป (สูงสุด 5MB) ข้ามไป`);
        continue;
      }
      accepted.push({ file, preview: URL.createObjectURL(file) });
    }

    if (accepted.length === 0) return;

    setNewFiles((prev) => [...prev, ...accepted]);

    // สแกนด้วย AI เฉพาะรูปแรกของรายการนี้เท่านั้น กันเขียนทับค่าที่ผู้ใช้แก้ไว้แล้ว
    if (wasEmpty) {
      scanReceipt(accepted[0].file);
    }
  }

  function removeNewFile(index: number) {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function removeExisting(id: string) {
    setRemovedIds((prev) => [...prev, id]);
  }

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
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
      setExistingReceipts(editing?.receipts ?? []);
      setRemovedIds([]);
      setNewFiles([]);
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

    const { data: savedTransaction, error } = await query.select("id").single();

    if (error || !savedTransaction) {
      toast.error("บันทึกรายการไม่สำเร็จ กรุณาลองใหม่");
      return;
    }

    const transactionId = savedTransaction.id as string;

    // ลบรูปที่ผู้ใช้เอาออก
    if (removedIds.length > 0) {
      await supabase.from("transaction_receipts").delete().in("id", removedIds);
    }

    // อัปโหลดรูปใหม่ที่เพิ่มเข้ามา แล้วบันทึก path ลงตาราง
    for (let i = 0; i < newFiles.length; i++) {
      const { file } = newFiles[i];
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${userId}/${Date.now()}-${i}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("receipts")
        .upload(path, file);

      if (uploadError) {
        toast.error("อัปโหลดรูปบางรูปไม่สำเร็จ");
        continue;
      }

      const { data: publicUrlData } = supabase.storage.from("receipts").getPublicUrl(path);

      await supabase
        .from("transaction_receipts")
        .insert({ transaction_id: transactionId, url: publicUrlData.publicUrl });
    }

    const { data: full } = await supabase
      .from("transactions")
      .select(TRANSACTION_SELECT)
      .eq("id", transactionId)
      .single();

    if (!full) {
      toast.error("บันทึกสำเร็จ แต่โหลดข้อมูลล่าสุดไม่สำเร็จ กรุณารีเฟรชหน้า");
      onOpenChange(false);
      return;
    }

    onSaved(full as never);
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
              {...register("categoryId", {
                onChange: (e) => {
                  const selected = categories.find((c) => c.id === e.target.value);
                  const currentAmount = getValues("amount");
                  if (selected?.default_amount != null && !currentAmount) {
                    setValue("amount", selected.default_amount);
                  }
                },
              })}
              className="h-11 w-full rounded-xl border border-input bg-background px-3.5 text-base shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:text-sm"
            >
              <option value="">เลือกหมวดหมู่</option>
              {filteredCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.default_amount != null ? ` (฿${c.default_amount})` : ""}
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
            <Label>รูปใบเสร็จ (สูงสุด {MAX_RECEIPTS} รูป)</Label>
            <p className="text-xs text-muted-foreground">
              รูปแรกที่แนบ AI จะช่วยกรอกจำนวนเงิน/วันที่/หมวดหมู่ให้อัตโนมัติ
              (ตรวจสอบความถูกต้องก่อนกดบันทึกทุกครั้ง)
            </p>

            <div className="flex flex-wrap gap-2">
              {keptExisting.map((r) => (
                <div key={r.id} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={r.url}
                    alt="ใบเสร็จ"
                    className="size-20 rounded-xl border border-border object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeExisting(r.id)}
                    className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-destructive text-white shadow"
                    aria-label="ลบรูป"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}

              {newFiles.map((f, i) => (
                <div key={f.preview} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={f.preview}
                    alt="ใบเสร็จ"
                    className="size-20 rounded-xl border border-border object-cover"
                  />
                  {scanning && i === 0 && keptExisting.length === 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-xl bg-black/60 text-white">
                      <Loader2 className="size-4 animate-spin" />
                      <span className="text-[10px]">กำลังอ่าน...</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeNewFile(i)}
                    disabled={scanning}
                    className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-destructive text-white shadow disabled:opacity-50"
                    aria-label="ลบรูป"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}

              {totalCount < MAX_RECEIPTS && (
                <label className="flex size-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-input text-muted-foreground hover:bg-accent">
                  <Camera className="size-5" />
                  <span className="text-[10px]">เพิ่มรูป</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleReceiptChange}
                  />
                </label>
              )}
            </div>
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
