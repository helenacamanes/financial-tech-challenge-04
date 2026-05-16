export type TransactionAttachment = {
  url: string;
  path: string;
  name: string;
  contentType?: string | null;
};

export type Transaction = {
  id: string;
  title: string;
  value: number;
  type: "income" | "expense";
  date: Date;
  createdAt?: Date;
  description?: string;
  account?: string;
  attachment?: TransactionAttachment | null;
};
