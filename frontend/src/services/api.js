const API_BASE = '/api';

const getHeaders = (isMultipart = false) => {
  const token = localStorage.getItem('token');
  const headers = {};
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // Auth
  register: async (userData) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Registration failed');
    }
    return res.json();
  },

  login: async (credentials) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Login failed');
    }
    return res.json();
  },

  getCurrentUser: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(),
    });
    if (!res.ok) return null;
    return res.json();
  },

  // Document Upload
  uploadPdf: async (formData) => {
    const res = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Upload failed');
    }
    return res.json();
  },

  getDocuments: async (semester, subject) => {
    let url = `${API_BASE}/documents/list`;
    const params = new URLSearchParams();
    if (semester) params.append('semester', semester);
    if (subject) params.append('subject', subject);
    if (params.toString()) url += `?${params.toString()}`;

    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) return [];
    return res.json();
  },

  deleteDocument: async (docId) => {
    const res = await fetch(`${API_BASE}/documents/${docId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return res.json();
  },

  // Chat & History
  sendMessage: async (chatPayload) => {
    const res = await fetch(`${API_BASE}/chat/send`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(chatPayload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Chat service error');
    }
    return res.json();
  },

  getChatSessions: async (userId = 1) => {
    const res = await fetch(`${API_BASE}/chat/sessions?userId=${userId}`, {
      headers: getHeaders(),
    });
    if (!res.ok) return [];
    return res.json();
  },

  getSessionMessages: async (sessionId) => {
    const res = await fetch(`${API_BASE}/chat/session/${sessionId}`, {
      headers: getHeaders(),
    });
    if (!res.ok) return [];
    return res.json();
  },

  deleteSession: async (sessionId) => {
    const res = await fetch(`${API_BASE}/chat/session/${sessionId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return res.json();
  }
};
