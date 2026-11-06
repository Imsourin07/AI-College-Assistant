import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import LandingHero from './components/LandingHero';
import StudentDashboard from './components/StudentDashboard';
import DocumentLibrary from './components/DocumentLibrary';
import AuthPage from './components/AuthPage';
import PdfUploadModal from './components/PdfUploadModal';
import AuthModal from './components/AuthModal';
import ProfileModal from './components/ProfileModal';
import { api } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('landing'); // 'landing' | 'dashboard' | 'chat' | 'library' | 'auth'
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
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Load User, Documents & Sessions on Mount
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
      console.log('Guest session - no persisted JWT');
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
    setActiveTab('chat');
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
    setActiveTab('chat');
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

      if (response.detectedSubject && response.detectedSubject !== 'General' && response.detectedSubject !== 'Ambiguous') {
        setSubject(response.detectedSubject);
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

  const handleLaunchChatWithPrompt = (promptText) => {
    setActiveTab('chat');
    if (promptText) {
      handleSendMessage(promptText);
    }
  };

  const handleAskAboutDoc = (doc) => {
    if (doc.semester) setSemester(doc.semester);
    if (doc.subject) setSubject(doc.subject);
    setActiveTab('chat');
    handleSendMessage(`Please give me an overview and summary of the topics covered in ${doc.fileName}`);
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

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    if (userData.semester) setSemester(userData.semester);
    loadSessions(userData.id);
    setActiveTab('dashboard'); // Redirect to dashboard upon login
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setActiveSessionId(null);
    setMessages([]);
    // Ensure Logout clears the authentication token and redirects to Login
    setActiveTab('auth');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* Top Navigation Bar with visible Sign In and Logout controls */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        semester={semester}
        setSemester={setSemester}
        subject={subject}
        setSubject={setSubject}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenAuth={() => setActiveTab('auth')}
        onOpenProfile={() => setIsProfileOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        {activeTab === 'landing' && (
          <LandingHero
            user={user}
            onLaunchChat={handleLaunchChatWithPrompt}
            onExploreLibrary={() => setActiveTab('library')}
            onOpenAuth={() => setActiveTab('auth')}
          />
        )}

        {activeTab === 'dashboard' && (
          <StudentDashboard
            user={user}
            semester={semester}
            setSemester={setSemester}
            subject={subject}
            setSubject={setSubject}
            documents={documents}
            sessions={sessions}
            onLaunchChat={handleLaunchChatWithPrompt}
            onOpenUpload={() => setIsUploadOpen(true)}
            onExploreLibrary={() => setActiveTab('library')}
          />
        )}

        {activeTab === 'chat' && (
          <>
            <Sidebar
              sessions={sessions}
              activeSessionId={activeSessionId}
              onSelectSession={handleSelectSession}
              onNewChat={handleNewChat}
              onDeleteSession={handleDeleteSession}
              documents={documents}
              onDeleteDocument={handleDeleteDocument}
              onOpenLibrary={() => setActiveTab('library')}
              user={user}
              onOpenAuth={() => setActiveTab('auth')}
              onLogout={handleLogout}
            />
            <ChatWindow
              messages={messages}
              onSendMessage={handleSendMessage}
              loading={loading}
              semester={semester}
              subject={subject}
              user={user}
            />
          </>
        )}

        {activeTab === 'library' && (
          <DocumentLibrary
            documents={documents}
            onDeleteDocument={handleDeleteDocument}
            onOpenUpload={() => setIsUploadOpen(true)}
            onAskAboutDoc={handleAskAboutDoc}
            user={user}
          />
        )}

        {activeTab === 'auth' && (
          <AuthPage
            onAuthSuccess={handleAuthSuccess}
            onNavigateToApp={() => setActiveTab('dashboard')}
          />
        )}
      </div>

      {/* Modals */}
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
        onAuthSuccess={handleAuthSuccess}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        onLogout={handleLogout}
        onOpenAuth={() => setActiveTab('auth')}
      />
    </div>
  );
}
