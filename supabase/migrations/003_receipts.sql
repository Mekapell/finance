-- Phase 3.1: แนบรูปภาพ/ถ่ายภาพใบเสร็จให้รายการรายรับ-รายจ่าย
alter table public.transactions add column if not exists receipt_url text;

insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', true)
on conflict (id) do nothing;

-- โครงสร้าง path ที่ใช้: receipts/{user_id}/{filename}
create policy "receipt_public_read" on storage.objects
for select using (bucket_id = 'receipts');

create policy "receipt_owner_insert" on storage.objects
for insert with check (
  bucket_id = 'receipts' and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "receipt_owner_update" on storage.objects
for update using (
  bucket_id = 'receipts' and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "receipt_owner_delete" on storage.objects
for delete using (
  bucket_id = 'receipts' and auth.uid()::text = (storage.foldername(name))[1]
);
