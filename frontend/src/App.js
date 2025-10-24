import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import ModernNavbar from './components/ModernNavbar';
import Sidebar from './components/Sidebar';
import ModernHomePage from './pages/ModernHomePage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateQr from './pages/CreateQr';
import Analytics from './pages/Analytics';
import QrCodes from './pages/QrCodes';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Layout Component
const Layout = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ModernNavbar />
      {isAuthenticated && <Sidebar />}
      <main className={`${isAuthenticated ? 'pt-24 p-8' : 'pt-16'} transition-all duration-300`}>
        {children}
      </main>
    </div>
  );
};

// Home Page Component
const HomePage = () => {
  return <ModernHomePage />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/create" 
                element={
                  <ProtectedRoute>
                    <CreateQr />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/analytics" 
                element={
                  <ProtectedRoute>
                    <Analytics />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/qr-codes" 
                element={
                  <ProtectedRoute>
                    <QrCodes />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/history" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </Layout>
          
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;