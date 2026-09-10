// มาสคอตหมูออมสิน ออกแบบขึ้นเองสำหรับแอปนี้โดยเฉพาะ (ไม่เกี่ยวกับตัวการ์ตูนของแบรนด์อื่นใด)
// ใช้ "หมู" เพราะเป็นสัญลักษณ์การออมเงินที่คนไทยคุ้นเคย (กระปุกหมู)

export function ShopMascot({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 96 96" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* ตัว */}
      <ellipse cx="48" cy="54" rx="30" ry="26" fill="var(--pv-gold)" />
      {/* หู */}
      <path d="M24 34 L18 20 L34 28 Z" fill="var(--pv-gold)" />
      <path d="M72 34 L78 20 L62 28 Z" fill="var(--pv-gold)" />
      {/* จมูก */}
      <ellipse cx="48" cy="62" rx="12" ry="9" fill="var(--pv-bg-soft)" />
      <circle cx="43" cy="62" r="1.8" fill="var(--pv-ink-faint)" />
      <circle cx="53" cy="62" r="1.8" fill="var(--pv-ink-faint)" />
      {/* ตา (หลับยิ้ม) */}
      <path
        d="M34 46 Q38 41 42 46"
        stroke="var(--pv-bg)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M54 46 Q58 41 62 46"
        stroke="var(--pv-bg)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      {/* แก้มยิ้ม */}
      <circle cx="32" cy="56" r="4" fill="oklch(0.72 0.14 20 / 45%)" />
      <circle cx="64" cy="56" r="4" fill="oklch(0.72 0.14 20 / 45%)" />
      {/* เหรียญที่กำลังหยอด */}
      <circle cx="76" cy="30" r="9" fill="var(--pv-income)" />
      <text
        x="76"
        y="34"
        textAnchor="middle"
        fontSize="11"
        fontWeight="700"
        fill="var(--pv-bg)"
      >
        ฿
      </text>
      {/* ช่องหยอดกระปุก */}
      <rect x="42" y="30" width="12" height="4" rx="2" fill="var(--pv-bg)" opacity="0.5" />
    </svg>
  );
}
