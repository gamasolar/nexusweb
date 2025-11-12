import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, bigint, index, uniqueIndex } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Market data candles table
 * Stores OHLCV + order flow data from Binance
 */
export const marketCandles = mysqlTable("market_candles", {
  id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
  symbol: varchar("symbol", { length: 20 }).notNull(),
  timeframe: varchar("timeframe", { length: 10 }).notNull().default("1m"),
  timestamp: timestamp("timestamp").notNull(),
  
  // OHLC data
  open: decimal("open", { precision: 20, scale: 8 }).notNull(),
  high: decimal("high", { precision: 20, scale: 8 }).notNull(),
  low: decimal("low", { precision: 20, scale: 8 }).notNull(),
  close: decimal("close", { precision: 20, scale: 8 }).notNull(),
  
  // Volume data
  volume: decimal("volume", { precision: 20, scale: 8 }).notNull(),
  quoteVolume: decimal("quoteVolume", { precision: 20, scale: 8 }),
  
  // Order flow data
  numberOfTrades: int("numberOfTrades"),
  takerBuyBaseVolume: decimal("takerBuyBaseVolume", { precision: 20, scale: 8 }),
  takerBuyQuoteVolume: decimal("takerBuyQuoteVolume", { precision: 20, scale: 8 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  symbolTimeIdx: uniqueIndex("symbol_time_idx").on(table.symbol, table.timestamp, table.timeframe),
  timestampIdx: index("timestamp_idx").on(table.timestamp),
}));

export type MarketCandle = typeof marketCandles.$inferSelect;
export type InsertMarketCandle = typeof marketCandles.$inferInsert;

/**
 * Calculated indicators table
 * Stores pre-calculated indicator values for performance
 */
export const indicators = mysqlTable("indicators", {
  id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
  symbol: varchar("symbol", { length: 20 }).notNull(),
  timeframe: varchar("timeframe", { length: 10 }).notNull().default("1m"),
  timestamp: timestamp("timestamp").notNull(),
  
  // Indicator type and parameters
  indicatorType: varchar("indicatorType", { length: 50 }).notNull(), // 'SMA', 'EMA', 'RSI', etc.
  parameters: varchar("parameters", { length: 255 }), // JSON string of parameters, e.g., '{"period": 20}'
  
  // Calculated value
  value: decimal("value", { precision: 20, scale: 8 }).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  lookupIdx: uniqueIndex("indicator_lookup_idx").on(
    table.symbol,
    table.timestamp,
    table.timeframe,
    table.indicatorType,
    table.parameters
  ),
  timestampIdx: index("indicator_timestamp_idx").on(table.timestamp),
}));

export type Indicator = typeof indicators.$inferSelect;
export type InsertIndicator = typeof indicators.$inferInsert;

/**
 * Trading signals table
 * Stores generated trading signals from strategies
 */
export const tradingSignals = mysqlTable("trading_signals", {
  id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
  symbol: varchar("symbol", { length: 20 }).notNull(),
  timeframe: varchar("timeframe", { length: 10 }).notNull(),
  timestamp: timestamp("timestamp").notNull(),
  
  // Signal details
  signalType: mysqlEnum("signalType", ["BUY", "SELL", "NEUTRAL"]).notNull(),
  strategy: varchar("strategy", { length: 100 }).notNull(), // Strategy name that generated this signal
  confidence: decimal("confidence", { precision: 5, scale: 2 }).notNull(), // 0-100
  
  // Entry/Exit levels
  entryPrice: decimal("entryPrice", { precision: 20, scale: 8 }),
  stopLoss: decimal("stopLoss", { precision: 20, scale: 8 }),
  takeProfit: decimal("takeProfit", { precision: 20, scale: 8 }),
  
  // Signal metadata
  metadata: text("metadata"), // JSON string with additional signal data
  
  // Execution tracking
  status: mysqlEnum("status", ["PENDING", "EXECUTED", "CANCELLED", "EXPIRED"]).default("PENDING").notNull(),
  executedAt: timestamp("executedAt"),
  executedPrice: decimal("executedPrice", { precision: 20, scale: 8 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  symbolTimeIdx: index("signal_symbol_time_idx").on(table.symbol, table.timestamp),
  statusIdx: index("signal_status_idx").on(table.status),
}));

export type TradingSignal = typeof tradingSignals.$inferSelect;
export type InsertTradingSignal = typeof tradingSignals.$inferInsert;
