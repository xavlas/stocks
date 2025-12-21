
export class Indicators {

    static sma(data: number[], period: number): number[] {
        const results: number[] = new Array(data.length).fill(NaN);
        for (let i = period - 1; i < data.length; i++) {
            const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
            results[i] = sum / period;
        }
        return results;
    }

    static ema(data: number[], period: number): number[] {
        const results = new Array(data.length).fill(NaN);
        const k = 2 / (period + 1);

        // Initial SMA as first EMA
        let sum = 0;
        for (let i = 0; i < period; i++) sum += data[i];
        results[period - 1] = sum / period;

        for (let i = period; i < data.length; i++) {
            results[i] = (data[i] - results[i - 1]) * k + results[i - 1];
        }
        return results;
    }

    static rsi(data: number[], period: number = 14): number[] {
        const results = new Array(data.length).fill(NaN);
        if (data.length < period + 1) return results;

        let gains = 0;
        let losses = 0;

        for (let i = 1; i <= period; i++) {
            const change = data[i] - data[i - 1];
            if (change > 0) gains += change;
            else losses -= change;
        }

        let avgGain = gains / period;
        let avgLoss = losses / period;

        results[period] = 100 - (100 / (1 + avgGain / avgLoss));

        for (let i = period + 1; i < data.length; i++) {
            const change = data[i] - data[i - 1];
            const gain = change > 0 ? change : 0;
            const loss = change < 0 ? -change : 0;

            avgGain = (avgGain * (period - 1) + gain) / period;
            avgLoss = (avgLoss * (period - 1) + loss) / period;

            if (avgLoss === 0) {
                results[i] = 100;
            } else {
                const rs = avgGain / avgLoss;
                results[i] = 100 - (100 / (1 + rs));
            }
        }

        return results;
    }

    static macd(data: number[], fast: number = 12, slow: number = 26, signal: number = 9): { macd: number[], signal: number[], histogram: number[] } {
        const fastEMA = this.ema(data, fast);
        const slowEMA = this.ema(data, slow);

        const macdLine = fastEMA.map((v, i) => v - slowEMA[i]);
        // Signal line is EMA of MACD line
        // We need to handle NaNs. calculating EMA on NaNs results in NaNs, which is correct.
        // However, the input to ema() must handle leading NaNs correctly if we want alignment.
        // My ema() sets leading to NaN.

        // Find first non-NaN index in macdLine
        let firstValid = 0;
        while (firstValid < macdLine.length && isNaN(macdLine[firstValid])) firstValid++;

        // Slice valid data for calculation? Or adjust EMA?
        // Let's pass the whole array. My EMA implementation logic assumes 0..period sum.
        // If data has NaNs at start, `sum` will be NaN.
        // We should start EMA after sufficient valid data.

        // For simplicity in MVP: 
        // Signal line calculation on MACD line.
        // The MACD line has `slow - 1` NaNs at start.
        // We can treat the MACD slice starting from `slow - 1` as input for signal EMA.

        const signalLine = new Array(data.length).fill(NaN);
        // We need `signal` valid points.
        const START = slow - 1; // Index where MACD starts being valid

        if (macdLine.length > START + signal) {
            const validMacd = macdLine.slice(START);
            const validSignal = this.ema(validMacd, signal);
            // Fill back
            for (let i = 0; i < validSignal.length; i++) {
                signalLine[START + i] = validSignal[i];
            }
        }

        const histogram = macdLine.map((v, i) => v - signalLine[i]);

        return { macd: macdLine, signal: signalLine, histogram };
    }
    static roc(data: number[], period: number = 14): number[] {
        const results = new Array(data.length).fill(NaN);
        for (let i = period; i < data.length; i++) {
            const prev = data[i - period];
            if (prev !== 0 && !isNaN(prev)) {
                results[i] = ((data[i] - prev) / prev) * 100;
            }
        }
        return results;
    }

    static bollinger(data: number[], period: number = 20, multiplier: number = 2): { middle: number[], upper: number[], lower: number[] } {
        const middle = this.sma(data, period);
        const upper = new Array(data.length).fill(NaN);
        const lower = new Array(data.length).fill(NaN);

        for (let i = period - 1; i < data.length; i++) {
            const slice = data.slice(i - period + 1, i + 1);
            const avg = middle[i];
            const squareDiffs = slice.map(v => Math.pow(v - avg, 2));
            const stdDev = Math.sqrt(squareDiffs.reduce((a, b) => a + b, 0) / period);

            upper[i] = avg + multiplier * stdDev;
            lower[i] = avg - multiplier * stdDev;
        }

        return { middle, upper, lower };
    }
}
