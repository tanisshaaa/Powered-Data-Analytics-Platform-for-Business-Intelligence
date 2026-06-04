import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

interface AnomalyPoint {
  order_date: string;
  total_sales: number;
  anomaly: number; // -1 = anomaly, 1 = normal
}

interface AnomalySummary {
  total_count: number;
  anomaly_count: number;
  normal_count: number;
  contamination_rate: number;
  normal_average_sales: number;
  anomaly_average_sales: number;
  latest_anomaly: boolean;
  latest_date: string;
  latest_sales: number;
}

interface AnomalyResponse {
  points: AnomalyPoint[];
  summary: AnomalySummary;
  is_mock?: boolean;
}

// Styling Constants (Matching Premium Dark Theme)
const glassPanelStyle: React.CSSProperties = {
  background: 'rgba(12, 12, 15, 0.75)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '16px',
  padding: '24px',
  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
};

// Custom Tooltip for the Recharts AreaChart
const CustomAnomalyTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    const isAnomaly = item.anomaly === -1;
    return (
      <div style={{
        backgroundColor: '#0c0c0f',
        border: `1px solid ${isAnomaly ? '#ef4444' : '#00d2ff'}`,
        padding: '12px 16px',
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.8)'
      }}>
        <p style={{ margin: 0, fontWeight: 'bold', color: isAnomaly ? '#ef4444' : 'var(--primary)', fontSize: '0.9rem' }}>
          {formatDate(item.order_date)}
        </p>
        <p style={{ margin: '6px 0 0 0', fontSize: '0.85rem', color: '#f5f5f7' }}>
          Sales: <strong>{formatCurrency(item.total_sales)}</strong>
        </p>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: isAnomaly ? '#f87171' : '#10b981', fontWeight: '500' }}>
          Status: <strong>{isAnomaly ? '🚨 Anomaly (Outlier)' : '🟢 Normal pattern'}</strong>
        </p>
      </div>
    );
  }
  return null;
};

// Custom Dot Component to highlight Isolation Forest anomalies
const CustomDot = (props: any) => {
  const { cx, cy, payload } = props;
  if (payload && payload.anomaly === -1) {
    return (
      <g key={payload.order_date}>
        {/* Pulsing indicator ring (static) */}
        <circle cx={cx} cy={cy} r={12} fill="none" stroke="#ef4444" strokeWidth={1.5} />
        {/* Center red point (static) */}
        <circle cx={cx} cy={cy} r={6} fill="#ef4444" stroke="#ffffff" strokeWidth={2} />
      </g>
    );
  }
  return null;
};

