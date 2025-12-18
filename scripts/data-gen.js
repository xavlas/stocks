
import fs from 'fs';
import path from 'path';

const ASSETS = [
    { symbol: 'AAPL', startPrice: 150, vol: 0.02 },
    { symbol: 'MSFT', startPrice: 250, vol: 0.015 },
    { symbol: 'ALV', startPrice: 200, vol: 0.012 }
];

const startDate = new Date('2023-01-01');
const days = 365;

function generateData(asset) {
    let price = asset.startPrice;
    const data = [];

    for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);

        // Skip weekends
        if (date.getDay() === 0 || date.getDay() === 6) continue;

        const dateStr = date.toISOString().split('T')[0];
        const change = (Math.random() - 0.5) * asset.vol * price;
        const open = price;
        const close = price + change;
        const high = Math.max(open, close) + Math.random() * price * 0.005;
        const low = Math.min(open, close) - Math.random() * price * 0.005;
        const volume = Math.floor(Math.random() * 1000000) + 500000;

        data.push({
            time: dateStr,
            open: Number(open.toFixed(2)),
            high: Number(high.toFixed(2)),
            low: Number(low.toFixed(2)),
            close: Number(close.toFixed(2)),
            volume
        });

        price = close;
    }
    return data;
}

const outDir = path.resolve('src/assets/data');

ASSETS.forEach(asset => {
    const data = generateData(asset);
    const filePath = path.join(outDir, `${asset.symbol}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Generated ${filePath}`);
});
