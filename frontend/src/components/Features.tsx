import React from 'react';

const Features: React.FC = () => {
  const features = [
    { 
      title: 'Demand Forecasting Engine', 
      badge: 'PROJECTION MODULE',
      icon: '🔮', 
      desc: 'Process 365-day transactional history to project customer demand trends, enabling high-probability inventory matching weeks in advance.' 
    },
    { 
      title: 'Inventory Forecasting & POs', 
      badge: 'LOGISTICS MOD',
      icon: '🛒', 
      desc: 'Automatic safety-stock tracking with automated replenishment algorithms. Triggers precise supplier POs before stock-out events hit.' 
    },
    { 
      title: 'Sales Anomaly Scanner', 
      badge: 'TELEMETRY MOD',
      icon: '📉', 
      desc: 'Scans transactional velocity to capture immediate retail drops or spikes. Isolates channel leakages before they affect weekly margins.' 
    },
    { 
      title: 'AI Root Cause Diagnostic', 
      badge: 'COGNITIVE MODULE',
      icon: '🧠', 
      desc: 'Stop guessing "Why". RetailGPT isolates the exact category, shipment lane, promo code, or landing page driving top-line changes.' 
    },
    { 
      title: 'Conversational Data Sandbox', 
      badge: 'NLP INTERFACE',
      icon: '💬', 
      desc: 'Query your complex SuperStore database in simple conversational English. Watch RetailGPT render responsive, downloadable graphs in seconds.' 
    },
    { 
      title: 'Automated Weekly Reports', 
      badge: 'EXECUTIVE SYSTEM',
      icon: '📝', 
      desc: 'Get highly actionable audit logs delivered to your inbox every Monday. Outlines revenue leakages blocked and optimization opportunities.' 
    },
  ];

  return (
    <section className="features-section" id="features">
      <div className="features-header text-center">
        <h2 className="features-badge">Core Capabilities</h2>
        <h3 className="section-title">Fully Autonomous Revenue Intelligence</h3>
        <p className="features-subtitle">
          Six micro-services operating continuously under one dashboard to safeguard and scale your D2C Dials.
        </p>
      </div>

      <div className="features-grid">
        {features.map((feature, index) => (
          <div key={index} className="feature-card glass-panel">
            <div className="card-top">
              <span className="feature-badge-visual">{feature.badge}</span>
              <span className="feature-icon">{feature.icon}</span>
            </div>
            
            <h4 className="feature-title">{feature.title}</h4>
            <p className="feature-desc">{feature.desc}</p>
            
            <div className="feature-footer">
              <span className="feature-active-text">ENGINE STANDBY</span>
              <span className="feature-active-dot"></span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
