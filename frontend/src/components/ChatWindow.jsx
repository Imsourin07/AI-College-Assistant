import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, FileText, CheckCircle2, CornerDownLeft, HelpCircle } from 'lucide-react';

export default function ChatWindow({
  messages,
  onSendMessage,
  loading,
  semester,
  subject,
  user
}) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const quickPrompts = [
    '5th sem-এর OS syllabus কী?',
    'Explain CPU Scheduling Algorithms with FCFS and SJF',
    'Banker\'s Algorithm for Deadlock Avoidance notes',
    'What is Demand Paging and Virtual Memory?',
    'OS 5th Sem previous year questions overview'
  ];

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

  const handlePromptClick = (promptText) => {
    if (loading) return;
    onSendMessage(promptText);
  };

  return (
    <main style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'rgba(15, 23, 42, 0.4)',
      position: 'relative'
    }}>
      {/* Quick Context Banner */}
      <div style={{
        padding: '10px 24px',
        background: 'rgba(30, 41, 59, 0.5)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.85rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16} color="var(--primary)" />
          <span>Active Scope: <strong style={{ color: 'var(--accent-cyan)' }}>{semester}</strong> • <strong style={{ color: 'var(--primary)' }}>{subject}</strong></span>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Supported: Bengali, English, Banglish
        </div>
      </div>

      {/* Messages Container */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {messages.length === 0 ? (
          <div style={{
            margin: 'auto',
            maxWidth: '600px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              background: 'var(--primary-gradient)',
              padding: '20px',
              borderRadius: '24px',
              boxShadow: '0 0 30px rgba(99, 102, 241, 0.5)'
            }}>
              <Bot size={48} color="#fff" />
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
              Welcome to <span className="gradient-text">AI College Assistant</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Ask questions about your college syllabus, lecture notes, exam topics, or course modules in <strong>Bengali</strong> or <strong>English</strong>.
            </p>

            {/* Quick Prompts */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', marginTop: '10px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <HelpCircle size={14} />
                <span>Try these popular student questions:</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                {quickPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePromptClick(p)}
                    className="glass-panel"
                    style={{
                      padding: '8px 14px',
                      fontSize: '0.85rem',
                      color: 'var(--text-main)',
                      textAlign: 'left',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                  >
                    💬 {p}
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

            return (
              <div
                key={index}
                className="animate-fade-in"
                style={{
                  display: 'flex',
                  gap: '14px',
                  alignSelf: isStudent ? 'flex-end' : 'flex-start',
                  maxWidth: '85%'
                }}
              >
                {!isStudent && (
                  <div style={{
                    background: 'var(--primary-gradient)',
                    padding: '8px',
                    borderRadius: '12px',
                    height: 'fit-content',
                    display: 'flex',
                    boxShadow: '0 0 10px rgba(99, 102, 241, 0.3)'
                  }}>
                    <Bot size={20} color="#fff" />
                  </div>
                )}

                <div style={{
                  background: isStudent ? 'var(--user-msg-bg)' : 'var(--ai-msg-bg)',
                  padding: '14px 18px',
                  borderRadius: isStudent ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                  border: isStudent ? 'none' : '1px solid var(--border-color)',
                  boxShadow: 'var(--shadow-sm)',
                  fontSize: '0.95rem'
                }}>
                  {/* Message Content */}
                  <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                    {msg.message}
                  </div>

                  {/* PDF Source Citations */}
                  {sources && sources.length > 0 && (
                    <div style={{
                      marginTop: '12px',
                      paddingTop: '10px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FileText size={12} />
                        <span>RAG Grounded Citations ({sources.length}):</span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {sources.map((src, i) => (
                          <span
                            key={i}
                            className="glass-pill"
                            style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}
                          >
                            📄 {src.fileName} (Page {src.pageNumber})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {isStudent && (
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    padding: '8px',
                    borderRadius: '12px',
                    height: 'fit-content',
                    display: 'flex'
                  }}>
                    <User size={20} color="#fff" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="animate-fade-in" style={{ display: 'flex', gap: '14px', alignSelf: 'flex-start' }}>
            <div style={{ background: 'var(--primary-gradient)', padding: '8px', borderRadius: '12px', display: 'flex' }}>
              <Bot size={20} color="#fff" />
            </div>
            <div className="glass-panel" style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkles size={16} color="var(--primary)" style={{ animation: 'spin 1.5s linear infinite' }} />
              <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Searching college PDFs & generating AI answer...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box Form */}
      <form
        onSubmit={handleSubmit}
        style={{
          padding: '16px 24px',
          background: 'rgba(15, 23, 42, 0.8)',
          borderTop: '1px solid var(--border-color)',
          backdropFilter: 'blur(12px)'
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(30, 41, 59, 0.7)',
          padding: '8px 12px 8px 16px',
          borderRadius: '14px',
          border: '1px solid var(--border-color)'
        }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Student Question: '5th sem-এর OS syllabus কী?'"
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
              background: input.trim() && !loading ? 'var(--primary-gradient)' : 'rgba(255, 255, 255, 0.1)',
              color: '#fff',
              padding: '10px 16px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 600,
              cursor: input.trim() && !loading ? 'pointer' : 'not-allowed'
            }}
          >
            <span>Ask AI</span>
            <Send size={16} />
          </button>
        </div>
      </form>
    </main>
  );
}
