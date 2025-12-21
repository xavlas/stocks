
import React, { useState } from 'react';
import type { IndicatorVisuals } from '../types/visuals';

interface IndicatorControlsProps {
    visuals: IndicatorVisuals;
    onChange: (visuals: IndicatorVisuals) => void;
    onToggle?: () => void;
}

export const IndicatorControls: React.FC<IndicatorControlsProps> = ({ visuals, onChange, onToggle }) => {
    const [isConfigOpen, setIsConfigOpen] = useState(false);

    const toggleIndicator = (key: keyof IndicatorVisuals) => {
        onChange({
            ...visuals,
            [key]: { ...visuals[key], visible: !visuals[key].visible }
        });
        if (onToggle) onToggle();
    };

    const updateParam = (key: keyof IndicatorVisuals, param: string, value: any) => {
        onChange({
            ...visuals,
            [key]: { ...visuals[key], [param]: value }
        });
        if (onToggle) onToggle();
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            padding: '15px',
            background: 'white',
            borderRadius: '16px',
            border: '1px solid #E0E5F2',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            marginTop: '10px'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>Indicators</span>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {(['sma', 'ema', 'rsi', 'bollinger'] as const).map((key) => (
                            <div
                                key={key}
                                onClick={() => toggleIndicator(key)}
                                style={{
                                    padding: '6px 14px',
                                    borderRadius: '10px',
                                    background: visuals[key].visible ? 'var(--primary-blue)' : '#F4F7FE',
                                    color: visuals[key].visible ? 'white' : 'var(--text-secondary)',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    fontSize: '11px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: visuals[key].visible ? 'white' : visuals[key].color }}></span>
                                {key.toUpperCase()}
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    onClick={() => setIsConfigOpen(!isConfigOpen)}
                    style={{
                        padding: '8px',
                        borderRadius: '12px',
                        border: '1px solid #E0E5F2',
                        background: isConfigOpen ? '#F4F7FE' : 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    title="Configuration"
                >
                    ⚙️
                </button>
            </div>

            {isConfigOpen && (
                <div style={{
                    padding: '15px',
                    background: '#F4F7FE',
                    borderRadius: '12px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '15px',
                    animation: 'fadeIn 0.3s ease'
                }}>
                    <style>{`
                        @keyframes fadeIn {
                            from { opacity: 0; transform: translateY(-5px); }
                            to { opacity: 1; transform: translateY(0); }
                        }
                    `}</style>

                    {/* SMA Config */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>SMA PERIOD</label>
                        <input
                            type="number"
                            value={visuals.sma.period}
                            onChange={(e) => updateParam('sma', 'period', parseInt(e.target.value))}
                            style={{ padding: '6px', borderRadius: '6px', border: '1px solid #E0E5F2' }}
                        />
                    </div>

                    {/* EMA Config */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>EMA PERIOD</label>
                        <input
                            type="number"
                            value={visuals.ema.period}
                            onChange={(e) => updateParam('ema', 'period', parseInt(e.target.value))}
                            style={{ padding: '6px', borderRadius: '6px', border: '1px solid #E0E5F2' }}
                        />
                    </div>

                    {/* RSI Config */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>RSI PERIOD</label>
                        <input
                            type="number"
                            value={visuals.rsi.period}
                            onChange={(e) => updateParam('rsi', 'period', parseInt(e.target.value))}
                            style={{ padding: '6px', borderRadius: '6px', border: '1px solid #E0E5F2' }}
                        />
                    </div>

                    {/* Bollinger Config */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>BB PERIOD / MULTIPLIER</label>
                        <div style={{ display: 'flex', gap: '5px' }}>
                            <input
                                type="number"
                                value={visuals.bollinger.period}
                                onChange={(e) => updateParam('bollinger', 'period', parseInt(e.target.value))}
                                style={{ flex: 1, padding: '6px', borderRadius: '6px', border: '1px solid #E0E5F2' }}
                            />
                            <input
                                type="number"
                                step="0.1"
                                value={visuals.bollinger.multiplier}
                                onChange={(e) => updateParam('bollinger', 'multiplier', parseFloat(e.target.value))}
                                style={{ flex: 1, padding: '6px', borderRadius: '6px', border: '1px solid #E0E5F2' }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
