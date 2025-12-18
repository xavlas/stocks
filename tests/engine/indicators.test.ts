
import { describe, it, expect } from 'vitest';
import { Indicators } from '../../src/engine/indicators';

describe('Indicators', () => {
    const prices = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]; // Linear growth

    it('SMA should calculate correctly', () => {
        const sma = Indicators.sma(prices, 5);
        expect(sma[4]).toBe(12); // (10+11+12+13+14)/5 = 60/5 = 12
        expect(sma[5]).toBe(13);
        expect(isNaN(sma[3])).toBe(true);
    });

    it('EMA should calculate correctly', () => {
        const ema = Indicators.ema(prices, 5);
        expect(ema[4]).toBe(12); // First is SMA
        // Next: (15 - 12) * (2/6) + 12 = 3 * 1/3 + 12 = 13.
        expect(ema[5]).toBeCloseTo(13, 5);
    });

    it('RSI should return valid range', () => {
        const volatile = [10, 12, 11, 13, 10, 15, 12, 16, 14, 18, 15, 20, 18, 22, 20, 25];
        const rsi = Indicators.rsi(volatile, 5); // Use small period
        const val = rsi[rsi.length - 1];
        expect(val).toBeGreaterThan(0);
        expect(val).toBeLessThan(100);
    });

    it('MACD should return components', () => {
        const data = new Array(50).fill(0).map((_, i) => i);
        const res = Indicators.macd(data, 12, 26, 9);
        expect(res.macd).toHaveLength(50);
        expect(res.signal).toHaveLength(50);
        expect(res.histogram).toHaveLength(50);
    });
});
