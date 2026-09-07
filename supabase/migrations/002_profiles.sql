-- Phase 2: Authentication & Profile
-- สร้างตาราง profiles (ข้อมูลส่วนตัวของผู้ใช้) และเชื่อมกับ shops ที่มีอยู่แล้วจาก Phase 1
-- หมายเหตุ: ชื่อร้าน (shop_name) ยังคงเก็บที่ shops.name เหมือนเดิม ไม่ซ้ำซ้อนกับ profiles

-- 1. ตาราง profiles ---------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  owner_name text,
  phone text,
  avatar_url text,
  currency text not null default 'THB',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- 2. อัปเดต updated_at อัตโนมัติ ---------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- 3. สร้าง profile + shop อัตโนมัติเมื่อมีผู้ใช้ใหม่ -------------------------
-- ดึงชื่อร้านจาก raw_user_meta_data (ส่งมาจากฟอร์มสมัครสมาชิก) มาสร้างแถวใน shops ให้เลย
-- เพื่อไม่ให้ต้องมีฟิลด์ shop_name ซ้ำใน profiles
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id);

  insert into public.shops (owner_id, name)
  values (new.id, coalesce(nullif(trim(new.raw_user_meta_data->>'shop_name'), ''), 'ร้านของฉัน'));

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- 4. Storage bucket สำหรับโลโก้ร้าน (avatars) -------------------------------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- โครงสร้าง path ที่ใช้: avatars/{user_id}/{filename}
create policy "avatar_public_read" on storage.objects
for select using (bucket_id = 'avatars');

create policy "avatar_owner_insert" on storage.objects
for insert with check (
  bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "avatar_owner_update" on storage.objects
for update using (
  bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "avatar_owner_delete" on storage.objects
for delete using (
  bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
);
