import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

const PROMPT = `นี่คือรูปใบเสร็จ/สลิป วิเคราะห์แล้วตอบเป็น JSON เท่านั้น (ห้ามมีข้อความอื่นนอก JSON) ตามรูปแบบนี้:
{
  "amount": ตัวเลขจำนวนเงินรวมสุทธิ (number ไม่มีเครื่องหมายจุลภาค),
  "type": "income" หรือ "expense" (ถ้าเป็นใบเสร็จซื้อของ/ค่าใช้จ่ายให้ตอบ "expense", ถ้าเป็นใบเสร็จรับเงิน/ขายของให้ตอบ "income"),
  "date": วันที่บนใบเสร็จรูปแบบ YYYY-MM-DD (ถ้าไม่เห็นวันที่ให้ใส่ null),
  "category": ชื่อหมวดหมู่ภาษาไทยสั้นๆที่เหมาะสม เช่น "ค่าวัตถุดิบ", "ค่าขนส่ง", "ค่าน้ำค่าไฟ", "อาหาร",
  "note": สรุปสั้นๆ เช่น ชื่อร้าน/รายการหลัก (ไม่เกิน 10 คำ)
}
ถ้ารูปไม่ใช่ใบเสร็จหรืออ่านไม่ออก ให้ตอบ {"error": "ไม่สามารถอ่านข้อมูลจากรูปนี้ได้"}`;

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ยังไม่ได้ตั้งค่า GEMINI_API_KEY บนเซิร์ฟเวอร์" },
      { status: 500 }
    );
  }

  const body = await request.json().catch(() => null);
  const imageData: string | undefined = body?.data;
  const mimeType: string | undefined = body?.mimeType;

  if (!imageData || !mimeType) {
    return NextResponse.json({ error: "ไม่มีรูปภาพ" }, { status: 400 });
  }

  const model = process.env.GEMINI_MODEL || "gemini-3.5-flash";

  try {
    const res = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
        "Api-Revision": "2026-05-20",
      },
      body: JSON.stringify({
        model,
        input: [
          { type: "text", text: PROMPT },
          { type: "image", data: imageData, mime_type: mimeType },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error("Gemini scan-receipt error:", res.status, errText);
      return NextResponse.json(
        { error: "สแกนใบเสร็จไม่สำเร็จ กรุณากรอกเอง" },
        { status: 502 }
      );
    }

    const data = await res.json();
    const rawText: string =
      data?.output_text ?? data?.steps?.at(-1)?.content?.[0]?.text ?? "";

    // Gemini อาจแถม ```json ... ``` มาด้วย ตัดออกก่อน parse
    const cleaned = rawText.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    if (parsed.error) {
      return NextResponse.json({ error: parsed.error }, { status: 422 });
    }

    return NextResponse.json({ result: parsed });
  } catch (error) {
    console.error("Scan receipt error:", error);
    return NextResponse.json(
      { error: "สแกนใบเสร็จไม่สำเร็จ กรุณากรอกเอง" },
      { status: 500 }
    );
  }
}
