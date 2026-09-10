-- ตั้งราคาประจำของหมวดหมู่ได้ (เผื่อซื้อของเดิมซ้ำๆ ไม่ต้องพิมพ์ราคาใหม่ทุกครั้ง)
alter table public.categories
  add column if not exists default_amount numeric;
