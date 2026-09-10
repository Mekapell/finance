// จับคู่หมวดหมู่กับสีสันหลากหลาย (แบบ deterministic ตามชื่อ) ให้หน้าตาสดใส เป็นกันเองมากขึ้น
// ไม่ยุ่งกับข้อมูล แค่ใช้ตกแต่งหน้าจอเท่านั้น

const PALETTE = [
  { bg: "oklch(0.75 0.15 90)", fg: "oklch(0.22 0.05 90)" }, // ทอง/เหลือง
  { bg: "oklch(0.72 0.16 300)", fg: "oklch(0.98 0 0)" }, // ม่วง
  { bg: "oklch(0.72 0.15 200)", fg: "oklch(0.98 0 0)" }, // ฟ้า
  { bg: "oklch(0.72 0.17 20)", fg: "oklch(0.98 0 0)" }, // ส้มแดง/ชมพู
  { bg: "oklch(0.72 0.15 155)", fg: "oklch(0.22 0.05 155)" }, // เขียว
  { bg: "oklch(0.72 0.14 340)", fg: "oklch(0.98 0 0)" }, // ชมพู
] as const;

export function getCategoryAccent(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) % PALETTE.length;
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}
