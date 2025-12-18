/**
 * Engine Interface Definitions
 * These contracts define the interaction between the UI and the Backtesting Engine.
 */

// --- Types ---

export interface Candle {
    time: string; // 'YYYY-MM-DD'
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export type Operator = '>' | '<' | '>=' | '<=' | '==';

export interface Condition {
    indicator: 'price'; // For MVP, only price supported initially, maybe SMA later
    operator: Operator;
    value: number;
}

export interface Action {
    type: 'buy' | 'sell';
    quantity: number;
}

export interface Rule {
    id: string;
    condition: Condition;
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
    direction: 'long'; // MVP: Long only
    pnl: number;
    status: 'open' | 'closed';
}

export interface BacktestMetrics {
    totalReturn: number; // %
    netProfit: number;
    totalTrades: number;
    winRate: number; // %
}

export interface BacktestResult {
    trades: Trade[];
    equityCurve: { time: string; value: number }[];
    metrics: BacktestMetrics;
}

// --- Service Interfaces ---

export interface IBacktester {
    /**
     * Runs the simulation.
     * @param strategy The user defined strategy.
     * @param data The historical market data.
     * @param initialCapital Starting cash (default 10000).
     */
    run(strategy: Strategy, data: Candle[], initialCapital?: number): BacktestResult;
}

export interface IMarketDataService {
    /**
     * Fetches historical data for an asset.
     */
    getHistory(symbol: string): Promise<Candle[]>;

    /**
     * Returns list of available assets.
     */
    getAvailableAssets(): Promise<{ symbol: string; name: string }[]>;
}
