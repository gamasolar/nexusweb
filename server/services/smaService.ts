/**
 * SMA Service
 * 
 * High-level service for calculating and storing SMA indicators.
 * Integrates with the database and provides caching.
 */

import { calculateSMA, type SMAParams, serializeSMAParams, validateSMAParams } from "../indicators/sma";
import { saveIndicatorsBatch, getLatestIndicators } from "./indicatorService";
import { getMarketCandles } from "../db";
import type { InsertIndicator, MarketCandle } from "../../drizzle/schema";

export interface CalculateSMARequest {
  symbol: string;
  timeframe: string;
  period: number;
  startTime?: Date;
  endTime?: Date;
  limit?: number;
}

export interface SMAResult {
  timestamp: Date;
  value: number;
}

/**
 * Calculate SMA for a symbol and store in database
 * 
 * @param request - Calculation parameters
 * @returns Array of calculated SMA values
 */
export async function calculateAndStoreSMA(request: CalculateSMARequest): Promise<SMAResult[]> {
  // Validate parameters
  const params: SMAParams = { period: request.period };
  validateSMAParams(params);

  // Fetch market data
  const candles = await getMarketCandles({
    symbol: request.symbol,
    timeframe: request.timeframe,
    startTime: request.startTime,
    endTime: request.endTime,
    limit: request.limit || 5000,
  });

  if (candles.length < request.period) {
    throw new Error(
      `Insufficient data for SMA(${request.period}): need ${request.period} candles, got ${candles.length}`
    );
  }

  // Prepare data for SMA calculation
  const priceData = candles.map((candle: MarketCandle) => ({
    timestamp: candle.timestamp,
    close: parseFloat(candle.close),
  }));

  // Calculate SMA
  const smaValues = calculateSMA(priceData, request.period);

  // Prepare data for database insertion
  const parametersJson = serializeSMAParams(params);
  const indicatorData: InsertIndicator[] = smaValues.map((sma) => ({
    symbol: request.symbol,
    timeframe: request.timeframe,
    timestamp: sma.timestamp,
    indicatorType: "SMA",
    parameters: parametersJson,
    value: sma.value.toString(),
  }));

  // Save to database
  await saveIndicatorsBatch(indicatorData);

  return smaValues;
}

/**
 * Get existing SMA values from database
 * 
 * @param symbol - Trading symbol
 * @param timeframe - Timeframe (e.g., '1m', '5m')
 * @param period - SMA period
 * @param count - Number of values to retrieve
 * @returns Array of SMA values
 */
export async function getSMA(
  symbol: string,
  timeframe: string,
  period: number,
  count: number = 100
): Promise<SMAResult[]> {
  const params: SMAParams = { period };
  validateSMAParams(params);

  const parametersJson = serializeSMAParams(params);

  const indicators = await getLatestIndicators(
    {
      symbol,
      timeframe,
      indicatorType: "SMA",
      parameters: parametersJson,
    },
    count
  );

  return indicators.map((ind) => ({
    timestamp: ind.timestamp,
    value: parseFloat(ind.value),
  }));
}

/**
 * Calculate SMA for the latest data point (real-time)
 * 
 * @param symbol - Trading symbol
 * @param timeframe - Timeframe
 * @param period - SMA period
 * @returns Latest SMA value
 */
export async function calculateLatestSMA(
  symbol: string,
  timeframe: string,
  period: number
): Promise<SMAResult | null> {
  const params: SMAParams = { period };
  validateSMAParams(params);

  // Fetch the latest candles
  const candles = await getMarketCandles({
    symbol,
    timeframe,
    limit: period,
  });

  if (candles.length < period) {
    return null;
  }

  // Prepare data
  const priceData = candles.map((candle: MarketCandle) => ({
    timestamp: candle.timestamp,
    close: parseFloat(candle.close),
  }));

  // Calculate SMA
  const smaValues = calculateSMA(priceData, period);

  if (smaValues.length === 0) {
    return null;
  }

  // Return the latest value
  return smaValues[smaValues.length - 1];
}
