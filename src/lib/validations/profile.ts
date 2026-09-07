import { z } from "zod";

export const profileSchema = z.object({
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
