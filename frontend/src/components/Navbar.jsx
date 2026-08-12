import React from 'react';
import { Bot, Upload, LogIn, UserCheck, BookOpen, Layers } from 'lucide-react';

export default function Navbar({
  user,
  semester,
  setSemester,
  subject,
  setSubject,
  onOpenUpload,
  onOpenAuth,
  onLogout
}) {
  const semesters = ['1st Sem', '2nd Sem', '3rd Sem', '4th Sem', '5th Sem', '6th Sem', '7th Sem', '8th Sem'];
  const subjects = ['Operating Systems', 'Computer Networks', 'DBMS', 'Software Engineering', 'Data Structures', 'AI & ML'];

  return (
    <header className="glass-panel" style={{
      borderRadius: 0,
      borderBottom: '1px solid var(--border-color)',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 20
    }}>
      {/* Brand Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          background: 'var(--primary-gradient)',
          padding: '10px',
          borderRadius: '12px',
          display: 'flex',
          boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)'
        }}>
          <Bot size={24} color="#fff" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
            AI College Assistant <span className="gradient-text">— Top Pick</span>
          </h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Smart RAG Grounded Notes & Syllabus Bot
          </p>
        </div>
      </div>

      {/* Course Context Selectors */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(15, 23, 42, 0.5)', padding: '4px 8px', borderRadius: '10px' }}>
          <Layers size={16} color="var(--primary)" />
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '0.85rem', cursor: 'pointer' }}
          >
            {semesters.map(s => <option key={s} value={s} style={{ background: '#0f172a' }}>{s}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(15, 23, 42, 0.5)', padding: '4px 8px', borderRadius: '10px' }}>
          <BookOpen size={16} color="var(--accent-cyan)" />
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '0.85rem', cursor: 'pointer' }}
          >
            {subjects.map(sub => <option key={sub} value={sub} style={{ background: '#0f172a' }}>{sub}</option>)}
          </select>
        </div>

        {/* Upload PDF Action */}
        <button
          onClick={onOpenUpload}
          style={{
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid var(--primary)',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 600,
            fontSize: '0.85rem'
          }}
        >
          <Upload size={16} color="var(--primary)" />
          Upload College PDF
        </button>

        {/* Student Auth Button */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="glass-pill" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-emerald)' }}>
              <UserCheck size={16} />
              <span>{user.name} ({user.semester})</span>
            </div>
            <button
              onClick={onLogout}
              style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem' }}
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            style={{
              background: 'var(--primary-gradient)',
              color: '#fff',
              padding: '8px 18px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
            }}
          >
            <LogIn size={16} />
            Student Login
          </button>
        )}
      </div>
    </header>
  );
}
