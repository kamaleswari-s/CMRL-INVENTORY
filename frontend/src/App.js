import Trash from './pages/Trash';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ComponentList from './pages/ComponentList';
import ComponentDetail from './pages/ComponentDetail';
import Search from './pages/Search';
import GlobalSearch from './pages/GlobalSearch';
import AuditLog from './pages/AuditLog';
import UserManagement from './pages/UserManagement';

function ProtectedRoute({ element }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#1E90FF' }}>Loading...</div>;
  return user ? element : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route element={<ProtectedRoute element={<Layout />} />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/components/:category" element={<ComponentList />} />
            <Route path="/component/:component_id" element={<ComponentDetail />} />
            <Route path="/search" element={<Search />} />
            <Route path="/globalsearch" element={<GlobalSearch />} />
            <Route path="/audit" element={<AuditLog />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/trash" element={<Trash />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
