import React from 'react';
import { Bot, Sparkles, BookOpen, FileText, ArrowRight, ShieldCheck, Zap, Globe, Cpu } from 'lucide-react';
import InteractiveOrb from './InteractiveOrb';

export default function LandingHero({ onLaunchChat, onExploreLibrary, onOpenAuth, user }) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '56px' }}>
      {/* Hero Section */}
      <section style={{
        maxWidth: '1240px',
        margin: '0 auto',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '40px',
        alignItems: 'center',
        padding: '24px 0'
      }}>
        {/* Left Column: Typography & CTAs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', width: 'fit-content' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: 'var(--accent-cyan)'
            }}>
              <Sparkles size={14} /> Autonomous College AI Architecture
            </span>
            <span style={{ color: 'var(--text-muted)' }}>·</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Spring Boot 3 + Gemini</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.3rem, 4.5vw, 3.6rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            fontFamily: 'var(--font-heading)',
            letterSpacing: '-0.02em',
            textWrap: 'balance'
          }}>
            Next-Gen Academic Intelligence for <span className="gradient-text-electric">University Students</span>
          </h1>

          <p style={{
            fontSize: '1.05rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.68,
            maxWidth: '560px'
          }}>
            Grounded directly in your official syllabus PDFs, class notes, and university modules.
            Ask complex engineering queries in <strong>Bengali, English, or Banglish</strong> with verifiable page citations.
          </p>

          {/* Quick CTA Actions */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '10px' }}>
            <button
              onClick={() => onLaunchChat()}
              style={{
                background: 'var(--primary-gradient)',
                color: '#fff',
                padding: '14px 26px',
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: '0.98rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 8px 24px -4px rgba(99, 102, 241, 0.45)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <Bot size={18} />
              <span>Launch AI Assistant</span>
              <ArrowRight size={16} />
            </button>

            <button
              onClick={onExploreLibrary}
              className="glass-surface"
              style={{
                color: 'var(--text-primary)',
                padding: '14px 24px',
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
            >
              <BookOpen size={18} color="var(--accent-cyan)" />
              <span>View Notes Library</span>
            </button>
          </div>

          {/* Trust Metrics Bar */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '24px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)'
          }}>
            <div>
              <strong style={{ color: '#fff', fontSize: '1rem', display: 'block' }}>100% Verifiable</strong>
              <span>Page-level PDF citations</span>
            </div>
            <div style={{ width: '1px', height: '28px', background: 'var(--border-subtle)' }} />
            <div>
              <strong style={{ color: '#fff', fontSize: '1rem', display: 'block' }}>Dual Language</strong>
              <span>Banglish & English queries</span>
            </div>
            <div style={{ width: '1px', height: '28px', background: 'var(--border-subtle)' }} />
            <div>
              <strong style={{ color: '#fff', fontSize: '1rem', display: 'block' }}>Zero Hallucination</strong>
              <span>Strict RAG bounds</span>
            </div>
          </div>
        </div>

        {/* Right Column: 3D Holographic Visual Stage */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Ambient Glow Backdrop */}
          <div style={{
            position: 'absolute',
            width: '90%',
            height: '90%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(6, 182, 212, 0.15) 50%, transparent 70%)',
            filter: 'blur(35px)',
            zIndex: 0
          }} />

          {/* 3D Hologram Card */}
          <div className="card-3d glass-surface-elevated" style={{
            position: 'relative',
            zIndex: 1,
            borderRadius: '24px',
            overflow: 'hidden',
            width: '100%',
            maxWidth: '520px'
          }}>
            <img
              src="/src/assets/images/hero_3d_ai_core_1793974086542.jpg"
              alt="Futuristic 3D Educational AI Core"
              referrerPolicy="no-referrer"
              style={{
                width: '100%',
                height: 'auto',
                aspectRatio: '16/9',
                objectFit: 'cover',
                display: 'block'
              }}
            />

            <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                  Interactive Academic Neural Core
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  RAG Vector Engine · Apache PDFBox Parser · Spring Data JPA
                </p>
              </div>
              <div style={{ width: '42px', height: '42px' }}>
                <InteractiveOrb size={42} isAnalyzing={true} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid with 3D Depth */}
      <section style={{ maxWidth: '1240px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-cyan)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            ENGINEERED FOR UNIVERSITY RIGOR
          </span>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-heading)', marginTop: '8px' }}>
            Full-Stack Architecture Behind Every Answer
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {/* Card 1 */}
          <div className="card-3d glass-surface" style={{ padding: '28px', borderRadius: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(99, 102, 241, 0.3)'
            }}>
              <Cpu size={22} color="var(--primary)" />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
              RAG Document Ingestion
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Upload any university syllabus, lecture slides, or exam blueprints. The system extracts structured chunks, computes TF-IDF embeddings, and performs lexical-semantic ranking.
            </p>
            <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>
              Apache PDFBox 3.0 + Vector Chunks
            </div>
          </div>

          {/* Card 2 */}
          <div className="card-3d glass-surface" style={{ padding: '28px', borderRadius: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'rgba(6, 182, 212, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(6, 182, 212, 0.3)'
            }}>
              <Globe size={22} color="var(--accent-cyan)" />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
              Natural Multilingual Querying
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Native understanding of questions phrased in Bengali or Banglish (e.g., <em>"5th sem-এর OS syllabus কী?"</em>). Provides pinpoint clarity with complete topic breakdown.
            </p>
            <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>
              Bengali · English · Banglish Dialects
            </div>
          </div>

          {/* Card 3 */}
          <div className="card-3d glass-surface" style={{ padding: '28px', borderRadius: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'rgba(139, 92, 246, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(139, 92, 246, 0.3)'
            }}>
              <ShieldCheck size={22} color="var(--accent-violet)" />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
              Zero-Trust Security & Isolation
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Enterprise Spring Security 6 with stateless JWT tokens and BCrypt hashing. Chat sessions and uploaded notes are isolated by authenticated student ID.
            </p>
            <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>
              JJWT 0.12 + User SecurityContext
            </div>
          </div>
        </div>
      </section>

      {/* Quick Launch Banner */}
      <section style={{ maxWidth: '1240px', margin: '0 auto', width: '100%' }}>
        <div className="glass-surface-elevated" style={{
          padding: '36px',
          borderRadius: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
          background: 'linear-gradient(135deg, rgba(20, 30, 60, 0.85) 0%, rgba(10, 16, 32, 0.95) 100%)'
        }}>
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
              Ready to revise for your upcoming university exams?
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Ask syllabus questions, analyze past papers, or upload custom lecture notes in seconds.
            </p>
          </div>
          <button
            onClick={() => onLaunchChat('Explain CPU Scheduling Algorithms with FCFS and SJF')}
            style={{
              background: 'var(--primary-gradient)',
              color: '#fff',
              padding: '12px 24px',
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 6px 20px -2px rgba(99, 102, 241, 0.5)'
            }}
          >
            <span>Try Sample OS Query</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </section>
    </div>
  );
}
