import { pgTable, serial, varchar, text, timestamp, numeric, bigint, index, uniqueIndex, pgEnum } from "drizzle-orm/pg-core";

/**
 * Core user table backing auth flow.
 */
export const roleEnum = pgEnum("role", ["user", "admin"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Market data candles table
 * Maps to existing nexus_historical_prices table
 */
export const marketCandles = pgTable("nexus_historical_prices", {
  id: serial("id").primaryKey(),
  symbol: varchar("symbol", { length: 20 }).notNull(),
  timeframe: varchar("timeframe", { length: 10 }).notNull().default("1m"),
  timestamp: timestamp("timestamp").notNull(),
  
  // OHLC data
  open: numeric("open", { precision: 20, scale: 8 }).notNull(),
  high: numeric("high", { precision: 20, scale: 8 }).notNull(),
  low: numeric("low", { precision: 20, scale: 8 }).notNull(),
  close: numeric("close", { precision: 20, scale: 8 }).notNull(),
  
  // Volume data
  volume: numeric("volume", { precision: 20, scale: 8 }).notNull(),
  quoteVolume: numeric("quote_volume", { precision: 20, scale: 8 }),
  
  // Order flow data
  numberOfTrades: bigint("number_of_trades", { mode: "number" }),
  takerBuyBaseVolume: numeric("taker_buy_base_volume", { precision: 20, scale: 8 }),
  takerBuyQuoteVolume: numeric("taker_buy_quote_volume", { precision: 20, scale: 8 }),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  timestampIdx: index("timestamp_idx").on(table.timestamp),
}));

export type MarketCandle = typeof marketCandles.$inferSelect;
export type InsertMarketCandle = typeof marketCandles.$inferInsert;

/**
 * Calculated indicators table
 * Maps to existing nexus_technical_indicators table
 */
export const technicalIndicators = pgTable("nexus_technical_indicators", {
  id: serial("id").primaryKey(),
  symbol: varchar("symbol", { length: 20 }).notNull(),
  timeframe: varchar("timeframe", { length: 10 }).notNull(),
  timestamp: timestamp("timestamp").notNull(),
  
  // Existing indicator columns from Python system
  rsi14: numeric("rsi_14", { precision: 10, scale: 2 }),
  macd: numeric("macd", { precision: 20, scale: 8 }),
  macdSignal: numeric("macd_signal", { precision: 20, scale: 8 }),
  macdHistogram: numeric("macd_histogram", { precision: 20, scale: 8 }),
  bbUpper: numeric("bb_upper", { precision: 20, scale: 8 }),
  bbMiddle: numeric("bb_middle", { precision: 20, scale: 8 }),
  bbLower: numeric("bb_lower", { precision: 20, scale: 8 }),
  ema9: numeric("ema_9", { precision: 20, scale: 8 }),
  ema21: numeric("ema_21", { precision: 20, scale: 8 }),
  sma50: numeric("sma_50", { precision: 20, scale: 8 }),
  sma200: numeric("sma_200", { precision: 20, scale: 8 }),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  symbolTimeIdx: uniqueIndex("tech_ind_symbol_time_idx").on(table.symbol, table.timestamp, table.timeframe),
}));

export type TechnicalIndicator = typeof technicalIndicators.$inferSelect;
export type InsertTechnicalIndicator = typeof technicalIndicators.$inferInsert;

/**
 * Flexible indicators table for new indicator engine
 */
export const indicators = pgTable("nexus_indicators_v2", {
  id: serial("id").primaryKey(),
  symbol: varchar("symbol", { length: 20 }).notNull(),
  timeframe: varchar("timeframe", { length: 10 }).notNull().default("1m"),
  timestamp: timestamp("timestamp").notNull(),
  
  // Indicator type and parameters
  indicatorType: varchar("indicator_type", { length: 50 }).notNull(), // 'SMA', 'EMA', 'RSI', etc.
  parameters: varchar("parameters", { length: 255 }), // JSON string of parameters
  
  // Calculated value
  value: numeric("value", { precision: 20, scale: 8 }).notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  lookupIdx: uniqueIndex("indicator_v2_lookup_idx").on(
    table.symbol,
    table.timestamp,
    table.timeframe,
    table.indicatorType,
    table.parameters
  ),
  timestampIdx: index("indicator_v2_timestamp_idx").on(table.timestamp),
}));

export type Indicator = typeof indicators.$inferSelect;
export type InsertIndicator = typeof indicators.$inferInsert;

/**
 * Trading signals table
 */
export const signalTypeEnum = pgEnum("signal_type", ["BUY", "SELL", "NEUTRAL"]);
export const signalStatusEnum = pgEnum("signal_status", ["PENDING", "EXECUTED", "CANCELLED", "EXPIRED"]);

export const tradingSignals = pgTable("nexus_trading_signals", {
  id: serial("id").primaryKey(),
  symbol: varchar("symbol", { length: 20 }).notNull(),
  timeframe: varchar("timeframe", { length: 10 }).notNull(),
  timestamp: timestamp("timestamp").notNull(),
  
  // Signal details
  signalType: signalTypeEnum("signal_type").notNull(),
  strategy: varchar("strategy", { length: 100 }).notNull(),
  confidence: numeric("confidence", { precision: 5, scale: 2 }).notNull(),
  
  // Entry/Exit levels
  entryPrice: numeric("entry_price", { precision: 20, scale: 8 }),
  stopLoss: numeric("stop_loss", { precision: 20, scale: 8 }),
  takeProfit: numeric("take_profit", { precision: 20, scale: 8 }),
  
  // Signal metadata
  metadata: text("metadata"),
  
  // Execution tracking
  status: signalStatusEnum("status").default("PENDING").notNull(),
  executedAt: timestamp("executed_at"),
  executedPrice: numeric("executed_price", { precision: 20, scale: 8 }),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  symbolTimeIdx: index("signal_symbol_time_idx").on(table.symbol, table.timestamp),
  statusIdx: index("signal_status_idx").on(table.status),
}));

export type TradingSignal = typeof tradingSignals.$inferSelect;
export type InsertTradingSignal = typeof tradingSignals.$inferInsert;
