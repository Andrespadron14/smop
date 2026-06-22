import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

export default function ContractorPanel() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    api.get('/projects').then(r => setProjects(r.data)).finally(() => setLoading(false));
  }, []);

  const statusLabels = { pending: 'Pendiente', in_progress: 'En Ejecución', completed: 'Completado', paused: 'En Pausa' };

  if (loading) return <div className="animate-pulse text-gray-400 text-center py-20">Cargando...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Panel del Contratista</h1>
        <p className="text-sm text-gray-500 mt-1">Bienvenido, {user?.name} — {projects.length} proyecto(s) asignado(s)</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card"><div className="text-3xl font-bold text-gray-900">{projects.filter(p => p.status === 'in_progress').length}</div><div className="text-sm text-gray-500 mt-1">En Ejecución</div></div>
        <div className="card"><div className="text-3xl font-bold text-gray-900">{projects.filter(p => p.status === 'pending').length}</div><div className="text-sm text-gray-500 mt-1">Pendientes</div></div>
        <div className="card"><div className="text-3xl font-bold text-gray-900">{projects.filter(p => p.status === 'completed').length}</div><div className="text-sm text-gray-500 mt-1">Completados</div></div>
      </div>
      {projects.map(p => (
        <div key={p.id} className="card">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
            <div>
              <h3 className="font-semibold text-gray-900">{p.name}</h3>
              <p className="text-sm text-gray-500">{p.location}</p>
            </div>
            <span className={`badge status-${p.status}`}>{statusLabels[p.status]}</span>
          </div>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{p.description}</p>
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-500">Avance del proyecto</span>
              <span className="font-medium text-gray-700">{p.progress || 0}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gray-800 rounded-full transition-all duration-500" style={{ width: `${p.progress || 0}%` }} />
            </div>
          </div>
          <div className="flex gap-2">
            <Link to={`/proyectos/${p.id}`} className="btn btn-secondary btn-sm">Ver Detalle</Link>
            <Link to={`/proyectos/${p.id}/avances`} className="btn btn-primary btn-sm">+ Registrar Avance</Link>
          </div>
        </div>
      ))}
      {projects.length === 0 && (
        <div className="text-center py-16">
          <div className="text-gray-300 text-5xl mb-3">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          </div>
          <p className="text-gray-400">No tienes proyectos asignados actualmente.</p>
        </div>
      )}
    </div>
  );
}
