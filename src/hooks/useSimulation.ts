
import { useState } from 'react';
import { Backtester } from '../engine/Backtester';
import { MarketDataService } from '../engine/MarketDataService';
import type { Strategy, BacktestResult } from '../types/engine';

export const useSimulation = () => {
    const [isRunning, setIsRunning] = useState(false);
    const [result, setResult] = useState<BacktestResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const runSimulation = async (strategy: Strategy, symbol: string, start: string, end: string, initialCapital: number, limit?: number) => {
        setIsRunning(true);
        setError(null);
        setResult(null);

        if (strategy.rules.length === 0) {
            setError("Please define at least one rule before running.");
            setIsRunning(false);
            return;
        }

        // Use timeout to allow UI to update to 'Running' (JS is single threaded)
        setTimeout(async () => {
            try {
                const dataService = new MarketDataService();
                const fullData = await dataService.getHistory(symbol);

                const data = fullData.filter(d => d.time >= start && d.time <= end);

                if (data.length === 0) {
                    throw new Error('No data for selected range');
                }

                const backtester = new Backtester();
                const res = backtester.run(strategy, data, initialCapital, limit);
                setResult(res);
            } catch (e: any) {
                setError(e.message);
            } finally {
                setIsRunning(false);
            }
        }, 50);
    };

    return { runSimulation, isRunning, result, error };
};
