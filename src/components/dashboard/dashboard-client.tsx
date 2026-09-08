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

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { cn, formatDateTH, formatTHB } from "@/lib/utils";
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
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            สวัสดี{ownerName ? ` ${ownerName}` : ""} 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            ภาพรวมของ {shopName} เดือนนี้
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/transactions?add=1">
            <Plus className="size-4" />
            เพิ่มรายการ
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">รายรับเดือนนี้</p>
          <p className="mt-1 truncate text-lg font-semibold text-success">
            {formatTHB(thisMonth.income)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">รายจ่ายเดือนนี้</p>
          <p className="mt-1 truncate text-lg font-semibold text-destructive">
            {formatTHB(thisMonth.expense)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">กำไรสุทธิ</p>
          <p
            className={cn(
              "mt-1 truncate text-lg font-semibold",
              thisMonth.net >= 0 ? "text-success" : "text-destructive"
            )}
          >
            {formatTHB(thisMonth.net)}
          </p>
        </Card>
      </div>

      <Card className="p-4">
        <p className="mb-3 text-sm font-medium">แนวโน้ม 6 เดือนล่าสุด</p>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={4}>
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                fontSize={12}
                stroke="var(--muted-foreground)"
              />
              <Tooltip
                formatter={(value: number) => formatTHB(value)}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                  background: "var(--card)",
                  fontSize: 13,
                }}
              />
              <Bar dataKey="income" fill="var(--success)" radius={[6, 6, 0, 0]} name="รายรับ" />
              <Bar dataKey="expense" fill="var(--destructive)" radius={[6, 6, 0, 0]} name="รายจ่าย" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-medium">รายการล่าสุด</p>
          <Link href="/transactions" className="text-sm text-primary hover:underline">
            ดูทั้งหมด
          </Link>
        </div>

        <div className="flex flex-col gap-2">
          {recent.length === 0 && (
            <EmptyState
              icon={Receipt}
              title="ยังไม่มีรายการ"
              description="เริ่มบันทึกรายรับ-รายจ่ายแรกของร้านได้เลย"
            />
          )}
          {recent.map((t) => (
            <Card key={t.id} className="flex items-center justify-between p-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {t.category?.name ?? "ไม่มีหมวดหมู่"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDateTH(t.occurred_at)}
                </p>
              </div>
              <span
                className={cn(
                  "whitespace-nowrap text-sm font-semibold",
                  t.type === "income" ? "text-success" : "text-destructive"
                )}
              >
                {t.type === "income" ? "+" : "-"}
                {formatTHB(t.amount)}
              </span>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
