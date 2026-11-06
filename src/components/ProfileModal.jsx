import React, { useState } from 'react';
import { X, User, Mail, Layers, Shield, Settings, Sliders, LogOut, CheckCircle2 } from 'lucide-react';

export default function ProfileModal({ isOpen, onClose, user, onLogout, onOpenAuth }) {
  const [prefLanguage, setPrefLanguage] = useState('Banglish & English');
  const [prefStyle, setPrefStyle] = useState('Comprehensive Exam Prep');
  const [savedMsg, setSavedMsg] = useState(false);

  if (!isOpen) return null;

  const handleSavePref = (e) => {
    e.preventDefault();
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.82)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 60
    }}>
      <div className="glass-surface-elevated animate-fade-in" style={{
        width: '90%',
        maxWidth: '480px',
        padding: '28px',
        position: 'relative',
        borderRadius: '24px'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'transparent',
            color: 'var(--text-muted)'
          }}
        >
          <X size={20} />
        </button>

        {/* Profile Card Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'var(--primary-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 20px -4px rgba(99, 102, 241, 0.5)'
          }}>
            <User size={28} color="#fff" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
              {user ? user.name : 'Student Profile'}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              {user ? user.email : 'Not signed in yet'}
            </p>
          </div>
        </div>

        {user ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Student Info Details */}
            <div style={{
              background: 'rgba(11, 17, 32, 0.7)',
              borderRadius: '14px',
              border: '1px solid var(--border-subtle)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              fontSize: '0.85rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)' }}>Registered Semester:</span>
                <span style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>{user.semester || '5th Sem'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)' }}>Access Level:</span>
                <span className="glass-pill" style={{ color: 'var(--accent-emerald)', padding: '2px 8px', fontSize: '0.75rem' }}>
                  {user.role || 'STUDENT'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)' }}>Authentication:</span>
                <span style={{ color: 'var(--text-secondary)' }}>Stateless JWT (HMAC-SHA256)</span>
              </div>
            </div>

            {/* AI Assistant Preferences */}
            <form onSubmit={handleSavePref} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', fontWeight: 700 }}>
                <Settings size={16} color="var(--primary)" />
                <span>AI Tutor Preferences</span>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Default Query Dialect
                </label>
                <select
                  value={prefLanguage}
                  onChange={(e) => setPrefLanguage(e.target.value)}
                  style={{ width: '100%', fontSize: '0.88rem' }}
                >
                  <option value="Banglish & English">Banglish & English (Recommended)</option>
                  <option value="Pure English">Pure English</option>
                  <option value="Bengali (বাংলা)">Bengali (বাংলা)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Answer Formatting Mode
                </label>
                <select
                  value={prefStyle}
                  onChange={(e) => setPrefStyle(e.target.value)}
                  style={{ width: '100%', fontSize: '0.88rem' }}
                >
                  <option value="Comprehensive Exam Prep">Comprehensive (Theory + Steps + Code)</option>
                  <option value="Concise Exam Revision">Concise (Quick Revision Bullets)</option>
                </select>
              </div>

              {savedMsg && (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid #10b981',
                  color: '#34d399',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <CheckCircle2 size={14} />
                  <span>Preferences updated successfully!</span>
                </div>
              )}

              <button
                type="submit"
                style={{
                  background: 'rgba(99, 102, 241, 0.18)',
                  border: '1px solid var(--primary)',
                  color: '#fff',
                  padding: '10px',
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '0.85rem'
                }}
              >
                Save Assistant Preferences
              </button>
            </form>

            {/* Logout Action */}
            <div style={{ paddingTop: '10px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#f87171',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Sign in with your student account to sync chat history and access personal course documents across devices.
            </p>
            <button
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              style={{
                background: 'var(--primary-gradient)',
                color: '#fff',
                padding: '12px 24px',
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: '0.95rem'
              }}
            >
              Sign In / Register Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
