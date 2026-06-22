import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Dashboard() {
  const [resumen, setResumen] = useState(null);
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/reports/resumen'),
      api.get('/reports/proyectos')
    ]).then(([r1, r2]) => {
      setResumen(r1.data);
      setProyectos(r2.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="animate-pulse text-gray-400 text-center py-20">Cargando dashboard...</div>;
  if (!resumen) return null;

  const statusLabels = { pending: 'Pendiente', in_progress: 'En Ejecución', completed: 'Completado', paused: 'En Pausa' };
  const statusData = Object.entries(resumen.by_status).map(([k, v]) => ({ name: statusLabels[k], value: v }));
  const chartData = proyectos.map(p => ({ name: p.name.length > 20 ? p.name.slice(0, 20) + '...' : p.name, progress: p.progress || 0 }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Resumen general de proyectos de obras públicas</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="text-3xl font-bold text-gray-900">{resumen.total_projects}</div>
          <div className="text-sm text-gray-500 mt-1">Total Proyectos</div>
        </div>
        <div className="card">
          <div className="text-3xl font-bold text-gray-900">{resumen.by_status.in_progress}</div>
          <div className="text-sm text-gray-500 mt-1">En Ejecución</div>
        </div>
        <div className="card">
          <div className="text-3xl font-bold text-gray-900">{resumen.avg_progress}%</div>
          <div className="text-sm text-gray-500 mt-1">Avance Promedio</div>
        </div>
        <div className="card">
          <div className="text-3xl font-bold text-gray-900">${(resumen.total_budget || 0).toLocaleString()}</div>
          <div className="text-sm text-gray-500 mt-1">Presupuesto Total</div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Estado de Proyectos</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" stroke="none">
                {statusData.map((entry, i) => (
                  <Cell key={i} fill={['#d4d4d4', '#262626', '#e5e5e5', '#a3a3a3'][i]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 text-xs mt-2">
            {statusData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full`} style={{ backgroundColor: ['#d4d4d4', '#262626', '#e5e5e5', '#a3a3a3'][i] }} />
                {d.name}: {d.value}
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Avance por Proyecto</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="progress" fill="#262626" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Proyectos Recientes</h3>
          <Link to="/proyectos" className="text-xs text-gray-600 hover:text-gray-900 underline">Ver todos</Link>
        </div>
        <div className="overflow-x-auto">
          <table>
            <thead><tr><th>Proyecto</th><th>Contratista</th><th>Estado</th><th>Avance</th><th>Presupuesto</th></tr></thead>
            <tbody>
              {proyectos.slice(0, 5).map(p => (
                <tr key={p.id}>
                  <td className="font-medium text-gray-900"><Link to={`/proyectos/${p.id}`} className="hover:underline">{p.name}</Link></td>
                  <td className="text-gray-600">{p.contractor_name || '—'}</td>
                  <td><span className={`badge status-${p.status}`}>{statusLabels[p.status]}</span></td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden max-w-[80px]">
                        <div className="h-full bg-gray-800 rounded-full" style={{ width: `${p.progress || 0}%` }} />
                      </div>
                      <span className="text-xs text-gray-500">{p.progress || 0}%</span>
                    </div>
                  </td>
                  <td className="text-gray-600">${(p.budget || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
