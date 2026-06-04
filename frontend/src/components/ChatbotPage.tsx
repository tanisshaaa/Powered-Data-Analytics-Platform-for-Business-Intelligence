import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  loading?: boolean;
  sql?: string;
  data?: Record<string, unknown>[];
  columns?: string[];
  chartType?: 'line' | 'bar' | 'pie' | 'table';
  sources?: { source: string; text: string; score?: number }[];
  error?: string;
}

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

const ChatbotPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Welcome to the RetailGPT Analytics Hub! I am your AI Business Analyst. Ask me anything about your sales, profits, categories, regions, or state metrics, and I will generate the SQL query, pull the live data, and draw the charts for you.'
    }
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    'What category generated the most sales?',
    'Show profit margins by region',
    'List the top 5 states by profit',
    'Compare sales vs profit across segments'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsgId = Date.now().toString();
    const userMessage: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: textToSend
    };

    const botMsgId = (Date.now() + 1).toString();
    const botPlaceholderMessage: ChatMessage = {
      id: botMsgId,
      sender: 'bot',
      text: '',
      loading: true
    };

    setMessages(prev => [...prev, userMessage, botPlaceholderMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await fetch('http://localhost:5000/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question: textToSend })
      });

      if (!response.ok) {
        throw new Error('Failed to get response from chatbot API');
      }

      const result = await response.json();

      setMessages(prev =>
        prev.map(msg => {
          if (msg.id === botMsgId) {
            return {
              id: botMsgId,
              sender: 'bot',
              text: result.explanation || 'Here are the results of your query:',
              loading: false,
              sql: result.sql,
              data: result.data,
              columns: result.columns,
              chartType: result.chart_type,
              sources: result.sources,
              error: result.error
            };
          }
          return msg;
        })
      );
    } catch (err: unknown) {
      console.error(err);
      setMessages(prev =>
        prev.map(msg => {
          if (msg.id === botMsgId) {
            return {
              id: botMsgId,
              sender: 'bot',
              text: 'Sorry, I encountered an error while processing your request. Please ensure the backend server is running and your OpenAI API key is valid.',
              loading: false,
              error: err instanceof Error ? err.message : String(err)
            };
          }
          return msg;
        })
      );
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage(inputText);
    }
  };

  // Helper to render dynamic recharts dynamically
  const renderDynamicChart = (chartType: string, chartData: Record<string, unknown>[], columns: string[]) => {
    if (!chartData || chartData.length === 0 || !columns || columns.length < 2) return null;

    const numericCols = columns.filter(col => {
      const val = chartData[0][col];
      return typeof val === 'number';
    });

    const categoricalCols = columns.filter(col => !numericCols.includes(col));

    const xAxisKey = categoricalCols.find(col =>
      col.toLowerCase().includes('date') ||
      col.toLowerCase().includes('year') ||
      col.toLowerCase().includes('month') ||
      col.toLowerCase().includes('name') ||
      col.toLowerCase().includes('category')
    ) || categoricalCols[0] || columns[0];

    const yAxisKey = numericCols[0] || columns[1] || columns[0];

    // Helper to format values
    const formatYVal = (v: unknown): string => {
      if (typeof v === 'number') {
        if (yAxisKey.toLowerCase().includes('sales') || yAxisKey.toLowerCase().includes('profit') || yAxisKey.toLowerCase().includes('cost')) {
          return formatCurrency(v);
        }
        return v.toString();
      }
      return String(v);
    };

    if (chartType === 'line') {
      return (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartData} margin={{ top: 15, right: 15, left: 15, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey={xAxisKey} stroke="#8e8e93" fontSize={10} tickLine={false} dy={5} />
            <YAxis stroke="#8e8e93" fontSize={10} tickLine={false} tickFormatter={formatYVal} dx={-5} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0c0c0f', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
              labelStyle={{ fontWeight: 'bold', color: 'var(--primary)' }}
            />
            <Line type="monotone" dataKey={yAxisKey} stroke="var(--primary)" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === 'bar') {
      return (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} margin={{ top: 15, right: 15, left: 15, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey={xAxisKey} stroke="#8e8e93" fontSize={10} tickLine={false} dy={5} />
            <YAxis stroke="#8e8e93" fontSize={10} tickLine={false} tickFormatter={formatYVal} dx={-5} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0c0c0f', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
              labelStyle={{ fontWeight: 'bold', color: 'var(--primary)' }}
            />
            <Bar dataKey={yAxisKey} fill="#00d2ff" radius={[4, 4, 0, 0]}>
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? 'var(--primary)' : '#00d2ff'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === 'pie') {
      const COLORS = ['#ffcc00', '#00d2ff', '#10b981', '#a855f7', '#f43f5e', '#eab308'];
      return (
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="48%"
              innerRadius={50}
              outerRadius={75}
              paddingAngle={3}
              dataKey={yAxisKey}
              nameKey={xAxisKey}
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: '#0c0c0f', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
              formatter={(v) => [formatYVal(v), '']}
            />
            <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '0.75rem' }} />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    return null;
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

  return (
    <div className="dashboard-layout animate-fade-in" style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-gradient)', color: '#ffffff' }}>
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
        <Link to="/anomaly" className="sidebar-link" style={sidebarLinkStyle}>
          🚨 Anomaly Monitoring
        </Link>
        <Link to="/chatbot" className="sidebar-link active" style={activeSidebarLinkStyle}>
          🤖 Chatbot
        </Link>
        <Link to="/forecasting" className="sidebar-link" style={sidebarLinkStyle}>
          📈 Analysis & Forecasting
        </Link>
      </aside>

      {/* Main Chat Area */}
      <main className="dashboard-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', padding: '40px', position: 'relative', overflow: 'hidden' }}>
        {/* Header */}
        <div className="dashboard-header" style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '15px' }}>
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
          <div>
            <h1 className="text-primary" style={{ fontSize: '2.2rem', margin: 0, color: 'var(--primary)' }}>RetailGPT AI Assistant</h1>
            <p className="text-muted" style={{ margin: '5px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Natural language interface querying Superstore databases, generating visual reports, and giving analyst advice.
            </p>
          </div>
        </div>

        {/* Message History Scroller */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          paddingRight: '10px',
          marginBottom: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                width: '100%'
              }}
            >
              <div style={{
                maxWidth: msg.sender === 'user' ? '70%' : '85%',
                ...glassPanelStyle,
                background: msg.sender === 'user' ? 'rgba(255, 204, 0, 0.08)' : 'rgba(12, 12, 15, 0.85)',
                borderColor: msg.sender === 'user' ? 'rgba(255, 204, 0, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                padding: '20px',
                borderRadius: msg.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
              }}>
                {/* Sender Tag */}
                <div style={{
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  color: msg.sender === 'user' ? 'var(--primary)' : '#00d2ff',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '8px'
                }}>
                  {msg.sender === 'user' ? '👤 YOU' : '🤖 RetailGPT Analyst'}
                </div>

                {/* Loading state */}
                {msg.loading ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      backgroundColor: 'var(--primary)',
                      borderRadius: '50%',
                      animation: 'bounce 0.6s infinite alternate'
                    }}></div>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      backgroundColor: 'var(--primary)',
                      borderRadius: '50%',
                      animation: 'bounce 0.6s infinite alternate 0.2s'
                    }}></div>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      backgroundColor: 'var(--primary)',
                      borderRadius: '50%',
                      animation: 'bounce 0.6s infinite alternate 0.4s'
                    }}></div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: '5px' }}>Translating to SQL and querying records...</span>
                    <style>{`
                      @keyframes bounce {
                        from { transform: translateY(0); }
                        to { transform: translateY(-8px); }
                      }
                    `}</style>
                  </div>
                ) : (
                  <>
                    {/* Error display */}
                    {msg.error && (
                      <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '8px',
                        padding: '12px',
                        marginBottom: '15px',
                        color: '#f87171',
                        fontSize: '0.85rem'
                      }}>
                        <strong>⚠️ Database Error:</strong> {msg.error}
                      </div>
                    )}

                    {/* Bot or User Text */}
                    {msg.text && (
                      <p style={{
                        margin: 0,
                        lineHeight: '1.6',
                        color: '#f5f5f7',
                        fontSize: '0.95rem',
                        whiteSpace: 'pre-line'
                      }}>
                        {msg.text}
                      </p>
                    )}

                    {/* Retrieved Knowledge Sources Callout */}
                    {!msg.error && msg.sources && msg.sources.length > 0 && (
                      <div style={{
                        marginTop: '15px',
                        padding: '12px 16px',
                        background: 'rgba(0, 210, 255, 0.04)',
                        border: '1px solid rgba(0, 210, 255, 0.15)',
                        borderRadius: '10px'
                      }}>
                        <details>
                          <summary style={{
                            fontSize: '0.8rem',
                            color: '#00d2ff',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            outline: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}>
                            📚 Retrieved Knowledge Context ({msg.sources.length} sources)
                          </summary>
                          <div style={{
                            marginTop: '10px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                            fontSize: '0.8rem'
                          }}>
                            {msg.sources.map((src, sIdx) => (
                              <div key={sIdx} style={{
                                padding: '10px',
                                background: 'rgba(0,0,0,0.2)',
                                border: '1px solid rgba(255,255,255,0.06)',
                                borderRadius: '6px'
                              }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontWeight: 'bold', color: 'var(--primary)' }}>
                                  <span>📄 {src.source}</span>
                                  {src.score !== undefined && (
                                    <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
                                      Relevance: {src.score < 1.0 ? 'High' : src.score < 1.4 ? 'Medium' : 'Low'} ({src.score.toFixed(3)})
                                    </span>
                                  )}
                                </div>
                                <p style={{ margin: 0, color: 'rgba(255,255,255,0.85)', lineHeight: '1.4' }}>
                                  {src.text}
                                </p>
                              </div>
                            ))}
                          </div>
                        </details>
                      </div>
                    )}

                    {/* Render visual chart if bot returned data and chart recommendation */}
                    {!msg.error && msg.data && msg.data.length > 0 && msg.chartType && msg.chartType !== 'table' && (
                      <div style={{
                        marginTop: '20px',
                        padding: '15px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.04)',
                        borderRadius: '12px',
                        height: '280px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '10px' }} className="font-mono">
                          <span>📊 Visualized Output ({msg.chartType} chart)</span>
                        </div>
                        {renderDynamicChart(msg.chartType, msg.data, msg.columns || [])}
                      </div>
                    )}

                    {/* Table View Component */}
                    {!msg.error && msg.data && msg.data.length > 0 && (
                      <details style={{ marginTop: '15px' }}>
                        <summary style={{
                          fontSize: '0.8rem',
                          color: '#00d2ff',
                          cursor: 'pointer',
                          fontWeight: '600',
                          outline: 'none',
                          userSelect: 'none'
                        }}>
                          📋 View Raw Data Table ({msg.data.length} rows)
                        </summary>
                        <div style={{
                          marginTop: '10px',
                          overflowX: 'auto',
                          maxHeight: '200px',
                          border: '1px solid rgba(255,255,255,0.06)',
                          borderRadius: '8px',
                          background: 'rgba(0,0,0,0.2)'
                        }}>
                          <table style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            fontSize: '0.8rem',
                            textAlign: 'left'
                          }}>
                            <thead>
                              <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                {msg.columns?.map(col => (
                                  <th key={col} style={{ padding: '8px 12px', color: 'var(--primary)', fontWeight: 'bold' }}>{col}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {msg.data.slice(0, 50).map((row, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                                  {msg.columns?.map(col => (
                                    <td key={col} style={{ padding: '8px 12px', color: '#e4e4e7' }}>
                                      {typeof row[col] === 'number' && (col.toLowerCase().includes('sales') || col.toLowerCase().includes('profit'))
                                        ? formatCurrency(row[col])
                                        : row[col]?.toString() || 'NULL'}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {msg.data.length > 50 && (
                            <div style={{ padding: '8px 12px', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                              Showing first 50 rows.
                            </div>
                          )}
                        </div>
                      </details>
                    )}

                    {/* SQL inspector */}
                    {!msg.error && msg.sql && (
                      <details style={{ marginTop: '8px' }}>
                        <summary style={{
                          fontSize: '0.8rem',
                          color: 'var(--primary)',
                          cursor: 'pointer',
                          fontWeight: '600',
                          outline: 'none',
                          userSelect: 'none'
                        }}>
                          💻 Inspect Generated SQL Query
                        </summary>
                        <pre style={{
                          marginTop: '10px',
                          padding: '12px',
                          background: '#09090b',
                          border: '1px solid rgba(255, 204, 0, 0.15)',
                          borderRadius: '8px',
                          color: '#e4e4e7',
                          fontSize: '0.75rem',
                          fontFamily: 'Consolas, Monaco, monospace',
                          whiteSpace: 'pre-wrap',
                          overflowX: 'auto',
                          margin: 0
                        }}>
                          {msg.sql}
                        </pre>
                      </details>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Action Suggestion Prompts */}
        {messages.length === 1 && !isTyping && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            marginBottom: '15px'
          }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              💡 Quick Queries:
            </span>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSendMessage(prompt)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '20px',
                    padding: '8px 16px',
                    color: 'rgba(255, 255, 255, 0.85)',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    outline: 'none'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 204, 0, 0.08)';
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.85)';
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div style={{
          display: 'flex',
          gap: '12px',
          background: 'rgba(12, 12, 15, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '8px 12px',
          alignItems: 'center'
        }}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isTyping ? 'Analyst is computing...' : 'Ask a question about the Superstore data...'}
            disabled={isTyping}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: '#fff',
              fontSize: '0.95rem',
              outline: 'none',
              padding: '8px 0'
            }}
          />
          <button
            onClick={() => handleSendMessage(inputText)}
            disabled={isTyping || !inputText.trim()}
            style={{
              background: inputText.trim() && !isTyping ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              color: inputText.trim() && !isTyping ? '#000' : 'var(--text-muted)',
              fontWeight: 'bold',
              cursor: inputText.trim() && !isTyping ? 'pointer' : 'default',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>Send</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </main>
    </div>
  );
};

export default ChatbotPage;
