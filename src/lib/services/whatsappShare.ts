export interface TradeSummary {
  tradeNumber: string;
  tradeDate: string;
  sourceLines: Array<{ commodityName: string; quantityKg: string; sourceCityName: string }>;
  totalExpenses: string;
  grossProfit: string;
  netProfit: string;
  pdfUrl: string;
}

export class WhatsAppShare {
  
  /**
   * Builds a WhatsApp `wa.me` deep link
   */
  static buildWhatsAppShareURL(phoneNumber: string, trade: TradeSummary): string {
    // Format phone: remove spaces, +, brackets, dashes. Replace leading 0 with 91.
    let cleanPhone = phoneNumber.replace(/[\s+\-()]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '91' + cleanPhone.substring(1);
    } else if (cleanPhone.length === 10) {
      // Assume Indian number if just 10 digits
      cleanPhone = '91' + cleanPhone;
    }

    const sourceSummary = trade.sourceLines
      .map(l => `  • ${l.commodityName}: ${l.quantityKg}kg from ${l.sourceCityName}`)
      .join('\n');

    const message = `📊 *Mandi Trade Update*
━━━━━━━━━━━━━━━━━━━━
🔖 Trade #: ${trade.tradeNumber}
📅 Date: ${trade.tradeDate}

📦 *Sourcing:*
${sourceSummary || '  No items'}

💰 *Financials:*
  • Expenses: ₹${trade.totalExpenses}
  • Gross Profit: ₹${trade.grossProfit}
  • Net Profit: ₹${trade.netProfit}

📄 *Full Audit PDF:*
${trade.pdfUrl || 'Not available'}
━━━━━━━━━━━━━━━━━━━━
_Shared via MandiTrader SaaS_`;

    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
  }
}
