# Feature Specification: Backtesting Application

**Feature Branch**: `001-backtesting-app`
**Created**: 2025-12-15
**Status**: Draft
**Input**: User description: "je veux une application pour pouvoir faire du backtesting. Je veux pourvoir definir des regles sur cet interface pouvoir simulter des achats vente par un bot."
**Update**: User requested specific features: "get real values from history (apple, microsoft, allianz), switch between them, analyse from period to period, day by day, week by week."

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
-->

### User Story 1 - Define Trading Rules (Priority: P1)

As a trader, I want to define trading rules using a visual interface so that I can create a strategy without writing complex code.

**Why this priority**: The core value proposition is the ability to define custom rules for the bot. Without this, there is nothing to backtest.

**Independent Test**: Can be fully tested by creating a simple "Buy when price > X" rule and verifying it is saved correctly.

**Acceptance Scenarios**:

1. **Given** the rule editor, **When** I add a condition "Price > 100", **Then** the system saves this rule as part of my strategy.
2. **Given** a strategy, **When** I add an action "Buy 1 Unit", **Then** the system links this action to the condition.

---

### User Story 2 - Configure and Run Backtest Simulation (Priority: P1)

As a trader, I want to configure the backtest parameters (Asset, Dates, Frequency) and run a simulation so that I can see how my strategy performs on specific real-world scenarios.

**Why this priority**: Execution of the backtest is the primary function, and accurate configuration is required for meaningful results.

**Independent Test**: Can be tested by selecting "AAPL", a date range, and "Daily" frequency, then verifying the simulation uses that specific data subset.

**Acceptance Scenarios**:

1. **Given** the simulation setup screen, **When** I select "Apple" from the asset list, **Then** the simulation loads historical data for Apple.
2. **Given** the setup screen, **When** I switch the asset to "Microsoft", **Then** the simulation updates to use Microsoft data.
3. **Given** the setup screen, **When** I select a date range (e.g., "2023-01-01" to "2023-12-31"), **Then** the simulation only considers data within that period.
4. **Given** the setup screen, **When** I change the time granularity to "Weekly", **Then** the simulation executes trades based on weekly aggregated data.
5. **Given** valid configuration, **When** I click "Run", **Then** the system generates a list of simulated trades.

---

### User Story 3 - View Simulation Results (Priority: P2)

As a trader, I want to view detailed performance metrics of my backtest so that I can analyze the effectiveness of my strategy.

**Why this priority**: Result analysis is crucial for strategy improvement.

**Independent Test**: Can be tested by viewing the results of a completed simulation.

**Acceptance Scenarios**:

1. **Given** a completed simulation, **When** I view the results page, **Then** I see a chart of equity over time.
2. **Given** a completed simulation, **When** I look at the trade list, **Then** I can see the entry and exit price for each simulated trade.

### Edge Cases

- What happens when the historical data has gaps? System should handle missing data points gracefully (e.g., skip or warn).
- What happens if a rule creates an infinite loop or conflicting signals? **Decision**: Sell signals take precedence over Buy signals (Close positions before opening new ones).
- What happens if the strategy tries to buy with insufficient funds? System should track hypothetical cash balance and reject orders if funds are low.
- What happens if the selected date range has no data for the selected asset? System should display a clear error message.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a visual interface to define entry and exit conditions based on price and Simple Moving Average (SMA) indicator and MACD + RSI indicators.
- **FR-002**: System MUST allow users to select from a list of real assets (e.g., Apple, Microsoft, Allianz) for simulation.
- **FR-003**: System MUST allow users to specify a start date and end date for the simulation period.
- **FR-004**: System MUST allow users to select the time granularity for the simulation (e.g., Daily, Weekly).
- **FR-005**: System MUST simulate the execution of buy and sell orders based on the defined rules, selected asset, date range, and granularity.
- **FR-006**: System MUST calculate Purchase and Sale prices based on the Open price of the next candle after the signal, including transaction costs (optional default), and resulting Profit/Loss.
- **FR-007**: System MUST display a summary of performance including Total Return, Number of Trades, and Win/Loss ratio.
- **FR-008**: System MUST persist strategies so they can be reused or modified later.

### Key Entities *(include if feature involves data)*

- **Strategy**: A collection of Rules (Conditions -> Actions).
- **Rule**: A logical condition (e.g., Indicator > Value) and an associated Action (Buy/Sell).
- **Asset**: A tradable entity (Symbol, Name) available for backtesting.
- **Market Data Service**: Source of historical price data (Open, High, Low, Close, Volume) for a given Asset, Date Range, and Interval.
- **Trade**: A simulated transaction record (Type, Price, Quantity, Time).
- **Backtest Result**: The aggregate outcome of running a Strategy on Market Data.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can define a simple Moving Average Crossover strategy in under 3 minutes.
- **SC-002**: Backtest simulation for 1 year of daily data executes in under 5 seconds.
- **SC-003**: Users can switch the asset for a strategy and re-run the simulation in under 10 seconds.
- **SC-004**: 100% of simulated trades correctly follow the defined rules (verified via test cases).
- **SC-005**: Users can successfully interpret the result summary (Identify if strategy was profitable) within 10 seconds of viewing the results.

## Clarifications

### Session 2025-12-15
- Q: What happens if a rule creates conflicting signals? → A: Sell signals take precedence over Buy signals.
- Q: At what price are orders executed relative to the signal? → A: Orders execute at the Open price of the *next* candle (Next Open).
- Q: Which technical indicators must be supported in MVP? → A: Simple Moving Average (SMA) only (plus Price) + MACD + RSI 
