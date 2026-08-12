import React from 'react';
import { MessageSquare, Plus, Trash2, FileText, Sparkles, Clock } from 'lucide-react';

export default function Sidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  documents,
  onDeleteDocument
}) {
  return (
    <aside style={{
      width: '280px',
      background: 'rgba(15, 23, 42, 0.95)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      padding: '16px',
      gap: '20px'
    }}>
      {/* New Chat Button */}
      <button
        onClick={onNewChat}
        style={{
          background: 'var(--primary-gradient)',
          color: '#fff',
          padding: '12px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          fontWeight: 600,
          boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
          width: '100%'
        }}
      >
        <Plus size={18} />
        Start New Query
      </button>

      {/* Chat History Section */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '10px' }}>
          <Clock size={14} />
          <span>CHAT HISTORY (DATABASE)</span>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {sessions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 10px', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
              No past chats. Ask a question to save in history!
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
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: isActive ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                    border: isActive ? '1px solid var(--primary)' : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                    <MessageSquare size={16} color={isActive ? 'var(--primary)' : 'var(--text-muted)'} />
                    <span style={{
                      fontSize: '0.85rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      color: isActive ? '#fff' : 'var(--text-muted)'
                    }}>
                      {session.title || 'Untitled Session'}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                    style={{ background: 'transparent', color: 'var(--text-dim)', padding: '4px' }}
                    title="Delete Chat"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Uploaded College Documents List */}
      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '10px' }}>
          <FileText size={14} color="var(--accent-cyan)" />
          <span>INDEXED PDF DOCUMENTS</span>
        </div>

        <div style={{ maxHeight: '160px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {documents.length === 0 ? (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              No PDFs uploaded yet. Upload syllabus/notes to activate PDF RAG!
            </div>
          ) : (
            documents.map(doc => (
              <div
                key={doc.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(255, 255, 255, 0.04)',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  fontSize: '0.75rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                  <FileText size={14} color="var(--accent-cyan)" />
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {doc.fileName}
                  </span>
                </div>
                <button
                  onClick={() => onDeleteDocument(doc.id)}
                  style={{ background: 'transparent', color: '#f87171' }}
                  title="Remove document"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}
