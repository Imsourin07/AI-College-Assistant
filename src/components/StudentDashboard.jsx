import React from 'react';
import { Bot, Upload, BookOpen, Layers, Sparkles, Clock, CheckCircle2, FileText, ArrowRight, TrendingUp } from 'lucide-react';

export default function StudentDashboard({
  user,
  semester,
  setSemester,
  subject,
  setSubject,
  documents,
  sessions,
  onLaunchChat,
  onOpenUpload,
  onExploreLibrary
}) {
  const semesters = ['1st Sem', '2nd Sem', '3rd Sem', '4th Sem', '5th Sem', '6th Sem', '7th Sem', '8th Sem'];
  const subjects = ['Operating Systems', 'Compiler Design', 'Computer Networks', 'DBMS', 'Java', 'Data Structures', 'Physics', 'Software Engineering', 'AI & ML'];

  const examTopics = [
    { title: 'Compiler Design: Lexical & LL(1) Parsing', query: 'Explain the phases of a compiler from lexical analysis to code generation.', tag: 'Compiler Design' },
    { title: 'Operating Systems Syllabus & Modules', query: '5th sem-এর OS syllabus কী?', tag: 'Curriculum' },
    { title: 'CPU Scheduling: FCFS vs SJF vs Round Robin', query: 'Explain CPU Scheduling Algorithms with FCFS and SJF', tag: 'Core Concept' },
    { title: 'Deadlock Avoidance: Banker\'s Algorithm', query: 'Banker\'s Algorithm for Deadlock Avoidance with example', tag: 'Exam High-Yield' },
    { title: 'Virtual Memory & Demand Paging', query: 'What is Demand Paging, Page Fault, and Virtual Memory?', tag: 'Memory Management' },
    { title: 'Process Synchronization & Semaphores', query: 'Explain Process Synchronization, Critical Section Problem, and Semaphores in OS', tag: 'Concurrency' }
  ];

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '28px' }}>
        
        {/* Welcome Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-cyan)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                STUDENT INTELLIGENCE HUB
              </span>
              <span style={{ color: 'var(--text-muted)' }}>·</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {user ? `Logged in as ${user.name}` : 'Guest Session (Login for Cloud Sync)'}
              </span>
            </div>
            <h1 style={{ fontSize: '2.1rem', fontWeight: 800, fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>
              Academic Dashboard
            </h1>
          </div>

          {/* Quick Action Buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => onLaunchChat()}
              style={{
                background: 'var(--primary-gradient)',
                color: '#fff',
                padding: '10px 18px',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
              }}
            >
              <Bot size={16} />
              <span>Ask AI Question</span>
            </button>
            <button
              onClick={onOpenUpload}
              className="glass-surface"
              style={{
                color: '#fff',
                padding: '10px 18px',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Upload size={16} color="var(--accent-cyan)" />
              <span>Upload Notes</span>
            </button>
          </div>
        </div>

        {/* 3D KPI Status Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px'
        }}>
          {/* Card 1: Active Semester */}
          <div className="card-3d glass-surface" style={{ padding: '22px', borderRadius: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Academic Focus</span>
              <Layers size={18} color="var(--primary)" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }} className="gradient-text-electric">
              {semester}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Subject: <strong style={{ color: 'var(--text-primary)' }}>{subject}</strong>
            </div>
          </div>

          {/* Card 2: Indexed Documents */}
          <div className="card-3d glass-surface" style={{ padding: '22px', borderRadius: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Indexed Documents</span>
              <FileText size={18} color="var(--accent-cyan)" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#fff' }}>
              {documents.length} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)' }}>Files</span>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              RAG chunked & ready for search
            </div>
          </div>

          {/* Card 3: Saved Chat Sessions */}
          <div className="card-3d glass-surface" style={{ padding: '22px', borderRadius: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Active Conversations</span>
              <Clock size={18} color="var(--accent-violet)" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#fff' }}>
              {sessions.length} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)' }}>Threads</span>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Database-backed session storage
            </div>
          </div>

          {/* Card 4: AI Model Status */}
          <div className="card-3d glass-surface" style={{ padding: '22px', borderRadius: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>AI Engine</span>
              <Sparkles size={18} color="var(--accent-emerald)" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#fff' }}>
              Gemini <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--accent-cyan)' }}>RAG</span>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Bengali, English & Banglish
            </div>
          </div>
        </div>

        {/* Scope Controls Strip */}
        <div className="glass-surface" style={{
          padding: '20px 24px',
          borderRadius: '16px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
              Configure Current Study Scope
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              AI queries and document filters will automatically prioritize this semester and subject.
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Semester:</span>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                style={{ padding: '8px 12px', fontSize: '0.85rem' }}
              >
                {semesters.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Subject:</span>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                style={{ padding: '8px 12px', fontSize: '0.85rem' }}
              >
                {subjects.map(sub => <option key={sub} value={sub}>{sub}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* High-Yield Exam Revision Section */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                High-Yield Exam Preparation Shortcuts
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Click any topic to query the AI assistant with syllabus citations.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {examTopics.map((topic, i) => (
              <div
                key={i}
                onClick={() => onLaunchChat(topic.query)}
                className="card-3d glass-surface"
                style={{
                  padding: '20px',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                    {topic.tag}
                  </span>
                  <ArrowRight size={16} color="var(--primary)" />
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {topic.title}
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-code)' }}>
                  "{topic.query}"
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
