import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Transaction } from '../@types/transaction';

export const exportToPDF = async (transactions: Transaction[], monthName: string) => {
  const html = `
    <html>
      <body style="font-family: Helvetica; padding: 20px;">
        <h1 style="color: #2563EB;">Lighthouse - Extrato de ${monthName}</h1>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="background-color: #f1f5f9;">
            <th style="border: 1px solid #ddd; padding: 8px;">Data</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Título</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Valor</th>
          </tr>
          ${transactions.map(t => `
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">${t.date.toLocaleDateString('pt-BR')}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${t.title}</td>
              <td style="border: 1px solid #ddd; padding: 8px; color: ${t.type === 'income' ? 'green' : 'red'};">
                R$ ${t.value.toFixed(2)}
              </td>
            </tr>
          `).join('')}
        </table>
      </body>
    </html>
  `;

  const { uri } = await Print.printToFileAsync({ html });
  await Sharing.shareAsync(uri);
};