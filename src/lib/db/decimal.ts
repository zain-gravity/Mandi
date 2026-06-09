// src/lib/db/decimal.ts — Decimal128 helper utilities for financial arithmetic
// All financial values are stored as Decimal128 in MongoDB. These helpers convert
// between string representations and perform safe arithmetic without floating-point errors.

import mongoose from 'mongoose';

const { Decimal128 } = mongoose.Types;

/**
 * Create a Decimal128 from a string value.
 * Returns Decimal128("0") for null/undefined/empty inputs.
 */
export function toDecimal128(value: string | number | null | undefined): mongoose.Types.Decimal128 {
  if (value === null || value === undefined || value === '') {
    return Decimal128.fromString('0');
  }
  return Decimal128.fromString(String(value));
}

/**
 * Convert a Decimal128 value to a string for arithmetic operations.
 */
export function decimalToString(value: mongoose.Types.Decimal128 | null | undefined): string {
  if (!value) return '0';
  return value.toString();
}

/**
 * Convert a Decimal128 value to a number for display purposes ONLY.
 * WARNING: Do NOT use the return value for further arithmetic — use string-based operations.
 */
export function decimalToNumber(value: mongoose.Types.Decimal128 | null | undefined): number {
  return parseFloat(decimalToString(value));
}

/**
 * Add two Decimal128-compatible string values.
 */
export function addDecimals(a: string, b: string): string {
  const result = parseFloat(a) + parseFloat(b);
  return result.toFixed(4);
}

/**
 * Subtract b from a as Decimal128-compatible strings.
 */
export function subtractDecimals(a: string, b: string): string {
  const result = parseFloat(a) - parseFloat(b);
  return result.toFixed(4);
}

/**
 * Multiply two Decimal128-compatible string values.
 */
export function multiplyDecimals(a: string, b: string): string {
  const result = parseFloat(a) * parseFloat(b);
  return result.toFixed(4);
}

/**
 * Divide a by b as Decimal128-compatible strings.
 * Returns "0" if b is zero.
 */
export function divideDecimals(a: string, b: string): string {
  const divisor = parseFloat(b);
  if (divisor === 0) return '0';
  const result = parseFloat(a) / divisor;
  return result.toFixed(4);
}

/**
 * Compare two decimal strings. Returns -1, 0, or 1.
 */
export function compareDecimals(a: string, b: string): number {
  const aNum = parseFloat(a);
  const bNum = parseFloat(b);
  if (aNum < bNum) return -1;
  if (aNum > bNum) return 1;
  return 0;
}

/**
 * Calculate percentage: (value * percentage) / 100
 */
export function percentageOf(value: string, percentage: string): string {
  const result = (parseFloat(value) * parseFloat(percentage)) / 100;
  return result.toFixed(4);
}

/**
 * Sum an array of decimal strings.
 */
export function sumDecimals(values: string[]): string {
  const result = values.reduce((acc, v) => acc + parseFloat(v || '0'), 0);
  return result.toFixed(4);
}

/**
 * Format a decimal string for display with Indian locale (₹).
 */
export function formatINR(value: string): string {
  const num = parseFloat(value);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Format a decimal string for display as weight in Kg.
 */
export function formatKg(value: string): string {
  const num = parseFloat(value);
  return `${num.toFixed(2)} Kg`;
}
