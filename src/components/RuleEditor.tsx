import React, { useState } from 'react';
import { useStrategy } from '../context/StrategyContext';
import type { Rule, IndicatorConfig, IndicatorType } from '../types/engine';
import styles from './RuleEditor.module.css';
import { getRuleDescription } from '../utils/ruleDescriptions';

const DEFAULT_INDICATOR: IndicatorConfig = { type: 'price' };

export const RuleEditor: React.FC = () => {
    const { strategy, addRule, updateRule, removeRule } = useStrategy();
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form State
    const [left, setLeft] = useState<IndicatorConfig>({ ...DEFAULT_INDICATOR });
    const [operator, setOperator] = useState<any>('>');
    const [rightType, setRightType] = useState<'value' | 'indicator'>('value');
    const [rightValue, setRightValue] = useState<number>(0);
    const [rightIndicator, setRightIndicator] = useState<IndicatorConfig>({ ...DEFAULT_INDICATOR });
    const [actionType, setActionType] = useState<'buy' | 'sell'>('buy');
    const [quantity, setQuantity] = useState<number>(1);
    const [offsetPercent, setOffsetPercent] = useState<number>(0);

    const handleEdit = (rule: Rule) => {
        setEditingId(rule.id);
        setLeft(rule.condition.left);
        setOperator(rule.condition.operator);
        setRightType(rule.condition.right.type);
        if (rule.condition.right.value !== undefined) setRightValue(rule.condition.right.value);
        if (rule.condition.right.indicator) setRightIndicator(rule.condition.right.indicator);
        setOffsetPercent(rule.condition.right.offsetPercent || 0);

        setActionType(rule.action.type);
        setQuantity(rule.action.quantity);
        setIsEditing(true);
    };

    const resetForm = () => {
        setEditingId(null);
        setLeft({ ...DEFAULT_INDICATOR });
        setOperator('>');
        setRightType('value');
        setRightValue(0);
        setRightIndicator({ ...DEFAULT_INDICATOR });
        setOffsetPercent(0);
        setActionType('buy');
        setQuantity(1);
    };

    const handleSave = () => {
        const newRule: Rule = {
            id: editingId || crypto.randomUUID(),
            condition: {
                left,
                operator,
                right: {
                    type: rightType,
                    value: rightType === 'value' ? rightValue : undefined,
                    indicator: rightType === 'indicator' ? rightIndicator : undefined,
                    offsetPercent: offsetPercent !== 0 ? offsetPercent : undefined
                }
            },
            action: {
                type: actionType,
                quantity
            }
        };

        if (editingId) {
            updateRule(newRule);
        } else {
            addRule(newRule);
        }

        setIsEditing(false);
        resetForm();
    };

    const handleCancel = () => {
        setIsEditing(false);
        resetForm();
    };

    const addTemplate = (type: 'golden-cross' | 'trend-following' | 'sma-7-14') => {
        if (type === 'golden-cross') {
            // Buy: SMA 50 > SMA 200
            const buyRule: Rule = {
                id: crypto.randomUUID(),
                condition: {
                    left: { type: 'sma', period: 50 },
                    operator: '>',
                    right: { type: 'indicator', indicator: { type: 'sma', period: 200 } }
                },
                action: { type: 'buy', quantity: 1 }
            };
            // Sell: SMA 50 < SMA 200
            const sellRule: Rule = { // Death Cross
                id: crypto.randomUUID(),
                condition: {
                    left: { type: 'sma', period: 50 },
                    operator: '<',
                    right: { type: 'indicator', indicator: { type: 'sma', period: 200 } }
                },
                action: { type: 'sell', quantity: 1 }
            };
            addRule(buyRule);
            addRule(sellRule);
        } else if (type === 'trend-following') {
            // Buy: SMA 20 > SMA 50
            const buyRule: Rule = {
                id: crypto.randomUUID(),
                condition: {
                    left: { type: 'sma', period: 20 },
                    operator: '>',
                    right: { type: 'indicator', indicator: { type: 'sma', period: 50 } }
                },
                action: { type: 'buy', quantity: 1 }
            };
            // Sell: SMA 20 < SMA 50
            const sellRule: Rule = {
                id: crypto.randomUUID(),
                condition: {
                    left: { type: 'sma', period: 20 },
                    operator: '<',
                    right: { type: 'indicator', indicator: { type: 'sma', period: 50 } }
                },
                action: { type: 'sell', quantity: 1 }
            };
            addRule(buyRule);
            addRule(sellRule);
        } else if (type === 'sma-7-14') {
            // User Request: "si la moyenne mobile a 14 jour descend sous la moyenne mobile a 7 alors tu achetes sinon tu vends"
            // Buy: SMA 14 < SMA 7
            const buyRule: Rule = {
                id: crypto.randomUUID(),
                condition: {
                    left: { type: 'sma', period: 14 },
                    operator: '<',
                    right: { type: 'indicator', indicator: { type: 'sma', period: 7 } }
                },
                action: { type: 'buy', quantity: 1 }
            };
            // Sell: SMA 14 > SMA 7
            const sellRule: Rule = {
                id: crypto.randomUUID(),
                condition: {
                    left: { type: 'sma', period: 14 },
                    operator: '>',
                    right: { type: 'indicator', indicator: { type: 'sma', period: 7 } }
                },
                action: { type: 'sell', quantity: 1 }
            };
            addRule(buyRule);
            addRule(sellRule);
        }
    };

    const renderIndicatorInput = (
        config: IndicatorConfig,
        onChange: (c: IndicatorConfig) => void
    ) => {
        const handleTypeChange = (newType: IndicatorType) => {
            const updates: Partial<IndicatorConfig> = { type: newType };
            // Set default period if switching to indicator that needs it and it's missing
            if ((newType === 'sma' || newType === 'ema' || newType === 'rsi') && !config.period) {
                updates.period = 14;
            }
            onChange({ ...config, ...updates });
        };

        return (
            <div className={styles.indicatorConfig}>
                <select
                    value={config.type}
                    onChange={e => handleTypeChange(e.target.value as IndicatorType)}
                >
                    <option value="price">Price</option>
                    <option value="sma">SMA</option>
                    <option value="ema">EMA</option>
                    <option value="rsi">RSI</option>
                    <option value="roc">Rate of Change (%)</option>
                    <option value="macd">MACD Line</option>
                </select>

                {(config.type === 'sma' || config.type === 'ema' || config.type === 'rsi' || config.type === 'roc') && (
                    <input
                        type="number"
                        placeholder="Len"
                        value={config.period !== undefined ? config.period : ''}
                        onChange={e => onChange({ ...config, period: e.target.value ? Number(e.target.value) : undefined })}
                        style={{ width: '50px' }}
                    />
                )}
                {config.type === 'macd' && (
                    <>
                        <input type="number" title="Fast" value={config.fastPeriod || 12} onChange={e => onChange({ ...config, fastPeriod: Number(e.target.value) })} style={{ width: '35px' }} />
                        <input type="number" title="Slow" value={config.slowPeriod || 26} onChange={e => onChange({ ...config, slowPeriod: Number(e.target.value) })} style={{ width: '35px' }} />
                        <input type="number" title="Sig" value={config.signalPeriod || 9} onChange={e => onChange({ ...config, signalPeriod: Number(e.target.value) })} style={{ width: '35px' }} />
                    </>
                )}
            </div>
        );
    };

    return (
        <div className={`card ${styles.container}`}>
            <h2>Strategy Rules</h2>

            {!isEditing && strategy.rules.length === 0 && (
                <div style={{ marginBottom: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button onClick={() => addTemplate('golden-cross')} style={{ backgroundColor: '#26a69a', fontSize: '0.9em' }}>
                        ⚡ Golden Cross (50/200)
                    </button>
                    <button onClick={() => addTemplate('trend-following')} style={{ backgroundColor: '#29b6f6', fontSize: '0.9em' }}>
                        📈 Trend (SMA 20/50)
                    </button>
                    <button onClick={() => addTemplate('sma-7-14')} style={{ backgroundColor: '#ab47bc', fontSize: '0.9em' }}>
                        🚀 Short Term (SMA 7/14)
                    </button>
                    <small style={{ width: '100%', display: 'block', color: '#888', marginTop: '5px' }}>
                        Load a preset to get started quickly.
                    </small>
                </div>
            )}

            <div className={styles.ruleList}>
                {strategy.rules.length === 0 && <p style={{ color: '#777' }}>No rules defined.</p>}
                {strategy.rules.map((rule, index) => (
                    <div key={rule.id} className={`${styles.ruleItem} ${styles[rule.action.type]}`}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                            <div style={{
                                background: rule.action.type === 'buy' ? '#4CAF50' : '#E31A1A',
                                color: 'white',
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                flexShrink: 0
                            }}>
                                {index + 1}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <div>
                                    <strong>IF</strong> {rule.condition.left.type.toUpperCase()}
                                    {rule.condition.left.period && `(${rule.condition.left.period})`}
                                    {' '}{rule.condition.operator}{' '}
                                    {rule.condition.right.type === 'value'
                                        ? rule.condition.right.value
                                        : `${rule.condition.right.indicator?.type.toUpperCase()} (${rule.condition.right.indicator?.period || ''})`}
                                </div>
                                <div style={{ fontSize: '11px', color: '#666', fontStyle: 'italic' }}>
                                    {getRuleDescription(rule)}
                                </div>
                            </div>
                        </div>
                        <div>
                            <strong>THEN</strong> {rule.action.type === 'buy' ? '🟢 BUY' : '🔴 SELL'} {rule.action.quantity}
                        </div>
                        <div style={{ display: 'flex', gap: '5px' }}>
                            <button className={styles.btnEdit} onClick={() => handleEdit(rule)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2em' }}>✏️</button>
                            <button className={styles.btnDelete} onClick={() => removeRule(rule.id)}>X</button>
                        </div>
                    </div>
                ))}
            </div>

            {!isEditing ? (
                <button onClick={() => { resetForm(); setIsEditing(true); }} style={{ marginTop: '20px' }}>+ Add Rule</button>
            ) : (
                <div className={styles.form}>
                    <h3>{editingId ? 'Edit Rule' : 'New Rule'}</h3>

                    <div className={styles.row}>
                        <span className={styles.label}>IF</span>
                        {renderIndicatorInput(left, setLeft)}
                    </div>

                    <div className={styles.row}>
                        <span className={styles.label}>Is</span>
                        <select value={operator} onChange={e => setOperator(e.target.value)}>
                            <option value=">">Greater (&gt;)</option>
                            <option value="<">Less (&lt;)</option>
                            <option value="==">Equal (==)</option>
                            <option value=">=">Greater or Equal (&gt;=)</option>
                            <option value="<=">Less or Equal (&lt;=)</option>
                        </select>
                    </div>

                    <div className={styles.row}>
                        <span className={styles.label}>Than</span>
                        <select value={rightType} onChange={e => setRightType(e.target.value as any)}>
                            <option value="value">Value</option>
                            <option value="indicator">Indicator</option>
                        </select>

                        {rightType === 'value' ? (
                            <input
                                type="number"
                                value={rightValue}
                                onChange={e => setRightValue(Number(e.target.value))}
                                style={{ width: '80px' }}
                            />
                        ) : (
                            renderIndicatorInput(rightIndicator, setRightIndicator)
                        )}

                        {(rightType === 'indicator' || rightType === 'value') && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <span style={{ fontSize: '12px', color: '#888' }}> Offset %:</span>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={offsetPercent}
                                    onChange={e => setOffsetPercent(Number(e.target.value))}
                                    style={{ width: '50px' }}
                                />
                            </div>
                        )}
                    </div>

                    <div className={styles.row}>
                        <span className={styles.label}>THEN</span>
                        <select value={actionType} onChange={e => setActionType(e.target.value as any)}>
                            <option value="buy">BUY</option>
                            <option value="sell">SELL</option>
                        </select>
                        <input
                            type="number"
                            value={quantity}
                            onChange={e => setQuantity(Number(e.target.value))}
                            placeholder="Qty"
                            style={{ width: '60px' }}
                        />
                    </div>

                    <div className={styles.actions}>
                        <button onClick={handleCancel} style={{ background: '#555' }}>Cancel</button>
                        <button onClick={handleSave}>Save Rule</button>
                    </div>
                </div>
            )}
        </div>
    );
};
