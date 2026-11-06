import React, { useState } from 'react';
import { LogIn, UserPlus, Shield, CheckCircle2, AlertCircle, Sparkles, Key, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import InteractiveOrb from './InteractiveOrb';

export default function AuthPage({ onAuthSuccess, onNavigateToApp }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [semester, setSemester] = useState('5th Sem');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      let data;
      if (isLogin) {
        data = await api.login({ email, password });
        setSuccessMsg('Signed in successfully! Redirecting to Dashboard...');
      } else {
        data = await api.register({ name, email, password, semester });
        setSuccessMsg('Account registered successfully! Redirecting to Dashboard...');
      }

      localStorage.setItem('token', data.token);
      setTimeout(() => {
        onAuthSuccess(data);
      }, 700);
    } catch (err) {
      setError(err.message || 'Authentication error. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (type) => {
    setError('');
    if (type === 'student') {
      setEmail('student@college.edu');
      setPassword('password123');
      setIsLogin(true);
    } else {
      setName('Sourin Das');
      setEmail(`student_${Math.floor(Math.random() * 900 + 100)}@college.edu`);
      setPassword('password123');
      setSemester('5th Sem');
      setIsLogin(false);
    }
  };

  return (
    <div style={{
      flex: 1,
      overflowY: 'auto',
      padding: '40px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100%',
      background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(99, 102, 241, 0.15), transparent 70%), rgba(7, 11, 20, 0.95)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '460px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        {/* Top 3D Orb & Brand Heading */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '70px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <InteractiveOrb size={70} isAnalyzing={loading} />
          </div>

          <h1 style={{
            fontSize: '1.9rem',
            fontWeight: 800,
            fontFamily: 'var(--font-heading)',
            letterSpacing: '-0.02em'
          }}>
            {isLogin ? 'Student Authentication' : 'Create Student Profile'}
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: '380px', lineHeight: 1.5 }}>
            {isLogin
              ? 'Sign in to access your isolated chat history, saved exam notes, and PDF queries.'
              : 'Register your university account with Spring Security 6 & JWT authentication.'}
          </p>
        </div>

        {/* 3D Glass Auth Container */}
        <div className="card-3d glass-surface-elevated" style={{
          padding: '32px',
          borderRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {/* Mode Tabs */}
          <div style={{
            display: 'flex',
            background: 'rgba(11, 17, 32, 0.75)',
            padding: '4px',
            borderRadius: '12px',
            border: '1px solid var(--border-subtle)'
          }}>
            <button
              type="button"
              onClick={() => { setIsLogin(true); setError(''); setSuccessMsg(''); }}
              style={{
                flex: 1,
                padding: '9px',
                borderRadius: '9px',
                fontSize: '0.88rem',
                fontWeight: 600,
                background: isLogin ? 'rgba(99, 102, 241, 0.28)' : 'transparent',
                color: isLogin ? '#fff' : 'var(--text-secondary)',
                border: isLogin ? '1px solid var(--border-focus)' : '1px solid transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <LogIn size={15} />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setError(''); setSuccessMsg(''); }}
              style={{
                flex: 1,
                padding: '9px',
                borderRadius: '9px',
                fontSize: '0.88rem',
                fontWeight: 600,
                background: !isLogin ? 'rgba(99, 102, 241, 0.28)' : 'transparent',
                color: !isLogin ? '#fff' : 'var(--text-secondary)',
                border: !isLogin ? '1px solid var(--border-focus)' : '1px solid transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <UserPlus size={15} />
              <span>Register</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {!isLogin && (
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sourin Das"
                    style={{ width: '100%', paddingLeft: '38px' }}
                  />
                  <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>
            )}

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                College Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@college.edu"
                  style={{ width: '100%', paddingLeft: '38px' }}
                />
                <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ width: '100%', paddingLeft: '38px' }}
                />
                <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Current Semester
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  style={{ width: '100%', fontSize: '0.88rem' }}
                >
                  {['1st Sem', '2nd Sem', '3rd Sem', '4th Sem', '5th Sem', '6th Sem', '7th Sem', '8th Sem'].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Error and Success Alerts */}
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
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid #10b981',
                color: '#34d399',
                padding: '10px 14px',
                borderRadius: '10px',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                background: 'var(--primary-gradient)',
                color: '#fff',
                padding: '14px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.95rem',
                marginTop: '4px',
                boxShadow: '0 4px 18px rgba(99, 102, 241, 0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span>{loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Student Account')}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Quick Demo Credentials Autofill Helper */}
          <div style={{
            background: 'rgba(11, 17, 32, 0.6)',
            borderRadius: '12px',
            padding: '12px 14px',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            fontSize: '0.78rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
              <Key size={13} color="var(--accent-cyan)" />
              <span style={{ fontWeight: 600 }}>Quick Portfolio Testing:</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handleFillDemo('student')}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--accent-cyan)',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}
              >
                Autofill Test Login
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('register')}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--accent-violet)',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}
              >
                Autofill New Student
              </button>
            </div>
          </div>

          {/* Footer Security Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            fontSize: '0.75rem',
            color: 'var(--text-muted)'
          }}>
            <Shield size={13} color="var(--accent-emerald)" />
            <span>Protected by Spring Security 6 & BCrypt encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
}
