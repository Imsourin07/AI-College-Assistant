import React, { useState } from 'react';
import { X, UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, Sparkles, Layers } from 'lucide-react';
import { api } from '../services/api';

export default function PdfUploadModal({
  isOpen,
  onClose,
  currentSemester,
  currentSubject,
  onUploadSuccess
}) {
  const [file, setFile] = useState(null);
  const [semester, setSemester] = useState(currentSemester || '5th Sem');
  const [subject, setSubject] = useState(currentSubject || 'Operating Systems');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (!selected.name.toLowerCase().endsWith('.pdf')) {
        setError('Please select a valid PDF file (.pdf)');
        setFile(null);
        return;
      }
      setFile(selected);
      setError('');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please choose a college PDF file to upload.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('semester', semester);
      formData.append('subject', subject);
      formData.append('uploadedBy', 'College Student / Admin');

      const res = await api.uploadPdf(formData);
      setSuccessMsg(res.message || 'PDF uploaded and RAG indexed successfully!');
      setTimeout(() => {
        onUploadSuccess();
        onClose();
        setFile(null);
        setSuccessMsg('');
      }, 1200);
    } catch (err) {
      setError(err.message || 'Failed to upload PDF document');
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
        maxWidth: '520px',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '22px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'var(--primary-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 18px rgba(99, 102, 241, 0.4)'
          }}>
            <UploadCloud size={24} color="#fff" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
              Ingest College PDF Notes
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Chunked & embedded for high-precision RAG question answering
            </p>
          </div>
        </div>

        <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* File Drop Area */}
          <div
            onClick={() => document.getElementById('pdf-file-input').click()}
            style={{
              border: '2px dashed rgba(99, 102, 241, 0.45)',
              borderRadius: '16px',
              padding: '28px 20px',
              textAlign: 'center',
              background: 'rgba(11, 17, 32, 0.65)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.background = 'rgba(20, 30, 58, 0.65)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.45)';
              e.currentTarget.style.background = 'rgba(11, 17, 32, 0.65)';
            }}
          >
            <input
              id="pdf-file-input"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <FileText size={38} color="var(--accent-cyan)" />
            {file ? (
              <div>
                <p style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>{file.name}</p>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            ) : (
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  Click to select syllabus PDF
                </p>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Supports university syllabus, lecture slides, or exam blueprints
                </p>
              </div>
            )}
          </div>

          {/* Academic Scope Configuration */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Target Semester
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                style={{ width: '100%', fontSize: '0.88rem' }}
              >
                {['1st Sem', '2nd Sem', '3rd Sem', '4th Sem', '5th Sem', '6th Sem', '7th Sem', '8th Sem'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Course Subject
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                style={{ width: '100%', fontSize: '0.88rem' }}
              >
                {['Operating Systems', 'Compiler Design', 'Computer Networks', 'DBMS', 'Java', 'Data Structures', 'Physics', 'Software Engineering', 'AI & ML'].map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Alerts */}
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
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Submit Action */}
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
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)',
              marginTop: '4px'
            }}
          >
            {loading ? (
              <>
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Parsing PDF with Apache PDFBox...</span>
              </>
            ) : (
              <span>Process & Index PDF</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
