import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ProblemStory from './components/ProblemStory';
import InteractivePlayground from './components/InteractivePlayground';
import Features from './components/Features';
import DashboardPage from './components/DashboardPage';
import ForecastingPage from './components/ForecastingPage';
import AnomalyPage from './components/AnomalyPage';
import ChatbotPage from './components/ChatbotPage';


const LandingPage: React.FC = () => {
  const scrollToPlayground = () => {
    document.getElementById('playground')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <HeroSection onScrollToPlayground={scrollToPlayground} />
        <ProblemStory />
        <InteractivePlayground />
        <Features />
      </main>

      <footer className="footer-visual glass-panel">
        <div className="footer-logo">
          Retail<span className="logo-accent">GPT</span>
        </div>
        <div className="footer-contact font-mono">
          <a href="mailto:tanishaasinha02@gmail.com" className="footer-link">tanishaasinha02@gmail.com</a>
          <span className="divider">&middot;</span>
          <a href="https://github.com/tanisshaaa" target="_blank" rel="noopener noreferrer" className="footer-link">Github</a>
          <span className="divider">&middot;</span>
          <a href="https://www.linkedin.com/in/tanishasinhaa" target="_blank" rel="noopener noreferrer" className="footer-link">Linkedin</a>
          <span className="divider">&middot;</span>
          <a href="https://tanisshaaa.github.io/Portfolio/" target="_blank" rel="noopener noreferrer" className="footer-link">Portfolio</a>
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/forecasting" element={<ForecastingPage />} />
        <Route path="/anomaly" element={<AnomalyPage />} />
        <Route path="/chatbot" element={<ChatbotPage />} />
      </Routes>
    </Router>
  );
};


export default App;
