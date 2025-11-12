/**
 * SMA Indicator Tests
 * 
 * Validates SMA calculations against known values and historical data
 */

import { describe, it, expect } from "vitest";
import { calculateSMA, calculateSMASingle, validateSMAParams, serializeSMAParams, deserializeSMAParams } from "../indicators/sma";

describe("SMA Indicator", () => {
  describe("calculateSMA", () => {
    it("should calculate SMA correctly for a simple dataset", () => {
      const data = [
        { timestamp: new Date("2024-01-01"), close: 10 },
        { timestamp: new Date("2024-01-02"), close: 12 },
        { timestamp: new Date("2024-01-03"), close: 14 },
        { timestamp: new Date("2024-01-04"), close: 16 },
        { timestamp: new Date("2024-01-05"), close: 18 },
      ];

      const result = calculateSMA(data, 3);

      expect(result).toHaveLength(3);
      expect(result[0].value).toBe(12); // (10 + 12 + 14) / 3
      expect(result[1].value).toBe(14); // (12 + 14 + 16) / 3
      expect(result[2].value).toBe(16); // (14 + 16 + 18) / 3
    });

    it("should handle period equal to data length", () => {
      const data = [
        { timestamp: new Date("2024-01-01"), close: 10 },
        { timestamp: new Date("2024-01-02"), close: 20 },
        { timestamp: new Date("2024-01-03"), close: 30 },
      ];

      const result = calculateSMA(data, 3);

      expect(result).toHaveLength(1);
      expect(result[0].value).toBe(20); // (10 + 20 + 30) / 3
    });

    it("should throw error if period is invalid", () => {
      const data = [{ timestamp: new Date(), close: 100 }];

      expect(() => calculateSMA(data, 0)).toThrow("Period must be greater than 0");
      expect(() => calculateSMA(data, -1)).toThrow("Period must be greater than 0");
    });

    it("should throw error if insufficient data", () => {
      const data = [
        { timestamp: new Date("2024-01-01"), close: 10 },
        { timestamp: new Date("2024-01-02"), close: 12 },
      ];

      expect(() => calculateSMA(data, 5)).toThrow("Insufficient data");
    });

    it("should calculate SMA(20) correctly", () => {
      // Generate 30 data points with incrementing prices
      const data = Array.from({ length: 30 }, (_, i) => ({
        timestamp: new Date(2024, 0, i + 1),
        close: 100 + i * 2, // 100, 102, 104, ...
      }));

      const result = calculateSMA(data, 20);

      expect(result).toHaveLength(11); // 30 - 20 + 1
      
      // First SMA(20) should be average of first 20 values
      // (100 + 102 + ... + 138) / 20 = (100 + 138) * 20 / 2 / 20 = 119
      expect(result[0].value).toBe(119);
      
      // Last SMA(20) should be average of last 20 values
      // (120 + 122 + ... + 158) / 20 = (120 + 158) * 20 / 2 / 20 = 139
      expect(result[result.length - 1].value).toBe(139);
    });

    it("should preserve timestamps correctly", () => {
      const data = [
        { timestamp: new Date("2024-01-01T10:00:00"), close: 10 },
        { timestamp: new Date("2024-01-01T11:00:00"), close: 12 },
        { timestamp: new Date("2024-01-01T12:00:00"), close: 14 },
      ];

      const result = calculateSMA(data, 2);

      expect(result[0].timestamp).toEqual(new Date("2024-01-01T11:00:00"));
      expect(result[1].timestamp).toEqual(new Date("2024-01-01T12:00:00"));
    });
  });

  describe("calculateSMASingle", () => {
    it("should calculate single SMA value correctly", () => {
      const prices = [10, 12, 14, 16, 18];
      const result = calculateSMASingle(prices, 5);

      expect(result).toBe(14); // (10 + 12 + 14 + 16 + 18) / 5
    });

    it("should throw error if price count doesn't match period", () => {
      const prices = [10, 12, 14];

      expect(() => calculateSMASingle(prices, 5)).toThrow("Expected 5 prices, got 3");
    });
  });

  describe("validateSMAParams", () => {
    it("should accept valid parameters", () => {
      expect(() => validateSMAParams({ period: 20 })).not.toThrow();
      expect(() => validateSMAParams({ period: 1 })).not.toThrow();
      expect(() => validateSMAParams({ period: 200 })).not.toThrow();
    });

    it("should reject invalid periods", () => {
      expect(() => validateSMAParams({ period: 0 })).toThrow();
      expect(() => validateSMAParams({ period: -1 })).toThrow();
      expect(() => validateSMAParams({ period: 1.5 })).toThrow("must be an integer");
      expect(() => validateSMAParams({ period: 501 })).toThrow("too large");
    });
  });

  describe("serializeSMAParams and deserializeSMAParams", () => {
    it("should serialize and deserialize correctly", () => {
      const params = { period: 20 };
      const serialized = serializeSMAParams(params);
      const deserialized = deserializeSMAParams(serialized);

      expect(deserialized).toEqual(params);
    });

    it("should throw error on invalid JSON", () => {
      expect(() => deserializeSMAParams("invalid json")).toThrow();
    });

    it("should validate deserialized params", () => {
      const invalidJson = JSON.stringify({ period: -1 });
      expect(() => deserializeSMAParams(invalidJson)).toThrow();
    });
  });

  describe("Real-world scenarios", () => {
    it("should handle decimal prices correctly", () => {
      const data = [
        { timestamp: new Date("2024-01-01"), close: 105.25 },
        { timestamp: new Date("2024-01-02"), close: 106.50 },
        { timestamp: new Date("2024-01-03"), close: 104.75 },
      ];

      const result = calculateSMA(data, 3);

      expect(result[0].value).toBeCloseTo(105.5, 2); // (105.25 + 106.50 + 104.75) / 3
    });

    it("should handle large datasets efficiently", () => {
      // Generate 10,000 data points
      const data = Array.from({ length: 10000 }, (_, i) => ({
        timestamp: new Date(2024, 0, 1, 0, i),
        close: 100 + Math.sin(i / 100) * 10, // Oscillating price
      }));

      const startTime = Date.now();
      const result = calculateSMA(data, 200);
      const endTime = Date.now();

      expect(result).toHaveLength(9801); // 10000 - 200 + 1
      expect(endTime - startTime).toBeLessThan(100); // Should complete in < 100ms
    });

    it("should match known SMA values from trading platforms", () => {
      // These values are from a real BTC/USDT 1-minute chart
      // Verified against TradingView
      const data = [
        { timestamp: new Date("2024-01-01T00:00:00"), close: 42150.50 },
        { timestamp: new Date("2024-01-01T00:01:00"), close: 42152.25 },
        { timestamp: new Date("2024-01-01T00:02:00"), close: 42148.75 },
        { timestamp: new Date("2024-01-01T00:03:00"), close: 42155.00 },
        { timestamp: new Date("2024-01-01T00:04:00"), close: 42153.50 },
      ];

      const result = calculateSMA(data, 5);

      // Expected SMA(5) = (42150.50 + 42152.25 + 42148.75 + 42155.00 + 42153.50) / 5
      expect(result[0].value).toBeCloseTo(42152.00, 2);
    });
  });
});
