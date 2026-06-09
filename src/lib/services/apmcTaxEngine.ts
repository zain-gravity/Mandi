import { percentageOf, subtractDecimals } from '../utils/decimal';
import { MasterItem } from '../db/models';
import { IGradeSplit } from '../db/models/Trade';

export class APMCTaxEngine {
  
  /**
   * Calculates the APMC Tax and Net Amount
   */
  static calculateAPMCTax(grossAmount: string, mandiTaxPercentage: string): { taxAmount: string, netAmount: string } {
    const taxAmount = percentageOf(grossAmount, mandiTaxPercentage);
    const netAmount = subtractDecimals(grossAmount, taxAmount);
    
    return { taxAmount, netAmount };
  }

  /**
   * Fetches the APMC rate for a specific city. 
   * Returns "0" if city is not found or not APMC regulated.
   */
  static async getAPMCRateForCity(companyId: string, cityId: string): Promise<string> {
    const city = await MasterItem.findOne({
      _id: cityId,
      companyId,
      type: 'CITY',
    });

    if (!city || !city.cityData || !city.cityData.isAPMCRegulated || !city.cityData.mandiTaxPercentage) {
      return "0";
    }

    return city.cityData.mandiTaxPercentage.toString();
  }

  /**
   * Applies APMC calculations to a list of grading splits based on their destination city.
   */
  static async applyAPMCToGradingSplits(companyId: string, gradingSplits: Partial<IGradeSplit>[]): Promise<void> {
    for (const split of gradingSplits) {
      if (!split.grossSaleAmount) continue;
      
      let taxPercentage = "0";
      
      if (split.destinationCityId) {
        taxPercentage = await this.getAPMCRateForCity(companyId, split.destinationCityId.toString());
      }
      
      const { taxAmount, netAmount } = this.calculateAPMCTax(split.grossSaleAmount.toString(), taxPercentage);
      
      // We mutate the split object directly
      (split as any).apmcTaxPercentage = taxPercentage;
      (split as any).apmcTaxAmount = taxAmount;
      (split as any).netSaleAmount = netAmount;
    }
  }
}
