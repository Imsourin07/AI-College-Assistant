import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Check } from 'lucide-react';

function CodeBlock({ children, className, ...props }) {
  const [copied, setCopied] = useState(false);
  const codeString = String(children).replace(/\n$/, '');
  const match = /language-(\w+)/.exec(className || '');
  const isInline = !match && !codeString.includes('\n');

  if (isInline) {
    return (
      <code
        style={{
          background: 'rgba(99, 102, 241, 0.15)',
          color: '#38bdf8',
          padding: '2px 6px',
          borderRadius: '6px',
          fontSize: '0.88em',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
        }}
        {...props}
      >
        {children}
      </code>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      position: 'relative',
      margin: '12px 0',
      borderRadius: '10px',
      overflow: 'hidden',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      background: 'rgba(10, 15, 29, 0.85)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 14px',
        background: 'rgba(255, 255, 255, 0.04)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        fontSize: '0.75rem',
        color: 'var(--text-muted)'
      }}>
        <span>{match ? match[1].toUpperCase() : 'CODE'}</span>
        <button
          onClick={handleCopy}
          type="button"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.75rem'
          }}
        >
          {copied ? <Check size={12} color="var(--accent-emerald)" /> : <Copy size={12} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre style={{
        margin: 0,
        padding: '14px 16px',
        overflowX: 'auto',
        fontSize: '0.86rem',
        lineHeight: 1.55,
        color: '#e2e8f0',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
      }}>
        <code>{children}</code>
      </pre>
    </div>
  );
}

export default function MarkdownRenderer({ content }) {
  if (!content) return null;

  return (
    <div className="markdown-content" style={{ lineHeight: 1.68 }}>
      <ReactMarkdown
        components={{
          code: CodeBlock,
          h1: ({ node, ...props }) => (
            <h1 style={{ fontSize: '1.45rem', fontWeight: 700, margin: '14px 0 8px', color: '#fff' }} {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '12px 0 6px', color: '#f8fafc' }} {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '10px 0 6px', color: 'var(--accent-cyan)' }} {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 style={{ fontSize: '0.98rem', fontWeight: 600, margin: '8px 0 4px', color: '#cbd5e1' }} {...props} />
          ),
          p: ({ node, ...props }) => (
            <p style={{ margin: '6px 0 10px', color: 'var(--text-primary)' }} {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul style={{ margin: '6px 0 10px 20px', padding: 0, listStyleType: 'disc' }} {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol style={{ margin: '6px 0 10px 20px', padding: 0, listStyleType: 'decimal' }} {...props} />
          ),
          li: ({ node, ...props }) => (
            <li style={{ margin: '4px 0', color: 'var(--text-secondary)' }} {...props} />
          ),
          strong: ({ node, ...props }) => (
            <strong style={{ color: '#fff', fontWeight: 600 }} {...props} />
          ),
          em: ({ node, ...props }) => (
            <em style={{ color: 'var(--accent-cyan)', fontStyle: 'italic' }} {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote style={{
              margin: '10px 0',
              padding: '8px 14px',
              borderLeft: '3px solid var(--primary)',
              background: 'rgba(99, 102, 241, 0.08)',
              borderRadius: '0 8px 8px 0',
              fontStyle: 'italic',
              color: 'var(--text-secondary)'
            }} {...props} />
          ),
          table: ({ node, ...props }) => (
            <div style={{ overflowX: 'auto', margin: '12px 0' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.85rem',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }} {...props} />
            </div>
          ),
          th: ({ node, ...props }) => (
            <th style={{
              background: 'rgba(255, 255, 255, 0.06)',
              padding: '8px 12px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              fontWeight: 600,
              color: '#fff',
              textAlign: 'left'
            }} {...props} />
          ),
          td: ({ node, ...props }) => (
            <td style={{
              padding: '8px 12px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              color: 'var(--text-secondary)'
            }} {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
