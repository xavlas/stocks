import type { Rule } from '../types/engine';

export function getRuleDescription(rule: Rule): string {
    const { condition, action } = rule;
    const { left, operator, right } = condition;

    // Translate indicator names
    const indicatorNames: Record<string, string> = {
        'price': 'Prix',
        'sma': 'Moyenne Mobile Simple',
        'ema': 'Moyenne Mobile Exponentielle',
        'rsi': 'RSI',
        'roc': 'Taux de Variation',
        'macd': 'MACD'
    };

    // Translate operators
    const operatorNames: Record<string, string> = {
        '>': 'est supérieur à',
        '<': 'est inférieur à',
        '>=': 'est supérieur ou égal à',
        '<=': 'est inférieur ou égal à',
        '==': 'est égal à'
    };

    // Build left side description
    let leftDesc = indicatorNames[left.type] || left.type;
    if (left.period) {
        leftDesc += ` (${left.period} jours)`;
    }

    // Build right side description
    let rightDesc = '';
    if (right.type === 'value') {
        rightDesc = right.value?.toString() || '0';
    } else if (right.indicator) {
        rightDesc = indicatorNames[right.indicator.type] || right.indicator.type;
        if (right.indicator.period) {
            rightDesc += ` (${right.indicator.period} jours)`;
        }
    }

    // Add offset if present
    if (right.offsetPercent) {
        const sign = right.offsetPercent > 0 ? '+' : '';
        rightDesc += ` ${sign}${right.offsetPercent}%`;
    }

    // Build action description
    const actionDesc = action.type === 'buy'
        ? `acheter ${action.quantity} action${action.quantity > 1 ? 's' : ''}`
        : `vendre ${action.quantity} action${action.quantity > 1 ? 's' : ''}`;

    // Combine everything
    return `Si ${leftDesc} ${operatorNames[operator]} ${rightDesc}, alors ${actionDesc}.`;
}
