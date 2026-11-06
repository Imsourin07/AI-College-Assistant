import React, { useState } from 'react';
import { Bot, Upload, LogIn, LogOut, UserCheck, BookOpen, Layers, Sparkles, User, ChevronDown, Settings } from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  user,
  semester,
  setSemester,
  subject,
  setSubject,
  onOpenUpload,
  onOpenAuth,
  onOpenProfile,
  onLogout
}) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const semesters = ['1st Sem', '2nd Sem', '3rd Sem', '4th Sem', '5th Sem', '6th Sem', '7th Sem', '8th Sem'];
  const subjects = ['Operating Systems', 'Compiler Design', 'Computer Networks', 'DBMS', 'Java', 'Data Structures', 'Physics', 'Software Engineering', 'AI & ML'];

  const navItems = [
    { id: 'landing', label: 'Overview' },
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'chat', label: 'AI Chat' },
    { id: 'library', label: 'Library' }
  ];

  if (!user) {
    navItems.push({ id: 'auth', label: 'Sign In' });
  }

  return (
    <header className="glass-surface" style={{
      borderRadius: 0,
      borderBottom: '1px solid var(--border-subtle)',
      padding: '10px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
      position: 'relative',
      zIndex: 40
    }}>
      {/* Zone 1: Brand Wordmark */}
      <div
        onClick={() => setActiveTab('landing')}
        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flexShrink: 0 }}
      >
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--primary-gradient)',
          boxShadow: '0 0 14px rgba(99, 102, 241, 0.45)'
        }}>
          <img
            src="/src/assets/images/avatar_ai_core_1793974087597.jpg"
            alt="AI Assistant Core"
            referrerPolicy="no-referrer"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{
            fontSize: '1.1rem',
            fontWeight: 800,
            fontFamily: 'var(--font-heading)',
            letterSpacing: '-0.02em',
            whiteSpace: 'nowrap'
          }}>
            AI College Assistant
          </span>
          <span style={{ fontSize: '0.68rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
            Spring Boot 3 · RAG Gemini
          </span>
        </div>
      </div>

      {/* Zone 2: Navigation Links */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        background: 'rgba(11, 17, 32, 0.7)',
        padding: '3px',
        borderRadius: '12px',
        border: '1px solid var(--border-subtle)'
      }}>
        {navItems.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: isActive ? '#fff' : 'var(--text-secondary)',
                background: isActive ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                border: isActive ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              {tab.id === 'auth' && <LogIn size={13} color="var(--accent-cyan)" />}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Zone 3: Academic Scopes & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {/* Semester & Subject Selectors */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(11, 17, 32, 0.8)',
          padding: '4px 8px',
          borderRadius: '10px',
          border: '1px solid var(--border-subtle)'
        }}>
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '0.8rem', padding: '2px 4px', cursor: 'pointer' }}
          >
            {semesters.map(s => <option key={s} value={s} style={{ background: '#0b1120' }}>{s}</option>)}
          </select>
          <span style={{ color: 'var(--border-subtle)' }}>|</span>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'var(--accent-cyan)', fontSize: '0.8rem', padding: '2px 4px', cursor: 'pointer' }}
          >
            {subjects.map(sub => <option key={sub} value={sub} style={{ background: '#0b1120' }}>{sub}</option>)}
          </select>
        </div>

        {/* Upload Notes Action */}
        <button
          onClick={onOpenUpload}
          style={{
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.35)',
            color: '#fff',
            padding: '6px 12px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: 600,
            fontSize: '0.8rem',
            whiteSpace: 'nowrap'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.28)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.15)'}
        >
          <Upload size={14} color="var(--primary-glow)" />
          <span>Upload PDF</span>
        </button>

        {/* User Auth or Logged-In Menu */}
        {user ? (
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {/* Profile Menu Trigger */}
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  padding: '6px 12px',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <UserCheck size={14} color="var(--accent-emerald)" />
                <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name}
                </span>
                <ChevronDown size={13} color="var(--text-muted)" />
              </button>

              {/* Direct Quick Logout Button */}
              <button
                onClick={onLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: 'rgba(239, 68, 68, 0.14)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  color: '#f87171',
                  padding: '6px 10px',
                  borderRadius: '10px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
                title="Log out of student account"
              >
                <LogOut size={13} />
                <span>Logout</span>
              </button>
            </div>

            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <div
                className="glass-surface-elevated animate-fade-in"
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  width: '230px',
                  borderRadius: '14px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  zIndex: 50
                }}
              >
                <div style={{ paddingBottom: '8px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <p style={{ fontWeight: 700, fontSize: '0.88rem', color: '#fff' }}>{user.name}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.email}
                  </p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', marginTop: '2px' }}>
                    {user.semester || '5th Sem'} · {user.role || 'STUDENT'}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onOpenProfile();
                  }}
                  style={{
                    background: 'transparent',
                    color: 'var(--text-secondary)',
                    padding: '6px 8px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <Settings size={14} color="var(--primary)" />
                  <span>Account & Preferences</span>
                </button>

                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onLogout();
                  }}
                  style={{
                    background: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#f87171',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <LogOut size={14} />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setActiveTab('auth')}
            style={{
              background: 'var(--primary-gradient)',
              color: '#fff',
              padding: '7px 16px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 700,
              fontSize: '0.82rem',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
              whiteSpace: 'nowrap'
            }}
          >
            <LogIn size={14} />
            <span>Student Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}
