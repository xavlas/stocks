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
    const [hoveredRuleId, setHoveredRuleId] = useState<string | null>(null);

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
            <div className={styles.titleHeader}>
                <h2>Strategy Rules</h2>
                {!isEditing && (
                    <button
                        onClick={() => { resetForm(); setIsEditing(true); }}
                        style={{
                            padding: '6px 12px',
                            background: 'var(--primary-blue)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        + New Rule
                    </button>
                )}
            </div>

            {!isEditing && strategy.rules.length === 0 && (
                <div style={{ marginBottom: '20px' }}>
                    <div className={styles.templatePills}>
                        <button className={styles.templatePill} onClick={() => addTemplate('golden-cross')} style={{ backgroundColor: '#26a69a' }}>
                            <span>⚡</span> Golden Cross
                        </button>
                        <button className={styles.templatePill} onClick={() => addTemplate('trend-following')} style={{ backgroundColor: '#29b6f6' }}>
                            <span>📈</span> Trend Following
                        </button>
                        <button className={styles.templatePill} onClick={() => addTemplate('sma-7-14')} style={{ backgroundColor: '#ab47bc' }}>
                            <span>🚀</span> Short Term
                        </button>
                    </div>
                </div>
            )}

            <div className={styles.ruleList}>
                {strategy.rules.length === 0 && !isEditing && (
                    <div style={{ textAlign: 'center', padding: '40px 20px', background: '#F4F7FE', borderRadius: '20px', border: '2px dashed #E0E5F2' }}>
                        <p style={{ color: '#777', margin: 0, fontSize: '14px' }}>No active strategy rules</p>
                        <small style={{ color: '#AAA' }}>Add a rule or load a template above</small>
                    </div>
                )}

                {strategy.rules.map((rule, index) => (
                    <div key={rule.id} className={`${styles.ruleItem} ${rule.action.type === 'sell' ? styles.sell : ''}`}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1 }}>
                            <div style={{
                                background: rule.action.type === 'buy' ? 'rgba(38, 166, 154, 0.1)' : 'rgba(239, 83, 80, 0.1)',
                                color: rule.action.type === 'buy' ? '#26a69a' : '#ef5350',
                                width: '32px',
                                height: '32px',
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '14px',
                                fontWeight: 800,
                                flexShrink: 0
                            }}>
                                {rule.action.type === 'buy' ? 'B' : 'S'}{index + 1}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                                    IF <span style={{ color: 'var(--primary-blue)' }}>{rule.condition.left.type.toUpperCase()}{rule.condition.left.period && `(${rule.condition.left.period})`}</span>
                                    {' '}{rule.condition.operator}{' '}
                                    <span style={{ color: 'var(--primary-blue)' }}>
                                        {rule.condition.right.type === 'value'
                                            ? rule.condition.right.value
                                            : `${rule.condition.right.indicator?.type.toUpperCase()}${rule.condition.right.indicator?.period ? `(${rule.condition.right.indicator.period})` : ''}`}
                                    </span>
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Action: {rule.action.type} {rule.action.quantity} unit(s)
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <div
                                onMouseEnter={() => setHoveredRuleId(rule.id)}
                                onMouseLeave={() => setHoveredRuleId(null)}
                                style={{
                                    cursor: 'help',
                                    width: '32px',
                                    height: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '14px',
                                    color: '#2196F3',
                                    background: '#F4F7FE',
                                    borderRadius: '10px',
                                    position: 'relative'
                                }}
                            >
                                ℹ️
                                {hoveredRuleId === rule.id && (
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '100%',
                                        right: 0,
                                        marginBottom: '12px',
                                        backgroundColor: '#2C3E50',
                                        color: 'white',
                                        padding: '12px 16px',
                                        borderRadius: '12px',
                                        fontSize: '11px',
                                        fontWeight: 500,
                                        width: '240px',
                                        zIndex: 1000,
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                                        lineHeight: '1.5'
                                    }}>
                                        {getRuleDescription(rule)}
                                        <div style={{
                                            position: 'absolute',
                                            bottom: '-6px',
                                            right: '10px',
                                            width: 0,
                                            height: 0,
                                            borderLeft: '6px solid transparent',
                                            borderRight: '6px solid transparent',
                                            borderTop: '6px solid #2C3E50'
                                        }} />
                                    </div>
                                )}
                            </div>
                            <button className={styles.btnEdit} onClick={() => handleEdit(rule)}>✏️</button>
                            <button className={styles.btnDelete} onClick={() => removeRule(rule.id)}>×</button>
                        </div>
                    </div>
                ))}
            </div>

            {isEditing ? (
                <div className={styles.form}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 700 }}>{editingId ? 'EDIT RULE' : 'CREATE NEW RULE'}</h4>

                    <div className={styles.row}>
                        <span className={styles.label}>IF</span>
                        {renderIndicatorInput(left, setLeft)}
                    </div>

                    <div className={styles.row}>
                        <span className={styles.label}>IS</span>
                        <select value={operator} onChange={e => setOperator(e.target.value)} style={{ flex: 1 }}>
                            <option value=">">Greater (&gt;)</option>
                            <option value="<">Less (&lt;)</option>
                            <option value="==">Equal (==)</option>
                            <option value=">=">Greater or Equal (&gt;=)</option>
                            <option value="<=">Less or Equal (&lt;=)</option>
                        </select>
                    </div>

                    <div className={styles.row}>
                        <span className={styles.label}>THAN</span>
                        <select value={rightType} onChange={e => setRightType(e.target.value as any)}>
                            <option value="value">Constant Value</option>
                            <option value="indicator">Another Indicator</option>
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
                    </div>

                    {offsetPercent !== 0 || rightType === 'indicator' ? (
                        <div className={styles.row}>
                            <span className={styles.label}>OFFSET</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={offsetPercent}
                                    onChange={e => setOffsetPercent(Number(e.target.value))}
                                    style={{ width: '70px' }}
                                />
                                <span style={{ fontSize: '12px', color: '#888' }}>% (ex: 3 pour +3%)</span>
                            </div>
                        </div>
                    ) : null}

                    <div className={styles.row}>
                        <span className={styles.label}>THEN</span>
                        <div style={{ display: 'flex', gap: '8px', flex: 1 }}>
                            <select value={actionType} onChange={e => setActionType(e.target.value as any)} style={{ flex: 2 }}>
                                <option value="buy">BUY ASSET</option>
                                <option value="sell">SELL ASSET</option>
                            </select>
                            <input
                                type="number"
                                value={quantity}
                                onChange={e => setQuantity(Number(e.target.value))}
                                placeholder="Qty"
                                style={{ flex: 1 }}
                            />
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <button onClick={handleCancel} style={{ padding: '10px 20px', borderRadius: '12px', border: 'none', background: '#E0E5F2', color: 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                        <button onClick={handleSave} style={{ padding: '10px 20px', borderRadius: '12px', border: 'none', background: 'var(--primary-blue)', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Save Strategy Rule</button>
                    </div>
                </div>
            ) : (
                strategy.rules.length > 0 && (
                    <button className={styles.btnAddRule} onClick={() => { resetForm(); setIsEditing(true); }}>
                        <span>+</span> Add another rule
                    </button>
                )
            )}
        </div>
    );
};
