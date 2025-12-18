# Implementation Plan: Backtesting Application

**Branch**: `001-backtesting-app` | **Date**: 2025-12-15 | **Spec**: [feature spec](../001-backtesting-app/spec.md)
**Input**: Feature specification from `/specs/001-backtesting-app/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a client-side React web application (via Vite) to allow users to define trading strategies using a visual rule editor, run backtests against bundled historical data (AAPL, MSFT, ALV), and visualize results with interactive charts.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.x
**Primary Dependencies**: React 18, Vite, Lightweight-charts (for financial plotting), date-fns
**Storage**: LocalStorage (for persisting user strategies), Bundled JSON (for historical data)
**Testing**: Vitest (Unit), React Testing Library
**Target Platform**: Modern Web Browsers
**Project Type**: Web Application (Single Page App)
**Performance Goals**: Simulation < 5s for 1 year of data.
**Constraints**: No backend server (client-side only for MVP).
**Scale/Scope**: ~10 screens/components, core backtesting engine logic.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Library-First**: Core backtesting logic should be separated from UI components.
- [x] **Test-First**: Engine logic must be unit tested.
- [x] **Simplicity**: Use Vanilla CSS (modules) as per system instructions, avoid complex state management libraries (Redux) unless necessary (React Context sufficient).

## Project Structure

### Documentation (this feature)

```text
specs/001-backtesting-app/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Web Application Structure (Vite)
src/
├── assets/          # Static assets (JSON data for stocks)
├── components/      # UI Components (RuleEditor, Chart, etc.)
├── engine/          # Backtesting Logic (Strategy, Backtester)
├── hooks/           # React hooks
├── types/           # TypeScript definitions
├── App.tsx
└── main.tsx

tests/
├── engine/          # Unit tests for backtesting logic
└── components/      # Component tests
```

**Structure Decision**: Standard Vite + React structure with a dedicated `engine/` directory for the domain logic to satisfy the "Library-First" principle (separation of concerns).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | | |
