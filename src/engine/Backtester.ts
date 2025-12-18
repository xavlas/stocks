
import type { Strategy, Candle, Trade, BacktestResult, Action } from '../types/engine';
import { RuleEvaluator } from './RuleEvaluator';
import { Indicators } from './indicators';

export class Backtester {
    run(strategy: Strategy, candles: Candle[], initialCapital: number = 10000, maxTrades?: number): BacktestResult {
        const evaluator = new RuleEvaluator();
        evaluator.prepare(strategy, candles);

        let cash = initialCapital;
        let position = 0;
        const trades: Trade[] = [];
        const equityCurve: { time: string, value: number }[] = [];

        let pendingAction: Action | null = null;

        for (let i = 0; i < candles.length; i++) {
            const candle = candles[i];

            // 1. Execute Pending Action (at Open)
            if (pendingAction) {
                const price = candle.open;
                if (pendingAction.type === 'buy') {
                    // Prevent Pyramiding: Only buy if we flat (position == 0)
                    if (position === 0) {
                        const cost = price * pendingAction.quantity;
                        if (cash >= cost) {
                            // Check Max Trades limit
                            if (maxTrades !== undefined && trades.length >= maxTrades) {
                                pendingAction = null;
                            } else {
                                cash -= cost;
                                position += pendingAction.quantity;
                                trades.push({
                                    id: crypto.randomUUID(),
                                    entryDate: candle.time,
                                    entryPrice: price,
                                    quantity: pendingAction.quantity,
                                    direction: 'long',
                                    pnl: 0,
                                    status: 'open',
                                    triggeredRuleId: pendingAction.ruleId
                                });
                            }
                        }
                    }
                } else if (pendingAction.type === 'sell') {
                    if (position > 0) {
                        // Sell Logic: FIFO (Simplified: Close all matching quantity)
                        let qtyToSell = Math.min(position, pendingAction.quantity);

                        for (const trade of trades) {
                            if (trade.status === 'open' && qtyToSell > 0) {
                                trade.exitDate = candle.time;
                                trade.exitPrice = price;
                                trade.pnl = (price - trade.entryPrice) * trade.quantity;
                                trade.status = 'closed';

                                cash += (price * trade.quantity);
                                position -= trade.quantity;
                                qtyToSell -= trade.quantity;
                            }
                        }
                    }
                }
                pendingAction = null;
            }

            // 2. Evaluate Rules (at Close) -> Generate Signal for Next Open
            let signal: Action | null = null;

            // Sell Priority
            const sellRules = strategy.rules.filter(r => r.action.type === 'sell');
            for (const rule of sellRules) {
                if (evaluator.evaluate(rule, i)) {
                    signal = { ...rule.action, ruleId: rule.id };
                    break;
                }
            }

            if (!signal) {
                const buyRules = strategy.rules.filter(r => r.action.type === 'buy');
                for (const rule of buyRules) {
                    if (evaluator.evaluate(rule, i)) {
                        signal = { ...rule.action, ruleId: rule.id };
                        break;
                    }
                }
            }

            if (signal) {
                pendingAction = signal;
            }

            // 3. Mark to Market
            const currentEquity = cash + (position * candle.close);
            equityCurve.push({ time: candle.time, value: currentEquity });
        }

        // Metrics
        const endEquity = equityCurve.length > 0 ? equityCurve[equityCurve.length - 1].value : initialCapital;
        const totalReturn = ((endEquity - initialCapital) / initialCapital) * 100;
        const closedTrades = trades.filter(t => t.status === 'closed');
        const wins = closedTrades.filter(t => t.pnl > 0).length;

        // Max Drawdown
        let peak = -Infinity;
        let maxDrawdown = 0;
        for (const point of equityCurve) {
            if (point.value > peak) peak = point.value;
            const dd = (peak - point.value) / peak * 100;
            if (dd > maxDrawdown) maxDrawdown = dd;
        }

        // Generate Debug Indicators for Overlay
        const debugIndicators: { name: string, data: { time: string, value: number }[], color?: string }[] = [];
        // Extract unique indicators from rules
        const uniqueIndicators = new Set<string>();
        for (const rule of strategy.rules) {
            if (rule.condition.left.type === 'sma' || rule.condition.left.type === 'ema') {
                uniqueIndicators.add(`${rule.condition.left.type}:${rule.condition.left.period}`);
            }
            if (rule.condition.right && rule.condition.right.type === 'indicator' && rule.condition.right.indicator) {
                const ind = rule.condition.right.indicator;
                if (ind.type === 'sma' || ind.type === 'ema') {
                    uniqueIndicators.add(`${ind.type}:${ind.period}`);
                }
            }
        }

        const closes = candles.map(c => c.close);
        uniqueIndicators.forEach(ui => {
            const [type, periodStr] = ui.split(':');
            const p = Number(periodStr) || 14;
            let values: number[] = [];
            let color = '#FFA726'; // Default Orange

            if (type === 'sma') {
                values = Indicators.sma(closes, p);
                color = '#2962FF'; // Blueish
            } else if (type === 'ema') {
                values = Indicators.ema(closes, p);
                color = '#E91E63'; // Pinkish
            }

            const seriesData = candles.map((c, i) => ({
                time: c.time,
                value: values[i]
            })).filter(d => !isNaN(d.value));

            debugIndicators.push({
                name: `${type.toUpperCase()} ${p}`,
                data: seriesData,
                color
            });
        });

        return {
            trades,
            equityCurve,
            metrics: {
                totalReturn,
                netProfit: endEquity - initialCapital,
                totalTrades: trades.length,
                winRate: closedTrades.length > 0 ? (wins / closedTrades.length) * 100 : 0,
                maxDrawdown
            },
            candles,
            debugIndicators,
            strategy
        };
    }
}
