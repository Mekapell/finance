/**
 * แปล error message ดิบจาก Supabase Auth ให้เป็นภาษาไทยที่เข้าใจง่าย
 * ห้ามโชว์ error.message ดิบให้ผู้ใช้เห็นตรงๆ (ตาม security checklist)
 */
export function toThaiAuthError(message: string | undefined): string {
  const m = (message ?? "").toLowerCase();

  if (m.includes("invalid login credentials")) {
    return "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง";
  }
  if (m.includes("email not confirmed")) {
    return "กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ ตรวจสอบกล่องจดหมายของคุณ";
  }
  if (m.includes("user already registered") || m.includes("already registered")) {
    return "อีเมลนี้ถูกใช้งานแล้ว กรุณาเข้าสู่ระบบแทน";
  }
  if (
    m.includes("profiles_username") ||
    m.includes("duplicate key") ||
    m.includes("database error saving new user")
  ) {
    return "ชื่อผู้ใช้นี้ถูกใช้งานแล้ว กรุณาเลือกชื่อผู้ใช้อื่น";
  }
  if (m.includes("password should be at least")) {
    return "รหัสผ่านสั้นเกินไป ต้องมีอย่างน้อย 8 ตัว";
  }
  if (m.includes("rate limit") || m.includes("too many requests")) {
    return "ทำรายการถี่เกินไป กรุณารอสักครู่แล้วลองใหม่";
  }
  if (m.includes("invalid email")) {
    return "รูปแบบอีเมลไม่ถูกต้อง";
  }
  if (m.includes("network")) {
    return "เชื่อมต่อเครือข่ายไม่ได้ กรุณาตรวจสอบอินเทอร์เน็ต";
  }
  if (m.includes("session") || m.includes("auth session missing")) {
    return "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่อีกครั้ง";
  }

  return "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
}
