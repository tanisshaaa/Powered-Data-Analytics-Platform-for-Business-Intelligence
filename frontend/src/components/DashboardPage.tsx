import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer
} from 'recharts';

const COLORS = ['#ffcc00', '#ff8800', '#ff3333', '#00ffaa', '#00d2ff', '#bd00ff', '#ff007f'];

// --- MOCK DATA FOR FALLBACK ---
const MOCK_YEARLY = [
  { name: '2023', orders: 1240, sales: 450000 },
  { name: '2024', orders: 2850, sales: 920000 },
  { name: '2025', orders: 4100, sales: 1430000 },
  { name: '2026', orders: 5800, sales: 2100000 }
];

const MOCK_COUNTRIES = [
  { name: 'United States', sales: 850000, orders: 2400 },
  { name: 'United Kingdom', sales: 420000, orders: 1100 },
  { name: 'Germany', sales: 380000, orders: 950 },
  { name: 'France', sales: 310000, orders: 800 },
  { name: 'Australia', sales: 290000, orders: 750 },
  { name: 'Japan', sales: 250000, orders: 680 },
  { name: 'Canada', sales: 220000, orders: 600 },
  { name: 'India', sales: 180000, orders: 520 },
  { name: 'Brazil', sales: 150000, orders: 410 },
  { name: 'China', sales: 120000, orders: 320 }
];

const MOCK_STATES: Record<string, { name: string; sales: number; orders: number }[]> = {
  'United States': [
    { name: 'California', sales: 250000, orders: 700 },
    { name: 'New York', sales: 180000, orders: 500 },
    { name: 'Texas', sales: 140000, orders: 390 },
    { name: 'Florida', sales: 110000, orders: 310 },
    { name: 'Illinois', sales: 90000, orders: 250 },
    { name: 'Washington', sales: 80000, orders: 250 }
  ],
  'United Kingdom': [
    { name: 'England', sales: 280000, orders: 720 },
    { name: 'Scotland', sales: 80000, orders: 210 },
    { name: 'Wales', sales: 40000, orders: 110 },
    { name: 'Northern Ireland', sales: 20000, orders: 60 }
  ],
  'Germany': [
    { name: 'North Rhine-Westphalia', sales: 120000, orders: 300 },
    { name: 'Bavaria', sales: 100000, orders: 250 },
    { name: 'Baden-Württemberg', sales: 80000, orders: 200 },
    { name: 'Hesse', sales: 50000, orders: 130 },
    { name: 'Berlin', sales: 30000, orders: 70 }
  ]
};

const MOCK_CATEGORIES = [
  { name: 'Technology', sales: 1100000, orders: 3200 },
  { name: 'Furniture', sales: 650000, orders: 1800 },
  { name: 'Office Supplies', sales: 450000, orders: 2100 }
];

const MOCK_SUBCATEGORIES: Record<string, { name: string; sales: number; orders: number }[]> = {
  'Technology': [
    { name: 'Phones', sales: 500000, orders: 1400 },
    { name: 'Copiers', sales: 300000, orders: 800 },
    { name: 'Accessories', sales: 200000, orders: 700 },
    { name: 'Machines', sales: 100000, orders: 300 }
  ],
  'Furniture': [
    { name: 'Chairs', sales: 280000, orders: 800 },
    { name: 'Bookcases', sales: 180000, orders: 500 },
    { name: 'Tables', sales: 120000, orders: 300 },
    { name: 'Furnishings', sales: 70000, orders: 200 }
  ],
  'Office Supplies': [
    { name: 'Storage', sales: 150000, orders: 700 },
    { name: 'Binders', sales: 120000, orders: 600 },
    { name: 'Appliances', sales: 100000, orders: 500 },
    { name: 'Paper', sales: 80000, orders: 300 }
  ]
};

