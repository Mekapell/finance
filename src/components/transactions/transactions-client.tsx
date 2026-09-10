"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Settings2, Trash2, Receipt } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { CategoryManagerDialog } from "@/components/transactions/category-manager-dialog";
import { TransactionFormDialog } from "@/components/transactions/transaction-form-dialog";
import { createClient } from "@/lib/supabase/client";
import { cn, formatDateTH, formatTHB } from "@/lib/utils";
import { getCategoryAccent } from "@/lib/category-colors";
import type { Category, Transaction, TransactionType } from "@/lib/types/finance";

type Filter = "all" | TransactionType;

export function TransactionsClient({
  shopId,
  userId,
  initialCategories,
  initialTransactions,
}: {
  shopId: string;
  userId: string;
  initialCategories: Category[];
  initialTransactions: Transaction[];
}) {
  const [categories, setCategories] = React.useState(initialCategories);
  const [transactions, setTransactions] = React.useState(initialTransactions);
  const [filter, setFilter] = React.useState<Filter>("all");
  const [formOpen, setFormOpen] = React.useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Transaction | null>(null);
  const searchParams = useSearchParams();

  React.useEffect(() => {
    if (searchParams.get("add") === "1") {
      setFormOpen(true);
    }
    // เปิดครั้งเดียวตอนโหลดหน้าจากลิงก์ quick-add พอ ไม่ต้องผูก dependency กับ searchParams ทุกครั้ง
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totals = React.useMemo(() => {
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    return { income, expense, net: income - expense };
  }, [transactions]);

  const filtered =
    filter === "all" ? transactions : transactions.filter((t) => t.type === filter);

  function handleSaved(saved: Transaction) {
    setTransactions((prev) => {
      const exists = prev.some((t) => t.id === saved.id);
      const next = exists
        ? prev.map((t) => (t.id === saved.id ? saved : t))
        : [saved, ...prev];
      return [...next].sort((a, b) => (a.occurred_at < b.occurred_at ? 1 : -1));
    });
    toast.success(editing ? "แก้ไขรายการสำเร็จ" : "เพิ่มรายการสำเร็จ");
    setEditing(null);
  }

  async function handleDelete(id: string) {
    if (!window.confirm("ลบรายการนี้?")) return;

    const supabase = createClient();
    const { error } = await supabase.from("transactions").delete().eq("id", id);

    if (error) {
      toast.error("ลบรายการไม่สำเร็จ");
      return;
    }

    setTransactions((prev) => prev.filter((t) => t.id !== id));
    toast.success("ลบรายการแล้ว");
  }

  return (
    <div className="pv-theme -m-4 flex min-h-[calc(100dvh-4rem)] flex-col gap-6 rounded-none p-5 pb-28 md:-m-6 md:min-h-[calc(100dvh-4.5rem)] md:rounded-3xl md:p-9 md:pb-9">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight text-[var(--pv-ink)]">
          รายรับ–รายจ่าย
        </h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCategoryDialogOpen(true)}
          className="border-[var(--pv-hairline)] bg-transparent text-[var(--pv-ink-dim)] hover:bg-[var(--pv-surface)]"
        >
          <Settings2 className="size-4" />
          หมวดหมู่
        </Button>
      </div>

      <div className="rounded-[24px] bg-[var(--pv-surface-raised)] p-5">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-[var(--pv-ink-faint)]">รายรับ</p>
            <p
              className="mt-1 truncate text-base font-semibold"
              style={{ color: "var(--pv-income)" }}
            >
              {formatTHB(totals.income)}
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--pv-ink-faint)]">รายจ่าย</p>
            <p
              className="mt-1 truncate text-base font-semibold"
              style={{ color: "var(--pv-expense)" }}
            >
              {formatTHB(totals.expense)}
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--pv-ink-faint)]">กำไรสุทธิ</p>
            <p className="mt-1 truncate text-base font-semibold text-[var(--pv-ink)]">
              {formatTHB(totals.net)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {(
          [
            { key: "all", label: "ทั้งหมด" },
            { key: "income", label: "รายรับ" },
            { key: "expense", label: "รายจ่าย" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              filter === tab.key
                ? "bg-[var(--pv-gold)] text-[var(--pv-bg)]"
                : "bg-[var(--pv-surface)] text-[var(--pv-ink-dim)]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-1 flex-col">
        {filtered.length === 0 && (
          <EmptyState
            icon={Receipt}
            title="ยังไม่มีรายการ"
            description="กดปุ่ม + ด้านล่างเพื่อเพิ่มรายการแรกของคุณ"
          />
        )}
        {filtered.map((t) => {
          const accent = getCategoryAccent(t.category?.name ?? "ไม่มีหมวดหมู่");
          return (
            <div
              key={t.id}
              className="flex cursor-pointer items-center justify-between border-b border-[var(--pv-hairline)] py-3.5 last:border-0"
              onClick={() => {
                setEditing(t);
                setFormOpen(true);
              }}
            >
              <div className="flex min-w-0 items-center gap-3">
                {t.receipts.length > 0 ? (
                  <div
                    className="relative shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(t.receipts[0].url, "_blank");
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={t.receipts[0].url}
                      alt="ใบเสร็จ"
                      className="size-10 rounded-full border border-[var(--pv-hairline)] object-cover"
                    />
                    {t.receipts.length > 1 && (
                      <span
                        className="absolute -right-1.5 -top-1.5 flex size-4.5 items-center justify-center rounded-full text-[10px] font-medium"
                        style={{ background: "var(--pv-gold)", color: "var(--pv-bg)" }}
                      >
                        {t.receipts.length}
                      </span>
                    )}
                  </div>
                ) : (
                  <span
                    className="flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
                    style={{ background: accent.bg, color: accent.fg }}
                  >
                    {(t.category?.name ?? "ไม่มีหมวดหมู่").charAt(0)}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[var(--pv-ink)]">
                    {t.category?.name ?? "ไม่มีหมวดหมู่"}
                  </p>
                  <p className="truncate text-xs text-[var(--pv-ink-faint)]">
                    {formatDateTH(t.occurred_at)}
                    {t.note ? ` · ${t.note}` : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className="whitespace-nowrap text-sm font-semibold"
                  style={{
                    color: t.type === "income" ? "var(--pv-income)" : "var(--pv-expense)",
                  }}
                >
                  {t.type === "income" ? "+" : "-"}
                  {formatTHB(t.amount)}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(t.id);
                  }}
                  className="text-[var(--pv-ink-faint)] hover:text-[var(--pv-expense)]"
                  aria-label="ลบรายการ"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => {
          setEditing(null);
          setFormOpen(true);
        }}
        className="fixed bottom-24 right-5 z-30 flex size-14 items-center justify-center rounded-full shadow-lg md:bottom-8"
        style={{ background: "var(--pv-gold)", color: "var(--pv-bg)" }}
        aria-label="เพิ่มรายการ"
      >
        <Plus className="size-6" />
      </button>

      <TransactionFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        shopId={shopId}
        userId={userId}
        categories={categories}
        editing={editing}
        onSaved={handleSaved}
      />

      <CategoryManagerDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        shopId={shopId}
        categories={categories}
        onChange={setCategories}
      />
    </div>
  );
}
