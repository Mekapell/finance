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

## ที่ยังไม่ทำ / ต้องทำต่อ
- [ ] รัน npm install + next build ในแซนด์บ็อกซ์เพื่อเช็ค error ให้ครบ (ยังไม่ทดสอบ)
- [ ] ยังไม่ได้ push โค้ดขึ้น GitHub repo (Mekapell/finance) — ต้องคุยเรื่อง Personal Access Token กับผู้ใช้
- [ ] ยังไม่ได้แจ้ง Environment Variables / ขั้นตอน Supabase Dashboard (Redirect URLs) ให้ผู้ใช้
- [ ] ยังไม่ได้ทำ Checklist ทดสอบท้ายสุดตามสเปค deliverable ข้อ 7

## บริบทผู้ใช้ (สำคัญ)
- ใช้ iPhone เครื่องเดียว ไม่มีคอมพิวเตอร์ ทำงานคนเดียว
- ต้องหาวิธี deliver โค้ดที่ไม่ต้องพึ่งเทอร์มินัล/คอม — แนวทางที่เสนอไว้คือขอ GitHub PAT เพื่อ push ให้ตรงจาก sandbox นี้
