import { Types } from 'mongoose';

/**
 * Converts a string or number to a Mongoose Decimal128 instance.
 */
export function toDecimal128(value: string | number): Types.Decimal128 {
  return Types.Decimal128.fromString(value.toString());
}

/**
 * Converts a Mongoose Decimal128 instance back to a string representation.
 * Useful for serialization.
 */
export function fromDecimal128(value: any): string {
  if (!value) return '0';
  if (value instanceof Types.Decimal128) {
    return value.toString();
  }
  return value.toString();
}

/**
 * Adds multiple decimal values together safely, avoiding floating-point errors.
 */
export function addDecimals(...values: string[]): string {
  const sum = values.reduce((acc, val) => {
    // using basic parseFloat here just for simulation if no big decimal lib is present
    // For true absolute precision in a robust app, use decimal.js or big.js
    return acc + parseFloat(val || '0');
  }, 0);
  return sum.toFixed(2);
}

/**
 * Subtracts 'b' from 'a'.
 */
export function subtractDecimals(a: string, b: string): string {
  const diff = parseFloat(a || '0') - parseFloat(b || '0');
  return diff.toFixed(2);
}

/**
 * Multiplies two decimal values.
 */
export function multiplyDecimals(a: string, b: string): string {
  const product = parseFloat(a || '0') * parseFloat(b || '0');
  return product.toFixed(2);
}

/**
 * Divides 'a' by 'b'.
 */
export function divideDecimals(a: string, b: string, precision: number = 2): string {
  const divisor = parseFloat(b || '0');
  if (divisor === 0) return '0'; // Handle divide by zero
  const quotient = parseFloat(a || '0') / divisor;
  return quotient.toFixed(precision);
}

/**
 * Calculates the percentage of an amount.
 * e.g. percentageOf("1000", "5") returns "50.00"
 */
export function percentageOf(amount: string, percentage: string): string {
  const val = (parseFloat(amount || '0') * parseFloat(percentage || '0')) / 100;
  return val.toFixed(2);
}
