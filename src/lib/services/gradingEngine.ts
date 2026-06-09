import { addDecimals, subtractDecimals, divideDecimals, multiplyDecimals } from '../utils/decimal';
import { IGradeSplit, ISourceLine } from '../db/models/Trade';

export class GradingEngine {
  
  /**
   * Validates that the sum of graded quantities does not exceed inbound quantity.
   */
  static validateGradingSplits(inboundQuantityKg: string, gradingSplits: Partial<IGradeSplit>[]): boolean {
    const totalGraded = gradingSplits.reduce((sum, split) => {
      return addDecimals(sum, split.quantityKg ? split.quantityKg.toString() : '0');
    }, '0');

    // Float comparison is safe here because we format to fixed decimal places
    return parseFloat(totalGraded) <= parseFloat(inboundQuantityKg);
  }

  /**
   * Calculates transit loss (Sukhti)
   * If inbound is 1000kg and outbound grades sum to 950kg, loss is 50kg.
   * The cost per kg increases because you paid for 1000kg but can only sell 950kg.
   */
  static calculateTransitLoss(inboundKg: string, outboundKg: string, totalPurchaseCost: string) {
    const lossKg = subtractDecimals(inboundKg, outboundKg);
    const lossPercentage = divideDecimals(multiplyDecimals(lossKg, '100'), inboundKg, 2);
    
    // Adjusted net cost = Total Cost / Outbound Kg
    // If outboundKg is 0, we can't divide by 0, cost is essentially 100% lost but we handle gracefully
    const adjustedNetCostPerKg = parseFloat(outboundKg) > 0 
      ? divideDecimals(totalPurchaseCost, outboundKg, 2)
      : '0';

    return { lossKg, lossPercentage, adjustedNetCostPerKg };
  }

  /**
   * Builds the summary for a source line including its transit loss calculation
   */
  static buildGradingSummary(sourceLine: Partial<ISourceLine>) {
    if (!sourceLine.quantityKg || !sourceLine.totalPurchaseCost) {
      throw new Error("Source line missing quantity or cost");
    }

    const inboundKg = sourceLine.quantityKg.toString();
    const totalCost = sourceLine.totalPurchaseCost.toString();
    
    let outboundKg = '0';
    if (sourceLine.gradingSplits) {
      outboundKg = sourceLine.gradingSplits.reduce((sum, split) => {
        return addDecimals(sum, split.quantityKg ? split.quantityKg.toString() : '0');
      }, '0');
    }

    if (!this.validateGradingSplits(inboundKg, sourceLine.gradingSplits || [])) {
      throw new Error("Grading split total exceeds inbound quantity");
    }

    const transitLoss = this.calculateTransitLoss(inboundKg, outboundKg, totalCost);

    return transitLoss;
  }
}
