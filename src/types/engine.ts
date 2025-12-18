
export interface Candle {
    time: string; // 'YYYY-MM-DD'
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export type Operator = '>' | '<' | '>=' | '<=' | '==';
export type IndicatorType = 'price' | 'sma' | 'ema' | 'rsi' | 'macd' | 'roc';

export interface IndicatorConfig {
    type: IndicatorType;
    period?: number; // For SMA, RSI
    source?: 'input' | 'indicator'; // Source of data (e.g. price or another indicator) -> Simplification: Just calculate on Close price usually
    // MACD params
    fastPeriod?: number;
    slowPeriod?: number;
    signalPeriod?: number;
}

export interface Condition {
    indicator: IndicatorConfig;
    operator: Operator;
    value: number; // Threshold
}

// Simplified for MVP rule: Indicator vs Value
// Advanced: Indicator vs Indicator (e.g. SMA(50) > SMA(200))
// For MVP, user story says "Buy when price > X" or "Simple Moving Average Crossover".
// Crossover implies Ind A > Ind B.
// Let's stick to the contract from `engine-api.ts` which was `indicator: 'price'`
// But user updated requirements to include SMA, MACD, RSI.
// So I need to expand the Condition to support Indicator vs Indicator or Indicator vs Value.

export interface ConditionV2 {
    left: IndicatorConfig;
    operator: Operator;
    right: {
        type: 'value' | 'indicator';
        value?: number;
        indicator?: IndicatorConfig;
        offsetPercent?: number; // Explicit offset in %, e.g. 3 or -3
    };
}
// For now, let's keep it compatible with the previous simple contract but extensible
// or update the contract. I'll stick to a robust definition.

export interface Action {
    type: 'buy' | 'sell';
    quantity: number; // Units
    ruleId?: string; // ID of the rule that triggered this action
}

export interface Rule {
    id: string;
    condition: ConditionV2;
    action: Action;
}

export interface Strategy {
    id: string;
    name: string;
    rules: Rule[];
}

export interface Trade {
    id: string;
    entryDate: string;
    entryPrice: number;
    exitDate?: string;
    exitPrice?: number;
    quantity: number;
    direction: 'long';
    pnl: number;
    status: 'open' | 'closed';
    triggeredRuleId?: string; // ID of the rule that triggered this trade
}

export interface BacktestMetrics {
    totalReturn: number;
    netProfit: number;
    totalTrades: number;
    winRate: number;
    maxDrawdown: number;
}

export interface BacktestResult {
    trades: Trade[];
    equityCurve: { time: string; value: number }[];
    metrics: BacktestMetrics;
    candles: Candle[];
    debugIndicators?: { name: string, data: { time: string, value: number }[], color?: string }[];
    strategy?: Strategy; // Include strategy for rule lookup
}
