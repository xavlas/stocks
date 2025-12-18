
import React, { useEffect, useRef } from 'react';
import { createChart, ColorType } from 'lightweight-charts';
import type { IChartApi } from 'lightweight-charts';
import type { BacktestResult } from '../types/engine';

export const EquityChart: React.FC<{ result: BacktestResult }> = ({ result }) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            layout: { background: { type: ColorType.Solid, color: '#2a2a2a' }, textColor: '#d1d4f9' },
            grid: { vertLines: { color: '#404040' }, horzLines: { color: '#404040' } },
            width: chartContainerRef.current.clientWidth,
            height: 400,
            rightPriceScale: {
                visible: true,
                borderColor: 'rgba(197, 203, 206, 0.8)',
            },
            leftPriceScale: {
                visible: false,
                borderColor: 'rgba(197, 203, 206, 0.8)',
            },
        });
        chartRef.current = chart;

        // 1. Price Series (Candles) - Right Axis
        const candlestickSeries = chart.addCandlestickSeries({
            upColor: '#26a69a', downColor: '#ef5350', borderVisible: false,
            wickUpColor: '#26a69a', wickDownColor: '#ef5350',
            priceScaleId: 'right'
        });
        candlestickSeries.setData(result.candles);

        // 2. Equity Series (Area) - Removed as per request
        /*
        const areaSeries = chart.addAreaSeries({
            lineColor: '#2962FF', topColor: 'rgba(41, 98, 255, 0.5)', bottomColor: 'rgba(41, 98, 255, 0.05)',
            lineWidth: 2,
            priceScaleId: 'left', // Separate scale for Equity
            priceFormat: {
                type: 'price',
                precision: 2,
                minMove: 0.01,
            },
        });

        const equityData = result.equityCurve.map(p => ({
            time: p.time,
            value: p.value
        }));
        areaSeries.setData(equityData);
        */

        // Markers on Price Series
        const markers: any[] = [];
        for (const t of result.trades) {
            // Find rule index (1-based) from triggeredRuleId
            const ruleIndex = t.triggeredRuleId
                ? result.strategy?.rules.findIndex(r => r.id === t.triggeredRuleId) ?? -1
                : -1;
            const ruleNum = ruleIndex >= 0 ? `#${ruleIndex + 1}` : '';

            markers.push({
                time: t.entryDate,
                position: t.direction === 'long' ? 'belowBar' : 'aboveBar',
                color: '#2196F3',
                shape: 'arrowUp',
                text: `${ruleNum} Buy ${t.quantity}`
            });
            if (t.exitDate) {
                markers.push({
                    time: t.exitDate,
                    position: 'aboveBar',
                    color: '#FF9800',
                    shape: 'arrowDown',
                    text: `Sell (PnL: ${t.pnl.toFixed(2)})`
                });
            }
        }
        markers.sort((a, b) => (a.time > b.time ? 1 : -1));
        candlestickSeries.setMarkers(markers);

        if (result.debugIndicators) {
            // Separate oscillators (RSI, ROC) from price-based indicators
            const rsiIndicators = result.debugIndicators.filter(ind => ind.name.toLowerCase().includes('rsi'));
            const rocIndicators = result.debugIndicators.filter(ind => ind.name.toLowerCase().includes('roc'));
            const priceIndicators = result.debugIndicators.filter(ind =>
                !ind.name.toLowerCase().includes('rsi') &&
                !ind.name.toLowerCase().includes('roc')
            );

            // Add price-based indicators to main chart
            priceIndicators.forEach((ind) => {
                const lineSeries = chart.addLineSeries({
                    color: ind.color || '#FFA726',
                    lineWidth: 1,
                    priceScaleId: 'right', // Overlay on price
                    title: ind.name
                });
                lineSeries.setData(ind.data);
            });

            // Add RSI indicators to separate pane (top oscillator)
            rsiIndicators.forEach((ind) => {
                const rsiSeries = chart.addLineSeries({
                    color: ind.color || '#9C27B0',
                    lineWidth: 2,
                    priceScaleId: 'rsi', // Separate scale
                    title: ind.name
                });
                rsiSeries.setData(ind.data);
            });

            // Add ROC indicators to separate pane (bottom oscillator)
            rocIndicators.forEach((ind) => {
                const rocSeries = chart.addLineSeries({
                    color: ind.color || '#FF5722',
                    lineWidth: 2,
                    priceScaleId: 'roc', // Separate scale
                    title: ind.name
                });
                rocSeries.setData(ind.data);
            });

            // Configure RSI scale if we have RSI indicators
            if (rsiIndicators.length > 0 && rocIndicators.length > 0) {
                // Both RSI and ROC: split the bottom area
                chart.priceScale('rsi').applyOptions({
                    scaleMargins: {
                        top: 0.7, // Position RSI in 70-85% range
                        bottom: 0.15
                    },
                    borderVisible: true,
                    visible: true
                });
                chart.priceScale('roc').applyOptions({
                    scaleMargins: {
                        top: 0.85, // Position ROC in bottom 15%
                        bottom: 0
                    },
                    borderVisible: true,
                    visible: true
                });
            } else if (rsiIndicators.length > 0) {
                // Only RSI
                chart.priceScale('rsi').applyOptions({
                    scaleMargins: {
                        top: 0.7, // Position RSI in bottom 30% of chart
                        bottom: 0
                    },
                    borderVisible: true,
                    visible: true
                });
            } else if (rocIndicators.length > 0) {
                // Only ROC
                chart.priceScale('roc').applyOptions({
                    scaleMargins: {
                        top: 0.7, // Position ROC in bottom 30% of chart
                        bottom: 0
                    },
                    borderVisible: true,
                    visible: true
                });
            }
        }

        chart.timeScale().fitContent();

        const handleResize = () => {
            chart.applyOptions({ width: chartContainerRef.current?.clientWidth });
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, [result]);

    return (
        <div ref={chartContainerRef} className="card" style={{ position: 'relative', width: '100%', height: '400px', marginBottom: '20px', padding: 0, overflow: 'hidden' }}>
            <div style={{
                position: 'absolute',
                left: '12px',
                top: '12px',
                zIndex: 2,
                fontSize: '14px',
                fontFamily: 'sans-serif',
                lineHeight: '18px',
                fontWeight: 300,
                color: '#d1d4f9',
                backgroundColor: 'rgba(42, 42, 42, 0.5)',
                padding: '8px',
                borderRadius: '4px',
                pointerEvents: 'none' // Click through logic
            }}>

                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ width: '10px', height: '10px', backgroundColor: '#26a69a', marginRight: '5px', display: 'inline-block' }}></span>
                    <span>Price (Right)</span>
                </div>
                {result.debugIndicators?.map(ind => (
                    <div key={ind.name} style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ width: '10px', height: '10px', backgroundColor: ind.color, marginRight: '5px', display: 'inline-block' }}></span>
                        <span>{ind.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
