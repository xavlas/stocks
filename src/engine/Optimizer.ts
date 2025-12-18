import type { Strategy, Rule, IndicatorConfig, IndicatorType, Candle } from '../types/engine';
import { Backtester } from './Backtester';

export class Optimizer {
    static generateRandomStrategy(id: string, initialCapital: number, avgPrice: number): Strategy {
        // Calculate maximum quantity we can afford with initial capital
        // Reserve 10% for safety margin
        const maxQuantity = Math.floor((initialCapital * 0.9) / avgPrice);
        const quantity = Math.max(1, maxQuantity); // At least 1 share

        // Generate exactly 1 buy rule and 1 sell rule with same quantity
        const buyRule = this.generateRandomRule('buy', quantity);
        const sellRule = this.generateRandomRule('sell', quantity);

        return {
            id,
            name: 'AI Generated',
            rules: [buyRule, sellRule]
        };
    }

    private static generateRandomRule(actionType: 'buy' | 'sell', quantity: number): Rule {
        const indicators: IndicatorType[] = ['sma', 'ema', 'rsi', 'roc', 'price']; // Exclude MACD for simplicity of random gen

        const leftType = indicators[Math.floor(Math.random() * indicators.length)];
        const left: IndicatorConfig = {
            type: leftType,
            period: this.randomPeriod(leftType)
        };

        const rightType = Math.random() > 0.5 ? 'value' : 'indicator';
        let rightIndicator: IndicatorConfig | undefined;
        let rightValue: number | undefined;

        if (rightType === 'indicator') {
            const t = indicators[Math.floor(Math.random() * indicators.length)];
            rightIndicator = { type: t, period: this.randomPeriod(t) };
        } else {
            // Random reasonable values based on left type
            if (leftType === 'rsi') rightValue = Math.floor(Math.random() * 70) + 15;
            else if (leftType === 'roc') rightValue = Math.floor(Math.random() * 10) - 5;
            else rightValue = 0; // Prices/MA comparisons usually against indicator, not static value unless 0
        }

        return {
            id: crypto.randomUUID(),
            condition: {
                left,
                operator: Math.random() > 0.5 ? '>' : '<', // Randomize operator
                right: {
                    type: rightType,
                    indicator: rightIndicator,
                    value: rightValue,
                    offsetPercent: Math.random() > 0.8 ? Math.floor(Math.random() * 10) - 5 : undefined // 20% chance of offset
                }
            },
            action: { type: actionType, quantity }
        };
    }

    private static randomPeriod(type: IndicatorType): number {
        if (type === 'rsi') return Math.floor(Math.random() * 20) + 5;
        if (type === 'roc') return Math.floor(Math.random() * 20) + 1;
        if (type === 'price') return 0;
        return Math.floor(Math.random() * 190) + 10; // SMA/EMA 10-200
    }

    static async optimize(
        candles: Candle[],
        initialCapital: number,
        baseStrategy: Strategy,
        durationMs: number = 5000,
        onProgress: (progress: string) => void
    ): Promise<Strategy> {
        let bestStrategy = baseStrategy;
        let bestProfit = -Infinity;

        const startTime = Date.now();
        let iterations = 0;

        // Calculate average price for quantity estimation
        const avgPrice = candles.reduce((sum, c) => sum + c.close, 0) / candles.length;

        // Run baseline
        const backtester = new Backtester();
        const baseline = backtester.run(bestStrategy, candles, initialCapital);
        bestProfit = baseline.metrics.netProfit;

        // Loop using setImmediate logic to not block UI completely (chunking)
        return new Promise((resolve) => {
            const tick = () => {
                const now = Date.now();
                if (now - startTime > durationMs) {
                    onProgress(`Optimized ${iterations} strategies. Best Net Profit: $${bestProfit.toFixed(2)}`);
                    resolve(bestStrategy);
                    return;
                }

                // Run a chunk of X iterations
                for (let i = 0; i < 50; i++) {
                    const candidate = this.generateRandomStrategy(crypto.randomUUID(), initialCapital, avgPrice);
                    const bt = new Backtester();
                    const res = bt.run(candidate, candles, initialCapital);

                    if (res.metrics.netProfit > bestProfit) {
                        bestProfit = res.metrics.netProfit;
                        bestStrategy = candidate;
                    }
                    iterations++;
                }

                // Yield to main thread
                // Report roughly every 500 iterations or so
                if (iterations % 500 === 0) {
                    onProgress(`Thinking... ${((now - startTime) / durationMs * 100).toFixed(0)}%`);
                }

                setTimeout(tick, 0);
            };
            tick();
        });
    }
}
