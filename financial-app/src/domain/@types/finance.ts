export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserProfile {
  balance: number;
  createdAt?: Date;
  updatedAt?: Date;
}
