import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleViewDashboardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (sessionStorage.getItem('visitorFilled') === 'true') {
      navigate('/dashboard');
    } else {
      setShowModal(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    setLoading(true);
    try {
      await fetch('http://localhost:5000/api/visitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email })
      });
      sessionStorage.setItem('visitorFilled', 'true');
    } catch (error) {
      console.error('Error saving visitor info:', error);
    } finally {
      setLoading(false);
      setShowModal(false);
      navigate('/dashboard');
    }
  };

  return (
    <>
      <nav className="navbar glass-panel">
        <div className="nav-logo">
          <span className="logo-text">Retail<span className="logo-accent">GPT</span></span>
        </div>
        
        <div className="nav-links">
          <Link to="/dashboard" className="nav-link-btn" style={{ textDecoration: 'none' }}>🚀 Explore Demo</Link>
        </div>

        <button onClick={handleViewDashboardClick} className="nav-cta" style={{ textDecoration: 'none', border: 'none', cursor: 'pointer' }}>
          📊 View Dashboard
        </button>
      </nav>

      {showModal && (
        <div className="modal-overlay" style={modalOverlayStyle}>
          <div className="modal-content glass-panel" style={modalContentStyle}>
            <h3>Just curious! 👋</h3>
            <p>Hehe sorry for trouble but just curious who all visited. so can you please enter your name and email...so that i have an idea who are you!</p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
              <input
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={inputStyle}
              />
              <input
                type="email"
                placeholder="Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={inputStyle}
              />
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} className="nav-link-btn" style={{ background: 'transparent', border: '1px solid #555' }}>Cancel</button>
                <button type="submit" className="nav-cta" disabled={loading} style={{ border: 'none' }}>
                  {loading ? 'Saving...' : 'Submit & View'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
  backdropFilter: 'blur(5px)'
};

const modalContentStyle: React.CSSProperties = {
  padding: '30px',
  borderRadius: '15px',
  maxWidth: '400px',
  width: '90%',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  backgroundColor: '#111'
};

const inputStyle: React.CSSProperties = {
  padding: '12px',
  borderRadius: '8px',
  border: '1px solid #333',
  backgroundColor: '#222',
  color: '#fff',
  outline: 'none'
};

export default Navbar;
