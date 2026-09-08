import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

const SYSTEM_INSTRUCTION = `คุณคือผู้ช่วยตอบคำถามเกี่ยวกับการใช้งานเว็บแอป "ระบบจัดการการเงินร้านค้า"
ตอบเป็นภาษาไทย กระชับ ตรงประเด็น ไม่เกิน 4-5 ประโยค

ข้อมูลเกี่ยวกับเว็บนี้ที่ควรรู้:
- สมัครสมาชิก/เข้าสู่ระบบที่หน้า /register และ /login, มีลืมรหัสผ่านได้
- หน้า "แดชบอร์ด" สรุปยอดรายรับ-รายจ่ายเดือนนี้ + กราฟแนวโน้ม 6 เดือน + รายการล่าสุด
- หน้า "รายการ" (/transactions) ใช้เพิ่ม/แก้ไข/ลบรายการรายรับ-รายจ่าย กดปุ่ม + มุมขวาล่าง
  เพิ่มรายการได้ พร้อมถ่ายภาพ/แนบรูปใบเสร็จได้ และจัดการหมวดหมู่ได้จากปุ่ม "หมวดหมู่"
- หน้า "รายงาน" (/reports) ดูสรุปรายเดือน/รายปี แยกตามหมวดหมู่ Export เป็น CSV หรือ PDF ได้
- หน้า "ตั้งค่าโปรไฟล์" แก้ชื่อร้าน/ชื่อเจ้าของ/เบอร์โทร/โลโก้ร้าน กดที่ avatar มุมขวาบน
- มีโหมดมืด (ปุ่มพระอาทิตย์/พระจันทร์มุมขวาบน) และติดตั้งเป็นแอปบนหน้าจอ iPhone ได้ผ่าน Safari > แชร์ > เพิ่มไปยังหน้าจอโฮม

ถ้าคำถามไม่เกี่ยวกับการใช้งานเว็บนี้ ให้ตอบสั้นๆ ว่าคุณช่วยได้แค่เรื่องการใช้งานเว็บนี้เท่านั้น
ห้ามให้คำแนะนำด้านกฎหมาย ภาษี หรือการเงินเชิงลึก ให้แนะนำให้ปรึกษาผู้เชี่ยวชาญแทน`;

type ChatMessage = { role: "user" | "assistant"; content: string };

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
  const messages: ChatMessage[] = Array.isArray(body?.messages) ? body.messages : [];

  if (messages.length === 0) {
    return NextResponse.json({ error: "ไม่มีข้อความ" }, { status: 400 });
  }

  // ส่งแค่ 10 ข้อความล่าสุด กันบทสนทนายาวเกินไปจนใช้โทเค็นเปลือง
  const recent = messages.slice(-10);
  const contents = recent.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents,
          system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
          generationConfig: { maxOutputTokens: 500 },
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error("Gemini API error:", res.status, errText);
      return NextResponse.json(
        { error: "ขออภัย ระบบ AI ไม่ตอบสนองในขณะนี้ กรุณาลองใหม่" },
        { status: 502 }
      );
    }

    const data = await res.json();
    const reply: string =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ??
      "ขออภัย ไม่สามารถตอบคำถามนี้ได้ในขณะนี้";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "เชื่อมต่อระบบ AI ไม่ได้ กรุณาลองใหม่" },
      { status: 500 }
    );
  }
}
