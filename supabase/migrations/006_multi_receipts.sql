-- รองรับแนบรูปใบเสร็จได้หลายรูปต่อรายการ (สูงสุด 5 รูป บังคับที่ฝั่งแอป)
create table if not exists public.transaction_receipts (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references public.transactions(id) on delete cascade,
  url text not null,
  created_at timestamptz not null default now()
);

create index if not exists transaction_receipts_transaction_id_idx
  on public.transaction_receipts(transaction_id);

alter table public.transaction_receipts enable row level security;

create policy "own transaction receipts" on public.transaction_receipts
for all using (
  exists (
    select 1 from public.transactions t
    join public.shops s on s.id = t.shop_id
    where t.id = transaction_receipts.transaction_id
      and s.owner_id = auth.uid()
  )
) with check (
  exists (
    select 1 from public.transactions t
    join public.shops s on s.id = t.shop_id
    where t.id = transaction_receipts.transaction_id
      and s.owner_id = auth.uid()
  )
);

-- ย้ายรูปเดี่ยวเดิม (ถ้ามี) เข้าตารางใหม่ ไม่ทิ้งข้อมูลเก่า
insert into public.transaction_receipts (transaction_id, url)
select id, receipt_url from public.transactions
where receipt_url is not null
on conflict do nothing;
