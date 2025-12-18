# Data Model: Backtesting Application

## Core Entities

### Market Data

**Candle**
Represents a single unit of price data for a specific time interval.
- `time` (string | number): Timestamp or date string (YYYY-MM-DD).
- `open` (number): Opening price.
- `high` (number): Highest price.
- `low` (number): Lowest price.
- `close` (number): Closing price.
- `volume` (number): Trading volume.

**Asset**
Represents a tradable instrument.
- `symbol` (string): Unique identifier (e.g., "AAPL").
- `name` (string): Full name (e.g., "Apple Inc.").
- `data` (Candle[]): Array of historical candles (loaded on demand).

### Strategy & Rules

**Strategy**
- `id` (string): UUID.
- `name` (string): User-defined name.
- `rules` (Rule[]): List of trading rules.

**Rule**
- `id` (string): UUID.
- `condition` (Condition): Logic to trigger the rule.
- `action` (Action): Effect validation.

**Condition**
- `type` (string): 'price' | 'indicator'.
- `indicator` (string): 'price' | 'sma'.
- `period` (number?): For indicators like SMA (e.g., 14).
- `operator` (string): '>' | '<' | '>=' | '<=' | '=='.
- `value` (number): Threshold value.

**Action**
- `type` (string): 'buy' | 'sell'.
- `quantity` (number): Amount to trade (or percentage of equity).

### Simulation

**Trade**
- `id` (string): UUID.
- `entryDate` (string): Date of trade entry.
- `entryPrice` (number): Price at entry.
- `exitDate` (string?): Date of trade exit.
- `exitPrice` (number?): Price at exit.
- `quantity` (number): Units traded.
- `direction` (string): 'long' | 'short'.
- `pnl` (number): Profit/Loss (realized).
- `status` (string): 'open' | 'closed'.

**BacktestResult**
- `trades` (Trade[]): List of executable trades.
- `equityCurve` ({time, value}[]): Daily equity balance.
- `metrics`:
    - `totalReturn` (number): Percentage.
    - `netProfit` (number): Absolute value.
    - `totalTrades` (number): Count.
    - `winRate` (number): Percentage of winning trades.
    - `maxDrawdown` (number): Max percentage drop from peak.
