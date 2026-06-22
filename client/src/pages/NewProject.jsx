import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function NewProject() {
  const navigate = useNavigate();
  const [contractors, setContractors] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', location: '', budget: '',
    start_date: '', end_date: '', status: 'pending', contractor_id: ''
  });

  useEffect(() => {
    api.get('/users/contractors').then(r => setContractors(r.data)).catch(() => {});
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/projects', {
        ...form,
        budget: parseFloat(form.budget) || 0,
        contractor_id: form.contractor_id ? parseInt(form.contractor_id) : null
      });
      setSuccess(true);
      setTimeout(() => navigate('/proyectos'), 1500);
    } catch (err) {
      alert('Error al crear proyecto: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Proyecto creado exitosamente</h2>
          <p className="text-sm text-gray-500">Redirigiendo a la lista de proyectos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <button onClick={() => navigate('/proyectos')} className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Volver a proyectos
      </button>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nuevo Proyecto</h1>
        <p className="text-sm text-gray-500 mt-1">Registra un nuevo proyecto de obra pública</p>
      </div>
      <form onSubmit={handleSubmit} className="card space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label>Nombre del Proyecto</label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="Ej: Pavimentación Av. Bolívar" required className="w-full" />
          </div>
          <div className="md:col-span-2">
            <label>Descripción</label>
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Describe el proyecto..." rows={3} className="w-full" />
          </div>
          <div>
            <label>Ubicación</label>
            <input name="location" value={form.location} onChange={handleChange} placeholder="Ej: Av. Bolívar, Municipio Plaza" className="w-full" />
          </div>
          <div>
            <label>Presupuesto ($)</label>
            <input name="budget" type="number" step="0.01" min="0" value={form.budget} onChange={handleChange} placeholder="0.00" className="w-full" />
          </div>
          <div>
            <label>Fecha de Inicio</label>
            <input name="start_date" type="date" value={form.start_date} onChange={handleChange} className="w-full" />
          </div>
          <div>
            <label>Fecha Estimada de Fin</label>
            <input name="end_date" type="date" value={form.end_date} onChange={handleChange} className="w-full" />
          </div>
          <div>
            <label>Estado</label>
            <select name="status" value={form.status} onChange={handleChange} className="w-full">
              <option value="pending">Pendiente</option>
              <option value="in_progress">En Ejecución</option>
              <option value="paused">En Pausa</option>
              <option value="completed">Completado</option>
            </select>
          </div>
          <div>
            <label>Contratista Asignado</label>
            <select name="contractor_id" value={form.contractor_id} onChange={handleChange} className="w-full">
              <option value="">Seleccionar contratista...</option>
              {contractors.map(c => (
                <option key={c.id} value={c.id}>{c.company_name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={submitting || !form.name} className="btn btn-primary">
            {submitting ? 'Guardando...' : 'Crear Proyecto'}
          </button>
          <button type="button" onClick={() => navigate('/proyectos')} className="btn btn-secondary">Cancelar</button>
        </div>
      </form>
    </div>
  );
}
