import { Transaction }
  from "@/core/@types/transaction";

export function calculateBalance(
  transactions: Transaction[],
) {
  return transactions.reduce(
    (acc, transaction) => {
      if (
        transaction.type ===
        "income"
      ) {
        return (
          acc + transaction.value
        );
      }

      return (
        acc - transaction.value
      );
    },
    0,
  );
}