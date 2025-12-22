import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StoriesManager from './pages/StoriesManager';
import BlogManager from './components/BlogManager';
import VolunteerManager from './components/VolunteerManager';
import AnimalManager from './components/AnimalManager';
import AdoptionInquiryManager from './components/AdoptionInquiryManager';
import Layout from './components/Layout';
import UserManagement from './pages/UserManagement';
import Sponsors from './pages/Sponsors';
import StatsManager from './components/StatsManager/StatsManager';
import NewsletterSubscribers from './pages/NewsletterSubscribers';
import NewsletterCompose from './pages/NewsletterCompose';
import FundingNeedsManager from './components/FundingNeedsManager';

// Simple auth context
const AuthContext = React.createContext();

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('adminToken');
    const userData = localStorage.getItem('adminUser');
    
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminUser', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setIsAuthenticated(false);
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const authValue = {
    isAuthenticated,
    user,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={authValue}>
      <div className="App">
        <Helmet>
          <title>HALT Shelter - Admin Panel</title>
          <meta name="description" content="Administrative panel for HALT Shelter website management" />
        </Helmet>
        
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/stories" element={
            <ProtectedRoute>
              <Layout>
                <StoriesManager />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/blog" element={
            <ProtectedRoute>
              <Layout>
                <BlogManager />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/volunteers" element={
            <ProtectedRoute>
              <Layout>
                <VolunteerManager />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/animals" element={
            <ProtectedRoute>
              <Layout>
                <AnimalManager />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/adoption-inquiries" element={
            <ProtectedRoute>
              <Layout>
                <AdoptionInquiryManager />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/users" element={
            <ProtectedRoute>
              <Layout>
                <UserManagement />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/sponsors" element={
            <ProtectedRoute>
              <Layout>
                <Sponsors />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/stats" element={
            <ProtectedRoute>
              <Layout>
                <StatsManager />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/newsletter" element={
            <ProtectedRoute>
              <Layout>
                <NewsletterSubscribers />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/newsletter/compose" element={
            <ProtectedRoute>
              <Layout>
                <NewsletterCompose />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/funding-needs" element={
            <ProtectedRoute>
              <Layout>
                <FundingNeedsManager />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </AuthContext.Provider>
  );
}

export default App;
