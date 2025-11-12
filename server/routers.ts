import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { calculateAndStoreSMA, getSMA, calculateLatestSMA } from "./services/smaService";
import { getDb, getMarketCandles } from "./db";
import { sql } from "drizzle-orm";
import { marketCandles } from "../drizzle/schema";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // NEXUS Data API
  nexus: router({
    // Test connection and get database stats
    getStats: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }
      
      // Query total candles
      const totalResult = await db.execute(sql`
        SELECT COUNT(*) as total FROM nexus_historical_prices
      `) as any;
      
      // Query distinct symbols
      const symbolsResult = await db.execute(sql`
        SELECT DISTINCT symbol FROM nexus_historical_prices ORDER BY symbol
      `) as any;
      
      const total = totalResult[0]?.total || 0;
      const symbols = symbolsResult.map((r: any) => r.symbol);
      
      return {
        totalCandles: Number(total),
        symbols,
        connected: true,
      };
    }),
    
    // Get latest candles for a symbol
    getLatestCandles: publicProcedure
      .input(z.object({
        symbol: z.string().default("BTCUSDT"),
        timeframe: z.string().default("1m"),
        limit: z.number().default(100),
      }))
      .query(async ({ input }) => {
        return await getMarketCandles({
          symbol: input.symbol,
          timeframe: input.timeframe,
          limit: input.limit,
        });
      }),
  }),
  
  // Indicators API
  indicators: router({
    // Calculate and store SMA for historical data
    calculateSMA: protectedProcedure
      .input(
        z.object({
          symbol: z.string(),
          timeframe: z.string(),
          period: z.number().int().positive(),
          startTime: z.date().optional(),
          endTime: z.date().optional(),
          limit: z.number().int().positive().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const result = await calculateAndStoreSMA(input);
        return {
          success: true,
          count: result.length,
          data: result,
        };
      }),

    // Get existing SMA values
    getSMA: publicProcedure
      .input(
        z.object({
          symbol: z.string(),
          timeframe: z.string(),
          period: z.number().int().positive(),
          count: z.number().int().positive().optional(),
        })
      )
      .query(async ({ input }) => {
        const result = await getSMA(
          input.symbol,
          input.timeframe,
          input.period,
          input.count
        );
        return result;
      }),

    // Get latest SMA value (real-time)
    getLatestSMA: publicProcedure
      .input(
        z.object({
          symbol: z.string(),
          timeframe: z.string(),
          period: z.number().int().positive(),
        })
      )
      .query(async ({ input }) => {
        const result = await calculateLatestSMA(
          input.symbol,
          input.timeframe,
          input.period
        );
        return result;
      }),
  }),
});

export type AppRouter = typeof appRouter;
