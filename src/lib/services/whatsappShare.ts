// Utility to generate the secure PDF token
export const generateTradeToken = (id: string) => {
  let hash = 0;
  const str = id + 'MANDI_SECRET_2026';
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
};

export function buildWhatsAppShareURL(trade: any, baseUrl: string): string {
  // 1. Generate the secure PDF link
  const pdfLink = `${baseUrl}/api/trades/${trade._id}/pdf?token=${generateTradeToken(trade._id)}`;

  // 2. Build the message text
  let message = `*Mandi Trade Update: ${trade.tradeNumber}*\n`;
  message += `Date: ${new Date(trade.tradeDate).toLocaleDateString()}\n`;
  message += `Status: ${trade.status}\n\n`;

  message += `*Sourcing*\n`;
  trade.sourceLines?.forEach((line: any) => {
    message += `- ${line.commodityName}: ${line.quantityKg?.toString() || 0} kg\n`;
  });

  message += `\n*Financials*\n`;
  message += `- Gross Sale: Rs. ${trade.financials?.totalGrossSale?.toString() || 0}\n`;
  message += `- Freight: Rs. ${trade.logistics?.freightCost?.toString() || 0}\n`;
  message += `- Net Profit: Rs. ${trade.financials?.netProfitAfterPeshgi?.toString() || 0}\n\n`;

  message += `*Full Audit PDF Report:*\n${pdfLink}\n`;

  // 3. Encode for wa.me
  const encodedMessage = encodeURIComponent(message);
  
  // Return the universal WhatsApp link (user can pick who to send it to)
  return `https://wa.me/?text=${encodedMessage}`;
}
