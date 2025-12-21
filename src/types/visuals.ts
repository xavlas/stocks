
export interface IndicatorVisuals {
    sma: { visible: boolean; period: number; color: string };
    ema: { visible: boolean; period: number; color: string };
    rsi: { visible: boolean; period: number; color: string };
    bollinger: { visible: boolean; period: number; multiplier: number; color: string };
}

export const DEFAULT_INDICATOR_VISUALS: IndicatorVisuals = {
    sma: { visible: false, period: 20, color: '#2962FF' },
    ema: { visible: false, period: 50, color: '#E91E63' },
    rsi: { visible: false, period: 14, color: '#9C27B0' },
    bollinger: { visible: false, period: 20, multiplier: 2, color: 'rgba(33, 150, 243, 0.3)' }
};
