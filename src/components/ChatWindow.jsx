import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, FileText, ChevronDown, ChevronUp, Copy, Check, HelpCircle } from 'lucide-react';
import InteractiveOrb from './InteractiveOrb';
import MarkdownRenderer from './MarkdownRenderer';

export default function ChatWindow({
  messages,
  onSendMessage,
  loading,
  semester,
  subject,
  user
}) {
  const [input, setInput] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [expandedSources, setExpandedSources] = useState({});
  const messagesEndRef = useRef(null);

  const defaultPrompts = [
    '5th sem-এর OS syllabus কী?',
    'Explain CPU Scheduling: FCFS vs SJF with turnaround time',
    'Banker\'s Algorithm for Deadlock Avoidance notes',
    'What is Demand Paging and Virtual Memory?',
    'Explain Process Synchronization & Critical Section Problem'
  ];

  const compilerPrompts = [
    'What is a compiler and its phases?',
    'Explain Lexical Analysis and Tokenization',
    'What is a Finite Automaton (DFA vs NFA)?',
    'Explain LL(1) Parsing and predictive parsing table',
    'What is Intermediate Code Generation (Three-Address Code)?',
    'Explain Code Optimization techniques'
  ];

  const quickPrompts = subject === 'Compiler Design' ? compilerPrompts : defaultPrompts;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const handleCopyMessage = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const toggleSourceExpand = (index) => {
    setExpandedSources(prev => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <main style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'radial-gradient(ellipse 90% 40% at 50% 0%, rgba(99, 102, 241, 0.08), transparent 70%), rgba(7, 11, 20, 0.95)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Active Scope & Assistant Header Bar */}
      <div className="glass-surface" style={{
        padding: '10px 24px',
        borderRadius: 0,
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.85rem',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: loading ? 'var(--accent-cyan)' : 'var(--accent-emerald)',
            boxShadow: `0 0 10px ${loading ? 'var(--accent-cyan)' : 'var(--accent-emerald)'}`
          }} />
          <span style={{ color: 'var(--text-secondary)' }}>
            Active Query Scope: <strong style={{ color: 'var(--accent-cyan)' }}>{semester}</strong> · <strong style={{ color: '#fff' }}>{subject}</strong>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          <span>Dialects: Bengali, English, Banglish</span>
        </div>
      </div>

      {/* Messages Scrollable Flow */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '28px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        {messages.length === 0 ? (
          <div style={{
            margin: 'auto',
            maxWidth: '640px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px'
          }}>
            {/* 3D Orb Visual Centerpiece */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <InteractiveOrb size={130} isAnalyzing={loading} />
            </div>

            <div>
              <h2 style={{ fontSize: '1.85rem', fontWeight: 800, fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>
                How can I assist your <span className="gradient-text-electric">studies today?</span>
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginTop: '8px' }}>
                Ask anything about <strong>{subject}</strong> or university course modules. Responses are backed by your indexed syllabus PDFs with verifiable citations.
              </p>
            </div>

            {/* Quick Prompts Container */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', marginTop: '6px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <HelpCircle size={14} color="var(--primary)" />
                <span>Frequently asked university exam questions:</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                {quickPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSendMessage(p)}
                    className="card-3d glass-surface"
                    style={{
                      padding: '10px 16px',
                      fontSize: '0.85rem',
                      color: 'var(--text-primary)',
                      textAlign: 'left',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Sparkles size={14} color="var(--accent-cyan)" />
                    <span>{p}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isStudent = msg.sender === 'STUDENT';
            let sources = [];
            if (!isStudent && msg.sourcesJson) {
              try { sources = JSON.parse(msg.sourcesJson); } catch (e) {}
            }
            const isExpanded = !!expandedSources[index];

            return (
              <div
                key={index}
                className="animate-fade-in"
                style={{
                  display: 'flex',
                  gap: '14px',
                  alignSelf: isStudent ? 'flex-end' : 'flex-start',
                  maxWidth: isStudent ? '75%' : '85%'
                }}
              >
                {!isStudent && (
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    boxShadow: '0 0 14px rgba(99, 102, 241, 0.4)'
                  }}>
                    <img
                      src="/src/assets/images/avatar_ai_core_1793974087597.jpg"
                      alt="AI"
                      referrerPolicy="no-referrer"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                )}

                <div style={{
                  background: isStudent ? 'var(--user-bubble)' : 'var(--bg-glass-elevated)',
                  backdropFilter: 'blur(16px)',
                  padding: '16px 20px',
                  borderRadius: isStudent ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  border: isStudent ? 'none' : '1px solid var(--border-subtle)',
                  boxShadow: 'var(--shadow-card)',
                  fontSize: '0.95rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  {/* Top Metadata */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.75rem',
                    color: isStudent ? 'rgba(255, 255, 255, 0.75)' : 'var(--text-muted)'
                  }}>
                    <span>{isStudent ? 'You' : 'Academic AI Assistant'}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {!isStudent && (
                        <button
                          onClick={() => handleCopyMessage(msg.message, index)}
                          style={{ background: 'transparent', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}
                          title="Copy answer"
                        >
                          {copiedIndex === index ? <Check size={12} color="var(--accent-emerald)" /> : <Copy size={12} />}
                        </button>
                      )}
                      <span>
                        {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  {isStudent ? (
                    <div style={{
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.68,
                      color: '#fff'
                    }}>
                      {msg.message}
                    </div>
                  ) : (
                    <MarkdownRenderer content={msg.message} />
                  )}

                  {/* PDF Source Citations Drawer */}
                  {sources && sources.length > 0 && (
                    <div style={{
                      marginTop: '8px',
                      paddingTop: '10px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.08)'
                    }}>
                      <div
                        onClick={() => toggleSourceExpand(index)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          fontSize: '0.78rem',
                          color: 'var(--accent-cyan)',
                          fontWeight: 600
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <FileText size={14} />
                          <span>RAG Grounded PDF Citations ({sources.length})</span>
                        </div>
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </div>

                      {isExpanded ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                          {sources.map((src, i) => (
                            <div
                              key={i}
                              style={{
                                background: 'rgba(11, 17, 32, 0.65)',
                                border: '1px solid rgba(255, 255, 255, 0.06)',
                                borderRadius: '10px',
                                padding: '10px 12px',
                                fontSize: '0.78rem'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <strong style={{ color: 'var(--text-primary)' }}>{src.fileName}</strong>
                                <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>Page {src.pageNumber}</span>
                              </div>
                              <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.5 }}>
                                "{src.excerpt}"
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                          {sources.map((src, i) => (
                            <span
                              key={i}
                              className="glass-pill"
                              style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}
                            >
                              📄 {src.fileName} (Page {src.pageNumber})
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {isStudent && (
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <User size={18} color="#fff" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Loading State with 3D Orb */}
        {loading && (
          <div className="animate-fade-in" style={{ display: 'flex', gap: '14px', alignSelf: 'flex-start' }}>
            <div style={{ width: '36px', height: '36px', flexShrink: 0 }}>
              <InteractiveOrb size={36} isAnalyzing={true} />
            </div>
            <div className="glass-surface-elevated" style={{
              padding: '14px 18px',
              borderRadius: '18px 18px 18px 4px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <Sparkles size={16} color="var(--accent-cyan)" style={{ animation: 'spin 1.5s linear infinite' }} />
              <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                Retrieving relevant syllabus chunks & synthesizing answer...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Dock Bar */}
      <form
        onSubmit={handleSubmit}
        style={{
          padding: '16px 24px',
          background: 'rgba(11, 17, 32, 0.92)',
          borderTop: '1px solid var(--border-subtle)',
          backdropFilter: 'blur(20px)',
          zIndex: 10
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(17, 26, 48, 0.8)',
          padding: '8px 12px 8px 18px',
          borderRadius: '14px',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)'
        }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question in English or Bengali (e.g. '5th sem-এর OS syllabus কী?')..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: '#fff',
              fontSize: '0.95rem'
            }}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            style={{
              background: input.trim() && !loading ? 'var(--primary-gradient)' : 'rgba(255, 255, 255, 0.08)',
              color: '#fff',
              padding: '10px 18px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
              boxShadow: input.trim() && !loading ? '0 4px 14px rgba(99, 102, 241, 0.4)' : 'none'
            }}
          >
            <span>Ask</span>
            <Send size={15} />
          </button>
        </div>
      </form>
    </main>
  );
}
