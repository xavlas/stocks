
import React, { useState, useEffect } from 'react';
import { MarketDataService } from '../engine/MarketDataService';
import { Optimizer } from '../engine/Optimizer';
import { useStrategy } from '../context/StrategyContext';
import styles from './BacktestConfig.module.css';

interface Props {
    onRun: (symbol: string, startDate: string, endDate: string, initialCapital: number, maxTrades?: number) => void;
    isRunning: boolean;
}

export const BacktestConfig: React.FC<Props> = ({ onRun, isRunning }) => {
    const { strategy, setStrategy } = useStrategy();
    const [assets, setAssets] = useState<{ symbol: string, name: string }[]>([]);
    const [selectedAsset, setSelectedAsset] = useState('AAPL');
    const [startDate, setStartDate] = useState('2020-01-01');
    const [endDate, setEndDate] = useState('2023-12-31');

    const [maxTrades, setMaxTrades] = useState<number | undefined>(undefined);
    const [initialCapital, setInitialCapital] = useState(10000);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [thinkProgress, setThinkProgress] = useState('');

    useEffect(() => {
        new MarketDataService().getAvailableAssets().then(setAssets);
    }, []);

    const handleUpdateData = async () => {
        setIsUpdating(true);
        try {
            // Force fetch with 'true' flag to hit Yahoo via Proxy
            const service = new MarketDataService();
            const newData = await service.getHistory(selectedAsset, true);
            if (newData.length > 0) {
                // Update date range to match new data
                if (newData[0].time < startDate) setStartDate(newData[0].time);
                if (newData[newData.length - 1].time > endDate) setEndDate(newData[newData.length - 1].time);
                alert(`Successfully fetched ${newData.length} candles up to ${newData[newData.length - 1].time}! Run Backtest to see new result.`);
            }
        } catch (e) {
            alert('Failed to update data via proxy. Please run "npm run update-data" in console.');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleThink = async () => {
        setIsThinking(true);
        setThinkProgress('Loading data...');

        try {
            const service = new MarketDataService();
            const candles = await service.getHistory(selectedAsset);

            // Filter by date range
            const filtered = candles.filter(c => c.time >= startDate && c.time <= endDate);

            setThinkProgress('Optimizing strategy...');

            const optimized = await Optimizer.optimize(
                filtered,
                initialCapital,
                strategy,
                60000, // 60 seconds
                (progress) => setThinkProgress(progress)
            );

            setStrategy(optimized);
            setThinkProgress('');

            // Auto-run backtest with optimized strategy
            setThinkProgress('Running backtest...');
            await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for UI update
            onRun(selectedAsset, startDate, endDate, initialCapital, maxTrades);

            alert('AI optimization complete! Backtest results are displayed below.');
        } catch (e) {
            alert('Optimization failed: ' + (e as Error).message);
        } finally {
            setIsThinking(false);
        }
    };

    return (
        <div className={`card ${styles.container}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2></h2>
                <button
                    onClick={handleUpdateData}
                    disabled={isUpdating}
                    style={{ fontSize: '0.8em', padding: '5px 10px', backgroundColor: '#607d8b' }}
                >
                    {isUpdating ? 'Fetching...' : '🔄 Update Data (Live)'}
                </button>
                <button
                    onClick={handleThink}
                    disabled={isThinking || isRunning}
                    style={{ fontSize: '0.8em', padding: '5px 10px', backgroundColor: '#4CAF50', marginLeft: '10px' }}
                >
                    {isThinking ? `Thinking... ${thinkProgress}` : '🧠 Think! (AI Optimize)'}
                </button>
            </div>
            <div className={styles.grid}>
                <div className={styles.field}>
                    <label>Initial Capital</label>
                    <input type="number" value={initialCapital} onChange={e => setInitialCapital(Number(e.target.value))} />
                </div>
                <div className={styles.field}>
                    <label>Asset</label>
                    <select value={selectedAsset} onChange={e => setSelectedAsset(e.target.value)}>
                        {assets.map(a => <option key={a.symbol} value={a.symbol}>{a.name} ({a.symbol})</option>)}
                    </select>
                </div>
                <div className={styles.field}>
                    <label>Start Date</label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div className={styles.field}>
                    <label>End Date</label>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
                <div className={styles.field}>
                    <label>Max Trades (Optional)</label>
                    <input type="number" placeholder="No Limit" value={maxTrades || ''} onChange={e => setMaxTrades(e.target.value ? Number(e.target.value) : undefined)} />
                </div>
                <div className={styles.action}>
                    <button onClick={() => onRun(selectedAsset, startDate, endDate, initialCapital, maxTrades)} disabled={isRunning}>
                        {isRunning ? 'Running...' : '▶ Run Backtest'}
                    </button>
                </div>
            </div>
        </div>
    );
};
