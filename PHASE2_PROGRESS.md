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

## ✅ Google Sheet sync — ทำเสร็จแล้ว (แก้ปัญหาความปลอดภัยที่เจอไปพร้อมกัน)
- ลบ `sync_profiles_to_gsheet()` ของเก่า (Gemini ทำไว้ ไม่มี secret check, ส่ง row ทั้งแถวตรงๆ) ทิ้งแล้ว
- สร้างใหม่ 2 ตัว มี secret check ป้องกัน:
  - `sync_new_user_to_gsheet()` — trigger AFTER INSERT ON shops (เวลาที่ shops row มีข้อมูลครบ join ได้แล้ว) → ส่งไปแท็บ "Users"
  - `sync_transaction_to_gsheet()` — trigger AFTER INSERT ON transactions → ส่งไปแท็บ "Transactions"
- ใช้ pg_net (async, ไม่บล็อกการทำงานของแอปแม้ webhook ล่ม)
- Google Apps Script (โค้ดอยู่ใน Google Sheet ID: 1-OXwIMogKuTP4OHhoNbSxT8CO5iTmZ0n9iQBcJJa3IQ) เขียนหัวข้อคอลัมน์อัตโนมัติจาก key ที่ส่งมา ไม่ต้องพิมพ์หัวข้อเอง
- ⚠️ ควรตั้ง repo GitHub เป็น private (ถ้ายังไม่ใช่) เพราะ migration ไฟล์นี้มี secret ของ Apps Script ฝังอยู่

## บริบทผู้ใช้ (สำคัญ)
- ใช้ iPhone เครื่องเดียว ไม่มีคอมพิวเตอร์ ทำงานคนเดียว
- ต้องหาวิธี deliver โค้ดที่ไม่ต้องพึ่งเทอร์มินัล/คอม — แนวทางที่เสนอไว้คือขอ GitHub PAT เพื่อ push ให้ตรงจาก sandbox นี้

## Bug fix เพิ่มเติม (หลัง Phase 6)
- แชท AI (Gemini) ผ่าน Google AI Studio — เพิ่มแล้ว, รอผู้ใช้ตั้ง GEMINI_API_KEY ใน Vercel เอง
- แก้ MIDDLEWARE_INVOCATION_FAILED: middleware ไม่มี try/catch รอบ supabase.auth.getUser() ถ้าเน็ต/Supabase สะดุดชั่วคราวจะทำทั้งเว็บพัง (500) — แก้แล้ว fail-open + เช็ค env var ก่อนสร้าง client

## อัปเดตล่าสุด: แนบรูปใบเสร็จได้หลายรูป (สูงสุด 5 รูป/รายการ)
- DB: ตารางใหม่ `transaction_receipts` (id, transaction_id, url, created_at) แทนคอลัมน์ receipt_url เดี่ยวเดิม
  - RLS: อิงความเป็นเจ้าของผ่าน transactions -> shops -> owner_id
  - Migration ย้ายข้อมูล receipt_url เก่า (ถ้ามี) เข้าตารางใหม่ให้อัตโนมัติแล้ว
- ฟอร์มเพิ่ม/แก้ไขรายการ: แนบรูปได้สูงสุด 5 รูป, ลบทีละรูปได้ทั้งรูปเดิม/รูปใหม่
- AI สแกน (Gemini) ทำงานอัตโนมัติเฉพาะรูปแรกที่แนบเท่านั้น (รูปถัดไปแนบเฉยๆ ไม่สแกนซ้ำ กันเขียนทับข้อมูลที่แก้แล้ว)
- หน้ารายการแสดงรูปแรกเป็น thumbnail + ตัวเลขจำนวนรูปถ้ามากกว่า 1
- อัปเดต query ทุกหน้าที่ดึงรายการ (transactions/reports/dashboard) ให้ join รูปทั้งหมดมาด้วย
- STATUS: build ผ่าน, push แล้ว (commit 8fe4e50), ยังไม่ได้ทดสอบจริงกับผู้ใช้

## อัปเดตล่าสุด: เข้าสู่ระบบด้วย Username + แผงควบคุมแอดมินรีเซ็ตรหัสผ่านลูกค้า
- DB: profiles.username (unique), profiles.is_admin + ฟังก์ชัน is_username_available / get_email_by_username
- สมัครสมาชิก: มีช่อง username, เช็คซ้ำ real-time
- ล็อกอิน: ใช้ username แทนอีเมล (ยัง fallback หา email จาก username ก่อน sign in)
- /settings/admin: ค้นหาลูกค้าด้วย username -> ตั้งรหัสผ่านใหม่ให้ได้ (ใช้ service_role key ฝั่งเซิร์ฟเวอร์เท่านั้น)
- STATUS: build ผ่าน, push แล้ว (commit beace61)
- ค้างที่ผู้ใช้ต้องทำเอง (ทำผ่านโค้ดไม่ได้):
  1. Supabase Dashboard -> Authentication -> Providers -> Email -> ปิด "Confirm email"
  2. Vercel -> financial9mek -> Settings -> Environment Variables -> เพิ่ม SUPABASE_SERVICE_ROLE_KEY (จาก Supabase Dashboard -> Project Settings -> API -> service_role key) แล้ว redeploy
  3. ตั้ง is_admin = true ให้บัญชีของ Mekapell เอง (รอ username/อีเมลจากผู้ใช้เพื่อรัน SQL ให้)
