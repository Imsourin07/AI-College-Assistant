import React from 'react';
import { MessageSquare, Plus, Trash2, FileText, Clock, ExternalLink, LogIn, LogOut, UserCheck, Shield } from 'lucide-react';

export default function Sidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  documents,
  onDeleteDocument,
  onOpenLibrary,
  user,
  onOpenAuth,
  onLogout
}) {
  return (
    <aside style={{
      width: '280px',
      background: 'rgba(11, 17, 32, 0.95)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      padding: '16px',
      gap: '16px',
      zIndex: 20
    }}>
      {/* Start New Query Button */}
      <button
        onClick={onNewChat}
        style={{
          background: 'var(--primary-gradient)',
          color: '#fff',
          padding: '12px 16px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          fontWeight: 600,
          fontSize: '0.88rem',
          boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)',
          width: '100%'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <Plus size={16} />
        <span>Start New Query</span>
      </button>

      {/* Chat History Section */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.75rem',
          fontWeight: 700,
          color: 'var(--text-muted)',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          marginBottom: '10px'
        }}>
          <Clock size={13} />
          <span>PAST CONVERSATIONS ({sessions.length})</span>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {sessions.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '24px 12px',
              color: 'var(--text-muted)',
              fontSize: '0.82rem',
              lineHeight: 1.5
            }}>
              No saved threads. Ask a question to start your history!
            </div>
          ) : (
            sessions.map((session) => {
              const isActive = session.id === activeSessionId;
              return (
                <div
                  key={session.id}
                  onClick={() => onSelectSession(session.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '9px 12px',
                    borderRadius: '10px',
                    background: isActive ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.02)',
                    border: isActive ? '1px solid var(--primary)' : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                    <MessageSquare size={15} color={isActive ? 'var(--primary-glow)' : 'var(--text-muted)'} />
                    <span style={{
                      fontSize: '0.82rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      color: isActive ? '#fff' : 'var(--text-secondary)',
                      fontWeight: isActive ? 600 : 400
                    }}>
                      {session.title || 'Untitled Session'}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                    style={{ background: 'transparent', color: 'var(--text-muted)', padding: '4px' }}
                    title="Delete Chat Session"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Indexed Documents Quick Drawer */}
      <div style={{
        borderTop: '1px solid var(--border-subtle)',
        paddingTop: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.75rem',
          fontWeight: 700,
          color: 'var(--text-muted)',
          letterSpacing: '0.04em',
          textTransform: 'uppercase'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FileText size={13} color="var(--accent-cyan)" />
            <span>KNOWLEDGE FILES</span>
          </div>
          <button
            onClick={onOpenLibrary}
            style={{ background: 'transparent', color: 'var(--accent-cyan)', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '2px' }}
          >
            <span>All ({documents.length})</span>
            <ExternalLink size={10} />
          </button>
        </div>

        <div style={{ maxHeight: '90px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {documents.slice(0, 3).map((doc) => (
            <div
              key={doc.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '6px 8px',
                borderRadius: '6px',
                fontSize: '0.73rem'
              }}
            >
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-secondary)' }}>
                {doc.fileName}
              </span>
              <span style={{ fontSize: '0.68rem', color: 'var(--accent-cyan)' }}>
                {doc.chunkCount || 12}c
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Auth Card & Logout Button */}
      <div style={{
        borderTop: '1px solid var(--border-subtle)',
        paddingTop: '12px'
      }}>
        {user ? (
          <div style={{
            background: 'rgba(20, 30, 58, 0.65)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <UserCheck size={16} color="var(--accent-emerald)" />
              </div>
              <div style={{ overflow: 'hidden' }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.name}
                </p>
                <p style={{ fontSize: '0.68rem', color: 'var(--accent-cyan)', whiteSpace: 'nowrap' }}>
                  {user.semester || '5th Sem'}
                </p>
              </div>
            </div>

            <button
              onClick={onLogout}
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                color: '#f87171',
                padding: '6px 8px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
                flexShrink: 0
              }}
              title="Logout from account"
            >
              <LogOut size={12} />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <div style={{
            background: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            borderRadius: '12px',
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Shield size={14} color="var(--accent-cyan)" />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Guest Session</span>
            </div>
            <button
              onClick={onOpenAuth}
              style={{
                background: 'var(--primary-gradient)',
                color: '#fff',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <LogIn size={11} />
              <span>Sign In</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
