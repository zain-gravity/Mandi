import { put } from '@vercel/blob';
import { jsPDF } from 'jspdf';
import { ITrade } from '../db/models/Trade';
import { format } from 'date-fns';

export class PDFGenerator {
  
  /**
   * Generates a PDF for a Trade and uploads it to Vercel Blob
   */
  static async generateTradeAuditPDF(trade: ITrade): Promise<string> {
    const doc = new jsPDF();
    
    // 1. Header
    doc.setFontSize(20);
    doc.text(`Trade Audit Report`, 20, 20);
    doc.setFontSize(12);
    doc.text(`Trade #: ${trade.tradeNumber}`, 20, 35);
    const dateStr = trade.tradeDate ? format(new Date(trade.tradeDate), 'PP') : 'N/A';
    doc.text(`Date: ${dateStr}`, 20, 42);
    doc.text(`Status: ${trade.status}`, 20, 49);

    let y = 65;

    // 2. Sourcing Details
    doc.setFontSize(14);
    doc.text('Sourcing Details', 20, y);
    y += 10;
    
    if (trade.sourceLines && trade.sourceLines.length > 0) {
      for (const line of trade.sourceLines) {
        doc.setFontSize(10);
        doc.text(`${line.commodityName || 'Unknown'} | ${line.quantityKg}kg @ INR ${line.purchasePricePerKg}/kg`, 25, y);
        doc.text(`From: ${line.sourceCityName || 'N/A'} | Farmer: ${line.farmerName || 'N/A'}`, 25, y + 5);
        y += 15;

        // Grading splits
        if (line.gradingSplits && line.gradingSplits.length > 0) {
          doc.text('  Grading (Chhatai):', 30, y);
          y += 7;
          for (const grade of line.gradingSplits) {
            doc.text(`    ${grade.gradeName}: ${grade.quantityKg}kg -> ${grade.destinationCityName || 'N/A'} @ INR ${grade.pricePerKg}/kg`, 30, y);
            y += 6;
          }
        }
      }
    } else {
      doc.setFontSize(10);
      doc.text('No sourcing data available.', 25, y);
      y += 10;
    }

    // 3. Financial Summary
    y += 10;
    
    // Add page break if getting near bottom
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(14);
    doc.text('Financial Summary', 20, y);
    y += 10;
    doc.setFontSize(10);
    
    const fin = trade.financials;
    if (fin) {
      doc.text(`Total Source Cost:     INR ${fin.totalSourceCost}`, 25, y); y += 7;
      doc.text(`Total Gross Sale:      INR ${fin.totalGrossSale}`, 25, y); y += 7;
      doc.text(`APMC Tax Deducted:     INR ${fin.totalAPMCTax}`, 25, y); y += 7;
      doc.text(`Net Sale:              INR ${fin.totalNetSale}`, 25, y); y += 7;
      doc.text(`Freight & Expenses:    INR ${fin.totalFreightAndExpenses}`, 25, y); y += 7;
      doc.text(`Gross Profit:          INR ${fin.grossProfit}`, 25, y); y += 7;
      doc.text(`Peshgi Deducted:       INR ${trade.totalPeshgiDeducted || '0'}`, 25, y); y += 7;
      doc.text(`Net Profit:            INR ${fin.netProfitAfterPeshgi}`, 25, y);
    } else {
      doc.text('Financials not finalized.', 25, y);
    }

    // Generate buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    // Upload to Vercel Blob
    const filename = `trades/${trade.companyId}/${trade.tradeNumber}-${Date.now()}.pdf`;
    
    // In local dev without token, we might fail here. Wrap in try/catch.
    try {
      const blob = await put(filename, pdfBuffer, {
        access: 'public',
        contentType: 'application/pdf',
      });
      return blob.url;
    } catch (e) {
      console.error("Failed to upload PDF to Blob storage. Check BLOB_READ_WRITE_TOKEN.", e);
      // Return a dummy URL for development if blob fails
      return `https://dummy-pdf-url.com/${filename}`;
    }
  }
}
