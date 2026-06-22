import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function AddUpdate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [technical, setTechnical] = useState('');
  const [percentage, setPercentage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/projects/${id}`).then(r => {
      setProject(r.data);
      const lastPct = r.data.updates?.[0]?.percentage || 0;
      setPercentage(lastPct);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`/updates/${id}`, { title, description, technical_advance: technical, percentage: Number(percentage) });
      navigate(`/proyectos/${id}`);
    } catch (err) {
      alert('Error al registrar avance');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="animate-pulse text-gray-400 text-center py-20">Cargando...</div>;
  if (!project) return <div className="text-center py-20 text-gray-400">Proyecto no encontrado</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <button onClick={() => navigate(`/proyectos/${id}`)} className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        Volver al proyecto
      </button>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Registrar Avance</h1>
        <p className="text-sm text-gray-500 mt-1">Proyecto: {project.name}</p>
      </div>
      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label>Título del Avance</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej: Inicio de excavación" required className="w-full" />
        </div>
        <div>
          <label>Descripción</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe el avance realizado..." rows={3} className="w-full" />
        </div>
        <div>
          <label>Avance Técnico</label>
          <textarea value={technical} onChange={e => setTechnical(e.target.value)} placeholder="Detalles técnicos: materiales, maquinaria, métricas..." rows={3} className="w-full" />
        </div>
        <div>
          <label>Porcentaje de Avance ({percentage}%)</label>
          <input type="range" min="0" max="100" step="5" value={percentage} onChange={e => setPercentage(e.target.value)} className="w-full accent-gray-900" />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={submitting || !title} className="btn btn-primary">{submitting ? 'Guardando...' : 'Guardar Avance'}</button>
          <button type="button" onClick={() => navigate(`/proyectos/${id}`)} className="btn btn-secondary">Cancelar</button>
        </div>
      </form>
    </div>
  );
}
