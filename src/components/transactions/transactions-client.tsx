"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Settings2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CategoryManagerDialog } from "@/components/transactions/category-manager-dialog";
import { TransactionFormDialog } from "@/components/transactions/transaction-form-dialog";
import { createClient } from "@/lib/supabase/client";
import { cn, formatDateTH, formatTHB } from "@/lib/utils";
import type { Category, Transaction, TransactionType } from "@/lib/types/finance";

type Filter = "all" | TransactionType;

export function TransactionsClient({
  shopId,
  initialCategories,
  initialTransactions,
}: {
  shopId: string;
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
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">รายรับ–รายจ่าย</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCategoryDialogOpen(true)}
        >
          <Settings2 className="size-4" />
          หมวดหมู่
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">รายรับ</p>
          <p className="mt-1 truncate text-lg font-semibold text-success">
            {formatTHB(totals.income)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">รายจ่าย</p>
          <p className="mt-1 truncate text-lg font-semibold text-destructive">
            {formatTHB(totals.expense)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">กำไรสุทธิ</p>
          <p className="mt-1 truncate text-lg font-semibold">
            {formatTHB(totals.net)}
          </p>
        </Card>
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
              "rounded-xl px-4 py-2 text-sm font-medium transition-colors",
              filter === tab.key
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2 pb-24">
        {filtered.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            ยังไม่มีรายการ กดปุ่ม + เพื่อเพิ่มรายการแรก
          </p>
        )}
        {filtered.map((t) => (
          <Card
            key={t.id}
            className="flex cursor-pointer items-center justify-between p-4"
            onClick={() => {
              setEditing(t);
              setFormOpen(true);
            }}
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {t.category?.name ?? "ไม่มีหมวดหมู่"}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDateTH(t.occurred_at)}
                {t.note ? ` · ${t.note}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "whitespace-nowrap text-sm font-semibold",
                  t.type === "income" ? "text-success" : "text-destructive"
                )}
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
                className="text-muted-foreground hover:text-destructive"
                aria-label="ลบรายการ"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </Card>
        ))}
      </div>

      <button
        type="button"
        onClick={() => {
          setEditing(null);
          setFormOpen(true);
        }}
        className="fixed bottom-24 right-5 z-30 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg md:bottom-8"
        aria-label="เพิ่มรายการ"
      >
        <Plus className="size-6" />
      </button>

      <TransactionFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        shopId={shopId}
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
