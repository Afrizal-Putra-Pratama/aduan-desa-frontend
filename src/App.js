import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import './config/firebase'; 

import { AuthProvider, useAuth } from './context/AuthContext';
import Profile from './pages/Profile';
import ComponentsDemo from './pages/ComponentsDemo';
// User Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateComplaint from './pages/CreateComplaint';
import ComplaintsList from './pages/ComplaintsList';
import ComplaintDetail from './pages/ComplaintDetail';
import PublicComplaints from './pages/PublicComplaints';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import NotificationToast from './components/NotificationToast';


// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminComplaints from './pages/admin/AdminComplaints';
import AdminComplaintDetail from './pages/admin/AdminComplaintDetail';
import AdminComplaintsMap from './pages/admin/AdminComplaintsMap';
import AdminCategories from './pages/admin/AdminCategories';
import AdminUsers from './pages/admin/AdminUsers';
import AdminUserDetail from './pages/admin/AdminUserDetail';
// Protected Route for Users
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  return isAuthenticated ? children : <Navigate to="/login" />;
}

// Public Route for Users
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
}

// Protected Route for Admin
function AdminProtectedRoute({ children }) {
  const adminToken = localStorage.getItem('admin_token');
  return adminToken ? children : <Navigate to="/admin/login" />;
}

function App() {
  
  return (
    <ThemeProvider>
    <Router>
      <AuthProvider>
        <NotificationToast />
        <Routes>
          <Route path="/components-demo" element={<ComponentsDemo />} />
          {/* User Routes */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/complaints" element={<ProtectedRoute><ComplaintsList /></ProtectedRoute>} />
          <Route path="/complaints/create" element={<ProtectedRoute><CreateComplaint /></ProtectedRoute>} />
          <Route path="/complaints/:id" element={<ProtectedRoute><ComplaintDetail /></ProtectedRoute>} />
          
          {/* FIX: Public Complaints Route */}
          <Route path="/public-complaints" element={<ProtectedRoute><PublicComplaints /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
          <Route path="/admin/complaints" element={<AdminProtectedRoute><AdminComplaints /></AdminProtectedRoute>} />
          <Route path="/admin/complaints/:id" element={<AdminProtectedRoute><AdminComplaintDetail /></AdminProtectedRoute>} />
          <Route path="/admin/map" element={<AdminProtectedRoute><AdminComplaintsMap /></AdminProtectedRoute>} />
          <Route path="/admin/categories" element={<AdminProtectedRoute><AdminCategories /></AdminProtectedRoute>} />
          <Route path="/admin/users" element={<AdminProtectedRoute><AdminUsers /></AdminProtectedRoute>} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/users/:id" element={<AdminUserDetail />} /> 
          {/* Default Route */}
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </Router>
    </ThemeProvider>
  );
}

export default App;
