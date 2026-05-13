import { z } from "zod";

export const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z
    .string()
    .min(1, "Digite um valor")
    .refine(
      (value) => {
        const parsed = Number(value.replace(",", "."));
        return !isNaN(parsed) && parsed > 0;
      },
      {
        message: "Digite um valor válido",
      },
    ),
  category: z.string().min(1, "Selecione uma categoria"),
  description: z.string().min(2, "Digite uma descrição"),
  date: z.coerce.date().refine((value) => !isNaN(value.getTime()), {
    message: "Selecione uma data",
  }),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;
