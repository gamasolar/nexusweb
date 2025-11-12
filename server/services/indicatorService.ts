/**
 * Indicator Service
 * 
 * Handles storage and retrieval of calculated indicators from the database.
 * Provides caching layer for performance optimization.
 */

import { eq, and, desc } from "drizzle-orm";
import { indicators, type Indicator, type InsertIndicator } from "../../drizzle/schema";
import { getDb } from "../db";

export interface IndicatorQuery {
  symbol: string;
  timeframe: string;
  indicatorType: string;
  parameters: string;
  timestamp?: Date;
}

/**
 * Save a single indicator value to the database
 */
export async function saveIndicator(data: InsertIndicator): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.insert(indicators).values(data).onConflictDoUpdate({
    target: [indicators.symbol, indicators.timestamp, indicators.timeframe, indicators.indicatorType, indicators.parameters],
    set: {
      value: data.value,
      updatedAt: new Date(),
    },
  });
}

/**
 * Save multiple indicator values in a batch
 */
export async function saveIndicatorsBatch(data: InsertIndicator[]): Promise<void> {
  if (data.length === 0) return;

  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Insert in batches of 1000 to avoid query size limits
  const batchSize = 1000;
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    await db.insert(indicators).values(batch).onConflictDoNothing();
  }
}

/**
 * Get indicator value for a specific timestamp
 */
export async function getIndicator(query: IndicatorQuery): Promise<Indicator | undefined> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const conditions = [
    eq(indicators.symbol, query.symbol),
    eq(indicators.timeframe, query.timeframe),
    eq(indicators.indicatorType, query.indicatorType),
    eq(indicators.parameters, query.parameters),
  ];

  if (query.timestamp) {
    conditions.push(eq(indicators.timestamp, query.timestamp));
  }

  const result = await db
    .select()
    .from(indicators)
    .where(and(...conditions))
    .limit(1);

  return result[0];
}

/**
 * Get multiple indicator values within a time range
 */
export async function getIndicators(
  query: Omit<IndicatorQuery, "timestamp">,
  startTime: Date,
  endTime: Date,
  limit: number = 1000
): Promise<Indicator[]> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db
    .select()
    .from(indicators)
    .where(
      and(
        eq(indicators.symbol, query.symbol),
        eq(indicators.timeframe, query.timeframe),
        eq(indicators.indicatorType, query.indicatorType),
        eq(indicators.parameters, query.parameters)
      )
    )
    .orderBy(desc(indicators.timestamp))
    .limit(limit);

  return result;
}

/**
 * Get the latest N indicator values
 */
export async function getLatestIndicators(
  query: Omit<IndicatorQuery, "timestamp">,
  count: number = 100
): Promise<Indicator[]> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db
    .select()
    .from(indicators)
    .where(
      and(
        eq(indicators.symbol, query.symbol),
        eq(indicators.timeframe, query.timeframe),
        eq(indicators.indicatorType, query.indicatorType),
        eq(indicators.parameters, query.parameters)
      )
    )
    .orderBy(desc(indicators.timestamp))
    .limit(count);

  return result.reverse(); // Return in chronological order
}

/**
 * Delete indicators for a specific symbol and type
 * Useful for recalculation or cleanup
 */
export async function deleteIndicators(query: Omit<IndicatorQuery, "timestamp">): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db
    .delete(indicators)
    .where(
      and(
        eq(indicators.symbol, query.symbol),
        eq(indicators.timeframe, query.timeframe),
        eq(indicators.indicatorType, query.indicatorType),
        eq(indicators.parameters, query.parameters)
      )
    );
}
