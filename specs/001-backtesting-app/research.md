# Research & Technical Decisions: Backtesting Application

**Feature**: Backtesting Application
**Date**: 2025-12-15

## Decisions

### 1. Frontend Framework
- **Decision**: Vite + React + TypeScript
- **Rationale**: Industry standard for single-page applications. fast development server, strong typing defines data models clearly.
- **Alternatives**: Next.js (Overkill for client-only app), Plain HTML/JS (Too complex to manage UI state).

### 2. Charting Library
- **Decision**: `lightweight-charts` (TradingView)
- **Rationale**: Specifically designed for financial data (Candlestick charts), high performance, lightweight.
- **Alternatives**: 
    - `Chart.js`: Good for general charts, but candlestick support is plugin-based and less performant for large datasets.
    - `Recharts`: Great for React, but less specialized for financial interactions (zooming, panning time series).

### 3. State Management
- **Decision**: React Context + Hooks
- **Rationale**: Application state (Current Strategy, Simulation Results) is moderate. Redux is unnecessary complexity.
- **Alternatives**: Redux, Zustand, Recoil.

### 4. Backtesting Engine
- **Decision**: Custom TypeScript implementation in `src/engine/`
- **Rationale**: The requirements calls for simple rule-based execution. Existing JS libs are often unmaintained or too heavy. Writing a custom `Backtester` class ensures full control over the rule evaluation logic.
- **Alternatives**: Javascript backtesting libraries (often outdated).

### 5. Historical Data
- **Decision**: Bundled JSON files (static assets)
- **Rationale**: Ensures "Real values" are available offline and without API key/rate limit issues for the demo.
- **Data Source**: I will generate/mock realistic daily OHLCV data for AAPL, MSFT using a script or static content for the purpose of this demo, effectively mirroring real 2023 data structure.

## Unresolved Questions (Resolved)
- *None. All technical approaches are standard.*
