# Tasks: Backtesting Application

**Feature Branch**: `001-backtesting-app`
**Status**: Pending

## Phase 1: Setup
**Goal**: Initialize the project structure and install dependencies.

- [ ] T001 Initialize Vite + React + TypeScript project in repo root
- [ ] T002 Install dependencies: `lightweight-charts`, `date-fns`, `vitest`
- [ ] T003 [P] Configure Vitest and simple test check
- [ ] T004 Create project standard directory structure (`src/components`, `src/engine`, `src/assets`, `src/types`)
- [ ] T005 [P] Generate static JSON market data (AAPL, MSFT, ALV) in `src/assets/data/`

## Phase 2: Foundational (Engine)
**Goal**: Build the core backtesting engine and data services.

- [ ] T006 Define core types in `src/types/engine.ts` (Candle, Rules, Strategy, Trade)
- [ ] T007 Implement MarketDataService in `src/engine/MarketDataService.ts` to load JSON assets
- [ ] T008 Test MarketDataService loading capabilities (Unit Test)
- [ ] T009 Implement Indicator logic (SMA, RSI, MACD) in `src/engine/indicators.ts`
- [ ] T010 Test Indicator calculation logic correctness
- [ ] T011 Implement RuleEvaluator logic in `src/engine/RuleEvaluator.ts` (Condition matching)
- [ ] T012 Implement Backtester class in `src/engine/Backtester.ts` (Loop, Signal Execution, PnL)
- [ ] T013 Test Backtester full flow with mock data

## Phase 3: User Story 1 - Define Trading Rules
**Goal**: Allow users to create strategies via UI.

- [ ] T014 Create StrategyContext in `src/context/StrategyContext.tsx`
- [ ] T015 [P] Create `RuleEditor` component in `src/components/RuleEditor.tsx`
- [ ] T016 Implement Condition form (Price/Indicator selection) in `RuleEditor`
- [ ] T017 Implement Action form (Buy/Sell) in `RuleEditor`
- [ ] T018 Connect RuleEditor to StrategyContext to save/update rules
- [ ] T019 [US1] Integration: Verify rules are saved to LocalStorage via Context

## Phase 4: User Story 2 - Configure and Run Backtest
**Goal**: Select parameters and execute the simulation.

- [ ] T020 [P] Create `BacktestConfig` component (Asset Select, Date Range, Granularity)
- [ ] T021 Connect Config component to Backtester engine invoke
- [ ] T022 Create `SimulationRunner` hook/service to manage async execution state
- [ ] T023 [US2] Integration: Wire "Run" button to trigger Backtester.run() with selected params

## Phase 5: User Story 3 - View Results
**Goal**: Visualize the outcome.

- [x] T024 [P] Create `ResultsSummary` component (Total Return, Win Rate metrics)
- [x] T025 Create `EquityChart` component using `lightweight-charts`
- [x] T026 Create `TradeList` component (Table of executed trades)
- [x] T027 [US3] Assemble `ResultsDashboard` page with Summary, Chart, and List
- [x] T028 [P] Polish Chart interactions (markers for Buy/Sell points)

## Phase 6: Polish
**Goal**: UI refinement and edge cases.

- [x] T029 Implement validation (prevent running without rules)
- [x] T030 Add error handling for missing data or invalid date ranges
- [x] T031 Apply consistent CSS modules styling for layout and responsiveness
- [x] T032 Final E2E manual walkthrough (Define Strategy -> Run -> View Results)

## Dependencies
- Phase 2 (Engine) blocks Phase 4 (Run).
- Phase 1 (Data) user by Phase 2.
- Phase 5 requires Phase 4 output.
