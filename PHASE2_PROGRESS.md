# Phase 2 — สถานะความคืบหน้า

อัปเดตล่าสุด: กำลังเขียนโค้ดครบตามสเปคแล้ว รอทดสอบ build

## ตัดสินใจสำคัญที่คุยกันไว้
- `profiles` เก็บเฉพาะข้อมูลส่วนตัว (owner_name, phone, avatar_url, currency)
  **ไม่มี** `shop_name` ซ้ำกับ `shops.name` — ชื่อร้านยังอยู่ที่ `shops.name` เหมือนเดิม
- ตอนสมัครสมาชิก trigger `handle_new_user()` สร้างทั้งแถว `profiles` และ `shops` ให้อัตโนมัติ
- หน้า settings profile แก้ `shops.name` + `profiles.(owner_name, phone, avatar_url)` พร้อมกันในปุ่มเดียว

## ทำเสร็จแล้วบน Supabase (project: yixaielydchwtbjnwojm)
- [x] Migration 002_profiles: ตาราง profiles + RLS + trigger updated_at + handle_new_user()
- [x] Storage bucket `avatars` + RLS (อ่านสาธารณะ, เขียน/แก้/ลบเฉพาะเจ้าของ ผ่าน path `{user_id}/...`)
- [x] แก้ security advisor warning จนสะอาด (revoke execute จาก public/anon/authenticated)

## ทำเสร็จแล้วในโค้ด (repo: Mekapell/finance, ยังไม่ push)
- [x] shadcn UI: button, input, label, card, checkbox, avatar, dropdown-menu
- [x] lib/auth-errors.ts, lib/validations/auth.ts, lib/validations/profile.ts
- [x] lib/data/profile.ts (getCurrentProfileWithShop)
- [x] components/auth/password-input.tsx, auth-card.tsx
- [x] app/register/page.tsx, app/login/page.tsx (แทนที่ placeholder), app/forgot-password, app/reset-password
- [x] app/auth/callback/route.ts
- [x] middleware ใหม่: PROTECTED_PREFIXES = /dashboard /transactions /reports /settings, AUTH_PREFIXES = /login /register, redirect param
- [x] ฟอนต์ Noto Sans Thai ใน layout.tsx + globals.css
- [x] package.json เพิ่ม @radix-ui/react-avatar, @radix-ui/react-checkbox
- [x] ย้าย dashboard page เข้า route group (dashboard)
- [x] components/dashboard: nav-items, sidebar, bottom-nav, navbar, actions.ts (logout)
- [x] app/(dashboard)/layout.tsx
- [x] components/settings/profile-form.tsx + app/(dashboard)/settings/profile/page.tsx (avatar upload รวมอยู่ในนี้)

## Phase 3 — รายรับ-รายจ่าย + หมวดหมู่ (เสร็จแล้ว, push แล้ว)
- ไม่แก้ schema/RLS เดิมเลย ใช้ categories/transactions จาก Phase 1
- หน้า /transactions: สรุปยอดรวม 3 ช่อง (รายรับ/รายจ่าย/กำไรสุทธิ), filter ทั้งหมด/รายรับ/รายจ่าย
- Dialog เพิ่ม/แก้ไขรายการ + Dialog จัดการหมวดหมู่ (เพิ่ม/ลบ)
- ปุ่มลอย + มุมขวาล่างสำหรับเพิ่มรายการ
- build ผ่านแล้ว ไม่มี TS error, push ขึ้น GitHub แล้ว (commit d580fd4)

## ที่ยังไม่ทำ (ค้างจาก Phase 2)
- [ ] ยังไม่ได้แจ้ง/ยืนยัน Environment Variables บน Vercel ว่าตั้งครบ (ดูเหมือนใช้งานได้แล้วจากที่ผู้ใช้ทดสอบ login ผ่าน)
- [ ] Checklist ทดสอบเต็มของ Phase 2 อาจยังไม่ได้ไล่ครบทุกข้อ (ผู้ใช้ยืนยันแค่ login ผ่าน)

## Dashboard (เสร็จแล้ว, push แล้ว)
- แทนที่ placeholder เดิมทั้งหมด
- ทักทายด้วยชื่อเจ้าของ/ร้าน, สรุปยอดเดือนนี้ 3 ช่อง, กราฟแท่งแนวโน้ม 6 เดือน (recharts), รายการล่าสุด 5 รายการ, ปุ่มเพิ่มรายการด่วน (ลิงก์ไป /transactions?add=1 ที่เปิด dialog อัตโนมัติ)

## Phase 4 — รายงาน + Export (เสร็จแล้ว, push แล้ว)
- หน้า /reports: สลับรายเดือน/รายปี, สรุปยอด, แยกตามหมวดหมู่ (แถบเทียบสัดส่วน)
- Export CSV: ดาวน์โหลดไฟล์ตรง (BOM UTF-8 กันตัวอักษรไทยเพี้ยนใน Excel)
- Export PDF: ใช้ window.print() + CSS ซ่อน sidebar/navbar/bottomnav ตอนพิมพ์ — กดแล้วเลือก "Save as PDF" ในหน้าพิมพ์ของ Safari (ไม่ได้ใช้ library ทำ PDF จริง เพื่อประหยัด dependency)
- แนบใบเสร็จ: ทำไปแล้วใน Phase 3.1 (ก่อนหน้า Phase 4)

## Phase 6 — Polish (เสร็จแล้ว, push แล้ว)
- Dark mode (next-themes), ปุ่มสลับใน navbar
- Loading skeleton ทุกหน้า, Empty state component ใช้ร่วมกัน
- PWA: manifest + icon/apple-icon (ผ่าน next/og ไม่ใช้ไฟล์รูปภายนอก) — เพิ่มลงหน้าจอ iPhone ได้แล้ว
- Bug fix: วันที่เพี้ยนช่วง 00:00-07:00 (UTC vs เวลาไทย), CSV escape ไม่ถูกต้อง

## ⚠️ พบระหว่างตรวจ RLS/security — สำคัญ ยังไม่ได้แก้ รอผู้ใช้ตัดสินใจ
เจอ function `public.sync_profiles_to_gsheet()` + extension `pg_net` ในโปรเจกต์ Supabase
- ฟังก์ชันนี้ส่งข้อมูลทั้งแถว (row_to_json) ไปที่ Google Apps Script URL ภายนอกทุกครั้งที่ trigger ทำงาน
- **ตอนนี้ไม่มี trigger ผูกอยู่จริง** (เช็คแล้วไม่ทำงานอัตโนมัติ) แต่ตัวฟังก์ชัน+extension ยังอยู่ในระบบ
- ไม่ใช่สิ่งที่ผมสร้าง — ไม่ทราบที่มา ต้องถามผู้ใช้ว่ารู้จัก/ตั้งใจทำไว้เองหรือเปล่า ก่อนจะลบ
- Advisor อื่น: `pg_net` อยู่ผิด schema (แนะนำย้าย), leaked password protection ปิดอยู่ (แนะนำเปิดใน Dashboard)

## บริบทผู้ใช้ (สำคัญ)
- ใช้ iPhone เครื่องเดียว ไม่มีคอมพิวเตอร์ ทำงานคนเดียว
- ต้องหาวิธี deliver โค้ดที่ไม่ต้องพึ่งเทอร์มินัล/คอม — แนวทางที่เสนอไว้คือขอ GitHub PAT เพื่อ push ให้ตรงจาก sandbox นี้