const MOCK_PRODUCTS: Record<string, { name: string; sales: number; orders: number }[]> = {
  'Phones': [
    { name: 'iPhone 15 Pro', sales: 150000, orders: 150 },
    { name: 'Samsung Galaxy S24', sales: 120000, orders: 130 },
    { name: 'Google Pixel 8', sales: 90000, orders: 100 },
    { name: 'OnePlus 12', sales: 80000, orders: 90 },
    { name: 'Xiaomi 14', sales: 60000, orders: 30 }
  ],
  'Chairs': [
    { name: 'Herman Miller Aeron', sales: 110000, orders: 100 },
    { name: 'Steelcase Gesture', sales: 85000, orders: 80 },
    { name: 'Secretlab Titan', sales: 50000, orders: 50 },
    { name: 'Ergohuman Elite', sales: 35000, orders: 70 }
  ],
  'Storage': [
    { name: 'Heavy Duty Shelving', sales: 55000, orders: 200 },
    { name: 'Plastic Organizer Bins', sales: 40000, orders: 300 },
    { name: 'File Cabinet 3-Drawer', sales: 35000, orders: 120 },
    { name: 'Modular Storage Cube', sales: 20000, orders: 80 }
  ]
};

const MOCK_REGIONS = [
  { name: 'North America', sales: 980000, orders: 2800 },
  { name: 'Europe', sales: 690000, orders: 1900 },
  { name: 'Asia Pacific', sales: 320000, orders: 900 },
  { name: 'Latin America', sales: 150000, orders: 400 },
  { name: 'Middle East & Africa', sales: 60000, orders: 150 }
];

// Helpers
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
};

const formatNumber = (value: number) => {
  return new Intl.NumberFormat('en-US').format(value);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LooseRecord = any;

// Custom tooltips for nice design
const CustomTooltip = ({ active, payload, label }: { active?: boolean, payload?: LooseRecord[], label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: '#0c0c0f',
        border: '1px solid rgba(255, 204, 0, 0.3)',
        padding: '12px 16px',
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.8)'
      }}>
        <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--primary)', fontSize: '0.95rem' }}>{label}</p>
        {payload.map((pld: LooseRecord, index: number) => {
          const isValCurrency = pld.name === 'sales' || pld.dataKey === 'sales';
          const valueStr = isValCurrency ? formatCurrency(pld.value) : formatNumber(pld.value);
          const title = pld.name === 'sales' ? 'Sales' : pld.name === 'orders' ? 'Total Orders' : pld.name;
          return (
            <p key={index} style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#f5f5f7' }}>
              <span style={{ color: pld.fill || '#ffcc00', marginRight: '6px' }}>●</span>
              {title}: <strong style={{ color: '#fff' }}>{valueStr}</strong>
            </p>
          );
        })}
      </div>
    );
  }
  return null;
};

