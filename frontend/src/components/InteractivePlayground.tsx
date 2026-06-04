
import React, { useState, useEffect, useRef } from 'react';

type Scenario = 'anomaly' | 'forecast' | 'inventory' | 'fraud' | 'chatbot' | 'reports';

interface TerminalLine {
  sender: 'user' | 'ai';
  text: string;
}

// Scenario configuration data
const scenariosInfo = {
  anomaly: {
    question: 'Why did sales drop on May 24th? 📉',
    aiResponse: 'Initiating deep root-cause diagnostic... Scan complete: Sales fell 42% below expected trend on May 24. Flagged Category: "Technology / Phones". Primary driver: Stock-out event caused by a 9-day shipping delay at the LA Port. Recommendation: Re-route 200 units from the East Coast warehouse immediately to restore $18,400 in daily run-rate.',
  },
  forecast: {
    question: 'What will sales look like next week? 🔮',
    aiResponse: 'Compiling predictive autoregressive demand models... 365-day seasonality audit processed. Trendline indicates strong upward momentum (+15%) next week for D2C Apparel. Adjust the Ad Spend slider to watch RetailGPT bend the forecast curve in real-time.',
  },
  inventory: {
    question: 'Do I need to reorder inventory? 🛒',
    aiResponse: 'Auditing SKU safety thresholds... Inventory velocity audit complete. Alert: SKU "Carbon-Tee-Black" consumption rate is 2.4x historical average. Est. stock-out: 4 days. Safety line violated. Action required: Generate PO to reorder 500 units.',
  },
  fraud: {
    question: 'Is there fraud or a system issue? 🚨',
    aiResponse: 'Scanning payment logs & webhook telemetry... Anomaly identified in Stripe checkout webhooks. Refund Loop Exploit detected on Session ID #8492 (IP 198.162.24.89). Duplicate discount code "WELCOME50" applied 4 times. Recommendation: Blacklist customer IP and block transaction.',
  },
  chatbot: {
    question: 'Why did mobile conversion rate drop this week? 💬',
    aiResponse: 'Initiating conversion funnel diagnostic... Session audit complete: Shopify checkout page speed on Mobile devices spiked to 5.2 seconds, causing 64% cart abandonment. Target element: "Hero-Banner-Big.png" is uncompressed (4.8MB). Recommendation: Compress Shopify hero images and defer analytics scripts to recover +2.3% in mobile conversion rate.',
  },
  reports: {
    question: 'Generate my weekly store audit and leakage report 📝',
    aiResponse: 'Compiling weekly executive ledger... Telemetry audited: 1.4M events scanned. 3 operational leakages caught and neutralized (Stripe discount exploit blocked, LA Port stock-out re-routed, safety PO generated). Preserved revenue margin: $48,290. Preparing PDF digest for delivery.',
  }
};

