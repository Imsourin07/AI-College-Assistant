import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import PdfUploadModal from './components/PdfUploadModal';
import AuthModal from './components/AuthModal';
import { api } from './services/api';

export default function App() {
  const [user, setUser] = useState(null);
  const [semester, setSemester] = useState('5th Sem');
  const [subject, setSubject] = useState('Operating Systems');

  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [documents, setDocuments] = useState([]);

  const [loading, setLoading] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Load User & Documents on Mount
  useEffect(() => {
    loadUser();
    loadDocuments();
    loadSessions();
  }, []);

  // Reload sessions when user changes
  useEffect(() => {
    if (user) {
      loadSessions(user.id);
    }
  }, [user]);

  const loadUser = async () => {
    try {
      const userData = await api.getCurrentUser();
      if (userData) {
        setUser(userData);
        if (userData.semester) setSemester(userData.semester);
      }
    } catch (e) {
      console.log('No logged in session');
    }
  };

  const loadDocuments = async () => {
    try {
      const list = await api.getDocuments(semester, subject);
      setDocuments(list);
    } catch (e) {
      console.error('Error fetching documents', e);
    }
  };

  const loadSessions = async (userId = 1) => {
    try {
      const list = await api.getChatSessions(userId);
      setSessions(list);
    } catch (e) {
      console.error('Error fetching chat sessions', e);
    }
  };

  const handleSelectSession = async (sessionId) => {
    setActiveSessionId(sessionId);
    try {
      const msgs = await api.getSessionMessages(sessionId);
      setMessages(msgs);
    } catch (e) {
      console.error('Error fetching session messages', e);
    }
  };

  const handleNewChat = () => {
    setActiveSessionId(null);
    setMessages([]);
  };

  const handleSendMessage = async (text) => {
    const userMsg = { sender: 'STUDENT', message: text, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await api.sendMessage({
        sessionId: activeSessionId,
        message: text,
        semester,
        subject
      });

      if (!activeSessionId) {
        setActiveSessionId(response.sessionId);
      }

      const aiMsg = {
        sender: 'AI',
        message: response.answer,
        sourcesJson: JSON.stringify(response.sources || []),
        timestamp: new Date().toISOString()
      };

      setMessages((prev) => [...prev, aiMsg]);
      loadSessions(user ? user.id : 1);
    } catch (err) {
      const errorMsg = {
        sender: 'AI',
        message: '⚠️ Error connecting to AI Assistant service: ' + err.message,
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    await api.deleteSession(sessionId);
    if (activeSessionId === sessionId) {
      handleNewChat();
    }
    loadSessions(user ? user.id : 1);
  };

  const handleDeleteDocument = async (docId) => {
    await api.deleteDocument(docId);
    loadDocuments();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    handleNewChat();
  };

  return (
    <div className="app-container">
      <Navbar
        user={user}
        semester={semester}
        setSemester={setSemester}
        subject={subject}
        setSubject={setSubject}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
      />

      <div className="main-content">
        <Sidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={handleSelectSession}
          onNewChat={handleNewChat}
          onDeleteSession={handleDeleteSession}
          documents={documents}
          onDeleteDocument={handleDeleteDocument}
        />

        <ChatWindow
          messages={messages}
          onSendMessage={handleSendMessage}
          loading={loading}
          semester={semester}
          subject={subject}
          user={user}
        />
      </div>

      <PdfUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        currentSemester={semester}
        currentSubject={subject}
        onUploadSuccess={loadDocuments}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(userData) => {
          setUser(userData);
          if (userData.semester) setSemester(userData.semester);
        }}
      />
    </div>
  );
}
