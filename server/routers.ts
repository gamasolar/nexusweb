import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { calculateAndStoreSMA, getSMA, calculateLatestSMA } from "./services/smaService";

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
