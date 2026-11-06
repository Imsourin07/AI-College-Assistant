import React, { useState } from 'react';
import { FileText, UploadCloud, Search, Trash2, Bot, Layers, BookOpen, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function DocumentLibrary({
  documents,
  onDeleteDocument,
  onOpenUpload,
  onAskAboutDoc,
  user
}) {
  const [search, setSearch] = useState('');
  const [filterSem, setFilterSem] = useState('ALL');

  const filteredDocs = documents.filter((doc) => {
    const matchSearch = doc.fileName.toLowerCase().includes(search.toLowerCase()) ||
      (doc.subject && doc.subject.toLowerCase().includes(search.toLowerCase()));
    const matchSem = filterSem === 'ALL' || doc.semester === filterSem;
    return matchSearch && matchSem;
  });

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '28px' }}>
        
        {/* Header & Upload Banner */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-cyan)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                KNOWLEDGE MATRIX & VAULT
              </span>
              <span style={{ color: 'var(--text-muted)' }}>·</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {documents.length} Academic Files
              </span>
            </div>
            <h1 style={{ fontSize: '2.1rem', fontWeight: 800, fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>
              Notes & Syllabus Document Library
            </h1>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.6 }}>
              Every PDF uploaded here is parsed with <strong>Apache PDFBox</strong>, split into semantic chunks, and indexed for high-precision retrieval during student chats.
            </p>
          </div>

          {/* Upload Callout Card with 3D library preview asset */}
          <div className="card-3d glass-surface-elevated" style={{
            borderRadius: '20px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <img
              src="/src/assets/images/card_digital_library_1793974086467.jpg"
              alt="Digital Academic Library"
              referrerPolicy="no-referrer"
              style={{
                width: '100%',
                height: '140px',
                objectFit: 'cover'
              }}
            />
            <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Add New Curriculum Notes</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Syllabus, question bank, or faculty notes (.pdf)</p>
              </div>
              <button
                onClick={onOpenUpload}
                style={{
                  background: 'var(--primary-gradient)',
                  color: '#fff',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
                }}
              >
                <UploadCloud size={16} />
                <span>Upload PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="glass-surface" style={{
          padding: '14px 20px',
          borderRadius: '14px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px'
        }}>
          {/* Search input */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(11, 17, 32, 0.8)',
            padding: '8px 14px',
            borderRadius: '10px',
            border: '1px solid var(--border-subtle)',
            minWidth: '280px',
            flex: 1
          }}>
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by file name or subject..."
              style={{
                background: 'transparent',
                border: 'none',
                padding: 0,
                color: '#fff',
                fontSize: '0.9rem',
                width: '100%'
              }}
            />
          </div>

          {/* Semester Filter Tabs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
            {['ALL', '1st Sem', '2nd Sem', '3rd Sem', '4th Sem', '5th Sem', '6th Sem', '7th Sem', '8th Sem'].map((sem) => {
              const active = filterSem === sem;
              return (
                <button
                  key={sem}
                  onClick={() => setFilterSem(sem)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    background: active ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                    color: active ? '#fff' : 'var(--text-secondary)',
                    border: active ? '1px solid var(--primary)' : '1px solid transparent'
                  }}
                >
                  {sem}
                </button>
              );
            })}
          </div>
        </div>

        {/* Document Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px'
        }}>
          {filteredDocs.length === 0 ? (
            <div className="glass-surface" style={{
              gridColumn: '1 / -1',
              padding: '48px 24px',
              textAlign: 'center',
              borderRadius: '20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}>
              <FileText size={48} color="var(--text-muted)" />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>No documents match your query</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '420px' }}>
                Upload a university syllabus or notes PDF to activate automated chunking and RAG answers.
              </p>
              <button
                onClick={onOpenUpload}
                style={{
                  background: 'var(--primary-gradient)',
                  color: '#fff',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  marginTop: '8px'
                }}
              >
                Upload First PDF
              </button>
            </div>
          ) : (
            filteredDocs.map((doc) => {
              const isDefaultSyllabus = doc.fileName === 'OS_5th_Sem_Syllabus.pdf' || doc.id === 1;
              return (
                <div
                  key={doc.id}
                  className="card-3d glass-surface"
                  style={{
                    padding: '24px',
                    borderRadius: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    position: 'relative'
                  }}
                >
                  {/* Top Status & Subject */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                        {doc.semester || '5th Sem'}
                      </span>
                      <span style={{ color: 'var(--text-muted)' }}>·</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {doc.subject || 'Operating Systems'}
                      </span>
                    </div>

                    {isDefaultSyllabus && (
                      <span className="glass-pill" style={{ color: 'var(--accent-emerald)', fontSize: '0.7rem' }}>
                        Curriculum Seed
                      </span>
                    )}
                  </div>

                  {/* Document Title */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{
                      padding: '10px',
                      borderRadius: '10px',
                      background: 'rgba(6, 182, 212, 0.12)',
                      border: '1px solid rgba(6, 182, 212, 0.25)',
                      flexShrink: 0
                    }}>
                      <FileText size={22} color="var(--accent-cyan)" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', wordBreak: 'break-word' }}>
                        {doc.fileName}
                      </h3>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Uploaded by: {doc.uploadedBy || 'College Faculty'}
                      </p>
                    </div>
                  </div>

                  {/* Metadata Indicators */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    paddingTop: '10px',
                    borderTop: '1px solid var(--border-subtle)',
                    fontSize: '0.78rem',
                    color: 'var(--text-secondary)'
                  }}>
                    <div>
                      <strong style={{ color: 'var(--text-primary)' }}>{doc.chunkCount || 12}</strong> Chunks
                    </div>
                    <div>
                      <strong style={{ color: 'var(--text-primary)' }}>PDF</strong> Format
                    </div>
                    <div style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}>
                      {doc.uploadDate ? new Date(doc.uploadDate).toLocaleDateString() : 'Active'}
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                    <button
                      onClick={() => onAskAboutDoc(doc)}
                      style={{
                        flex: 1,
                        background: 'rgba(99, 102, 241, 0.15)',
                        border: '1px solid var(--primary)',
                        color: '#fff',
                        padding: '8px 12px',
                        borderRadius: '10px',
                        fontWeight: 600,
                        fontSize: '0.82rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--primary-gradient)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.15)'}
                    >
                      <Bot size={14} />
                      <span>Ask AI About This</span>
                    </button>

                    {!isDefaultSyllabus && (
                      <button
                        onClick={() => onDeleteDocument(doc.id)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.12)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: '#f87171',
                          padding: '8px 12px',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="Delete document"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
