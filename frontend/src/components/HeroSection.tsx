import React from 'react';
import { Link } from 'react-router-dom';

interface HeroSectionProps {
  onScrollToPlayground: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onScrollToPlayground }) => {
  return (
    <section className="hero-section">
      <div className="hero-content">
        <div className="hero-tag-glow">
          <span className="tag-pulse"></span>
          <span>REVENUE INTELLIGENCE ENGINE v2.4</span>
        </div>
        
        <h1 className="hero-title">
          Your D2C store generates data. <br />
          <span className="text-gradient">RetailGPT</span> tells you how to scale it.
        </h1>
        
        <p className="hero-subtitle">
          An autonomous AI Business Analyst that continuously audits Shopify & Stripe logs, explains anomalies in real-time, predicts stock-outs, and executes revenue-saving overrides automatically.
        </p>

        <div className="hero-bullet-grid">
          <div className="bullet-item">
            <span className="bullet-dot"></span>
            <span>Continuous Anomaly Detection</span>
          </div>
          <div className="bullet-item">
            <span className="bullet-dot"></span>
            <span>Predictive Demand Forecasting</span>
          </div>
          <div className="bullet-item">
            <span className="bullet-dot"></span>
            <span>Auto-Pilot Stock Reordering</span>
          </div>
          <div className="bullet-item">
            <span className="bullet-dot"></span>
            <span>Payment Gateway Exploits Guard</span>
          </div>
        </div>

        <div className="hero-ctas">
          <Link to="/dashboard" className="cta-primary-btn blinking-btn" style={{ textDecoration: 'none' }}>
            🚀 Explore Demo
          </Link>
          <button onClick={onScrollToPlayground} className="cta-secondary-btn">
            Try Interactive Simulator ⚡
          </button>
        </div>


      </div>

      {/* Right Column: Beautiful Glowing Futuristic Animated Dashboard Preview */}
      <div className="hero-visual animate-float">
        <div className="futuristic-card glass-panel">
          <div className="card-scanner-line"></div>
          
          <div className="card-header-visual">
            <div className="visual-indicator">
              <span className="status-dot pulsing"></span>
              <span>RETAIL-ENGINE-LIVE</span>
            </div>
            <div className="visual-time font-mono">EST: 21:26:40</div>
          </div>

          <div className="card-metrics-grid">
            <div className="visual-metric glass-panel">
              <div className="v-met-label">DAILY CHANNELS AUDITED</div>
              <div className="v-met-value text-pink font-mono">1,482 SKUs</div>
              <div className="v-met-footer text-green">▲ 100% telemetry coverage</div>
            </div>
            
            <div className="visual-metric glass-panel">
              <div className="v-met-label">REVENUE PROTECTED</div>
              <div className="v-met-value font-mono">$48,290</div>
              <div className="v-met-footer text-pink">🛡️ 0 leakages in last 24h</div>
            </div>
          </div>

          {/* Interactive Graph Drawing Visual */}
          <div className="mini-chart-visual glass-panel">
            <div className="mini-chart-title">REAL-TIME ANOMALY DETECTOR</div>
            <svg className="mini-chart-svg" viewBox="0 0 200 80">
              <path 
                d="M 10 60 L 40 55 L 70 65 L 100 20 L 130 50 L 160 55 L 190 40" 
                fill="none" 
                stroke="#ff007f" 
                strokeWidth="2.5" 
              />
              <path 
                d="M 10 60 L 40 55 L 70 65 L 100 20 L 130 50 L 160 55 L 190 40 L 190 80 L 10 80 Z" 
                fill="url(#pink-gradient-fill)" 
                opacity="0.15" 
              />
              <circle cx="100" cy="20" r="5" fill="#bd00ff" className="pulsing-node" />
              <circle cx="100" cy="20" r="2" fill="#fff" />
              
              <defs>
                <linearGradient id="pink-gradient-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff007f" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
            </svg>
            <div className="mini-chart-legend">
              <span className="text-pink">● OUT-OF-STOCK INCIDENT SPOTTED & AUTO-RESOLVED</span>
            </div>
          </div>

          <div className="card-footer-visual font-mono">
            <span className="text-muted">SYSTEM STATUS:</span>
            <span className="text-green">SECURE & OPTIMIZED</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
