-- ล้างของเก่าที่ Gemini สร้างไว้แบบไม่ปลอดภัย (ไม่มี secret check, ส่ง row ทั้งแถวออกไปตรงๆ)
drop function if exists public.sync_profiles_to_gsheet() cascade;

-- Sync ผู้ใช้ใหม่ (ตอนสมัคร/สร้างร้านสำเร็จ) ไปที่แท็บ "Users" ใน Google Sheet
create or replace function public.sync_new_user_to_gsheet()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_email text;
  v_owner_name text;
  v_phone text;
begin
  select email into v_email from auth.users where id = new.owner_id;
  select owner_name, phone into v_owner_name, v_phone from public.profiles where id = new.owner_id;

  perform net.http_post(
    url := 'https://script.google.com/macros/s/AKfycbw0dbkApVM6rrOGzdcEEZWQX6uTmoq1IBKeMe5fOVYqE02Qz0oAx818sSn1gCI2MPi9jQ/exec',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := jsonb_build_object(
      'secret', 'a689f15887de457687d0ab199d4dbd4c',
      'sheet', 'Users',
      'data', jsonb_build_object(
        'วันที่สมัคร', to_char(now(), 'YYYY-MM-DD HH24:MI'),
        'อีเมล', coalesce(v_email, ''),
        'ชื่อร้าน', new.name,
        'ชื่อเจ้าของ', coalesce(v_owner_name, ''),
        'เบอร์โทร', coalesce(v_phone, '')
      )
    )
  );
  return new;
end;
$$;

drop trigger if exists on_shop_created_sync_gsheet on public.shops;
create trigger on_shop_created_sync_gsheet
after insert on public.shops
for each row execute function public.sync_new_user_to_gsheet();

revoke execute on function public.sync_new_user_to_gsheet() from public, anon, authenticated;

-- Sync รายการรายรับ-รายจ่ายใหม่ (real-time ตอนเพิ่ม) ไปที่แท็บ "Transactions" ใน Google Sheet
create or replace function public.sync_transaction_to_gsheet()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_category_name text;
  v_shop_name text;
begin
  select name into v_category_name from public.categories where id = new.category_id;
  select name into v_shop_name from public.shops where id = new.shop_id;

  perform net.http_post(
    url := 'https://script.google.com/macros/s/AKfycbw0dbkApVM6rrOGzdcEEZWQX6uTmoq1IBKeMe5fOVYqE02Qz0oAx818sSn1gCI2MPi9jQ/exec',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := jsonb_build_object(
      'secret', 'a689f15887de457687d0ab199d4dbd4c',
      'sheet', 'Transactions',
      'data', jsonb_build_object(
        'วันที่', new.occurred_at::text,
        'ร้าน', coalesce(v_shop_name, ''),
        'ประเภท', case when new.type = 'income' then 'รายรับ' else 'รายจ่าย' end,
        'หมวดหมู่', coalesce(v_category_name, ''),
        'จำนวนเงิน', new.amount,
        'โน้ต', coalesce(new.note, '')
      )
    )
  );
  return new;
end;
$$;

drop trigger if exists on_transaction_created_sync_gsheet on public.transactions;
create trigger on_transaction_created_sync_gsheet
after insert on public.transactions
for each row execute function public.sync_transaction_to_gsheet();

revoke execute on function public.sync_transaction_to_gsheet() from public, anon, authenticated;
