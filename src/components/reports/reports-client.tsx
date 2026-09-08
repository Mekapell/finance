"use client";

import * as React from "react";
import { Download, Printer, PieChart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { cn, formatDateTH, formatTHB } from "@/lib/utils";
import type { Transaction } from "@/lib/types/finance";

type Mode = "month" | "year";

function csvField(value: string): string {
  const escaped = value.replace(/"/g, '""');
  return `"${escaped}"`;
}

function toCSV(rows: Transaction[]): string {
  const header = ["วันที่", "ประเภท", "หมวดหมู่", "จำนวนเงิน", "โน้ต"];
  const lines = rows.map((t) =>
    [
      t.occurred_at,
      t.type === "income" ? "รายรับ" : "รายจ่าย",
      csvField(t.category?.name ?? ""),
      t.amount.toString(),
      csvField(t.note ?? ""),
    ].join(",")
  );
  return ["\uFEFF" + header.join(","), ...lines].join("\n");
}

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ReportsClient({
  shopName,
  transactions,
}: {
  shopName: string;
  transactions: Transaction[];
}) {
  const now = new Date();
  const [mode, setMode] = React.useState<Mode>("month");
  const [month, setMonth] = React.useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  );
  const [year, setYear] = React.useState(now.getFullYear());

  const periodLabel =
    mode === "month"
      ? new Intl.DateTimeFormat("th-TH", { year: "numeric", month: "long" }).format(
          new Date(`${month}-01`)
        )
      : `ปี ${year + 543}`;

  const filtered = React.useMemo(() => {
    return transactions.filter((t) => {
      if (mode === "month") return t.occurred_at.slice(0, 7) === month;
      return t.occurred_at.slice(0, 4) === String(year);
    });
  }, [transactions, mode, month, year]);

  const totals = React.useMemo(() => {
    const income = filtered
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + t.amount, 0);
    const expense = filtered
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + t.amount, 0);
    return { income, expense, net: income - expense };
  }, [filtered]);

  const breakdown = React.useMemo(() => {
    const map = new Map<string, { name: string; type: "income" | "expense"; total: number }>();
    for (const t of filtered) {
      const key = `${t.type}:${t.category?.name ?? "ไม่มีหมวดหมู่"}`;
      const entry = map.get(key) ?? {
        name: t.category?.name ?? "ไม่มีหมวดหมู่",
        type: t.type,
        total: 0,
      };
      entry.total += t.amount;
      map.set(key, entry);
    }
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [filtered]);

  const maxBreakdown = Math.max(1, ...breakdown.map((b) => b.total));

  function exportCSV() {
    const filename = mode === "month" ? `report-${month}.csv` : `report-${year}.csv`;
    downloadFile(toCSV(filtered), filename, "text/csv;charset=utf-8;");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between print:hidden">
        <h1 className="text-2xl font-semibold">รายงาน</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="size-4" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="size-4" />
            PDF
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 print:hidden">
        <div className="flex rounded-xl bg-secondary p-1">
          <button
            onClick={() => setMode("month")}
            className={cn(
              "rounded-lg px-3.5 py-1.5 text-sm font-medium",
              mode === "month" ? "bg-card shadow-sm" : "text-muted-foreground"
            )}
          >
            รายเดือน
          </button>
          <button
            onClick={() => setMode("year")}
            className={cn(
              "rounded-lg px-3.5 py-1.5 text-sm font-medium",
              mode === "year" ? "bg-card shadow-sm" : "text-muted-foreground"
            )}
          >
            รายปี
          </button>
        </div>

        {mode === "month" ? (
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="h-9 rounded-xl border border-input bg-background px-3 text-sm"
          />
        ) : (
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="h-9 rounded-xl border border-input bg-background px-3 text-sm"
          >
            {Array.from({ length: 5 }, (_, i) => now.getFullYear() - i).map((y) => (
              <option key={y} value={y}>
                {y + 543}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* หัวรายงานสำหรับตอนพิมพ์ PDF เท่านั้น */}
      <div className="hidden print:block">
        <h1 className="text-xl font-semibold">{shopName}</h1>
        <p className="text-sm text-muted-foreground">รายงาน{periodLabel}</p>
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
          <p
            className={cn(
              "mt-1 truncate text-lg font-semibold",
              totals.net >= 0 ? "text-success" : "text-destructive"
            )}
          >
            {formatTHB(totals.net)}
          </p>
        </Card>
      </div>

      <Card className="p-4">
        <p className="mb-3 text-sm font-medium">แยกตามหมวดหมู่ — {periodLabel}</p>
        <div className="flex flex-col gap-3">
          {breakdown.length === 0 && (
            <EmptyState icon={PieChart} title="ไม่มีข้อมูลในช่วงนี้" />
          )}
          {breakdown.map((b) => (
            <div key={`${b.type}-${b.name}`}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span>{b.name}</span>
                <span
                  className={cn(
                    "font-medium",
                    b.type === "income" ? "text-success" : "text-destructive"
                  )}
                >
                  {formatTHB(b.total)}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className={cn(
                    "h-full rounded-full",
                    b.type === "income" ? "bg-success" : "bg-destructive"
                  )}
                  style={{ width: `${(b.total / maxBreakdown) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4 print:hidden">
        <p className="mb-3 text-sm font-medium">รายการทั้งหมด ({filtered.length})</p>
        <div className="flex flex-col gap-2">
          {filtered.slice(0, 50).map((t) => (
            <div key={t.id} className="flex items-center justify-between text-sm">
              <div className="min-w-0">
                <p className="truncate">{t.category?.name ?? "ไม่มีหมวดหมู่"}</p>
                <p className="text-xs text-muted-foreground">{formatDateTH(t.occurred_at)}</p>
              </div>
              <span
                className={cn(
                  "whitespace-nowrap font-medium",
                  t.type === "income" ? "text-success" : "text-destructive"
                )}
              >
                {t.type === "income" ? "+" : "-"}
                {formatTHB(t.amount)}
              </span>
            </div>
          ))}
          {filtered.length > 50 && (
            <p className="pt-1 text-center text-xs text-muted-foreground">
              แสดง 50 รายการแรก — Export CSV เพื่อดูทั้งหมด
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