const DashboardPage: React.FC = () => {
  // KPI Stats
  const [stats, setStats] = useState({
    total_sales: 0,
    total_profit: 0,
    avg_shipping_cost: 0,
    avg_shipping_days: 0,
    ship_mode_data: [] as { name: string; value: number }[],
    segment_data: [] as { name: string; value: number }[],
    market_data: [] as { name: string; value: number }[]
  });

  // Yearly data
  const [yearlyData, setYearlyData] = useState<Record<string, unknown>[]>([]);

  // Region data & filter
  const [regionData, setRegionData] = useState<Record<string, unknown>[]>([]);
  const [regionSort, setRegionSort] = useState<'desc' | 'asc'>('desc');

  // Market sort state
  const [marketSort, setMarketSort] = useState<'desc' | 'asc'>('desc');

  // Sidebar toggle state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Geographic drill-down state
  const [geoData, setGeoData] = useState<Record<string, unknown>[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  // Product hierarchy drill-down state
  const [productData, setProductData] = useState<Record<string, unknown>[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  // Initial Data Fetching
  useEffect(() => {
    const initDashboard = async () => {
      setLoading(true);
      try {
        // Try fetching main stats
        const statsRes = await fetch('http://localhost:5000/api/dashboard-stats');
        if (!statsRes.ok) throw new Error('Failed to fetch dashboard stats');
        const statsJson = await statsRes.json();

        // Try fetching yearly orders
        const yearlyRes = await fetch('http://localhost:5000/api/dashboard/yearly');
        if (!yearlyRes.ok) throw new Error('Failed to fetch yearly orders');
        const yearlyJson = await yearlyRes.json();

        // Try fetching sorted regions
        const regionRes = await fetch(`http://localhost:5000/api/dashboard/regions?sort=${regionSort}`);
        if (!regionRes.ok) throw new Error('Failed to fetch region data');
        const regionJson = await regionRes.json();

        // Try fetching top countries
        const countriesRes = await fetch('http://localhost:5000/api/dashboard/countries');
        if (!countriesRes.ok) throw new Error('Failed to fetch countries');
        const countriesJson = await countriesRes.json();

        // Try fetching top categories
        const categoriesRes = await fetch('http://localhost:5000/api/dashboard/categories');
        if (!categoriesRes.ok) throw new Error('Failed to fetch categories');
        const categoriesJson = await categoriesRes.json();

        // Validate that we got real data arrays
        if (
          !statsJson || 
          (Array.isArray(yearlyJson) && yearlyJson.length === 0)
        ) {
          throw new Error('Supabase returned empty arrays (likely unpopulated)');
        }

        // If all succeeded and contain records:
        setStats({
          total_sales: statsJson.total_sales || 0,
          total_profit: statsJson.total_profit || 0,
          avg_shipping_cost: statsJson.avg_shipping_cost || 0,
          avg_shipping_days: statsJson.avg_shipping_days || 0,
          ship_mode_data: statsJson.ship_mode_data || [],
          segment_data: statsJson.segment_data || [],
          market_data: statsJson.market_data || []
        });
        setYearlyData(yearlyJson);
        setRegionData(regionJson);
        setGeoData(countriesJson);
        setProductData(categoriesJson);
        setIsLive(true);
      } catch (err) {
        console.warn('Backend/Database RPCs not fully ready yet. Defaulting to high-fidelity Offline Demo Mode.', err);
        // Load beautiful demo data
        setStats({
          total_sales: 3880000,
          total_profit: 620000,
          avg_shipping_cost: 26.5,
          avg_shipping_days: 3.8,
          ship_mode_data: [
            { name: 'Standard Class', value: 2400 },
            { name: 'Second Class', value: 850 },
            { name: 'First Class', value: 500 },
            { name: 'Same Day', value: 180 }
          ],
          segment_data: [
            { name: 'Consumer', value: 2100 },
            { name: 'Corporate', value: 1200 },
            { name: 'Home Office', value: 630 }
          ],
          market_data: [
            { name: 'APAC', value: 1100 },
            { name: 'EU', value: 920 },
            { name: 'US', value: 850 },
            { name: 'LATAM', value: 340 },
            { name: 'Africa', value: 120 }
          ]
        });
        setYearlyData(MOCK_YEARLY);
        // Sort mock regions based on initial sorting state
        const sortedMock = [...MOCK_REGIONS].sort((a, b) => 
          regionSort === 'desc' ? b.sales - a.sales : a.sales - b.sales
        );
        setRegionData(sortedMock);
        setGeoData(MOCK_COUNTRIES);
        setProductData(MOCK_CATEGORIES);
        setIsLive(false);
      } finally {
        setLoading(false);
      }
    };

    initDashboard();
  }, []);

  // Handle region sorting change
  const handleRegionSortToggle = async () => {
    const nextSort = regionSort === 'desc' ? 'asc' : 'desc';
    setRegionSort(nextSort);

    if (isLive) {
      try {
        const response = await fetch(`http://localhost:5000/api/dashboard/regions?sort=${nextSort}`);
        if (response.ok) {
          const data = await response.json();
          setRegionData(data);
        }
      } catch (e) {
        console.error('Failed to fetch sorted region data from api:', e);
      }
    } else {
      const sortedMock = [...MOCK_REGIONS].sort((a, b) => 
        nextSort === 'desc' ? b.sales - a.sales : a.sales - b.sales
      );
      setRegionData(sortedMock);
    }
  };

  // Handle Country Drill-down click
  const handleCountryClick = async (item: LooseRecord) => {
    if (!item || selectedCountry) return; // Only drill down from top level
    const countryName = item.name;
    setSelectedCountry(countryName);

    if (isLive) {
      try {
        const res = await fetch(`http://localhost:5000/api/dashboard/countries/${encodeURIComponent(countryName)}/states`);
        if (res.ok) {
          const data = await res.json();
          setGeoData(data);
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      // Use mock state data
      const mockStates = MOCK_STATES[countryName] || [
        { name: `${countryName} Region A`, sales: item.sales * 0.5, orders: item.orders * 0.5 },
        { name: `${countryName} Region B`, sales: item.sales * 0.3, orders: item.orders * 0.3 },
        { name: `${countryName} Region C`, sales: item.sales * 0.2, orders: item.orders * 0.2 }
      ];
      setGeoData(mockStates);
    }
  };

  // Reset Country Drill-down
  const handleResetCountry = async () => {
    setSelectedCountry(null);
    if (isLive) {
      try {
        const res = await fetch('http://localhost:5000/api/dashboard/countries');
        if (res.ok) {
          const data = await res.json();
          setGeoData(data);
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      setGeoData(MOCK_COUNTRIES);
    }
  };

  // Handle Product Category Drill-down click
  const handleProductClick = async (item: LooseRecord) => {
    if (!item) return;

    if (!selectedCategory) {
      // Step 1: Category -> Subcategory
      const categoryName = item.name;
      setSelectedCategory(categoryName);

      if (isLive) {
        try {
          const res = await fetch(`http://localhost:5000/api/dashboard/categories/${encodeURIComponent(categoryName)}/subcategories`);
          if (res.ok) {
            const data = await res.json();
            setProductData(data);
          }
        } catch (e) {
          console.error(e);
        }
      } else {
        const mockSubs = MOCK_SUBCATEGORIES[categoryName] || [
          { name: `${categoryName} Sub A`, sales: item.sales * 0.6, orders: item.orders * 0.6 },
          { name: `${categoryName} Sub B`, sales: item.sales * 0.4, orders: item.orders * 0.4 }
        ];
        setProductData(mockSubs);
      }
    } else if (selectedCategory && !selectedSubcategory) {
      // Step 2: Subcategory -> Product
      const subcategoryName = item.name;
      setSelectedSubcategory(subcategoryName);

      if (isLive) {
        try {
          const res = await fetch(`http://localhost:5000/api/dashboard/subcategories/${encodeURIComponent(subcategoryName)}/products`);
          if (res.ok) {
            const data = await res.json();
            setProductData(data);
          }
        } catch (e) {
          console.error(e);
        }
      } else {
        const mockProds = MOCK_PRODUCTS[subcategoryName] || [
          { name: `${subcategoryName} Premium Item`, sales: item.sales * 0.7, orders: item.orders * 0.7 },
          { name: `${subcategoryName} Standard Item`, sales: item.sales * 0.3, orders: item.orders * 0.3 }
        ];
        setProductData(mockProds);
      }
    }
  };

  // Reset Product Drill-down to Categories
  const handleResetProduct = async () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    if (isLive) {
      try {
        const res = await fetch('http://localhost:5000/api/dashboard/categories');
        if (res.ok) {
          const data = await res.json();
          setProductData(data);
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      setProductData(MOCK_CATEGORIES);
    }
  };

  // Reset Product Drill-down to Subcategories
  const handleBackToSubcategory = async () => {
    if (!selectedCategory) return;
    setSelectedSubcategory(null);
    if (isLive) {
      try {
        const res = await fetch(`http://localhost:5000/api/dashboard/categories/${encodeURIComponent(selectedCategory)}/subcategories`);
        if (res.ok) {
          const data = await res.json();
          setProductData(data);
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      setProductData(MOCK_SUBCATEGORIES[selectedCategory] || []);
    }
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
        
        <Link to="/dashboard" className="sidebar-link active" style={activeSidebarLinkStyle}>
          📊 Dashboard
        </Link>
        <Link to="/anomaly" className="sidebar-link" style={sidebarLinkStyle}>
          🚨 Anomaly Monitoring
        </Link>
        <Link to="/chatbot" className="sidebar-link" style={sidebarLinkStyle}>
          🤖 Chatbot
        </Link>
        <Link to="/forecasting" className="sidebar-link" style={sidebarLinkStyle}>
          📈 Analysis & Forecasting
        </Link>

      </aside>

      {/* Main Content */}
      <main className="dashboard-main" style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        
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
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              )}
              <h1 className="text-primary" style={{ fontSize: '2.5rem', margin: 0 }}>Executive Dashboard</h1>
              <span style={{
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                backgroundColor: isLive ? 'rgba(0, 255, 170, 0.15)' : 'rgba(255, 204, 0, 0.15)',
                color: isLive ? '#00ffaa' : '#ffcc00',
                border: `1px solid ${isLive ? 'rgba(0, 255, 170, 0.3)' : 'rgba(255, 204, 0, 0.3)'}`
              }}>
                {isLive ? '● Live Supabase DB' : '○ Offline Demo Mode'}
              </span>
            </div>
            <p className="text-muted" style={{ fontSize: '1.1rem', marginTop: '8px' }}>Real-time telemetry and revenue intelligence for your D2C store.</p>
          </div>
        </div>



        {/* KPI Cards Row */}
        <div className="demo-kpis-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div className="demo-kpi-card glass-panel" style={{ padding: '20px', borderRadius: '15px' }}>
            <div className="kpi-label" style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '10px' }}>Total Sales</div>
            <div className="kpi-value text-primary" style={{ fontSize: '1.7rem', fontWeight: 'bold', marginBottom: '10px' }}>
              {loading ? '...' : formatCurrency(stats.total_sales)}
            </div>
            <div className="kpi-footer" style={{ color: 'var(--success-color, #00ffaa)' }}>Real-time aggregated</div>
          </div>
          
          <div className="demo-kpi-card glass-panel" style={{ padding: '20px', borderRadius: '15px' }}>
            <div className="kpi-label" style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '10px' }}>Total Profit</div>
            <div className="kpi-value text-primary" style={{ fontSize: '1.7rem', fontWeight: 'bold', marginBottom: '10px' }}>
              {loading ? '...' : formatCurrency(stats.total_profit)}
            </div>
            <div className="kpi-footer text-muted">Net gains calculated</div>
          </div>
          
          <div className="demo-kpi-card glass-panel" style={{ padding: '20px', borderRadius: '15px' }}>
            <div className="kpi-label" style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '10px' }}>Avg Shipping Cost</div>
            <div className="kpi-value text-primary" style={{ fontSize: '1.7rem', fontWeight: 'bold', marginBottom: '10px' }}>
              {loading ? '...' : formatCurrency(stats.avg_shipping_cost)}
            </div>
            <div className="kpi-footer text-muted">Per order delivery expense</div>
          </div>
          
          <div className="demo-kpi-card glass-panel" style={{ padding: '20px', borderRadius: '15px' }}>
            <div className="kpi-label" style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '10px' }}>Avg Shipping Days</div>
            <div className="kpi-value text-primary" style={{ fontSize: '1.7rem', fontWeight: 'bold', marginBottom: '10px' }}>
              {loading ? '...' : `${Number(stats.avg_shipping_days).toFixed(1)} Days`}
            </div>
            <div className="kpi-footer" style={{ color: 'var(--success-color, #00ffaa)' }}>Order to Ship time</div>
          </div>
        </div>

        {/* Row 1: Yearly Orders Trend & Demographic Distribution */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px', marginBottom: '30px' }}>
          
          {/* Yearly Orders Area Chart */}
          <div className="demo-chart-container glass-panel" style={{ padding: '30px', borderRadius: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div className="demo-chart-title" style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 'bold', fontSize: '1.1rem' }}>Year-Wise Total Orders & Revenue</div>
              <span className="text-muted" style={{ fontSize: '0.85rem' }}>Annual trend</span>
            </div>
            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer>
                <AreaChart data={yearlyData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ffcc00" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#ffcc00" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00d2ff" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#00d2ff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                  <YAxis 
                    yAxisId="left" 
                    stroke="#ffcc00" 
                    width={75}
                    tickFormatter={(val) => val >= 1000000 ? `$${(val/1000000).toFixed(1)}M` : val >= 1000 ? `$${(val/1000).toFixed(0)}k` : `$${val}`}
                    label={{ value: 'Sales', angle: -90, position: 'insideLeft', style: { fill: '#ffcc00', textAnchor: 'middle' } }} 
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    stroke="#00d2ff" 
                    width={60}
                    tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(1)}k` : val}
                    label={{ value: 'Orders', angle: 90, position: 'insideRight', style: { fill: '#00d2ff', textAnchor: 'middle' } }} 
                  />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area yAxisId="left" type="monotone" dataKey="sales" name="sales" stroke="#ffcc00" fillOpacity={1} fill="url(#colorSales)" strokeWidth={2} />
                  <Area yAxisId="right" type="monotone" dataKey="orders" name="orders" stroke="#00d2ff" fillOpacity={1} fill="url(#colorOrders)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Demographics / Shipping pie grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Ship Mode Pie Chart */}
            <div className="demo-chart-container glass-panel" style={{ padding: '20px 25px', borderRadius: '15px', flex: 1 }}>
              <div className="demo-chart-title" style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '10px', fontWeight: 'bold', fontSize: '0.95rem' }}>Ship Mode Distribution</div>
              <div style={{ width: '100%', height: '120px' }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={stats.ship_mode_data}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={45}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {stats.ship_mode_data.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Custom micro-legend */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '10px', fontSize: '0.75rem' }}>
                {stats.ship_mode_data.map((entry, idx) => (
                  <span key={idx} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: COLORS[idx % COLORS.length] }}></span>
                    {entry.name} ({entry.value})
                  </span>
                ))}
              </div>
            </div>

            {/* Segment Pie Chart */}
            <div className="demo-chart-container glass-panel" style={{ padding: '20px 25px', borderRadius: '15px', flex: 1 }}>
              <div className="demo-chart-title" style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '10px', fontWeight: 'bold', fontSize: '0.95rem' }}>Customer Segment</div>
              <div style={{ width: '100%', height: '120px' }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={stats.segment_data}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={45}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {stats.segment_data.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '10px', fontSize: '0.75rem' }}>
                {stats.segment_data.map((entry, idx) => (
                  <span key={idx} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: COLORS[(idx + 3) % COLORS.length] }}></span>
                    {entry.name} ({entry.value})
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Region Sales Sorter & Geographic Drill-down */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.5fr', gap: '30px', marginBottom: '30px' }}>
          
          {/* Region Sorter Chart */}
          <div className="demo-chart-container glass-panel" style={{ padding: '30px', borderRadius: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div className="demo-chart-title" style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 'bold', fontSize: '1.1rem' }}>Region Sales Distribution</div>
              <button 
                onClick={handleRegionSortToggle}
                className="btn-sort"
                style={{
                  background: 'rgba(255, 204, 0, 0.1)',
                  border: '1px solid var(--primary)',
                  color: 'var(--primary)',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  transition: 'all 0.2s'
                }}
              >
                Sort: {regionSort === 'desc' ? 'High to Low ↓' : 'Low to High ↑'}
              </button>
            </div>
            <div style={{ width: '100%', height: '400px' }}>
              <ResponsiveContainer>
                <BarChart data={regionData} layout="vertical" margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" stroke="rgba(255,255,255,0.5)" tickFormatter={formatCurrency} />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    stroke="rgba(255,255,255,0.5)" 
                    width={120} 
                    interval={0} 
                    style={{ fontSize: '0.8rem' }} 
                  />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Bar dataKey="sales" name="sales" fill="#00ffaa" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Geographic Drill-down (Country -> State) */}
          <div className="demo-chart-container glass-panel" style={{ padding: '30px', borderRadius: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="demo-chart-title" style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 'bold', fontSize: '1.1rem' }}>
                  {selectedCountry ? `States in ${selectedCountry}` : 'Top 10 Country Sales'}
                </div>
                <div style={{ display: 'flex', gap: '6px', fontSize: '0.8rem', marginTop: '4px' }}>
                  <span 
                    onClick={handleResetCountry} 
                    style={{ color: selectedCountry ? 'var(--primary)' : 'rgba(255,255,255,0.4)', cursor: selectedCountry ? 'pointer' : 'default', textDecoration: selectedCountry ? 'underline' : 'none' }}
                  >
                    Global
                  </span>
                  {selectedCountry && (
                    <>
                      <span style={{ color: 'rgba(255,255,255,0.4)' }}>/</span>
                      <span style={{ color: '#fff' }}>{selectedCountry}</span>
                    </>
                  )}
                </div>
              </div>
              {selectedCountry && (
                <button
                  onClick={handleResetCountry}
                  style={{
                    background: 'none',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: 'rgba(255,255,255,0.6)',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.75rem'
                  }}
                >
                  &larr; Reset
                </button>
              )}
            </div>
            
            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer>
                <BarChart 
                  data={geoData} 
                  margin={{ top: 10, right: 20, left: 10, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="name" 
                    stroke="rgba(255,255,255,0.5)" 
                    angle={-30} 
                    textAnchor="end" 
                    height={70} 
                    interval={0}
                    style={{ fontSize: '0.75rem' }} 
                    tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
                  />
                  <YAxis stroke="rgba(255,255,255,0.5)" tickFormatter={formatCurrency} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="sales" 
                    name="sales" 
                    fill="var(--primary)" 
                    radius={[4, 4, 0, 0]}
                    style={{ cursor: selectedCountry ? 'default' : 'pointer' }}
                    onClick={(data: LooseRecord) => {
                      if (data) handleCountryClick(data);
                    }}
                  >
                    {geoData.map((_, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={selectedCountry ? '#ff8800' : 'var(--primary)'}
                        opacity={0.85}
                        className="interactive-bar"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            {!selectedCountry && (
              <p className="text-muted" style={{ margin: '8px 0 0 0', fontSize: '0.75rem', textAlign: 'center', fontStyle: 'italic' }}>
                💡 Click a country bar to drill down to state-level sales
              </p>
            )}
          </div>
        </div>

        {/* Row 3: Product Hierarchy & Market Distribution */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '30px', marginBottom: '30px' }}>
          <div className="demo-chart-container glass-panel" style={{ padding: '30px', borderRadius: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="demo-chart-title" style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 'bold', fontSize: '1.1rem' }}>
                  {selectedSubcategory 
                    ? `Top Products in ${selectedSubcategory}`
                    : selectedCategory
                      ? `Subcategories in ${selectedCategory}`
                      : 'Product Categories Sales Overview'
                  }
                </div>
                {/* Breadcrumbs */}
                <div style={{ display: 'flex', gap: '6px', fontSize: '0.8rem', marginTop: '4px' }}>
                  <span 
                    onClick={handleResetProduct} 
                    style={{ color: selectedCategory ? 'var(--primary)' : 'rgba(255,255,255,0.4)', cursor: selectedCategory ? 'pointer' : 'default', textDecoration: selectedCategory ? 'underline' : 'none' }}
                  >
                    Categories
                  </span>
                  {selectedCategory && (
                    <>
                      <span style={{ color: 'rgba(255,255,255,0.4)' }}>/</span>
                      <span 
                        onClick={handleBackToSubcategory}
                        style={{ color: selectedSubcategory ? 'var(--primary)' : '#fff', cursor: selectedSubcategory ? 'pointer' : 'default', textDecoration: selectedSubcategory ? 'underline' : 'none' }}
                      >
                        {selectedCategory}
                      </span>
                    </>
                  )}
                  {selectedSubcategory && (
                    <>
                      <span style={{ color: 'rgba(255,255,255,0.4)' }}>/</span>
                      <span style={{ color: '#fff' }}>{selectedSubcategory}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Reset button */}
              {(selectedCategory || selectedSubcategory) && (
                <div style={{ display: 'flex', gap: '10px' }}>
                  {selectedSubcategory && (
                    <button
                      onClick={handleBackToSubcategory}
                      style={{
                        background: 'none',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: 'rgba(255,255,255,0.6)',
                        padding: '4px 10px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.75rem'
                      }}
                    >
                      &larr; Back to {selectedCategory}
                    </button>
                  )}
                  <button
                    onClick={handleResetProduct}
                    style={{
                      background: 'none',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: 'rgba(255,255,255,0.6)',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.75rem'
                    }}
                  >
                    Reset All
                  </button>
                </div>
              )}
            </div>

            <div style={{ width: '100%', height: '320px' }}>
              <ResponsiveContainer>
                <BarChart 
                  data={productData} 
                  margin={{ top: 10, right: 30, left: 10, bottom: 50 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="name" 
                    stroke="rgba(255,255,255,0.5)" 
                    angle={-25} 
                    textAnchor="end" 
                    height={85} 
                    interval={0}
                    style={{ fontSize: '0.75rem' }} 
                    tickFormatter={(value) => value.length > 22 ? `${value.substring(0, 22)}...` : value}
                  />
                  <YAxis stroke="rgba(255,255,255,0.5)" tickFormatter={formatCurrency} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="sales" 
                    name="sales" 
                    fill="var(--primary)" 
                    radius={[4, 4, 0, 0]}
                    style={{ cursor: selectedSubcategory ? 'default' : 'pointer' }}
                    onClick={(data: LooseRecord) => {
                      if (data) handleProductClick(data);
                    }}
                  >
                    {productData.map((_, index) => {
                      let cellColor = 'var(--primary)';
                      if (selectedSubcategory) cellColor = '#bd00ff';
                      else if (selectedCategory) cellColor = '#00d2ff';
                      return (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={cellColor}
                          opacity={0.85}
                          className="interactive-bar"
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            {!selectedSubcategory && (
              <p className="text-muted" style={{ margin: '8px 0 0 0', fontSize: '0.75rem', textAlign: 'center', fontStyle: 'italic' }}>
                💡 Click a bar to drill down (Category &rarr; Subcategory &rarr; Products)
              </p>
            )}
          </div>

          {/* Market Bar Chart */}
          <div className="demo-chart-container glass-panel" style={{ padding: '30px', borderRadius: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div className="demo-chart-title" style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 'bold', fontSize: '1.1rem' }}>Market Distribution</div>
              <button
                onClick={() => setMarketSort(marketSort === 'desc' ? 'asc' : 'desc')}
                style={{
                  background: 'none',
                  border: '1px solid var(--primary)',
                  color: 'var(--primary)',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.75rem'
                }}
              >
                Sort: {marketSort === 'desc' ? 'High to Low ↓' : 'Low to High ↑'}
              </button>
            </div>
            <div style={{ width: '100%', height: '320px' }}>
              <ResponsiveContainer>
                <BarChart data={[...stats.market_data].sort((a, b) => marketSort === 'desc' ? b.value - a.value : a.value - b.value)} margin={{ top: 10, right: 10, left: 0, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="name" 
                    stroke="rgba(255,255,255,0.5)" 
                    angle={-30} 
                    textAnchor="end" 
                    height={60} 
                    interval={0} 
                    style={{ fontSize: '0.75rem' }} 
                  />
                  <YAxis stroke="rgba(255,255,255,0.5)" tickFormatter={formatNumber} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="orders" fill="#bd00ff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>


      </main>
    </div>
  );
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

export default DashboardPage;
