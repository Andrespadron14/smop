import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    api.get('/projects').then(r => setProjects(r.data)).finally(() => setLoading(false));
  }, []);

  const statusLabels = { pending: 'Pendiente', in_progress: 'En Ejecución', completed: 'Completado', paused: 'En Pausa' };

  const filtered = projects.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.location?.toLowerCase().includes(search.toLowerCase()) ||
    p.contractor_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="animate-pulse text-gray-400 text-center py-20">Cargando proyectos...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proyectos</h1>
          <p className="text-sm text-gray-500 mt-1">{projects.length} proyectos registrados</p>
        </div>
        {user?.role === 'admin' && (
          <Link to="/proyectos/nuevo" className="btn btn-primary text-sm">+ Nuevo Proyecto</Link>
        )}
      </div>
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input type="text" placeholder="Buscar proyectos..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(p => (
          <Link key={p.id} to={`/proyectos/${p.id}`} className="card hover:shadow-md transition-shadow block">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-gray-900">{p.name}</h3>
              <span className={`badge status-${p.status} flex-shrink-0 ml-2`}>{statusLabels[p.status]}</span>
            </div>
            <p className="text-sm text-gray-500 mb-3 line-clamp-2">{p.description}</p>
            <div className="space-y-1.5 text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                {p.location || 'Ubicación no especificada'}
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                {p.contractor_name || 'Sin contratista'}
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                ${(p.budget || 0).toLocaleString()}
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Avance</span>
                <span className="font-medium text-gray-700">{p.progress || 0}%</span>
              </div>
              <div className="mt-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gray-800 rounded-full transition-all duration-500" style={{ width: `${p.progress || 0}%` }} />
              </div>
            </div>
          </Link>
        ))}
        {filtered.length === 0 && <div className="col-span-full text-center py-12 text-gray-400">No se encontraron proyectos</div>}
      </div>
    </div>
  );
}
