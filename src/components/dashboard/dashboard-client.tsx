"use client";

import Link from "next/link";
import { Plus, Receipt } from "lucide-react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

import { formatDateTH, formatTHB } from "@/lib/utils";
import type { Transaction } from "@/lib/types/finance";

type ChartPoint = { label: string; income: number; expense: number };

export function DashboardClient({
  ownerName,
  shopName,
  thisMonth,
  chartData,
  recent,
}: {
  ownerName: string | null;
  shopName: string;
  thisMonth: { income: number; expense: number; net: number };
  chartData: ChartPoint[];
  recent: Transaction[];
}) {
  const isProfit = thisMonth.net >= 0;

  return (
    <div className="pv-theme -m-4 flex min-h-[calc(100dvh-4rem)] flex-col gap-8 rounded-none p-5 pb-28 md:-m-6 md:min-h-[calc(100dvh-4.5rem)] md:rounded-3xl md:p-9 md:pb-9">
      {/* หัวเรื่อง */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-[var(--pv-ink-faint)]">
            สวัสดี{ownerName ? ` ${ownerName}` : ""}
          </p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-[var(--pv-ink)]">
            {shopName}
          </h1>
        </div>
        <Link
          href="/transactions?add=1"
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--pv-gold)]/40 bg-[var(--pv-gold-dim)] px-4 py-2 text-sm font-medium text-[var(--pv-gold)] transition-colors hover:bg-[var(--pv-gold)]/25"
        >
          <Plus className="size-4" />
          เพิ่มรายการ
        </Link>
      </div>

      {/* การ์ดหลัก: กำไร/ขาดทุนเดือนนี้ */}
      <div className="rounded-[28px] bg-[var(--pv-surface-raised)] p-6 md:p-8">
        <p className="text-sm text-[var(--pv-ink-faint)]">ผลประกอบการเดือนนี้</p>

        <div className="mt-2 flex flex-wrap items-end gap-3">
          <span className="text-4xl font-semibold tracking-tight text-[var(--pv-ink)] md:text-5xl">
            {isProfit ? "" : "-"}
            {formatTHB(Math.abs(thisMonth.net)).replace("-", "")}
          </span>
          <span
            className="mb-1 rounded-full px-2.5 py-1 text-xs font-medium"
            style={{
              color: isProfit ? "var(--pv-income)" : "var(--pv-expense)",
              background: isProfit ? "var(--pv-income-dim)" : "var(--pv-expense-dim)",
            }}
          >
            {isProfit ? "กำไร" : "ขาดทุน"}
          </span>
        </div>

        <div className="mt-6 flex gap-6 border-t border-[var(--pv-hairline)] pt-5">
          <div className="flex items-center gap-2">
            <span
              className="size-2 rounded-full"
              style={{ background: "var(--pv-income)" }}
            />
            <div>
              <p className="text-xs text-[var(--pv-ink-faint)]">รายรับ</p>
              <p className="text-sm font-medium text-[var(--pv-ink)]">
                {formatTHB(thisMonth.income)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="size-2 rounded-full"
              style={{ background: "var(--pv-expense)" }}
            />
            <div>
              <p className="text-xs text-[var(--pv-ink-faint)]">รายจ่าย</p>
              <p className="text-sm font-medium text-[var(--pv-ink)]">
                {formatTHB(thisMonth.expense)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* แนวโน้ม */}
      <div>
        <p className="mb-4 text-sm font-medium text-[var(--pv-ink-dim)]">
          แนวโน้ม 6 เดือนล่าสุด
        </p>
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={5}>
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                fontSize={12}
                stroke="var(--pv-ink-faint)"
              />
              <Tooltip
                formatter={(value: number) => formatTHB(value)}
                contentStyle={{
                  borderRadius: 14,
                  border: "1px solid var(--pv-hairline)",
                  background: "var(--pv-surface-raised)",
                  color: "var(--pv-ink)",
                  fontSize: 13,
                }}
              />
              <Bar dataKey="income" fill="var(--pv-income)" radius={[5, 5, 0, 0]} name="รายรับ" />
              <Bar dataKey="expense" fill="var(--pv-expense)" radius={[5, 5, 0, 0]} name="รายจ่าย" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* รายการล่าสุด */}
      <div className="flex-1">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium text-[var(--pv-ink-dim)]">รายการล่าสุด</p>
          <Link
            href="/transactions"
            className="text-sm text-[var(--pv-gold)] hover:underline"
          >
            ดูทั้งหมด
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-[var(--pv-hairline)] py-10 text-center">
            <Receipt className="size-6 text-[var(--pv-ink-faint)]" />
            <p className="text-sm text-[var(--pv-ink-dim)]">ยังไม่มีรายการ</p>
            <p className="text-xs text-[var(--pv-ink-faint)]">
              เริ่มบันทึกรายรับ-รายจ่ายแรกของร้านได้เลย
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {recent.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between border-b border-[var(--pv-hairline)] py-3.5 last:border-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[var(--pv-ink)]">
                    {t.category?.name ?? "ไม่มีหมวดหมู่"}
                  </p>
                  <p className="text-xs text-[var(--pv-ink-faint)]">
                    {formatDateTH(t.occurred_at)}
                  </p>
                </div>
                <span
                  className="whitespace-nowrap text-sm font-semibold"
                  style={{
                    color: t.type === "income" ? "var(--pv-income)" : "var(--pv-expense)",
                  }}
                >
                  {t.type === "income" ? "+" : "-"}
                  {formatTHB(t.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
