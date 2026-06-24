import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import AddUpdate from './pages/AddUpdate';
import NewProject from './pages/NewProject';
import Users from './pages/Users';
import ContractorPanel from './pages/ContractorPanel';
import Reports from './pages/Reports';

function App() {
  const { user } = useAuth();

  const roleHome = {
    admin: '/',
    contractor: '/contratista',
    viewer: '/proyectos',
  };

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Landing />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Navigate to={roleHome[user.role] || '/proyectos'} />} />
      <Route path="/" element={<Layout><Dashboard /></Layout>} />
      <Route path="/proyectos" element={<ProtectedRoute roles={['admin','viewer']}><Layout><Projects /></Layout></ProtectedRoute>} />
      <Route path="/proyectos/nuevo" element={<ProtectedRoute roles={['admin']}><Layout><NewProject /></Layout></ProtectedRoute>} />
      <Route path="/proyectos/:id" element={<ProtectedRoute><Layout><ProjectDetail /></Layout></ProtectedRoute>} />
      <Route path="/proyectos/:id/avances" element={<ProtectedRoute roles={['admin','contractor']}><Layout><AddUpdate /></Layout></ProtectedRoute>} />
      <Route path="/admin/usuarios" element={<ProtectedRoute roles={['admin']}><Layout><Users /></Layout></ProtectedRoute>} />
      <Route path="/admin/reportes" element={<ProtectedRoute roles={['admin']}><Layout><Reports /></Layout></ProtectedRoute>} />
      <Route path="/contratista" element={<ProtectedRoute roles={['contractor']}><Layout><ContractorPanel /></Layout></ProtectedRoute>} />
      <Route path="*" element={<Navigate to={roleHome[user.role] || '/proyectos'} />} />
    </Routes>
  );
}

export default App;
