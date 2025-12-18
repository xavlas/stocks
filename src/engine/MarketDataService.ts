
import type { Candle } from '../types/engine';
import aaplData from '../assets/data/AAPL.json';
import msftData from '../assets/data/MSFT.json';
import alvData from '../assets/data/ALV.json';
import nvdaData from '../assets/data/NVDA.json';
import tslaData from '../assets/data/TSLA.json';
import btcData from '../assets/data/BTC.json';
import gleData from '../assets/data/GLE.json';
import safData from '../assets/data/SAF.json';
import fdjData from '../assets/data/FDJ.json';

// Mutable cache for session updates
const DATA_CACHE: Record<string, Candle[]> = {
    'AAPL': aaplData as Candle[],
    'MSFT': msftData as Candle[],
    'ALV': alvData as Candle[],
    'NVDA': nvdaData as Candle[],
    'TSLA': tslaData as Candle[],
    'BTC': btcData as Candle[],
    'GLE': gleData as Candle[],
    'SAF': safData as Candle[],
    'FDJ': fdjData as Candle[]
};

export class MarketDataService {
    private async fetchFromYahoo(symbol: string): Promise<Candle[] | null> {
        // Mapping internal symbol to Yahoo Ticker
        const tickerMap: Record<string, string> = {
            'AAPL': 'AAPL',
            'MSFT': 'MSFT',
            'ALV': 'ALV.DE',
            'NVDA': 'NVDA',
            'TSLA': 'TSLA',
            'BTC': 'BTC-USD',
            'GLE': 'GLE.PA',
            'SAF': 'SAF.PA',
            'FDJ': '1WE.F'
        };
        const ticker = tickerMap[symbol] || symbol;

        try {
            // Using a CORS proxy to bypass browser restrictions
            // https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=5y
            const targetUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=5y`;
            const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;

            const res = await fetch(proxyUrl);
            if (!res.ok) throw new Error('Network response was not ok');
            const data = await res.json();

            const result = data.chart.result[0];
            const quote = result.indicators.quote[0];
            const timestamps = result.timestamp;

            const candles = timestamps.map((ts: number, i: number) => ({
                time: new Date(ts * 1000).toISOString().split('T')[0],
                open: Number(quote.open[i]?.toFixed(2)) || 0,
                high: Number(quote.high[i]?.toFixed(2)) || 0,
                low: Number(quote.low[i]?.toFixed(2)) || 0,
                close: Number(quote.close[i]?.toFixed(2)) || 0,
                volume: quote.volume[i] || 0
            })).filter((c: Candle) => c.open > 0);

            return candles;
        } catch (e) {
            console.warn(`Failed to fetch live data for ${symbol}`, e);
            return null;
        }
    }

    async getHistory(symbol: string, forceUpdate: boolean = false): Promise<Candle[]> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 100));

        if (forceUpdate) {
            const liveData = await this.fetchFromYahoo(symbol);
            if (liveData) {
                DATA_CACHE[symbol] = liveData; // Update Session Cache
                return liveData;
            }
        }

        const data = DATA_CACHE[symbol];
        if (!data || data.length === 0) throw new Error(`Asset ${symbol} not found or no data available.`);
        return data;
    }

    async getAvailableAssets(): Promise<{ symbol: string, name: string }[]> {
        return [
            { symbol: 'AAPL', name: 'Apple Inc.' },
            { symbol: 'MSFT', name: 'Microsoft Corp.' },
            { symbol: 'NVDA', name: 'Nvidia Corp.' },
            { symbol: 'TSLA', name: 'Tesla Inc.' },
            { symbol: 'ALV', name: 'Allianz SE' },
            { symbol: 'GLE', name: 'Societe Generale' },
            { symbol: 'SAF', name: 'Safran SA' },
            { symbol: 'BTC', name: 'Bitcoin (USD)' },
            { symbol: 'FDJ', name: 'La Française des Jeux' }
        ];
    }
}
