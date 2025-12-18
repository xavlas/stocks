
import React from 'react';
import type { BacktestMetrics } from '../types/engine';

export const ResultsSummary: React.FC<{ metrics: BacktestMetrics }> = ({ metrics }) => {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginBottom: '20px' }}>
            <MetricCard label="Total Return" value={`${metrics.totalReturn.toFixed(2)}%`} color={metrics.totalReturn >= 0 ? '#4caf50' : '#f44336'} />
            <MetricCard label="Net Profit" value={`$${metrics.netProfit.toFixed(2)}`} color={metrics.netProfit >= 0 ? '#4caf50' : '#f44336'} />
            <MetricCard label="Trades" value={metrics.totalTrades} />
            <MetricCard label="Win Rate" value={`${metrics.winRate.toFixed(1)}%`} />
            <MetricCard label="Max Drawdown" value={`${metrics.maxDrawdown.toFixed(2)}%`} color="#f44336" />
        </div>
    );
};

const MetricCard: React.FC<{ label: string, value: string | number, color?: string }> = ({ label, value, color }) => (
    <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'start', justifyContent: 'center' }}>
        <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '5px' }}>{label}</div>
        <div style={{ fontSize: '24px', fontWeight: '700', color: color || 'var(--text-primary)' }}>{value}</div>
    </div>
);
