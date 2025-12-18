
import fs from 'fs';
import path from 'path';
import https from 'https';

const ASSETS = [
    { symbol: 'AAPL', name: 'AAPL' },
    { symbol: 'MSFT', name: 'MSFT' },
    { symbol: 'ALV.DE', name: 'ALV' }, // Map Allianz Xetra to ALV
    { symbol: 'NVDA', name: 'NVDA' },
    { symbol: 'TSLA', name: 'TSLA' },
    { symbol: 'BTC-USD', name: 'BTC' },
    { symbol: 'GLE.PA', name: 'GLE' },
    { symbol: 'SAF.PA', name: 'SAF' },
    { symbol: '1WE.F', name: 'FDJ' }
];

// Yahoo Finance API
// https://query1.finance.yahoo.com/v8/finance/chart/AAPL?interval=1d&range=2y

function fetchJson(url) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

async function run() {
    const outDir = path.resolve('src/assets/data');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    for (const asset of ASSETS) {
        console.log(`Fetching ${asset.symbol}...`);
        try {
            const url = `https://query1.finance.yahoo.com/v8/finance/chart/${asset.symbol}?interval=1d&range=5y`;
            const response = await fetchJson(url);

            const result = response.chart.result[0];
            const quote = result.indicators.quote[0];
            const timestamps = result.timestamp;

            const candles = timestamps.map((ts, i) => ({
                time: new Date(ts * 1000).toISOString().split('T')[0],
                open: Number(quote.open[i]?.toFixed(2)) || 0,
                high: Number(quote.high[i]?.toFixed(2)) || 0,
                low: Number(quote.low[i]?.toFixed(2)) || 0,
                close: Number(quote.close[i]?.toFixed(2)) || 0,
                volume: quote.volume[i] || 0
            })).filter(c => c.open > 0); // Filter out empty trading days

            const filePath = path.join(outDir, `${asset.name}.json`);
            fs.writeFileSync(filePath, JSON.stringify(candles, null, 2));
            console.log(`Saved ${candles.length} days for ${asset.name}`);
        } catch (e) {
            console.error(`Failed to fetch ${asset.symbol}:`, e.message);
        }
    }
}

run();
