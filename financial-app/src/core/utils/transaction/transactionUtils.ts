import type { Transaction } from "@/core/@types/transaction";

export type FilterPeriod = "Dia" | "Semana" | "Mês" | "Todos";

export function groupByDate(transactions: Transaction[]) {
  const groups: Record<string, Transaction[]> = {};

  transactions.forEach((transaction) => {
    const label = new Date(transaction.date).toLocaleDateString("pt-BR");

    if (!groups[label]) {
      groups[label] = [];
    }

    groups[label].push(transaction);
  });

  return Object.entries(groups).map(([title, data]) => ({ title, data }));
}

export function getCategoryIcon(title: string) {
  const t = title.toLowerCase();

  if (t.includes("mercado") || t.includes("supermercado"))
    return "cart-outline";
  if (t.includes("uber") || t.includes("taxi") || t.includes("transport"))
    return "car-outline";
  if (t.includes("netflix") || t.includes("spotify") || t.includes("stream"))
    return "play-circle-outline";
  if (t.includes("ifood") || t.includes("restaurante") || t.includes("food"))
    return "fast-food-outline";
  if (t.includes("farmácia") || t.includes("farmacia") || t.includes("saúde"))
    return "medkit-outline";
  if (t.includes("ginásio") || t.includes("academia")) return "barbell-outline";

  return "receipt-outline";
}
