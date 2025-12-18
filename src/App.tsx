import React, { useState, useEffect } from 'react';
import { StrategyProvider, useStrategy } from './context/StrategyContext';
import { BacktestConfig } from './components/BacktestConfig';
import { RuleEditor } from './components/RuleEditor';
import { ResultsSummary } from './components/ResultsSummary';
import { TradeList } from './components/TradeList';
import { useSimulation } from './hooks/useSimulation';
import { EquityChart } from './components/EquityChart';
import { Login } from './components/Login';

function Dashboard() {
  const { strategy } = useStrategy();
  const { runSimulation, isRunning, result, error } = useSimulation();

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div style={{ width: '250px', background: 'var(--card-bg)', borderRight: '1px solid #E0E5F2', display: 'flex', flexDirection: 'column', padding: '30px 20px' }}>
        <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '50px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: 'var(--primary-blue)' }}>⚡</span> STOCK <span style={{ fontWeight: 300 }}>AI</span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <NavItem icon="📊" label="Dashboard" active />
          <NavItem icon="📈" label="Analytics" />
          <NavItem icon="⚙️" label="Settings" />
        </nav>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '30px', background: 'var(--bg-color)' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Pages / Dashboard</div>
            <h1 style={{ fontSize: '34px', fontWeight: '700', margin: 0 }}>Stock Strategy</h1>
          </div>
        </div>

        {/* KPI Section */}
        {result && <ResultsSummary metrics={result.metrics} />}

        {/* Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) 2fr', gap: '20px', alignItems: 'start', marginBottom: '20px' }}>

          {/* Controls Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <BacktestConfig
              onRun={(sym, start, end, capital, limit) => runSimulation(strategy, sym, start, end, capital, limit)}
              isRunning={isRunning}
            />
            <RuleEditor />
          </div>

          {/* Analytics Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {result ? (
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid #E0E5F2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0 }}>Performance Chart</h3>
                  <div style={{ background: '#F4F7FE', padding: '5px 10px', borderRadius: '10px', color: 'var(--primary-blue)', fontSize: '12px', fontWeight: 600 }}>
                    {result.metrics.netProfit >= 0 ? 'PROFITABLE' : 'LOSS'}
                  </div>
                </div>
                <EquityChart result={result} />
              </div>
            ) : (
              <div className="card" style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '40px' }}>📉</div>
                <p>Run a simulation to view analytics</p>
              </div>
            )}

            {result && (
              <div className="card" style={{ padding: 0 }}>
                <div style={{ padding: '20px', borderBottom: '1px solid #E0E5F2' }}>
                  <h3 style={{ margin: 0 }}>Trade History</h3>
                </div>
                <TradeList trades={result.trades} />
              </div>
            )}
          </div>
        </div>

        {error && (
          <div style={{ padding: '15px', backgroundColor: '#FFEDED', color: '#E53935', borderRadius: '12px', marginBottom: '20px', border: '1px solid #FFCDD2' }}>
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>
    </div>
  );
}

const NavItem: React.FC<{ icon: string, label: string, active?: boolean }> = ({ icon, label, active }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', cursor: 'pointer',
    background: active ? 'var(--primary-blue)' : 'transparent',
    color: active ? 'white' : 'var(--text-secondary)',
    fontWeight: 500,
    transition: 'all 0.2s'
  }}>
    <span>{icon}</span> {label}
  </div>
);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated
    const auth = sessionStorage.getItem('authenticated');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <StrategyProvider>
      <Dashboard />
    </StrategyProvider>
  );
}

export default App;
