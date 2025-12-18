
import { describe, it, expect } from 'vitest';
import { MarketDataService } from '../../src/engine/MarketDataService';

describe('MarketDataService', () => {
    const service = new MarketDataService();

    it('should return available assets', async () => {
        const assets = await service.getAvailableAssets();
        expect(assets.length).toBe(3);
        expect(assets[0].symbol).toBe('AAPL');
    });

    it('should load history for AAPL', async () => {
        const data = await service.getHistory('AAPL');
        expect(data.length).toBeGreaterThan(0);
        expect(data[0]).toHaveProperty('open');
        expect(data[0]).toHaveProperty('close');
    });

    it('should throw error for invalid asset', async () => {
        await expect(service.getHistory('INVALID')).rejects.toThrow('Asset INVALID not found');
    });
});
