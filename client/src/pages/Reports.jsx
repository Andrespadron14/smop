import { useState, useEffect, useRef } from 'react';
import api from '../utils/api';

export default function Reports() {
  const [reportData, setReportData] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('todos');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const printRef = useRef();

  useEffect(() => {
    Promise.all([
      api.get('/reports/reporte-completo'),
      api.get('/reports/resumen')
    ]).then(([r1, r2]) => {
      setReportData(r1.data);
      setResumen(r2.data);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = reportData.filter(p => {
    if (filter !== 'todos' && p.status !== filter) return false;
    return true;
  });

  const handlePrint = () => window.print();

  const handleDownloadCSV = () => {
    const headers = ['Proyecto', 'Ubicación', 'Estado', 'Contratista', 'Presupuesto', 'Avance', 'Última Actualización', 'Fotos'];
    const rows = filtered.map(p => [
      p.name, p.location, p.status, p.contractor_name || '—', p.budget, `${p.progress || 0}%`, p.last_update || 'N/A', p.photos_count || 0
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-obras-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const statusLabels = { pending: 'Pendiente', in_progress: 'En Ejecución', completed: 'Completado', paused: 'En Pausa' };

  if (loading) return <div className="animate-pulse text-gray-400 text-center py-20">Generando reporte...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
          <p className="text-sm text-gray-500 mt-1">Reportes de avance de obras públicas</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handlePrint} className="btn btn-secondary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Imprimir
          </button>
          <button onClick={handleDownloadCSV} className="btn btn-secondary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Descargar CSV
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-3 no-print">
        <select value={filter} onChange={e => setFilter(e.target.value)} className="text-sm">
          <option value="todos">Todos los estados</option>
          <option value="pending">Pendiente</option>
          <option value="in_progress">En Ejecución</option>
          <option value="completed">Completado</option>
          <option value="paused">En Pausa</option>
        </select>
        <input type="date" value={dateRange.from} onChange={e => setDateRange({...dateRange, from: e.target.value})} className="text-sm" />
        <input type="date" value={dateRange.to} onChange={e => setDateRange({...dateRange, to: e.target.value})} className="text-sm" />
      </div>
      <div ref={printRef} className="space-y-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Alcaldía del Municipio Plaza</h2>
              <p className="text-sm text-gray-500">Sistema de Monitoreo de Obras Públicas - Reporte {filter !== 'todos' ? statusLabels[filter] : 'General'}</p>
              <p className="text-xs text-gray-400">Generado: {new Date().toLocaleString('es-VE')}</p>
            </div>
            <div className="text-right">
              <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center ml-auto mb-1">
                <span className="text-white font-bold">SM</span>
              </div>
            </div>
          </div>
          {resumen && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 border-b border-gray-200 pb-4">
              <div><div className="text-xs text-gray-500">Total</div><div className="text-xl font-bold text-gray-900">{resumen.total_projects}</div></div>
              <div><div className="text-xs text-gray-500">En Ejecución</div><div className="text-xl font-bold text-gray-900">{resumen.by_status.in_progress}</div></div>
              <div><div className="text-xs text-gray-500">Completados</div><div className="text-xl font-bold text-gray-900">{resumen.by_status.completed}</div></div>
              <div><div className="text-xs text-gray-500">Avance Prom.</div><div className="text-xl font-bold text-gray-900">{resumen.avg_progress}%</div></div>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-2 px-2 text-gray-600 font-semibold">Proyecto</th>
                  <th className="text-left py-2 px-2 text-gray-600 font-semibold">Ubicación</th>
                  <th className="text-left py-2 px-2 text-gray-600 font-semibold">Estado</th>
                  <th className="text-left py-2 px-2 text-gray-600 font-semibold">Contratista</th>
                  <th className="text-right py-2 px-2 text-gray-600 font-semibold">Presupuesto</th>
                  <th className="text-right py-2 px-2 text-gray-600 font-semibold">Avance</th>
                  <th className="text-right py-2 px-2 text-gray-600 font-semibold">Fotos</th>
                  <th className="text-right py-2 px-2 text-gray-600 font-semibold">Últ. Act.</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <tr key={p.id} className={i % 2 === 0 ? 'bg-gray-50' : ''}>
                    <td className="py-2 px-2 font-medium text-gray-900">{p.name}</td>
                    <td className="py-2 px-2 text-gray-600">{p.location || '—'}</td>
                    <td className="py-2 px-2"><span className={`badge status-${p.status} text-xs`}>{statusLabels[p.status]}</span></td>
                    <td className="py-2 px-2 text-gray-600">{p.contractor_name || '—'}</td>
                    <td className="py-2 px-2 text-right text-gray-900">${(p.budget || 0).toLocaleString()}</td>
                    <td className="py-2 px-2 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-gray-800 rounded-full" style={{ width: `${p.progress || 0}%` }} />
                        </div>
                        <span className="text-gray-700">{p.progress || 0}%</span>
                      </div>
                    </td>
                    <td className="py-2 px-2 text-right text-gray-600">{p.photos_count || 0}</td>
                    <td className="py-2 px-2 text-right text-gray-500 text-xs">{p.last_update ? new Date(p.last_update).toLocaleDateString() : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && <div className="text-center py-8 text-gray-400">No se encontraron proyectos con los filtros seleccionados</div>}
          <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-400 text-center">
            Alcaldía del Municipio Plaza - SMOP v1.0
          </div>
        </div>
      </div>
    </div>
  );
}
