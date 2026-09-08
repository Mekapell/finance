import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTHB(amount: number): string {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDateTH(date: string | Date): string {
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
  }).format(new Date(date));
}

/**
 * คืนวันที่ปัจจุบันแบบ YYYY-MM-DD ตามเขตเวลาเครื่อง (local)
 * ห้ามใช้ new Date().toISOString().slice(0,10) เพราะจะเพี้ยนช่วง 00:00-07:00 เวลาไทย
 * (toISOString แปลงเป็น UTC ก่อน ซึ่งช้ากว่าเวลาไทย 7 ชั่วโมง)
 */
export function todayLocalISODate(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