const AnomalyPage: React.FC = () => {
  const [data, setData] = useState<AnomalyResponse | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [timeRange, setTimeRange] = useState<30 | 60 | 90 | 120>(60);
  const [alert, setAlert] = useState<{ show: boolean; message: string; type: 'success' | 'error' | '' }>({
    show: false,
    message: '',
    type: ''
  });

  const fetchAnomalyData = async (useDemo: boolean) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/anomaly?demo=${useDemo ? 'true' : 'false'}`);
      if (!response.ok) throw new Error('Failed to fetch anomaly data');
      const json: AnomalyResponse = await response.json();
      setData(json);
      setIsDemoMode(!!json.is_mock);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err: any) {
      console.error(err);
      setAlert({
        show: true,
        message: 'Could not connect to backend server. Operating in simulated offline mode.',
        type: 'error'
      });
      setTimeout(() => setAlert({ show: false, message: '', type: '' }), 5000);
      
      // Fallback
      try {
        const fallbackRes = await fetch('http://localhost:5000/api/anomaly?demo=true');
        const fallbackJson = await fallbackRes.json();
        setData(fallbackJson);
        setIsDemoMode(true);
      } catch (fallbackErr) {
        console.error('Local fallback failed:', fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/dashboard-stats');
        if (!res.ok) throw new Error('Offline');
        await fetchAnomalyData(false);
      } catch {
        console.warn('Backend offline or unpopulated. Fetching demo anomalies...');
        await fetchAnomalyData(true);
      }
    };
    checkBackend();
  }, []);

  const handleSimulate = async (type: 'normal' | 'spike') => {
    if (isSimulating) return;
    setIsSimulating(true);
    try {
      const response = await fetch(`http://localhost:5000/api/anomaly/simulate?demo=${isDemoMode ? 'true' : 'false'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type })
      });
      
      if (!response.ok) throw new Error('Simulation endpoint failed');
      const resJson = await response.json();
      
      // Re-fetch anomalies
      await fetchAnomalyData(isDemoMode);
      
      setAlert({
        show: true,
        message: `Successfully simulated a ${type === 'spike' ? 'sales spike anomaly' : 'normal operation day'} of ${formatCurrency(resJson.data.total_sales)} on ${resJson.data.order_date}!`,
        type: 'success'
      });
      setTimeout(() => setAlert({ show: false, message: '', type: '' }), 6000);
      
    } catch (err: any) {
      console.error(err);
      setAlert({
        show: true,
        message: 'Simulation failed. Check backend connection.',
        type: 'error'
      });
      setTimeout(() => setAlert({ show: false, message: '', type: '' }), 5000);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleReset = async () => {
    if (isSimulating) return;
    setIsSimulating(true);
    try {
      const response = await fetch(`http://localhost:5000/api/anomaly/reset?demo=${isDemoMode ? 'true' : 'false'}`, {
        method: 'POST'
      });
      
      if (!response.ok) throw new Error('Reset endpoint failed');
      
      await fetchAnomalyData(isDemoMode);
      
      setAlert({
        show: true,
        message: 'Successfully reset simulation and cleaned up database tables!',
        type: 'success'
      });
      setTimeout(() => setAlert({ show: false, message: '', type: '' }), 5000);
      
    } catch (err: any) {
      console.error(err);
      setAlert({
        show: true,
        message: 'Failed to reset simulation.',
        type: 'error'
      });
      setTimeout(() => setAlert({ show: false, message: '', type: '' }), 5000);
    } finally {
      setIsSimulating(false);
    }
  };

  const sidebarLinkStyle: React.CSSProperties = {
    textDecoration: 'none',
    color: 'rgba(255, 255, 255, 0.8)',
    padding: '12px 15px',
    borderRadius: '8px',
    transition: 'background 0.3s, color 0.3s',
    display: 'block',
    fontSize: '1rem',
    fontWeight: '500'
  };

  const activeSidebarLinkStyle: React.CSSProperties = {
    ...sidebarLinkStyle,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: 'var(--primary)',
    borderLeft: '4px solid var(--primary)',
    fontWeight: 'bold'
  };

  // Process data for rendering in the chart
  const fullChartData = data?.points || [];
  const chartData = fullChartData.slice(-timeRange);

  // Filter out recent anomalies for the feed (showing recent anomalies first)
  const anomaliesFeed = fullChartData
    .filter(p => p.anomaly === -1)
    .slice(-8)
    .reverse();

  return (
    <div className="dashboard-layout animate-fade-in" style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-gradient)', color: '#ffffff' }}>
      {/* Dynamic CSS animations injected */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.6; }
        }
        @keyframes ping {
          0% { transform: scale(0.6); opacity: 1; }
          100% { transform: scale(2.8); opacity: 0; }
        }
        .animate-pulse-dot {
          transform-origin: center;
          animation: pulse 1.8s ease-in-out infinite;
        }
        .animate-ping-dot {
          transform-origin: center;
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        .pulse-banner-green {
          animation: greenPulse 2.5s infinite;
        }
        .pulse-banner-red {
          animation: redPulse 1.2s infinite;
        }
        @keyframes greenPulse {
          0% { border-color: rgba(16, 185, 129, 0.2); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.1); }
          50% { border-color: rgba(16, 185, 129, 0.6); box-shadow: 0 0 15px 2px rgba(16, 185, 129, 0.2); }
          100% { border-color: rgba(16, 185, 129, 0.2); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.1); }
        }
        @keyframes redPulse {
          0% { border-color: rgba(239, 68, 68, 0.3); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.2); background: rgba(239, 68, 68, 0.05); }
          50% { border-color: rgba(239, 68, 68, 1); box-shadow: 0 0 20px 4px rgba(239, 68, 68, 0.4); background: rgba(239, 68, 68, 0.15); }
          100% { border-color: rgba(239, 68, 68, 0.3); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.2); background: rgba(239, 68, 68, 0.05); }
        }
      `}</style>

      {/* Sidebar */}
      <aside className="sidebar glass-panel" style={{ 
        width: isSidebarOpen ? '280px' : '0px', 
        padding: isSidebarOpen ? '30px' : '0px', 
        opacity: isSidebarOpen ? 1 : 0,
        overflow: 'hidden',
        borderRight: isSidebarOpen ? '1px solid rgba(255, 255, 255, 0.1)' : 'none', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '15px',
        transition: 'all 0.3s ease',
        whiteSpace: 'nowrap',
        zIndex: 50
      }}>
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" className="sidebar-link" style={{ ...sidebarLinkStyle, padding: 0, color: 'var(--text-muted)' }}>
            &larr; Back to Home
          </Link>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            style={{
              background: 'rgba(255, 204, 0, 0.1)',
              border: '1px solid rgba(255, 204, 0, 0.3)',
              color: 'var(--primary)',
              cursor: 'pointer',
              padding: '6px 10px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s'
            }}
            title="Collapse Sidebar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
        </div>

        <h2 style={{ color: 'var(--primary)', marginBottom: '30px', fontSize: '1.5rem', marginTop: 0 }}>Retail<span className="logo-accent">GPT</span></h2>
        
        <Link to="/dashboard" className="sidebar-link" style={sidebarLinkStyle}>
          📊 Dashboard
        </Link>
        <Link to="/anomaly" className="sidebar-link active" style={activeSidebarLinkStyle}>
          🚨 Anomaly Monitoring
        </Link>
        <Link to="/chatbot" className="sidebar-link" style={sidebarLinkStyle}>
          🤖 Chatbot
        </Link>
        <Link to="/forecasting" className="sidebar-link" style={sidebarLinkStyle}>
          📈 Analysis & Forecasting
        </Link>
      </aside>

      {/* Main Panel */}
      <main className="dashboard-main" style={{ flex: 1, padding: '40px', overflowY: 'auto', position: 'relative' }}>
        
        {/* Loading Overlay */}
        {(loading || isSimulating) && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(6, 6, 8, 0.85)',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              border: '4px solid rgba(255, 204, 0, 0.1)',
              borderTop: '4px solid var(--primary)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <p style={{ color: 'var(--primary)', fontSize: '1.1rem', fontWeight: '500', margin: 0, letterSpacing: '0.5px' }}>
              {loading ? 'Evaluating sales anomalies via Isolation Forest...' : 'Simulating transactions and feeding ML models...'}
            </p>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}

        {/* Header */}
        <div className="dashboard-header" style={{ marginBottom: '35px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              {!isSidebarOpen && (
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  style={{
                    background: 'rgba(255, 204, 0, 0.1)',
                    border: '1px solid rgba(255, 204, 0, 0.3)',
                    color: 'var(--primary)',
                    fontSize: '1.2rem',
                    cursor: 'pointer',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.2s',
                    marginRight: '10px'
                  }}
                  title="Open Sidebar"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                  </svg>
                </button>
              )}
              <h1 className="text-primary" style={{ fontSize: '2.5rem', margin: 0, color: 'var(--primary)' }}>Anomaly Operations Center</h1>
            </div>
            <p className="text-muted" style={{ margin: '5px 0 0 0', color: 'var(--text-muted)' }}>
              Real-time threat detection and volume spike isolation using Scikit-Learn Isolation Forest.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }} className="font-mono">
              Last evaluation: {lastUpdated || 'Never'}
            </span>
            <button 
              onClick={() => fetchAnomalyData(isDemoMode)} 
              className="btn btn-secondary"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#fff',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Global Notifications Block */}
        {alert.show && (
          <div style={{
            ...glassPanelStyle,
            borderColor: alert.type === 'success' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)',
            background: alert.type === 'success' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
            color: '#fff',
            marginBottom: '30px',
            padding: '16px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span>{alert.type === 'success' ? '🟢' : '🔴'}</span>
              <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: '500' }}>{alert.message}</p>
            </div>
            <button 
              onClick={() => setAlert({ show: false, message: '', type: '' })}
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.7 }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Active Alert Banner */}
        {data && (
          <div style={{
            ...glassPanelStyle,
            padding: '20px 28px',
            borderRadius: '12px',
            marginBottom: '30px',
            border: '2px solid',
            transition: 'all 0.3s ease'
          }} className={data.summary.latest_anomaly ? 'pulse-banner-red' : 'pulse-banner-green'}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{
                fontSize: '2rem',
                animation: data.summary.latest_anomaly ? 'pulse 1s infinite' : 'none'
              }}>
                {data.summary.latest_anomaly ? '🚨' : '🛡️'}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: data.summary.latest_anomaly ? '#ef4444' : '#10b981', fontWeight: 'bold' }}>
                  {data.summary.latest_anomaly ? 'CRITICAL SYSTEM ALERT: VOLUME ANOMALY DETECTED' : 'SYSTEM STATUS: SECURED'}
                </h3>
                <p style={{ margin: '5px 0 0 0', fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.85)' }}>
                  {data.summary.latest_anomaly 
                    ? `Outlier volume of ${formatCurrency(data.summary.latest_sales)} was detected on ${data.summary.latest_date}. Isolation Forest flagged this transaction profile as an outlier (out of norm).`
                    : `Active monitoring reports sales volume of ${formatCurrency(data.summary.latest_sales)} on ${data.summary.latest_date} matches standard seasonal distributions. No threats identified.`
                  }
                </p>
              </div>
              <div>
                <span style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  background: data.summary.latest_anomaly ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                  color: data.summary.latest_anomaly ? '#f87171' : '#34d399',
                  border: `1px solid ${data.summary.latest_anomaly ? '#ef4444' : '#10b981'}`
                }}>
                  {data.summary.latest_anomaly ? 'THREAT ACTIVE' : 'MONITORING'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Metrics Grid */}
        {data && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '25px', marginBottom: '35px' }}>
            
            <div style={glassPanelStyle}>
              <h4 style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Latest Daily Sales
              </h4>
              <p style={{ 
                margin: '12px 0 0 0', 
                fontSize: '2.2rem', 
                fontWeight: 'bold',
                color: data.summary.latest_anomaly ? '#ef4444' : '#fff'
              }}>
                {formatCurrency(data.summary.latest_sales)}
              </p>
              <div style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Recorded on {formatDate(data.summary.latest_date)}
              </div>
            </div>

            <div style={glassPanelStyle}>
              <h4 style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Model Contamination Rate
              </h4>
              <p style={{ margin: '12px 0 0 0', fontSize: '2.2rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                {(data.summary.contamination_rate * 100).toFixed(1)}%
              </p>
              <div style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Isolation Forest outlier threshold
              </div>
            </div>

            <div style={glassPanelStyle}>
              <h4 style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Total Outliers Isolated
              </h4>
              <p style={{ margin: '12px 0 0 0', fontSize: '2.2rem', fontWeight: 'bold', color: '#f87171' }}>
                {data.summary.anomaly_count} <span style={{ fontSize: '1.2rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>/ {data.summary.total_count}</span>
              </p>
              <div style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {((data.summary.anomaly_count / data.summary.total_count) * 100).toFixed(2)}% of total transaction days
              </div>
            </div>

            <div style={glassPanelStyle}>
              <h4 style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Operational Average Sales
              </h4>
              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                  <span style={{ color: '#34d399' }}>🟢 Normal Avg:</span>
                  <strong style={{ color: '#fff' }}>{formatCurrency(data.summary.normal_average_sales)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                  <span style={{ color: '#f87171' }}>🔴 Outlier Avg:</span>
                  <strong style={{ color: '#fff' }}>{formatCurrency(data.summary.anomaly_average_sales)}</strong>
                </div>
              </div>
              <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'rgba(255, 204, 0, 0.75)' }} className="font-mono">
                Ratio: {(data.summary.anomaly_average_sales / (data.summary.normal_average_sales || 1)).toFixed(1)}x Normal Base
              </div>
            </div>

          </div>
        )}

        {/* Main Chart and Controls Panel */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px', marginBottom: '35px' }}>
          
          <div style={glassPanelStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 'bold' }}>Sales Volatility & Isolation markers</h3>
                <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Highlighting outlier daily totals (Red Radar Points) mapped against normal operations.
                </p>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Timeline Frame:</span>
                {[30, 60, 90, 120].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTimeRange(t as any)}
                    style={{
                      background: timeRange === t ? 'rgba(255, 204, 0, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                      border: timeRange === t ? '1px solid var(--primary)' : '1px solid rgba(255, 255, 255, 0.1)',
                      color: timeRange === t ? 'var(--primary)' : '#fff',
                      padding: '5px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 'bold',
                      transition: 'all 0.2s'
                    }}
                  >
                    {t} Days
                  </button>
                ))}
              </div>
            </div>

            {/* Recharts Area Chart */}
            <div style={{ width: '100%', height: '380px' }}>
              {data && data.points && data.points.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00d2ff" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#00d2ff" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.06)" vertical={false} />
                    <XAxis 
                      dataKey="order_date" 
                      stroke="#8e8e93" 
                      tickLine={false} 
                      axisLine={false} 
                      dy={10}
                      fontSize={11}
                      tickFormatter={formatDate}
                    />
                    <YAxis 
                      stroke="#8e8e93" 
                      tickLine={false} 
                      axisLine={false} 
                      dx={-10}
                      fontSize={11}
                      tickFormatter={formatCurrency}
                    />
                    <Tooltip content={<CustomAnomalyTooltip />} />
                    <Legend 
                      verticalAlign="top" 
                      height={36} 
                      iconType="circle"
                      iconSize={10}
                      wrapperStyle={{ fontSize: '0.9rem', color: '#fff' }}
                    />
                    
                    {/* Main Daily Sales Area Curve */}
                    <Area 
                      type="monotone" 
                      dataKey="total_sales" 
                      name="Daily Sales Total" 
                      stroke="#00d2ff" 
                      strokeWidth={2} 
                      fillOpacity={1} 
                      fill="url(#colorSales)"
                      dot={<CustomDot />}
                      activeDot={{ r: 8, stroke: '#fff', strokeWidth: 2 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                  Gathering statistical distributions...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Control and Feed Grid (Two Columns) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '30px', marginBottom: '35px' }}>
          
          {/* Simulation Control Room */}
          <div style={glassPanelStyle}>
            <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 'bold' }}>Simulation Threat Room</h3>
            <p style={{ margin: '5px 0 20px 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Manually trigger simulation dates to verify real-time ML anomaly detection updates.
            </p>

            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              padding: '16px 20px',
              borderRadius: '10px',
              marginBottom: '25px',
              fontSize: '0.9rem',
              lineHeight: '1.5'
            }}>
              <strong style={{ color: 'var(--primary)' }}>Demo Sequence Guide:</strong>
              <ol style={{ paddingLeft: '20px', margin: '8px 0 0 0' }}>
                <li>Click <span style={{ color: '#34d399', fontWeight: '600' }}>Simulate Normal Day</span> 2-3 times. Timeline expands smoothly with standard volume values. No security warnings trigger.</li>
                <li>Click <span style={{ color: '#f87171', fontWeight: '600' }}>Simulate Sales Spike</span> once. Injects a transaction day at ~3x normal average.</li>
                <li>A flashing red warning dot overlays the graph at the spike location.</li>
                <li>The System Status bar instantly turns red and issues a <strong style={{ color: '#ef4444' }}>CRITICAL ALERT</strong>.</li>
              </ol>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '25px' }}>
              <button
                onClick={() => handleSimulate('normal')}
                disabled={isSimulating}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#fff',
                  border: 'none',
                  padding: '14px 20px',
                  borderRadius: '10px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  opacity: isSimulating ? 0.6 : 1,
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                  transition: 'transform 0.2s'
                }}
              >
                <span>🟢</span> Simulate Normal Day
              </button>
              
              <button
                onClick={() => handleSimulate('spike')}
                disabled={isSimulating}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: '#fff',
                  border: 'none',
                  padding: '14px 20px',
                  borderRadius: '10px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  opacity: isSimulating ? 0.6 : 1,
                  boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)',
                  transition: 'transform 0.2s'
                }}
              >
                <span>🚨</span> Simulate Sales Spike
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: isDemoMode ? '#ffaa00' : '#10b981'
                  }}></span>
                  <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>
                    {isDemoMode ? 'Demo Mode (Offline Fallback)' : 'Database Mode (Supabase Connected)'}
                  </span>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Toggle demo mode to test without database write permissions.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => {
                    const newMode = !isDemoMode;
                    setIsDemoMode(newMode);
                    fetchAnomalyData(newMode);
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                  }}
                >
                  {isDemoMode ? 'Use Live DB' : 'Use Demo Mode'}
                </button>

                <button
                  onClick={handleReset}
                  disabled={isSimulating}
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#f87171',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    opacity: isSimulating ? 0.6 : 1
                  }}
                >
                  🧹 Reset Simulation
                </button>
              </div>
            </div>
          </div>

          {/* Anomaly Detection Feed */}
          <div style={glassPanelStyle}>
            <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 'bold' }}>Outlier Threat Feed</h3>
            <p style={{ margin: '5px 0 20px 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Recent sales records marked as outliers by the active Isolation Forest algorithm.
            </p>

            <div style={{ overflowX: 'auto', maxHeight: '310px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <th style={{ padding: '10px 8px', color: 'var(--text-muted)', fontWeight: 'bold' }}>Outlier Date</th>
                    <th style={{ padding: '10px 8px', color: 'var(--text-muted)', fontWeight: 'bold' }}>Recorded Sales</th>
                    <th style={{ padding: '10px 8px', color: 'var(--text-muted)', fontWeight: 'bold' }}>Outlier Ratio</th>
                    <th style={{ padding: '10px 8px', color: 'var(--text-muted)', fontWeight: 'bold', textAlign: 'right' }}>Security Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {anomaliesFeed.length > 0 ? (
                    anomaliesFeed.map((anomaly, idx) => {
                      // Calculate deviation
                      const normalAvg = data?.summary.normal_average_sales || 9500;
                      const deviationRatio = anomaly.total_sales / normalAvg;
                      
                      let riskColor = '#ffaa00'; // Medium (yellow)
                      let riskText = 'Medium Deviation';
                      
                      if (deviationRatio >= 2.5) {
                        riskColor = '#ef4444'; // High (red)
                        riskText = 'High Outlier Spike';
                      } else if (deviationRatio <= 0.3) {
                        riskColor = '#3b82f6'; // Low (blue/cyan)
                        riskText = 'Severe Drop outlier';
                      }
                      
                      return (
                        <tr 
                          key={anomaly.order_date + idx} 
                          style={{ 
                            borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                            backgroundColor: idx === 0 && data.summary.latest_anomaly ? 'rgba(239, 68, 68, 0.05)' : 'transparent'
                          }}
                        >
                          <td style={{ padding: '12px 8px', fontWeight: '500' }}>
                            {formatDate(anomaly.order_date)}
                            {idx === 0 && data.summary.latest_anomaly && (
                              <span style={{
                                marginLeft: '8px',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                background: '#ef4444',
                                color: '#fff',
                                fontSize: '0.65rem',
                                fontWeight: 'bold'
                              }}>
                                NEW
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '12px 8px', color: '#f87171', fontWeight: 'bold' }}>
                            {formatCurrency(anomaly.total_sales)}
                          </td>
                          <td style={{ padding: '12px 8px' }} className="font-mono">
                            {deviationRatio.toFixed(1)}x Avg Sales
                          </td>
                          <td style={{ padding: '12px 8px', color: riskColor, fontWeight: '600', textAlign: 'right' }}>
                            {riskText}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} style={{ padding: '20px 8px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No anomalies captured in the active date ranges.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
};

export default AnomalyPage;
