import { addDecimals, subtractDecimals, multiplyDecimals, percentageOf, toDecimal128 } from '../utils/decimal';
import { ITrade, IPeshgiDeduction } from '../db/models/Trade';
import { Peshgi, Company } from '../db/models';
import mongoose from 'mongoose';

export class SettlementEngine {
  
  /**
   * Computes all financial summary fields for a trade
   */
  static calculateTradeFinancials(trade: Partial<ITrade>) {
    let totalSourceCost = '0';
    let totalGrossSale = '0';
    let totalAPMCTax = '0';
    let totalNetSale = '0';
    let totalFreightAndExpenses = '0';
    let totalPeshgiDeducted = '0';

    // 1. Source Costs & Sales
    if (trade.sourceLines) {
      for (const line of trade.sourceLines) {
        totalSourceCost = addDecimals(totalSourceCost, line.totalPurchaseCost?.toString() || '0');
        
        if (line.gradingSplits) {
          for (const split of line.gradingSplits) {
            totalGrossSale = addDecimals(totalGrossSale, split.grossSaleAmount?.toString() || '0');
            totalAPMCTax = addDecimals(totalAPMCTax, split.apmcTaxAmount?.toString() || '0');
            totalNetSale = addDecimals(totalNetSale, split.netSaleAmount?.toString() || '0');
          }
        }
      }
    }

    // 2. Logistics & Ad-hoc Expenses
    if (trade.logistics?.freightCost) {
      totalFreightAndExpenses = addDecimals(totalFreightAndExpenses, trade.logistics.freightCost.toString());
    }
    
    let totalAdHocExpenses = '0';
    if (trade.expenses) {
      for (const exp of trade.expenses) {
        totalAdHocExpenses = addDecimals(totalAdHocExpenses, exp.amount?.toString() || '0');
      }
      totalFreightAndExpenses = addDecimals(totalFreightAndExpenses, totalAdHocExpenses);
    }

    // 3. Peshgi Deductions
    if (trade.peshgiDeductions) {
      for (const ded of trade.peshgiDeductions) {
        totalPeshgiDeducted = addDecimals(totalPeshgiDeducted, ded.deductedAmount?.toString() || '0');
      }
    }

    // 4. Final Calculations
    const totalCapitalDeployed = addDecimals(totalSourceCost, totalFreightAndExpenses);
    const grossProfit = subtractDecimals(totalNetSale, totalCapitalDeployed);
    const netProfitAfterPeshgi = subtractDecimals(grossProfit, totalPeshgiDeducted);

    return {
      totalSourceCost,
      totalGrossSale,
      totalAPMCTax,
      totalNetSale,
      totalFreightAndExpenses,
      totalCapitalDeployed,
      grossProfit,
      netProfitAfterPeshgi,
      totalPeshgiDeducted,
      totalAdHocExpenses, // Useful for the trade model if needed separately
    };
  }

  /**
   * Updates Peshgi ledger based on trade deductions
   */
  static async reconcilePeshgiDeductions(companyId: string, trade: any, session: mongoose.mongo.ClientSession) {
    if (!trade.peshgiDeductions || trade.peshgiDeductions.length === 0) return;

    for (const ded of trade.peshgiDeductions) {
      if (!ded.peshgiId) continue;

      const peshgi = await Peshgi.findOne({ _id: ded.peshgiId, companyId }).session(session);
      if (!peshgi) throw new Error(`Peshgi record not found: ${ded.peshgiId}`);

      const deductedStr = ded.deductedAmount.toString();
      const currentBalanceStr = peshgi.remainingBalance.toString();
      const newBalanceStr = subtractDecimals(currentBalanceStr, deductedStr);

      if (parseFloat(newBalanceStr) < 0) {
        throw new Error(`Cannot deduct ${deductedStr} from Peshgi ${ded.peshgiId} (Balance: ${currentBalanceStr})`);
      }

      peshgi.remainingBalance = toDecimal128(newBalanceStr);
      
      if (parseFloat(newBalanceStr) === 0) {
        peshgi.status = 'FULLY_SETTLED';
      } else {
        peshgi.status = 'PARTIALLY_SETTLED';
      }

      peshgi.settlements.push({
        tradeId: trade._id,
        tradeNumber: trade.tradeNumber,
        amountDeducted: toDecimal128(deductedStr),
        settledAt: new Date(),
        settledBy: trade.approvedBy || trade.createdBy,
      });

      await peshgi.save({ session });
    }
  }

  /**
   * Calculates how profit is split among partners
   */
  static async calculatePartnershipSettlement(companyId: string, netProfit: string, capitalDeployed: string) {
    const company = await Company.findById(companyId);
    if (!company) throw new Error('Company not found');

    const partners = company.partners || [];
    let totalFixedPayouts = '0';
    const fixedPayoutsList = [];
    
    // 1. Deduct Fixed Payouts
    for (const partner of partners) {
      if (partner.fixedPayout && parseFloat(partner.fixedPayout.toString()) > 0) {
        const payout = partner.fixedPayout.toString();
        totalFixedPayouts = addDecimals(totalFixedPayouts, payout);
        fixedPayoutsList.push({
          partnerId: partner.userId,
          partnerName: partner.name,
          amount: toDecimal128(payout),
        });
      }
    }

    const remainingProfit = subtractDecimals(netProfit, totalFixedPayouts);
    const profitSplitsList = [];
    let totalDistributed = totalFixedPayouts;

    // 2. Split Remaining Profit by Percentage
    if (parseFloat(remainingProfit) > 0) {
      for (const partner of partners) {
        if (partner.profitSharePercentage && parseFloat(partner.profitSharePercentage.toString()) > 0) {
          const share = percentageOf(remainingProfit, partner.profitSharePercentage.toString());
          totalDistributed = addDecimals(totalDistributed, share);
          profitSplitsList.push({
            partnerId: partner.userId,
            partnerName: partner.name,
            sharePercentage: partner.profitSharePercentage,
            amount: toDecimal128(share),
          });
        }
      }
    }

    return {
      capitalReturned: toDecimal128(capitalDeployed),
      fixedPayouts: fixedPayoutsList,
      profitSplits: profitSplitsList,
      totalDistributed: toDecimal128(totalDistributed),
    };
  }
}