const InteractivePlayground: React.FC = () => {
  const [activeScenario, setActiveScenario] = useState<Scenario>('anomaly');
  const [terminalLog, setTerminalLog] = useState<TerminalLine[]>([
    { sender: 'user', text: scenariosInfo.anomaly.question }
  ]);
  const [typingIndex, setTypingIndex] = useState(0);
  const [typingText, setTypingText] = useState('');
  
  const [anomalyResolved, setAnomalyResolved] = useState(false);
  const [inventoryRestocked, setInventoryRestocked] = useState(false);
  const [fraudBlocked, setFraudBlocked] = useState(false);
  const [chatbotOptimized, setChatbotOptimized] = useState(false);
  const [chatbotMobileSpeed, setChatbotMobileSpeed] = useState(5.2);
  const [reportsDownloaded, setReportsDownloaded] = useState(false);
  const [reportsDownloading, setReportsDownloading] = useState(false);
  const [adSpendBoost, setAdSpendBoost] = useState(0);
  const [anomalyThreshold, setAnomalyThreshold] = useState(-2);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [hoveredDataPoint, setHoveredDataPoint] = useState<any>(null);
  const [safetyStockLevel, setSafetyStockLevel] = useState(100);
  const [reportsWeek, setReportsWeek] = useState('May 24 - May 30');

  const terminalBodyRef = useRef<HTMLDivElement>(null);

  const handleTabClick = (tab: Scenario) => {
    if (activeScenario === tab) return;
    setActiveScenario(tab);
    setAnomalyResolved(false);
    setInventoryRestocked(false);
    setFraudBlocked(false);
    setChatbotOptimized(false);
    setChatbotMobileSpeed(5.2);
    setReportsDownloaded(false);
    setReportsDownloading(false);
    setTerminalLog([
      { sender: 'user', text: scenariosInfo[tab].question }
    ]);
    setTypingIndex(0);
    setTypingText('');
  };

  // Simulate Typewriter Effect
  useEffect(() => {
    const fullText = scenariosInfo[activeScenario].aiResponse;
    if (typingIndex < fullText.length) {
      const timeout = setTimeout(() => {
        setTypingText((prev) => prev + fullText[typingIndex]);
        setTypingIndex((prev) => prev + 1);
      }, 10); // Super fast typewriter for snappy UX
      return () => clearTimeout(timeout);
    } else if (typingIndex === fullText.length && typingText !== '') {
      // Finished typing, append AI line to logs
      const timeout = setTimeout(() => {
        setTerminalLog((prev) => [
          ...prev,
          { sender: 'ai', text: fullText }
        ]);
        setTypingText('');
      }, 0);
      return () => clearTimeout(timeout);
    }
  }, [typingIndex, activeScenario, typingText]);

  // Auto-scroll terminal logs internally without shifting the browser window
  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
    }
  }, [terminalLog, typingText]);

  // Calculated values
  const projectedRevenue = Math.round(124000 + (adSpendBoost * 540));
  const projectIncreasePercent = Math.round(12 + (adSpendBoost * 0.4));

  const handleResolveAnomaly = () => {
    setAnomalyResolved(true);
    setTerminalLog((prev) => [
      ...prev,
      { sender: 'ai', text: '✅ Re-routing directive approved! 200 units dispatched from East Coast. Restoring channel inventory... Daily run-rate fully recovered to $24,100.' }
    ]);
  };

  const handleReorderInventory = () => {
    setInventoryRestocked(true);
    setTerminalLog((prev) => [
      ...prev,
      { sender: 'ai', text: '✅ Purchase Order #PO-9284 approved! Sent to supplier. Bar graphs updated to 100% capacity. Safety levels secured.' }
    ]);
  };

  const handleBlockFraud = () => {
    setFraudBlocked(true);
    setTerminalLog((prev) => [
      ...prev,
      { sender: 'ai', text: '🔒 IP Blacklisted. Session security patched. Blocked $2,840 in illegal duplicate refunds. System secure.' }
    ]);
  };

  const handleOptimizeChatbot = () => {
    setChatbotOptimized(true);
    setChatbotMobileSpeed(1.1);
    setTerminalLog((prev) => [
      ...prev,
      { sender: 'ai', text: '⚡ Asset compression engine executed! Compressed "Hero-Banner-Big.png" from 4.8MB to 180KB. Mobile page load speed decreased to 1.1s. Conversion rate increased to 3.4%. Channel bounce mitigated!' }
    ]);
  };

  const handleDownloadReport = () => {
    setReportsDownloading(true);
    setTimeout(() => {
      setReportsDownloading(false);
      setReportsDownloaded(true);
      setTerminalLog((prev) => [
        ...prev,
        { sender: 'ai', text: '✅ Weekly Ledger compiled and signed! Saved locally as "retailgpt_ledger_week22.pdf". Transaction integrity verified.' }
      ]);
    }, 1200); // simulation delay
  };

  return (
    <section className="playground-section" id="playground">
      <div className="playground-header">
        <h2 className="playground-badge">RetailGPT Core</h2>
        <h3 className="playground-title">Play with the Live AI Analytics Console</h3>
        <p className="playground-subtitle">
          Toggle business questions below to test how our AI Revenue engine diagnoses problems, runs projections, and solves logistics constraints dynamically.
        </p>
      </div>

      {/* Question Selector Tabs */}
      <div className="playground-tabs">
        {(Object.keys(scenariosInfo) as Scenario[]).map((tab) => (
          <button
            key={tab}
            className={`playground-tab ${activeScenario === tab ? 'active' : ''}`}
            onClick={() => handleTabClick(tab)}
          >
            <span className="tab-icon">
              {tab === 'anomaly' && '📉'}
              {tab === 'forecast' && '🔮'}
              {tab === 'inventory' && '🛒'}
              {tab === 'fraud' && '🚨'}
              {tab === 'chatbot' && '💬'}
              {tab === 'reports' && '📝'}
            </span>
            <span className="tab-title">
              {tab === 'anomaly' && 'Anomaly Scan'}
              {tab === 'forecast' && 'Demand Forecast'}
              {tab === 'inventory' && 'Inventory Control'}
              {tab === 'fraud' && 'Fraud Shield'}
              {tab === 'chatbot' && 'AI Chatbot'}
              {tab === 'reports' && 'Weekly Reports'}
            </span>
          </button>
        ))}
      </div>

      <div className="playground-container glass-panel animate-pulse-glow">
        
        {/* Left Side: Interactive Chat Terminal */}
        <div className="playground-terminal">
          <div className="terminal-bar">
            <div className="terminal-dots">
              <span className="dot red"></span>
              <span className="dot yellow"></span>
              <span className="dot green"></span>
            </div>
            <div className="terminal-title">terminal://retailgpt-ai-diagnostics</div>
            <div className="terminal-status">LIVE</div>
          </div>
          
          <div className="terminal-body" ref={terminalBodyRef}>
            {terminalLog.map((line, index) => (
              <div key={index} className={`terminal-line ${line.sender}`}>
                <span className="line-prefix">
                  {line.sender === 'user' ? 'owner@store ~$ ' : 'retailgpt@agent ~$ '}
                </span>
                <span className="line-text">{line.text}</span>
              </div>
            ))}
            
            {/* Active Typewriting Line */}
            {typingText && (
              <div className="terminal-line ai typing">
                <span className="line-prefix">retailgpt@agent ~$ </span>
                <span className="line-text">{typingText}</span>
                <span className="terminal-cursor"></span>
              </div>
            )}
          </div>

          <div className="terminal-footer">
            <div className="terminal-prompt">
              <span className="prompt-indicator">&gt;</span>
              <input 
                type="text" 
                readOnly 
                value={`Ready to audit Store Data...`} 
                className="terminal-input"
              />
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Data Visualization Canvas */}
        <div className="playground-canvas">
          <div className="canvas-header">
            <span className="canvas-title">
              {activeScenario === 'anomaly' && 'Interactive Sales Tracker'}
              {activeScenario === 'forecast' && 'Machine Learning Projections'}
              {activeScenario === 'inventory' && 'Safety Stock Levels'}
              {activeScenario === 'fraud' && 'Real-Time Transaction Integrity'}
              {activeScenario === 'chatbot' && 'AI Funnel Speed Diagnostics'}
              {activeScenario === 'reports' && 'Weekly Telemetry Report'}
            </span>
            <div className="canvas-indicators">
              <span className="canvas-indicator">
                <span className="ind-dot green"></span> active
              </span>
            </div>
          </div>

          <div className="canvas-body">
            
            {/* SCENARIO 1: ANOMALY SCENE */}
            {activeScenario === 'anomaly' && (
              <div className="chart-wrapper">
                <svg className="interactive-svg" viewBox="0 0 500 220">
                  {/* Grid Lines */}
                  <line x1="50" y1="20" x2="50" y2="180" stroke="rgba(255, 215, 0, 0.08)" strokeWidth="1" />
                  <line x1="150" y1="20" x2="150" y2="180" stroke="rgba(255, 215, 0, 0.08)" strokeWidth="1" />
                  <line x1="250" y1="20" x2="250" y2="180" stroke="rgba(255, 215, 0, 0.08)" strokeWidth="1" />
                  <line x1="350" y1="20" x2="350" y2="180" stroke="rgba(255, 215, 0, 0.08)" strokeWidth="1" strokeDasharray="3" />
                  <line x1="450" y1="20" x2="450" y2="180" stroke="rgba(255, 215, 0, 0.08)" strokeWidth="1" />
                  
                  <line x1="50" y1="180" x2="450" y2="180" stroke="rgba(255, 215, 0, 0.2)" strokeWidth="1" />
                  
                  {/* Threshold Line */}
                  <line 
                    x1="50" 
                    y1={180 - (anomalyThreshold * 1.2)} 
                    x2="450" 
                    y2={180 - (anomalyThreshold * 1.2)} 
                    stroke="var(--primary-glow)" 
                    strokeWidth="1.5" 
                    strokeDasharray="4 4" 
                  />
                  <text x="60" y={170 - (anomalyThreshold * 1.2)} fill="var(--primary)" fontSize="9" opacity="0.8">
                    Anomaly Alert Gate: {anomalyThreshold}% drop
                  </text>

                  {/* Trend Lines */}
                  {/* Normal/Resolved Trend */}
                  <path
                    d={`M 50 100 Q 150 80, 250 ${anomalyResolved ? '90' : '150'} T 450 70`}
                    fill="none"
                    stroke={anomalyResolved ? "rgba(0, 255, 170, 0.8)" : "var(--primary)"}
                    strokeWidth="3.5"
                    className="chart-path-anim"
                  />

                  {/* Original Dotted Reference Path if resolved */}
                  {anomalyResolved && (
                    <path
                      d="M 50 100 Q 150 80, 250 150 T 450 70"
                      fill="none"
                      stroke="var(--primary-glow)"
                      strokeWidth="2"
                      strokeDasharray="3 3"
                    />
                  )}

                  {/* Verticals and Data Nodes */}
                  <circle cx="50" cy="100" r="4" fill="var(--primary)" />
                  <circle cx="150" cy="80" r="4" fill="var(--primary)" />
                  
                  {/* Anomaly Node */}
                  <g 
                    style={{ cursor: 'pointer' }}
                    onClick={handleResolveAnomaly}
                    onMouseEnter={() => setHoveredDataPoint('anomaly-node')}
                    onMouseLeave={() => setHoveredDataPoint(null)}
                  >
                    <circle 
                      cx="250" 
                      cy={anomalyResolved ? 90 : 150} 
                      r={anomalyResolved ? "5" : "10"} 
                      fill={anomalyResolved ? "#00ffaa" : "var(--primary)"} 
                      className={anomalyResolved ? "" : "pulsing-node"} 
                    />
                    <circle cx="250" cy={anomalyResolved ? 90 : 150} r="2" fill="#fff" />
                  </g>

                  <circle cx="450" cy="70" r="4" fill="var(--primary)" />

                  {/* Tooltip Overlay */}
                  {hoveredDataPoint === 'anomaly-node' && (
                    <g transform="translate(160, 30)">
                      <rect width="180" height="50" rx="8" fill="rgba(6,2,10,0.95)" stroke="var(--primary)" strokeWidth="1" />
                      <text x="10" y="20" fill="#fff" fontSize="10" fontWeight="bold">May 24th: Anomaly Detected!</text>
                      <text x="10" y="38" fill="var(--accent)" fontSize="9">Sales drop: -42% (LA Port Delay)</text>
                    </g>
                  )}
                  
                  {/* X-Axis labels */}
                  <text x="50" y="198" fill="rgba(255,255,255,0.4)" fontSize="9" textAnchor="middle">May 10</text>
                  <text x="150" y="198" fill="rgba(255,255,255,0.4)" fontSize="9" textAnchor="middle">May 17</text>
                  <text x="250" y="198" fill="var(--primary)" fontSize="9" textAnchor="middle" fontWeight="bold">May 24 (Alert)</text>
                  <text x="350" y="198" fill="rgba(255,255,255,0.4)" fontSize="9" textAnchor="middle">May 31</text>
                  <text x="450" y="198" fill="rgba(255,255,255,0.4)" fontSize="9" textAnchor="middle">June 07</text>
                </svg>

                {/* Dashboard Controls */}
                <div className="canvas-controls">
                  <div className="control-slider-group">
                    <label className="control-label">
                      <span>Anomaly Gate Sensitivity:</span>
                      <span className="control-value">{anomalyThreshold}%</span>
                    </label>
                    <input 
                      type="range" 
                      min="10" 
                      max="70" 
                      value={anomalyThreshold} 
                      onChange={(e) => setAnomalyThreshold(Number(e.target.value))}
                      className="neon-range" 
                    />
                  </div>

                  <div className="control-actions">
                    {!anomalyResolved ? (
                      <button onClick={handleResolveAnomaly} className="canvas-btn-primary blinking-btn">
                        ⚡ Approve AI East Coast Re-route
                      </button>
                    ) : (
                      <div className="status-success-badge">
                        🎉 Channel Rebalanced! Lost Revenue Restored
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* SCENARIO 2: FORECAST SCENE */}
            {activeScenario === 'forecast' && (
              <div className="chart-wrapper">
                <svg className="interactive-svg" viewBox="0 0 500 220">
                  {/* Grid Lines */}
                  <line x1="50" y1="20" x2="50" y2="180" stroke="rgba(255, 215, 0, 0.08)" strokeWidth="1" />
                  <line x1="150" y1="20" x2="150" y2="180" stroke="rgba(255, 215, 0, 0.08)" strokeWidth="1" />
                  <line x1="250" y1="20" x2="250" y2="180" stroke="rgba(255, 215, 0, 0.15)" strokeWidth="1" strokeDasharray="2 2" />
                  <line x1="350" y1="20" x2="350" y2="180" stroke="rgba(255, 215, 0, 0.08)" strokeWidth="1" />
                  <line x1="450" y1="20" x2="450" y2="180" stroke="rgba(255, 215, 0, 0.08)" strokeWidth="1" />
                  
                  <line x1="50" y1="180" x2="450" y2="180" stroke="rgba(255, 215, 0, 0.2)" strokeWidth="1" />
                  
                  {/* Historical Trend Line (Solid) */}
                  <path
                    d="M 50 120 Q 100 130, 150 110 T 250 95"
                    fill="none"
                    stroke="rgba(255, 215, 0, 0.5)"
                    strokeWidth="3"
                  />

                  {/* Confidence Interval Shadow */}
                  <path
                    d={`M 250 95 
                       Q 350 ${80 - (adSpendBoost * 0.4)}, 450 ${75 - (adSpendBoost * 0.7)} 
                       L 450 ${120 + (adSpendBoost * 0.2)} 
                       Q 350 ${110 + (adSpendBoost * 0.1)}, 250 95 Z`}
                    fill="rgba(255, 215, 0, 0.04)"
                  />

                  {/* Dotted Forecast Line (Dynamic based on Slider) */}
                  <path
                    d={`M 250 95 Q 350 ${85 - (adSpendBoost * 0.5)}, 450 ${90 - (adSpendBoost * 0.9)}`}
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="3.5"
                    strokeDasharray="4 4"
                    className="forecast-path"
                  />

                  {/* Forecast nodes */}
                  <circle cx="250" cy="95" r="4" fill="var(--primary)" />
                  <circle 
                    cx="450" 
                    cy={90 - (adSpendBoost * 0.9)} 
                    r="6" 
                    fill="#bd00ff" 
                    className="pulsing-node"
                  />
                  <circle cx="450" cy={90 - (adSpendBoost * 0.9)} r="2" fill="#fff" />
                  
                  {/* Label for split */}
                  <text x="250" y="15" fill="rgba(255,255,255,0.3)" fontSize="8" textAnchor="middle">AI Hand-off Limit</text>
                  <line x1="250" y1="20" x2="250" y2="180" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="4 4" />

                  {/* X-Axis labels */}
                  <text x="50" y="198" fill="rgba(255,255,255,0.4)" fontSize="9" textAnchor="middle">2 Weeks Ago</text>
                  <text x="150" y="198" fill="rgba(255,255,255,0.4)" fontSize="9" textAnchor="middle">Last Week</text>
                  <text x="250" y="198" fill="#fcf8ff" fontSize="9" textAnchor="middle" fontWeight="bold">Today</text>
                  <text x="350" y="198" fill="var(--accent)" fontSize="9" textAnchor="middle">Next Week</text>
                  <text x="450" y="198" fill="var(--accent)" fontSize="9" textAnchor="middle">2 Weeks Out</text>
                </svg>

                <div className="canvas-controls">
                  <div className="control-slider-group">
                    <label className="control-label">
                      <span>Simulated Ad Campaign Boost:</span>
                      <span className="control-value">+{adSpendBoost}% Ad Spend</span>
                    </label>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={adSpendBoost} 
                      onChange={(e) => setAdSpendBoost(Number(e.target.value))}
                      className="neon-range" 
                    />
                  </div>

                  <div className="forecast-metrics glass-panel">
                    <div className="metric-box">
                      <div className="met-title">Forecast Revenue</div>
                      <div className="met-value">${projectedRevenue.toLocaleString()}</div>
                    </div>
                    <div className="metric-box">
                      <div className="met-title">Growth Factor</div>
                      <div className="met-value text-pink">+{projectIncreasePercent}%</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SCENARIO 3: INVENTORY SCENE */}
            {activeScenario === 'inventory' && (
              <div className="chart-wrapper">
                <svg className="interactive-svg" viewBox="0 0 500 220">
                  {/* Grid Lines */}
                  <line x1="50" y1="180" x2="450" y2="180" stroke="rgba(255,215,0,0.15)" strokeWidth="1" />
                  
                  {/* Safety Stock Level Line */}
                  <line 
                    x1="50" 
                    y1={180 - (safetyStockLevel * 1.5)} 
                    x2="450" 
                    y2={180 - (safetyStockLevel * 1.5)} 
                    stroke="var(--primary)" 
                    strokeWidth="2" 
                    strokeDasharray="5 3" 
                  />
                  <text x="450" y={175 - (safetyStockLevel * 1.5)} fill="var(--primary)" fontSize="8" textAnchor="end" fontWeight="bold">
                    🚨 Safety Line: {safetyStockLevel}% Stock
                  </text>

                  {/* Bars representing items */}
                  {/* Item 1 */}
                  <g>
                    <rect 
                      x="70" 
                      y={inventoryRestocked ? "50" : "135"} 
                      width="50" 
                      height={inventoryRestocked ? "130" : "45"} 
                      fill={inventoryRestocked ? "rgba(0, 255, 170, 0.7)" : ((safetyStockLevel > 30) ? "rgba(255, 215, 0, 0.45)" : "rgba(189, 0, 255, 0.7)")} 
                      rx="4" 
                      className="inventory-bar"
                    />
                    <text x="95" y="195" fill="rgba(255,255,255,0.7)" fontSize="9" textAnchor="middle">Carbon-Tee</text>
                    <text x="95" y={inventoryRestocked ? "45" : "130"} fill={inventoryRestocked ? "#00ffaa" : "var(--primary)"} fontSize="9" textAnchor="middle" fontWeight="bold">
                      {inventoryRestocked ? "100%" : "30% (Low)"}
                    </text>
                  </g>

                  {/* Item 2 */}
                  <g>
                    <rect x="170" y="70" width="50" height="110" fill="rgba(189, 0, 255, 0.6)" rx="4" />
                    <text x="195" y="195" fill="rgba(255,255,255,0.7)" fontSize="9" textAnchor="middle">Denim-Stitch</text>
                    <text x="195" y="65" fill="#fcf8ff" fontSize="9" textAnchor="middle">75%</text>
                  </g>

                  {/* Item 3 */}
                  <g>
                    <rect x="270" y="40" width="50" height="140" fill="rgba(189, 0, 255, 0.6)" rx="4" />
                    <text x="295" y="195" fill="rgba(255,255,255,0.7)" fontSize="9" textAnchor="middle">Retro-Hoodie</text>
                    <text x="295" y="35" fill="#fcf8ff" fontSize="9" textAnchor="middle">92%</text>
                  </g>

                  {/* Item 4 */}
                  <g>
                    <rect x="370" y="100" width="50" height="80" fill="rgba(189, 0, 255, 0.6)" rx="4" />
                    <text x="395" y="195" fill="rgba(255,255,255,0.7)" fontSize="9" textAnchor="middle">Eco-Socks</text>
                    <text x="395" y="95" fill="#fcf8ff" fontSize="9" textAnchor="middle">55%</text>
                  </g>
                </svg>

                <div className="canvas-controls">
                  <div className="control-slider-group">
                    <label className="control-label">
                      <span>Adjust Safety Alert Boundary:</span>
                      <span className="control-value">{safetyStockLevel}% safety</span>
                    </label>
                    <input 
                      type="range" 
                      min="20" 
                      max="70" 
                      value={safetyStockLevel} 
                      onChange={(e) => setSafetyStockLevel(Number(e.target.value))}
                      className="neon-range" 
                    />
                  </div>

                  <div className="control-actions">
                    {!inventoryRestocked ? (
                      <button onClick={handleReorderInventory} className="canvas-btn-primary blinking-btn">
                        📦 Auto-Reorder 500 units of "Carbon-Tee-Black"
                      </button>
                    ) : (
                      <div className="status-success-badge">
                        🎉 Reorder Dispatched! Safety Levels Restored to 100%
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* SCENARIO 4: FRAUD SCENE */}
            {activeScenario === 'fraud' && (
              <div className="chart-wrapper">
                <div className="fraud-scan-layout">
                  {/* Transaction log simulator visual */}
                  <div className="fraud-grid">
                    <div className="grid-labels">
                      <span className="gr-label">SESSION ID</span>
                      <span className="gr-label">SKU AMOUNT</span>
                      <span className="gr-label">IP GEOLOCATION</span>
                      <span className="gr-label">RISK FACTOR</span>
                    </div>

                    <div className="grid-row safe">
                      <span className="gr-val font-mono">#9284-Shopify</span>
                      <span className="gr-val font-bold">$142.00</span>
                      <span className="gr-val">New York, US</span>
                      <span className="gr-val text-green font-bold">2.1% (Safe)</span>
                    </div>

                    <div className="grid-row safe">
                      <span className="gr-val font-mono">#9285-Shopify</span>
                      <span className="gr-val font-bold">$68.50</span>
                      <span className="gr-val">London, UK</span>
                      <span className="gr-val text-green font-bold">0.8% (Safe)</span>
                    </div>

                    <div className={`grid-row ${fraudBlocked ? 'secured' : 'flagged animate-pulse-glow'}`}>
                      <span className="gr-val font-mono">#8492-Stripe</span>
                      <span className="gr-val font-bold">$500.00</span>
                      <span className="gr-val">IP: 198.162.24.89</span>
                      <span className="gr-val text-pink font-bold">
                        {fraudBlocked ? '100% BLOCKED' : '94.2% EXPLOIT!'}
                      </span>
                    </div>

                    <div className="grid-row safe">
                      <span className="gr-val font-mono">#9286-Shopify</span>
                      <span className="gr-val font-bold">$119.00</span>
                      <span className="gr-val">Berlin, DE</span>
                      <span className="gr-val text-green font-bold">1.4% (Safe)</span>
                    </div>
                  </div>

                  <div className="fraud-action-box glass-panel">
                    <div className="sec-icon">{fraudBlocked ? '🛡️' : '🚨'}</div>
                    <div className="sec-details">
                      <div className="sec-title">{fraudBlocked ? 'Security Status: Secure' : 'Stripe Exploit In Progress'}</div>
                      <p className="sec-p">
                        {fraudBlocked 
                          ? 'Blacklist applied to 198.162.24.89. Refund loops patched.' 
                          : 'Customer trying to trigger duplicate welcome-coupon loops concurrently.'}
                      </p>
                    </div>
                    <div className="sec-action-btn">
                      {!fraudBlocked ? (
                        <button onClick={handleBlockFraud} className="canvas-btn-primary hex-btn blinking-btn">
                          🔒 Deploy IP Block & Void Session
                        </button>
                      ) : (
                        <span className="shield-applied-badge">🛡️ IP Blacklisted & Rules Active</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SCENARIO 5: CHATBOT FUNNEL SCENE */}
            {activeScenario === 'chatbot' && (
              <div className="chart-wrapper">
                <div className="chatbot-visual-layout">
                  {/* Funnel Representation Card */}
                  <div className="chatbot-funnel-card glass-panel">
                    <div className="funnel-header-text">Shopify Funnel (Mobile vs Desktop)</div>
                    <div className="funnel-visual">
                      <div className="funnel-bar-group">
                        <span className="funnel-bar-label">Product Page Views</span>
                        <div className="funnel-bars-container">
                          <div className="f-bar desktop" style={{ width: '100%' }}>100% (Desktop)</div>
                          <div className="f-bar mobile" style={{ width: '100%' }}>100% (Mobile)</div>
                        </div>
                      </div>

                      <div className="funnel-bar-group">
                        <span className="funnel-bar-label">Reached Shopify Checkout</span>
                        <div className="funnel-bars-container">
                          <div className="f-bar desktop" style={{ width: '65%' }}>65%</div>
                          <div className="f-bar mobile" style={{ width: `${Math.round(20 + (6.0 - chatbotMobileSpeed) * 9)}%` }}>
                            {Math.round(20 + (6.0 - chatbotMobileSpeed) * 9)}%
                          </div>
                        </div>
                      </div>

                      <div className="funnel-bar-group">
                        <span className="funnel-bar-label">Completed Purchase (Conv. Rate)</span>
                        <div className="funnel-bars-container">
                          <div className="f-bar desktop" style={{ width: '38%' }}>3.8% (Desktop Benchmark)</div>
                          <div className="f-bar mobile" style={{ width: `${Math.round(11 + (6.0 - chatbotMobileSpeed) * 4.6)}%` }}>
                            {((11 + (6.0 - chatbotMobileSpeed) * 4.6) / 10).toFixed(1)}% (Mobile Active)
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Page Speed Controls */}
                  <div className="canvas-controls">
                    <div className="control-slider-group">
                      <label className="control-label">
                        <span>Shopify Mobile Load Speed:</span>
                        <span className="control-value" style={{ color: chatbotMobileSpeed > 3 ? '#ff3333' : '#ffcc00' }}>
                          {chatbotMobileSpeed.toFixed(1)} seconds
                        </span>
                      </label>
                      <input 
                        type="range" 
                        min="1.0" 
                        max="6.0" 
                        step="0.1"
                        value={chatbotMobileSpeed} 
                        onChange={(e) => {
                          const speed = Number(e.target.value);
                          setChatbotMobileSpeed(speed);
                          if (speed <= 1.2) {
                            setChatbotOptimized(true);
                          } else {
                            setChatbotOptimized(false);
                          }
                        }}
                        className="neon-range" 
                      />
                      <div className="speed-status-msg font-mono" style={{ fontSize: '0.75rem', opacity: 0.8, color: chatbotMobileSpeed > 3 ? '#ff3333' : '#ffcc00' }}>
                        {chatbotMobileSpeed > 3 
                          ? '🚨 Slow load speed detected! 4.8MB banner is throttling mobile conversions.' 
                          : '⚡ Asset compression active! Load speed optimized to 1.1s.'}
                      </div>
                    </div>

                    <div className="control-actions">
                      {!chatbotOptimized ? (
                        <button onClick={handleOptimizeChatbot} className="canvas-btn-primary blinking-btn">
                          ⚡ Compress Hero Assets & Defer Scripts
                        </button>
                      ) : (
                        <div className="status-success-badge">
                          🎉 Store assets optimized! Mobile checkout speed: 1.1s | Mobile Conv: 3.4%
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SCENARIO 6: WEEKLY REPORTS SCENE */}
            {activeScenario === 'reports' && (
              <div className="chart-wrapper">
                <div className="weekly-reports-layout">
                  {/* Select Week Tabs */}
                  <div className="reports-subtabs">
                    {(['week1', 'week2', 'week3'] as const).map((wk) => (
                      <button
                        key={wk}
                        className={`reports-subtab ${reportsWeek === wk ? 'active' : ''}`}
                        onClick={() => {
                          setReportsWeek(wk);
                          setReportsDownloaded(false);
                        }}
                      >
                        {wk === 'week1' && 'May 25 - Jun 01'}
                        {wk === 'week2' && 'May 18 - May 25'}
                        {wk === 'week3' && 'May 11 - May 18'}
                      </button>
                    ))}
                  </div>

                  {/* Ledger display based on selected week */}
                  <div className="reports-ledger-card glass-panel font-mono">
                    <div className="ledger-header">
                      <span>AUDIT LEDGER ID: #RPT-2026-{reportsWeek.toUpperCase()}</span>
                      <span className="text-primary" style={{ color: 'var(--primary)' }}>STORE TELEMETRY CERTIFIED</span>
                    </div>

                    <div className="ledger-metrics">
                      <div className="led-met">
                        <span className="lbl">PRESERVED REVENUE</span>
                        <span className="val" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
                          {reportsWeek === 'week1' && '$48,290'}
                          {reportsWeek === 'week2' && '$36,150'}
                          {reportsWeek === 'week3' && '$59,400'}
                        </span>
                      </div>
                      <div className="led-met">
                        <span className="lbl">LEAKAGES PATROLLED</span>
                        <span className="val" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
                          {reportsWeek === 'week1' && '3 Incidents'}
                          {reportsWeek === 'week2' && '2 Incidents'}
                          {reportsWeek === 'week3' && '4 Incidents'}
                        </span>
                      </div>
                      <div className="led-met">
                        <span className="lbl">OPERATIONAL HEALTH</span>
                        <span className="val" style={{ fontWeight: 'bold' }}>
                          {reportsWeek === 'week1' && '98.6%'}
                          {reportsWeek === 'week2' && '94.2%'}
                          {reportsWeek === 'week3' && '97.9%'}
                        </span>
                      </div>
                    </div>

                    <div className="ledger-checklists" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div className="checklist-title">Resolved Operational Directives:</div>
                      {reportsWeek === 'week1' && (
                        <>
                          <div className="chk-item">✓ [LA PORT SUPPLY RE-ROUTE] Restored stock levels for Carbon-Tee</div>
                          <div className="chk-item">✓ [STRIPE WEBHOOK DOUBLE DISCOUNT] IP 198.162.24.89 blocked</div>
                          <div className="chk-item">✓ [AUTOMATED SKU REORDER PO-9284] Purchase order generated automatically</div>
                        </>
                      )}
                      {reportsWeek === 'week2' && (
                        <>
                          <div className="chk-item">✓ [KLAVIYO SPAM OVERFLOW PROTECTION] Blocked concurrent automation loops</div>
                          <div className="chk-item">✓ [AD SPEND DEVIATION ALARM] Tuned projection weights down 8%</div>
                        </>
                      )}
                      {reportsWeek === 'week3' && (
                        <>
                          <div className="chk-item">✓ [SHOPIFY CHECKOUT SLOWDOWN CAPTURE] Compressed unoptimized 4.8MB banners</div>
                          <div className="chk-item">✓ [STRIPE REFUND LOOP MITIGATION] Intercepted double-refund requests</div>
                          <div className="chk-item">✓ [SUPPLIER PO-9210 DISPATCH] Secured safety-stock boundaries</div>
                          <div className="chk-item">✓ [AUTONOMOUS TELEMETRY REPORTING] Signed Monday Executive Ledger</div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="canvas-controls" style={{ marginTop: '1rem' }}>
                    <div className="control-actions">
                      {reportsDownloading ? (
                        <button className="canvas-btn-primary disabled" disabled style={{ background: '#111115', color: 'var(--text-muted)', cursor: 'not-allowed', border: '1px solid var(--glass-border)' }}>
                          <span className="spinner">⏳</span> Compiling Audit Ledger...
                        </button>
                      ) : reportsDownloaded ? (
                        <div className="status-success-badge">
                          🎉 PDF Report Saved (retailgpt_ledger_{reportsWeek}.pdf)
                        </div>
                      ) : (
                        <button onClick={handleDownloadReport} className="canvas-btn-primary blinking-btn">
                          📝 Download Encrypted PDF Audit Report
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </section>
  );
};

export default InteractivePlayground;
