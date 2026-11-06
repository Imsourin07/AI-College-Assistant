import React, { useState } from 'react';
import { X, LogIn, UserPlus, AlertCircle, CheckCircle2, Shield, Sparkles } from 'lucide-react';
import { api } from '../services/api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [semester, setSemester] = useState('5th Sem');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let data;
      if (isLogin) {
        data = await api.login({ email, password });
      } else {
        data = await api.register({ name, email, password, semester });
      }

      localStorage.setItem('token', data.token);
      onAuthSuccess(data);
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.82)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 60,
      padding: '16px'
    }}>
      <div className="glass-surface-elevated animate-fade-in" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '32px',
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

        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'var(--primary-gradient)',
            margin: '0 auto 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 18px rgba(99, 102, 241, 0.4)'
          }}>
            {isLogin ? <LogIn size={22} color="#fff" /> : <UserPlus size={22} color="#fff" />}
          </div>
          <h3 style={{ fontSize: '1.45rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
            {isLogin ? 'Student Login' : 'Create Student Account'}
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {isLogin ? 'Sign in to access your chat sessions and notes' : 'Register to unlock personalized RAG history & syllabus access'}
          </p>
        </div>

        {/* Auth Toggle Tabs */}
        <div style={{
          display: 'flex',
          background: 'rgba(11, 17, 32, 0.7)',
          padding: '4px',
          borderRadius: '10px',
          marginBottom: '20px',
          border: '1px solid var(--border-subtle)'
        }}>
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(''); }}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '7px',
              fontSize: '0.85rem',
              fontWeight: 600,
              background: isLogin ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
              color: isLogin ? '#fff' : 'var(--text-secondary)',
              border: isLogin ? '1px solid var(--border-focus)' : '1px solid transparent'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(''); }}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '7px',
              fontSize: '0.85rem',
              fontWeight: 600,
              background: !isLogin ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
              color: !isLogin ? '#fff' : 'var(--text-secondary)',
              border: !isLogin ? '1px solid var(--border-focus)' : '1px solid transparent'
            }}
          >
            Register Profile
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {!isLogin && (
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sourin Das"
                style={{ width: '100%' }}
              />
            </div>
          )}

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              College Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@college.edu"
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ width: '100%' }}
            />
          </div>

          {!isLogin && (
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Semester
              </label>
              <select value={semester} onChange={(e) => setSemester(e.target.value)} style={{ width: '100%' }}>
                {['1st Sem', '2nd Sem', '3rd Sem', '4th Sem', '5th Sem', '6th Sem', '7th Sem', '8th Sem'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#f87171',
              padding: '10px 14px',
              borderRadius: '10px',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: 'var(--primary-gradient)',
              color: '#fff',
              padding: '13px',
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '0.92rem',
              marginTop: '8px',
              boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)'
            }}
          >
            {loading ? 'Authenticating...' : (isLogin ? 'Sign In to Assistant' : 'Create Student Profile')}
          </button>
        </form>

        <div style={{
          textAlign: 'center',
          marginTop: '18px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '0.78rem',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px'
        }}>
          <Shield size={13} color="var(--accent-emerald)" />
          <span>Stateless BCrypt + JWT Auth Integration</span>
        </div>
      </div>
    </div>
  );
}
