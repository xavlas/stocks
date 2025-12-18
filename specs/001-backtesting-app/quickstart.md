# Quickstart: Backtesting Application

## Prerequisites

- Node.js 18+
- npm or pnpm

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Dev Server**
   ```bash
   npm run dev
   ```
   Access the app at `http://localhost:5173`.

## Development Usage

### Adding new Market Data
Place JSON files in `src/assets/data/`.
Format:
```json
[
  { "time": "2023-01-01", "open": 150.0, "high": 155.0, "low": 149.0, "close": 153.0, "volume": 1000000 },
  ...
]
```

### Running Tests
```bash
npm test
```
Runs the Vitest suite for the backtesting engine.

### Building for Production
```bash
npm run build
# Preview
npm run preview
```
