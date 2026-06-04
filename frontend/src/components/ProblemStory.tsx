import React, { useState } from 'react';

const ProblemStory: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'normal' | 'drop'>('drop');

  const questions = [
    { text: "Why did sales drop? 📉", details: "Is it a checkout gateway latency, an ad campaign flag, or catalog glitches?", rotate: "-1.5deg" },
    { text: "Which product caused it? 📦", details: "Is the inventory dry for a single core SKU, or is a collection slow?", rotate: "1.2deg" },
    { text: "Is this temporary or serious? 🧐", details: "Should we wait for organic recovery, or trigger high-alert routing?", rotate: "-1deg" },
    { text: "What will next week look like? 🔮", details: "Project our weekly cash balances and safety margins based on drift.", rotate: "1.8deg" },
    { text: "Do I need to reorder inventory? 🛒", details: "Has consumption velocity triggered safety-limit points?", rotate: "-1.4deg" },
    { text: "Is there fraud or a system issue? 🚨", details: "Are Checkout codes duplicating discount rules or webhook logs?", rotate: "1deg" }
  ];

  return (
    <section className="story-section" id="story">
      <div className="story-grid">
        
        {/* Left Column: Visual Step Nodes Connected by Animated SVG Pipeline */}
        <div className="story-narrative-container">
          <span className="story-badge">THE DILEMMA & THE SOLUTION</span>
          
          <h2 className="story-title">
            The transition from <br />
            <span className="text-gradient">Raw Logs to Revenue Certainty</span>
          </h2>

          <div className="infographic-flow">
            {/* Pulsing SVG Flow Line on the Left */}
            <div className="pipeline-visual-wrapper">
              <svg className="story-pipeline-svg" viewBox="0 0 40 380">
                {/* Background Track Line */}
                <line x1="20" y1="10" x2="20" y2="370" stroke="var(--glass-border)" strokeWidth="3" />
                {/* Animated Glowing Dashed Packet Line */}
                <line 
                  x1="20" 
                  y1="10" 
                  x2="20" 
                  y2="370" 
                  stroke="var(--primary)" 
                  strokeWidth="3.5" 
                  strokeDasharray="8 12" 
                  className="flow-path-anim" 
                />
                {/* Nodes representing transition points (all solid yellow) */}
                <circle cx="20" cy="30" r="7" fill="var(--primary)" className="glow-circle" />
                <circle cx="20" cy="180" r="7" fill="var(--primary)" className="glow-circle" />
                <circle cx="20" cy="350" r="7" fill="var(--primary)" className="glow-circle" />
              </svg>
            </div>

            {/* Interactive Step Text Cards */}
            <div className="flow-steps">
              
              <div className="flow-step-node glass-panel">
                <div className="step-badge-circle font-mono">01</div>
                <div className="step-content">
                  <h4 className="step-heading">The Raw Data Firehose</h4>
                  <p className="step-desc text-muted">
                    Every day, storefronts generate thousands of transactional rows across Shopify checkout systems and Stripe gateway APIs. An unreadable mass of server logs.
                  </p>
                </div>
              </div>

              <div className="flow-step-node glass-panel">
                <div className="step-badge-circle font-mono">02</div>
                <div className="step-content">
                  <h4 className="step-heading">The Blindspot Gap</h4>
                  <p className="step-desc text-muted">
                    Standard dashboards show static, historical figures. They tell you sales fell, but stay completely silent on the root cause, leaving you with guesses and leakages.
                  </p>
                </div>
              </div>

              <div className="flow-step-node glass-panel glow-purple-border">
                <div className="step-badge-circle font-mono success">03</div>
                <div className="step-content">
                  <h4 className="step-heading">The Intelligence Bridge</h4>
                  <p className="step-desc text-muted">
                    RetailGPT acts as your continuous digital audit layer. It connects directly to live logs and processes complex shifts into human-readable action triggers immediately.
                  </p>
                </div>
              </div>

            </div>
          </div>

          <div className="story-approach-quote glass-panel animate-pulse-glow">
            <span className="quote-mark">“</span>
            <p>
              We bypassed flat dashboards. RetailGPT is a fully localized AI analyst that answers business questions and resolves logistical stockouts inside the database in real-time.
            </p>
          </div>
        </div>

        {/* Right Column: Visual Scenario (Hand-Sketched Scribble Look) */}
        <div className="story-visual-card glass-panel">
          <div className="card-top">
            <span className="card-badge">LIVE STORE EVENT STUDY</span>
            <div className="visual-toggle">
              <button 
                onClick={() => setActiveTab('normal')} 
                className={`toggle-btn ${activeTab === 'normal' ? 'active' : ''}`}
              >
                Normal
              </button>
              <button 
                onClick={() => setActiveTab('drop')} 
                className={`toggle-btn ${activeTab === 'drop' ? 'active' : ''}`}
              >
                Anomaly Trigger
              </button>
            </div>
          </div>

          <h3 className="scenario-heading">
            A merchant sells <span className="text-light-pink font-mono">100 items</span> daily. <br />
            Suddenly, channel sales plummet to <span className="text-pink font-mono">40</span>.
          </h3>

          {/* Comparative visual charts with custom scribble arrows */}
          <div className="scenario-graph-preview-doodle">
            <div className="bar-compare">
              <span className="bar-label font-mono">Standard Day</span>
              <div className="bar-container-scribble">
                <div className="bar-fill-scribble normal" style={{ width: activeTab === 'normal' ? '90%' : '90%' }}></div>
                <span className="bar-value font-mono">100 sales</span>
              </div>
            </div>

            {/* Scribble Arrow SVG connecting 100 to 40 */}
            {activeTab === 'drop' && (
              <div className="scribble-arrow-container">
                <svg className="scribble-arrow-svg" viewBox="0 0 100 50">
                  <path 
                    d="M 10 10 Q 50 40, 90 25 M 90 25 L 80 20 M 90 25 L 85 35" 
                    fill="none" 
                    stroke="var(--primary)" 
                    strokeWidth="2.5" 
                    strokeLinecap="round"
                    className="scribble-path-anim"
                  />
                  <text x="50" y="15" fill="var(--primary)" fontSize="7.5" fontWeight="bold" textAnchor="middle">
                    -60% Drop Spotted!
                  </text>
                </svg>
              </div>
            )}

            <div className="bar-compare">
              <span className="bar-label font-mono">Anomaly Day</span>
              <div className="bar-container-scribble">
                <div 
                  className={`bar-fill-scribble ${activeTab === 'drop' ? 'dropped animate-pulse-glow' : 'normal'}`} 
                  style={{ width: activeTab === 'drop' ? '36%' : '90%' }}
                ></div>
                <span className="bar-value font-mono text-pink">
                  {activeTab === 'drop' ? '40 sales' : '100 sales'}
                </span>
              </div>
            </div>
          </div>

          <p className="scenario-p text-muted">
            The visual drop is immediately highlighted. But as a shop owner, you are flooded with critical diagnostic questions:
          </p>

          {/* Doodled/Rotated Sticky Notes questions grid */}
          <div className="story-questions-grid-doodled">
            {questions.map((q, index) => (
              <div 
                key={index} 
                className="story-question-bubble-doodle glass-panel"
                style={{ transform: `rotate(${q.rotate})` }}
              >
                <div className="q-bubble-header font-bold text-pink">
                  {q.text}
                </div>
                <p className="q-bubble-details text-muted">
                  {q.details}
                </p>
                <div className="bubble-corner-fold"></div>
              </div>
            ))}
          </div>

          <div className="scenario-footer font-mono">
            <span className="scan-text">AUDIT COMPLETED:</span>
            <span className="action-text text-pink">SCROLL DOWN TO INJECT SOLUTIONS</span>
          </div>
        </div>

      </div>
    </section>
  );
};

export default ProblemStory;
