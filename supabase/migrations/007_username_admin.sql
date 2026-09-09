-- เพิ่ม username สำหรับเข้าสู่ระบบ + สิทธิ์แอดมิน (สำหรับรีเซ็ตรหัสผ่านลูกค้า)
alter table public.profiles
  add column if not exists username text,
  add column if not exists is_admin boolean not null default false;

-- ตั้งค่า username ให้ profile เดิมที่ยังไม่มี ก่อนบังคับ not null + unique
update public.profiles
set username = 'user_' || substr(id::text, 1, 8)
where username is null or trim(username) = '';

alter table public.profiles
  alter column username set not null;

create unique index if not exists profiles_username_unique_idx
  on public.profiles (lower(username));

-- เช็คว่า username นี้ว่างอยู่ไหม (เรียกได้ทั้งก่อน/หลังล็อกอิน สำหรับหน้าสมัคร/แก้ไขโปรไฟล์)
create or replace function public.is_username_available(p_username text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  return not exists (
    select 1 from public.profiles where lower(username) = lower(p_username)
  );
end;
$$;

revoke all on function public.is_username_available(text) from public;
grant execute on function public.is_username_available(text) to anon, authenticated;

-- หา email จาก username สำหรับตอนเข้าสู่ระบบ (ต้องหาก่อนจะยืนยันตัวตนได้)
create or replace function public.get_email_by_username(p_username text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
begin
  select u.email into v_email
  from public.profiles p
  join auth.users u on u.id = p.id
  where lower(p.username) = lower(p_username)
  limit 1;
  return v_email;
end;
$$;

revoke all on function public.get_email_by_username(text) from public;
grant execute on function public.get_email_by_username(text) to anon, authenticated;

-- อัปเดต trigger สมัครสมาชิกให้เก็บ username จาก metadata ด้วย
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data->>'username'), ''),
      'user_' || substr(new.id::text, 1, 8)
    )
  );

  insert into public.shops (owner_id, name)
  values (new.id, coalesce(nullif(trim(new.raw_user_meta_data->>'shop_name'), ''), 'ร้านของฉัน'));

  return new;
end;
$$;
