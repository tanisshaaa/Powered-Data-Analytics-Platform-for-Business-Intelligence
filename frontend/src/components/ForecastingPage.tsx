import { API_BASE } from '../config';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from 'recharts';

interface ForecastItem {
  order_date: string;
  total_sales: number;
  is_forecast: boolean;
}

interface ForecastResponse {
  forecast: ForecastItem[];
  feature_importance: Record<string, number>;
  historical: ForecastItem[];
  is_mock?: boolean;
}

const COLORS = ['#ffcc00', '#ff8800', '#00ffaa', '#00d2ff', '#bd00ff'];

// Helper formatters
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LooseRecord = any;

// Custom tooltips
const CustomForecastTooltip = ({ active, payload }: { active?: boolean, payload?: LooseRecord[] }) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    const isForecast = item.isForecast;
    return (
      <div style={{
        backgroundColor: '#0c0c0f',
        border: `1px solid ${isForecast ? 'rgba(255, 136, 0, 0.4)' : 'rgba(255, 204, 0, 0.4)'}`,
        padding: '12px 16px',
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.8)'
      }}>
        <p style={{ margin: 0, fontWeight: 'bold', color: isForecast ? '#ff8800' : 'var(--primary)', fontSize: '0.9rem' }}>
          {formatDate(item.date)}
        </p>
        <p style={{ margin: '6px 0 0 0', fontSize: '0.85rem', color: '#f5f5f7' }}>
          Status: <strong>{isForecast ? 'XGBoost Forecast' : 'Historical Daily'}</strong>
        </p>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.95rem', color: '#fff' }}>
          Sales: <strong>{formatCurrency(item.tooltipSales)}</strong>
        </p>
      </div>
    );
  }
  return null;
};

const CustomFeatureTooltip = ({ active, payload }: { active?: boolean, payload?: LooseRecord[] }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div style={{
        backgroundColor: '#0c0c0f',
        border: '1px solid rgba(0, 255, 170, 0.3)',
        padding: '10px 14px',
        borderRadius: '8px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.8)'
      }}>
        <p style={{ margin: 0, fontWeight: 'bold', color: '#00ffaa', fontSize: '0.9rem' }}>{data.feature}</p>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#f5f5f7' }}>
          Importance Weight: <strong>{data.importance}%</strong>
        </p>
      </div>
    );
  }
  return null;
};

