import React, { useState } from 'react';
import { X, UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
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
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50
    }}>
      <div className="glass-panel animate-fade-in" style={{
        width: '90%',
        maxWidth: '520px',
        padding: '28px',
        position: 'relative',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            background: 'transparent',
            color: 'var(--text-muted)'
          }}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ background: 'var(--primary-gradient)', padding: '10px', borderRadius: '12px', display: 'flex' }}>
            <UploadCloud size={24} color="#fff" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
              Upload College PDF / Notes
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              PDF will be parsed & chunked for RAG vector search
            </p>
          </div>
        </div>

        <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* File Drop Area */}
          <div
            onClick={() => document.getElementById('pdf-file-input').click()}
            style={{
              border: '2px dashed var(--primary-glow, rgba(99, 102, 241, 0.4))',
              borderRadius: '14px',
              padding: '24px',
              textAlign: 'center',
              background: 'rgba(15, 23, 42, 0.5)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <input
              id="pdf-file-input"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <FileText size={36} color="var(--primary)" style={{ marginBottom: '8px' }} />
            {file ? (
              <div>
                <p style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>{file.name}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            ) : (
              <div>
                <p style={{ fontWeight: 600 }}>Click to select syllabus PDF file</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Supports syllabus notes, question banks, or notice PDFs</p>
              </div>
            )}
          </div>

          {/* Metadata Controls */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Semester</label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                style={{ width: '100%' }}
              >
                {['1st Sem', '2nd Sem', '3rd Sem', '4th Sem', '5th Sem', '6th Sem', '7th Sem', '8th Sem'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                style={{ width: '100%' }}
              >
                {['Operating Systems', 'Computer Networks', 'DBMS', 'Software Engineering', 'Data Structures', 'AI & ML'].map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #f87171', color: '#f87171', padding: '10px 14px', borderRadius: '10px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #34d399', color: '#34d399', padding: '10px 14px', borderRadius: '10px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              background: 'var(--primary-gradient)',
              color: '#fff',
              padding: '12px',
              borderRadius: '12px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '8px'
            }}
          >
            {loading ? (
              <>
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Extracting Text & Chunking PDF...</span>
              </>
            ) : (
              <span>Start RAG PDF Indexing</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
