
import { describe, it, expect } from 'vitest';
import { Backtester } from '../../src/engine/Backtester';
import { Strategy, Candle } from '../../src/types/engine';

describe('Backtester', () => {
    const candles: Candle[] = [
        { time: '2023-01-01', open: 10, high: 12, low: 10, close: 11, volume: 100 },
        { time: '2023-01-02', open: 11, high: 14, low: 11, close: 13, volume: 100 },
        { time: '2023-01-03', open: 13, high: 15, low: 13, close: 15, volume: 100 },
        { time: '2023-01-04', open: 15, high: 16, low: 15, close: 16, volume: 100 },
        { time: '2023-01-05', open: 16, high: 16, low: 10, close: 10, volume: 100 }
    ];

    it('should execute buy strategy', () => {
        const strategy: Strategy = {
            id: 'test',
            name: 'Test',
            rules: [
                {
                    id: 'r1',
                    condition: {
                        left: { type: 'price' },
                        operator: '>',
                        right: { type: 'value', value: 12 }
                    },
                    action: { type: 'buy', quantity: 10 }
                }
            ]
        };

        const backtester = new Backtester();
        const res = backtester.run(strategy, candles, 1000);

        // Day 2 Close (13) > 12 -> Signal Buy.
        // Day 3 Open (13) -> Exec Buy 10 units.

        expect(res.trades.length).toBeGreaterThanOrEqual(1);
        const t1 = res.trades[0];
        expect(t1.entryDate).toBe('2023-01-03');
        expect(t1.entryPrice).toBe(13);
        expect(t1.quantity).toBe(10);

        // Check Equity
        // Day 3 Close 15. Pos 10. Value 150. Cash 870. Equity 1020.
        // Initial 1000.
        const day3 = res.equityCurve.find(e => e.time === '2023-01-03');
        expect(day3?.value).toBe(1020);
    });
});
