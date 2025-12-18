
import React from 'react';
import type { Trade } from '../types/engine';
import styles from './TradeList.module.css';

export const TradeList: React.FC<{ trades: Trade[] }> = ({ trades }) => {
    return (
        <div className={`card ${styles.container}`}>
            <h3>Trades ({trades.length})</h3>
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Entry Date</th>
                            <th>Type</th>
                            <th>Qty</th>
                            <th>Entry Price</th>
                            <th>Invested</th>
                            <th>Exit Date</th>
                            <th>Exit Price</th>
                            <th>PnL</th>
                        </tr>
                    </thead>
                    <tbody>
                        {trades.map(t => (
                            <tr key={t.id}>
                                <td>{t.entryDate}</td>
                                <td>{t.direction.toUpperCase()}</td>
                                <td>{t.quantity}</td>
                                <td>{t.entryPrice.toFixed(2)}</td>
                                <td>{(t.entryPrice * t.quantity).toFixed(2)}</td>
                                <td>{t.exitDate || '-'}</td>
                                <td>{t.exitPrice?.toFixed(2) || '-'}</td>
                                <td style={{ color: t.status === 'open' ? '#aaa' : (t.pnl >= 0 ? '#4caf50' : '#f44336') }}>
                                    {t.status === 'open' ? 'OPEN' : t.pnl.toFixed(2)}
                                </td>
                            </tr>
                        ))}
                        {trades.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', padding: '20px', color: '#777' }}>No trades generated</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
