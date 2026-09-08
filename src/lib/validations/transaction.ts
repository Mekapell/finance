import { z } from "zod";

export const transactionTypeEnum = z.enum(["income", "expense"]);

export const transactionSchema = z.object({
  type: transactionTypeEnum,
  amount: z.coerce
    .number({ message: "กรุณากรอกจำนวนเงิน" })
    .positive("จำนวนเงินต้องมากกว่า 0"),
  categoryId: z.string().min(1, "กรุณาเลือกหมวดหมู่"),
  occurredAt: z.string().min(1, "กรุณาเลือกวันที่"),
  note: z.string().optional(),
});

export type TransactionInput = z.infer<typeof transactionSchema>;

export const categorySchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อหมวดหมู่"),
  type: transactionTypeEnum,
});

export type CategoryInput = z.infer<typeof categorySchema>;
