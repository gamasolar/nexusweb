/**
 * Simple Moving Average (SMA) Indicator
 * 
 * The SMA is one of the most fundamental technical indicators, calculating the average
 * price over a specified number of periods. It smooths out price data to identify trends.
 * 
 * Formula: SMA = (P1 + P2 + ... + Pn) / n
 * Where:
 * - P = Price (typically closing price)
 * - n = Number of periods
 * 
 * Common periods:
 * - 20: Short-term trend
 * - 50: Medium-term trend
 * - 200: Long-term trend
 */

export interface SMAParams {
  period: number;
}

export interface PriceData {
  timestamp: Date;
  close: number;
}

/**
 * Calculate Simple Moving Average for a dataset
 * 
 * @param data - Array of price data points (must be sorted by timestamp ascending)
 * @param period - Number of periods to average
 * @returns Array of SMA values with timestamps
 */
export function calculateSMA(
  data: PriceData[],
  period: number
): Array<{ timestamp: Date; value: number }> {
  if (period <= 0) {
    throw new Error("Period must be greater than 0");
  }

  if (data.length < period) {
    throw new Error(`Insufficient data: need at least ${period} candles, got ${data.length}`);
  }

  const result: Array<{ timestamp: Date; value: number }> = [];

  // Calculate SMA for each valid window
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;

    // Sum the closing prices for the window
    for (let j = i - period + 1; j <= i; j++) {
      sum += data[j].close;
    }

    const smaValue = sum / period;

    result.push({
      timestamp: data[i].timestamp,
      value: smaValue,
    });
  }

  return result;
}

/**
 * Calculate SMA for a single point (rolling calculation)
 * Useful for real-time updates
 * 
 * @param recentPrices - Array of recent closing prices (length must equal period)
 * @param period - Number of periods
 * @returns SMA value
 */
export function calculateSMASingle(recentPrices: number[], period: number): number {
  if (recentPrices.length !== period) {
    throw new Error(`Expected ${period} prices, got ${recentPrices.length}`);
  }

  const sum = recentPrices.reduce((acc, price) => acc + price, 0);
  return sum / period;
}

/**
 * Validate SMA parameters
 */
export function validateSMAParams(params: SMAParams): void {
  if (!params.period || params.period <= 0) {
    throw new Error("Period must be a positive number");
  }

  if (!Number.isInteger(params.period)) {
    throw new Error("Period must be an integer");
  }

  if (params.period > 500) {
    throw new Error("Period too large (max 500)");
  }
}

/**
 * Generate cache key for SMA indicator
 */
export function getSMACacheKey(symbol: string, timeframe: string, period: number): string {
  return `sma:${symbol}:${timeframe}:${period}`;
}

/**
 * Serialize SMA parameters to JSON string for database storage
 */
export function serializeSMAParams(params: SMAParams): string {
  return JSON.stringify({ period: params.period });
}

/**
 * Deserialize SMA parameters from JSON string
 */
export function deserializeSMAParams(json: string): SMAParams {
  const params = JSON.parse(json);
  validateSMAParams(params);
  return params;
}