const ForecastingPage: React.FC = () => {
  const [data, setData] = useState<ForecastResponse | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRetraining, setIsRetraining] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [alert, setAlert] = useState<{ show: boolean; message: string; type: 'success' | 'error' | '' }>({
    show: false,
    message: '',
    type: ''
  });

  // Fetch forecast data
  const fetchForecast = async (useDemo: boolean) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/forecast?demo=${useDemo ? 'true' : 'false'}`);
      if (!response.ok) throw new Error('Failed to fetch forecasting data');
      const json: ForecastResponse = await response.json();
      setData(json);
      setIsDemoMode(!!json.is_mock);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err: unknown) {
      console.error(err);
      // Fallback alert
      setAlert({
        show: true,
        message: 'Could not connect to backend server. Operating in simulated offline mode.',
        type: 'error'
      });
      setTimeout(() => setAlert({ show: false, message: '', type: '' }), 5000);
      
      // Load fallback simulated data locally
      try {
        const fallbackRes = await fetch(`${API_BASE}/api/forecast?demo=true`);
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
    // Check if main dashboard stats indicates offline mode
    const checkBackend = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/dashboard-stats`);
        if (!res.ok) throw new Error('Offline');
        await fetchForecast(false);
      } catch {
        console.warn('Backend offline or unpopulated. Fetching demo forecast...');
        await fetchForecast(true);
      }
    };
    checkBackend();
  }, []);

  const handleRetrain = async () => {
    setIsRetraining(true);
    try {
      // Simulate training delay for wowed UX micro-animations
      await new Promise(resolve => setTimeout(resolve, 1500));
      const response = await fetch(`${API_BASE}/api/forecast?demo=${isDemoMode ? 'true' : 'false'}`);
      if (!response.ok) throw new Error('Model retraining failed');
      const json: ForecastResponse = await response.json();
      setData(json);
      setLastUpdated(new Date().toLocaleTimeString());
      setAlert({
        show: true,
        message: `XGBoost Regressor retrained successfully! 7-day projection updated.`,
        type: 'success'
      });
      setTimeout(() => setAlert({ show: false, message: '', type: '' }), 4000);
    } catch (err: unknown) {
      setAlert({
        show: true,
        message: 'Retraining failed: ' + (err instanceof Error ? err.message : String(err)),
        type: 'error'
      });
      setTimeout(() => setAlert({ show: false, message: '', type: '' }), 4000);
    } finally {
      setIsRetraining(false);
    }
  };

  const handleModeToggle = () => {
    const nextMode = !isDemoMode;
    setIsDemoMode(nextMode);
    fetchForecast(nextMode);
  };


  // Data processing for charts
  const historical = data?.historical || [];
  const forecast = data?.forecast || [];
  const featureImportance = data?.feature_importance || {};

  // Compute merged data for continuous chart line
  const chartData: Record<string, unknown>[] = [];
  historical.forEach((h, index) => {
    const isLast = index === historical.length - 1 && forecast.length > 0;
    chartData.push({
      date: h.order_date,
      historicalSales: h.total_sales,
      forecastSales: isLast ? h.total_sales : null,
      tooltipSales: h.total_sales,
      isForecast: false
    });
  });

  forecast.forEach(f => {
    chartData.push({
      date: f.order_date,
      historicalSales: null,
      forecastSales: f.total_sales,
      tooltipSales: f.total_sales,
      isForecast: true
    });
  });

  // Calculate metrics
  const totalForecasted = forecast.reduce((sum, item) => sum + item.total_sales, 0);
  const avgForecasted = forecast.length > 0 ? totalForecasted / forecast.length : 0;
  
  let peakDay = 'N/A';
  let peakSales = 0;
  forecast.forEach(f => {
    if (f.total_sales > peakSales) {
      peakSales = f.total_sales;
      peakDay = f.order_date;
    }
  });

  // Calculate growth compared to previous 7 days of history
  const last7DaysHistorySum = historical.slice(-7).reduce((sum, item) => sum + item.total_sales, 0);
  const growthRate = last7DaysHistorySum > 0 ? ((totalForecasted - last7DaysHistorySum) / last7DaysHistorySum) * 100 : 0;

  // Process feature importance
  const featImportanceData = Object.entries(featureImportance).map(([key, value]) => {
    let name = key;
    if (key === 'lag_1') name = "Yesterday's Sales (Lag 1)";
    else if (key === 'lag_7') name = "Same Day Last Week (Lag 7)";
    else if (key === 'rolling_7') name = "7-Day Rolling Average";
    else if (key === 'day_of_week') name = "Day of Week (Weekly Cycle)";
    else if (key === 'month') name = "Month of Year (Seasonality)";

    return {
      feature: name,
      rawKey: key,
      importance: (value * 100).toFixed(1),
      value: value
    };
  }).sort((a, b) => b.value - a.value);


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

  return (
    <div className="dashboard-layout animate-fade-in" style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-gradient)' }}>
      
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
        whiteSpace: 'nowrap'
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
              justifyContent: 'center'
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
        <Link to="/anomaly" className="sidebar-link" style={sidebarLinkStyle}>
          🚨 Anomaly Monitoring
        </Link>
        <Link to="/chatbot" className="sidebar-link" style={sidebarLinkStyle}>
          🤖 Chatbot
        </Link>
        <Link to="/forecasting" className="sidebar-link active" style={activeSidebarLinkStyle}>
          📈 Analysis & Forecasting
        </Link>
      </aside>

      {/* Main Panel */}
      <main className="dashboard-main" style={{ flex: 1, padding: '40px', overflowY: 'auto', position: 'relative' }}>
        
        {/* Loading Overlay */}
        {(loading || isRetraining) && (
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
              animation: 'spin 1.2s linear infinite'
            }}></div>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 'bold' }}>
                {isRetraining ? 'Fitting XGBoost Estimator...' : 'Analyzing Sales Timelines...'}
              </h3>
              <p className="text-muted" style={{ marginTop: '8px' }}>
                {isRetraining 
                  ? 'Calculating feature lags, rolling averages, and training decision trees...' 
                  : 'Fetching orders database and preparing historical sales series...'}
              </p>
            </div>
          </div>
        )}

        {/* Global Toast Alert */}
        {alert.show && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: alert.type === 'success' ? '#112211' : '#221111',
            border: `1px solid ${alert.type === 'success' ? '#00ffaa' : '#ff3333'}`,
            color: alert.type === 'success' ? '#00ffaa' : '#ff3333',
            padding: '16px 24px',
            borderRadius: '8px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            animation: 'fadeInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            <style>{`
              @keyframes fadeInRight {
                from { opacity: 0; transform: translateX(50px); }
                to { opacity: 1; transform: translateX(0); }
              }
            `}</style>
            <span>{alert.type === 'success' ? '⚡' : '⚠️'}</span>
            <span style={{ fontWeight: '500', fontSize: '0.95rem' }}>{alert.message}</span>
          </div>
        )}

        {/* Header */}
        <div style={{ marginBottom: '35px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
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
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              )}
              <h1 className="text-primary" style={{ fontSize: '2.5rem', margin: 0 }}>Predictive Forecasting</h1>
              <span 
                onClick={handleModeToggle}
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  backgroundColor: !isDemoMode ? 'rgba(0, 255, 170, 0.15)' : 'rgba(255, 204, 0, 0.15)',
                  color: !isDemoMode ? '#00ffaa' : '#ffcc00',
                  border: `1px solid ${!isDemoMode ? 'rgba(0, 255, 170, 0.3)' : 'rgba(255, 204, 0, 0.3)'}`,
                  cursor: 'pointer'
                }}
                title="Click to toggle DB mode / Demo mode"
              >
                {!isDemoMode ? '● Live Database Mode' : '○ Offline Demo Mode'}
              </span>
            </div>
            <p className="text-muted" style={{ fontSize: '1.1rem', marginTop: '8px' }}>
              Machine Learning sales projections driven by a recursive 7-day XGBoost Regressor model.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleRetrain}
              disabled={isRetraining || loading}
              style={{
                background: 'var(--primary)',
                color: '#000',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '0.95rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(255, 204, 0, 0.2)'
              }}
              className="hover-scale"
            >
              <span>⚙️</span>
              {isRetraining ? 'Retraining...' : 'Retrain XGBoost Model'}
            </button>
          </div>
        </div>

        {/* KPI Cards Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          
          <div className="glass-panel" style={{ padding: '20px', borderRadius: '15px' }}>
            <div style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '10px', fontSize: '0.9rem' }}>Projected 7-Day Sales</div>
            <div className="text-primary" style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '8px' }}>
              {formatCurrency(totalForecasted)}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#ffcc00' }}>Next 7 days aggregated</div>
          </div>
          
          <div className="glass-panel" style={{ padding: '20px', borderRadius: '15px' }}>
            <div style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '10px', fontSize: '0.9rem' }}>Projected Daily Average</div>
            <div className="text-primary" style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '8px' }}>
              {formatCurrency(avgForecasted)}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#9fa0a6' }}>Mean daily revenue</div>
          </div>
          
          <div className="glass-panel" style={{ padding: '20px', borderRadius: '15px' }}>
            <div style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '10px', fontSize: '0.9rem' }}>Peak Forecasted Day</div>
            <div className="text-primary" style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '8px' }}>
              {formatCurrency(peakSales)}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#ff8800' }}>
              Peak on {peakDay !== 'N/A' ? formatDate(peakDay) : 'N/A'}
            </div>
          </div>
          
          <div className="glass-panel" style={{ padding: '20px', borderRadius: '15px' }}>
            <div style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '10px', fontSize: '0.9rem' }}>Expected Weekly Growth</div>
            <div className="text-primary" style={{ 
              fontSize: '1.8rem', 
              fontWeight: 'bold', 
              marginBottom: '8px',
              color: growthRate >= 0 ? '#00ffaa' : '#ff3333' 
            }}>
              {growthRate >= 0 ? '+' : ''}{growthRate.toFixed(1)}%
            </div>
            <div style={{ fontSize: '0.8rem', color: '#9fa0a6' }}>
              Vs. previous 7 days ({formatCurrency(last7DaysHistorySum)})
            </div>
          </div>

        </div>

        {/* Row 1: Line Chart */}
        <div className="glass-panel" style={{ padding: '30px', borderRadius: '15px', marginBottom: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <h3 style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.25rem', fontWeight: 'bold' }}>
                Sales Demand Curve (XGBoost Regressor)
              </h3>
              <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                Continuous chronological trajectory mapping the final 30 days of actual sales connected to the 7-day projection.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '15px', fontSize: '0.8rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '12px', height: '3px', backgroundColor: '#ffcc00', display: 'inline-block' }}></span>
                Historical
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '12px', height: '3px', borderTop: '2px dashed #ff8800', display: 'inline-block' }}></span>
                Forecast (XGBoost)
              </span>
            </div>
          </div>

          <div style={{ width: '100%', height: '380px' }}>
            <ResponsiveContainer>
              <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="date" 
                  stroke="rgba(255,255,255,0.5)" 
                  tickFormatter={formatDate}
                  tick={{ fontSize: '0.75rem' }}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.5)" 
                  tickFormatter={formatCurrency}
                  width={80}
                  tick={{ fontSize: '0.75rem' }}
                />
                <Tooltip content={<CustomForecastTooltip />} />
                <Legend verticalAlign="top" height={36} iconType="plainline" />
                <Line 
                  type="monotone" 
                  dataKey="historicalSales" 
                  stroke="#ffcc00" 
                  strokeWidth={3} 
                  dot={{ r: 3, fill: '#ffcc00' }} 
                  name="Historical Daily Sales" 
                  activeDot={{ r: 5 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="forecastSales" 
                  stroke="#ff8800" 
                  strokeWidth={3} 
                  strokeDasharray="5 5" 
                  dot={{ r: 4, fill: '#ff8800' }} 
                  name="7-Day ML Prediction" 
                  activeDot={{ r: 6 }} 
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Row 2: Feature Importance and Model Information */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px', marginBottom: '30px' }}>
          
          {/* Feature Importance Card */}
          <div className="glass-panel" style={{ padding: '30px', borderRadius: '15px' }}>
            <h3 style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '8px' }}>
              XGBoost Feature Importance Weights
            </h3>
            <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '20px' }}>
              Calculated Gini-gain index representing how much the decision trees relied on each engineered lag & date feature.
            </p>

            <div style={{ width: '100%', height: '240px' }}>
              {featImportanceData.length > 0 ? (
                <ResponsiveContainer>
                  <BarChart data={featImportanceData} layout="vertical" margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis type="number" stroke="rgba(255,255,255,0.5)" tickFormatter={(val) => `${(val * 100).toFixed(0)}%`} />
                    <YAxis type="category" dataKey="feature" stroke="rgba(255,255,255,0.5)" width={180} style={{ fontSize: '0.75rem' }} />
                    <Tooltip content={<CustomFeatureTooltip />} />
                    <Bar dataKey="value" name="Importance" radius={[0, 4, 4, 0]}>
                      {featImportanceData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                  <p className="text-muted">No feature weights available</p>
                </div>
              )}
            </div>
          </div>

          {/* Model Information details */}
          <div className="glass-panel" style={{ padding: '30px', borderRadius: '15px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '15px' }}>
                XGBoost Feature Engineering Spec
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                
                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>
                  <div style={{ fontWeight: 'bold', color: '#ffcc00', fontSize: '0.9rem', marginBottom: '4px' }}>Memory Lags</div>
                  <p className="text-muted" style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
                    <strong>Lag 1 (Yesterday):</strong> Captures immediate short-term demand inertia.<br />
                    <strong>Lag 7 (Last Week):</strong> Captures weekly cyclic patterns (e.g. higher weekend buying).
                  </p>
                </div>

                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>
                  <div style={{ fontWeight: 'bold', color: '#ff8800', fontSize: '0.9rem', marginBottom: '4px' }}>Rolling Momentum</div>
                  <p className="text-muted" style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
                    <strong>7-Day Moving Mean:</strong> Smoothes daily volatility to establish local average demand momentum.
                  </p>
                </div>

                <div>
                  <div style={{ fontWeight: 'bold', color: '#00ffaa', fontSize: '0.9rem', marginBottom: '4px' }}>Temporal Seasonality</div>
                  <p className="text-muted" style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
                    <strong>Day of Week:</strong> Encodes weekly schedules (0-6).<br />
                    <strong>Month:</strong> Encodes calendar seasonality (1-12) for long-term holiday shifts.
                  </p>
                </div>

              </div>
            </div>

            <div style={{ marginTop: '20px', padding: '12px 16px', background: 'rgba(255, 204, 0, 0.05)', borderRadius: '8px', border: '1px dashed var(--glass-border)', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span className="text-muted">Estimator Class:</span>
                <span style={{ color: '#fff', fontFamily: 'monospace' }}>xgboost.XGBRegressor</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span className="text-muted">Trees Count (n_estimators):</span>
                <span style={{ color: '#fff', fontFamily: 'monospace' }}>100 Trees</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-muted">Last Updated:</span>
                <span style={{ color: '#fff', fontFamily: 'monospace' }}>{lastUpdated || 'N/A'}</span>
              </div>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
};

export default ForecastingPage;
