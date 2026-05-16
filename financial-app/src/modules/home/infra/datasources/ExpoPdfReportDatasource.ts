import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

import type { Transaction }
  from "@/modules/transactions";

export class ExpoPdfReportDatasource {
  async exportMonthlyReport(
    transactions: Transaction[],
    monthName: string,
  ) {
    const rows = transactions
      .map(
        (transaction) => `
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">
              ${transaction.date.toLocaleDateString("pt-BR")}
            </td>
            <td style="border: 1px solid #ddd; padding: 8px;">
              ${transaction.title}
            </td>
            <td style="border: 1px solid #ddd; padding: 8px; color: ${
              transaction.type === "income"
                ? "green"
                : "red"
            };">
              R$ ${transaction.value.toFixed(2)}
            </td>
          </tr>
        `,
      )
      .join("");

    const html = `
      <html>
        <body style="font-family: Helvetica; padding: 20px;">
          <h1 style="color: #2563EB;">
            Lighthouse - Extrato de ${monthName}
          </h1>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="background-color: #f1f5f9;">
              <th style="border: 1px solid #ddd; padding: 8px;">Data</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Título</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Valor</th>
            </tr>
            ${rows}
          </table>
        </body>
      </html>
    `;

    const { uri } =
      await Print.printToFileAsync({
        html,
      });

    await Sharing.shareAsync(uri);
  }
}
