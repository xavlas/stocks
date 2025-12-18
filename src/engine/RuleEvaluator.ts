
import type { Candle, Rule, Strategy, IndicatorConfig } from '../types/engine';
import { Indicators } from './indicators';

type IndicatorCache = Record<string, number[]>;

export class RuleEvaluator {
    private cache: IndicatorCache = {};
    // private _candles: Candle[] = [];
    private prices: number[] = [];

    // Helper to get Signal Line for MACD if needed. 
    // Since our IndicatorConfig is simple, we might need a convention.
    // But let's assume 'macd' return MACD line.

    prepare(strategy: Strategy, candles: Candle[]) {
        // this._candles = candles;
        this.prices = candles.map(c => c.close);
        this.cache = {};

        strategy.rules.forEach(rule => {
            this.ensureIndicator(rule.condition.left);
            if (rule.condition.right && rule.condition.right.type === 'indicator' && rule.condition.right.indicator) {
                this.ensureIndicator(rule.condition.right.indicator);
            }
        });
    }

    private ensureIndicator(config: IndicatorConfig) {
        if (!config) return;
        const key = JSON.stringify(config);
        if (this.cache[key]) return;

        let result: number[] = [];
        const data = this.prices;

        switch (config.type) {
            case 'price':
                result = this.prices;
                break;
            case 'roc':
                result = Indicators.roc(data, config.period || 14);
                break;
            case 'sma':
                result = Indicators.sma(data, config.period || 14);
                break;
            case 'ema':
                result = Indicators.ema(data, config.period || 14);
                break;
            case 'rsi':
                result = Indicators.rsi(data, config.period || 14);
                break;
            case 'macd':
                // Assuming defaults if not provided?
                const fast = config.fastPeriod || 12;
                const slow = config.slowPeriod || 26;
                const sig = config.signalPeriod || 9;
                const res = Indicators.macd(data, fast, slow, sig);
                result = res.macd;
                // Note: We are losing Signal line access here with this Config structure.
                // Future improvement: Add 'part': 'line' | 'signal' | 'histogram' to IndicatorConfig.
                // For now, only MACD Line is supported for comparison.
                break;
        }
        this.cache[key] = result;
    }

    evaluate(rule: Rule, index: number): boolean {
        const { left, operator, right } = rule.condition;

        const leftVal = this.getValue(left, index);
        let rightVal = 0;

        if (right.type === 'value') {
            rightVal = right.value || 0;
        } else if (right.indicator) {
            rightVal = this.getValue(right.indicator, index);
        }

        // Apply Offset if present (e.g. "Right val + 3%")
        if (right.offsetPercent) {
            rightVal = rightVal * (1 + right.offsetPercent / 100);
        }

        if (isNaN(leftVal) || isNaN(rightVal)) return false;

        switch (operator) {
            case '>': return leftVal > rightVal;
            case '<': return leftVal < rightVal;
            case '>=': return leftVal >= rightVal;
            case '<=': return leftVal <= rightVal;
            case '==': return leftVal === rightVal;
        }
        return false;
    }

    private getValue(config: IndicatorConfig, index: number): number {
        const key = JSON.stringify(config);
        return this.cache[key] ? this.cache[key][index] : NaN;
    }
}
