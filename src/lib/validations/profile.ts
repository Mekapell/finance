import { z } from "zod";

export const usernameFieldSchema = z
  .string()
  .min(3, "ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร")
  .max(20, "ชื่อผู้ใช้ต้องไม่เกิน 20 ตัวอักษร")
  .regex(/^[a-zA-Z0-9_]+$/, "ใช้ได้แค่ตัวอักษรอังกฤษ ตัวเลข และ _ เท่านั้น (ห้ามเว้นวรรค/ตัวพิเศษ)");

export const profileSchema = z.object({
  username: usernameFieldSchema,
  shopName: z.string().min(1, "กรุณากรอกชื่อร้าน"),
  ownerName: z.string().optional(),
  phone: z
    .string()
    .optional()
    .refine((v) => !v || /^[0-9+\-\s]{6,15}$/.test(v), {
      message: "รูปแบบเบอร์โทรไม่ถูกต้อง",
    }),
});

export type ProfileInput = z.infer<typeof profileSchema>;
