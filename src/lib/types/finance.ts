export type TransactionType = "income" | "expense";

export type Category = {
  id: string;
  name: string;
  type: TransactionType;
};

export type Transaction = {
  id: string;
  type: TransactionType;
  amount: number;
  note: string | null;
  occurred_at: string;
  category_id: string | null;
  category: Category | null;
};
