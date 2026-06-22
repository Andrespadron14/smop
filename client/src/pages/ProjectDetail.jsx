import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadProject = () => {
    setLoading(true);
    api.get(`/projects/${id}`).then(r => setProject(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { loadProject(); }, [id]);

  const handleComment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`/projects/${id}/comments`, { comment });
      setComment('');
      setShowCommentForm(false);
      loadProject();
    } catch (err) { alert('Error al enviar comentario'); }
    finally { setSubmitting(false); }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('photo', file);
    fd.append('caption', 'Foto de avance');
    try {
      await api.post(`/photos/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      loadProject();
    } catch { alert('Error al subir foto'); }
  };

  const handleStatusChange = async (status) => {
    try {
      await api.put(`/projects/${id}/status`, { status });
      loadProject();
    } catch { alert('Error al cambiar estado'); }
  };

  const statusLabels = { pending: 'Pendiente', in_progress: 'En Ejecución', completed: 'Completado', paused: 'En Pausa' };

  if (loading) return <div className="animate-pulse text-gray-400 text-center py-20">Cargando proyecto...</div>;
  if (!project) return <div className="text-center py-20 text-gray-400">Proyecto no encontrado</div>;

  const canEdit = user?.role === 'admin' || (user?.role === 'contractor' && project.contractor_id);

  return (
    <div className="space-y-6">
      <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        Volver
      </button>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          <p className="text-sm text-gray-500 mt-1">{project.location}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`badge status-${project.status} text-sm px-3 py-1`}>{statusLabels[project.status]}</span>
          {user?.role === 'admin' && (
            <div className="flex gap-1">
              {['pending','in_progress','paused','completed'].map(s => (
                <button key={s} onClick={() => handleStatusChange(s)} disabled={project.status === s} className={`btn btn-sm ${project.status === s ? 'bg-gray-900 text-white' : 'btn-secondary'}`}>
                  {statusLabels[s]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      {project.description && <p className="text-gray-600 text-sm">{project.description}</p>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card"><div className="text-xs text-gray-500 mb-1">Presupuesto</div><div className="text-lg font-semibold text-gray-900">${(project.budget||0).toLocaleString()}</div></div>
        <div className="card"><div className="text-xs text-gray-500 mb-1">Contratista</div><div className="text-lg font-semibold text-gray-900">{project.contractor_name || '—'}</div></div>
        <div className="card"><div className="text-xs text-gray-500 mb-1">Avance Actual</div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gray-800 rounded-full" style={{width: `${project.updates?.[0]?.percentage || 0}%`}} />
            </div>
            <span className="text-lg font-semibold text-gray-900">{project.updates?.[0]?.percentage || 0}%</span>
          </div>
        </div>
      </div>
      {/* Responsibles */}
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Personas Responsables</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {project.responsibles?.map(r => (
            <div key={r.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">{r.name?.charAt(0)}</div>
              <div><div className="text-sm font-medium text-gray-900">{r.name}</div><div className="text-xs text-gray-500">{r.cargo}</div></div>
            </div>
          ))}
          {(!project.responsibles || project.responsibles.length === 0) && <div className="text-sm text-gray-400">Sin responsables asignados</div>}
        </div>
      </div>
      {/* Progress Timeline */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Avances del Proyecto</h3>
          {canEdit && <button onClick={() => navigate(`/proyectos/${id}/avances`)} className="btn btn-primary btn-sm">+ Registrar Avance</button>}
        </div>
        {project.updates?.length > 0 ? (
          <div className="space-y-4">
            {project.updates.map(u => (
              <div key={u.id} className="relative pl-6 pb-4 border-l-2 border-gray-200 last:pb-0">
                <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-gray-800" />
                <div className="text-xs text-gray-400 mb-1">{u.created_at} por <span className="font-medium text-gray-600">{u.user_name}</span></div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-gray-900">{u.title}</h4>
                  <span className="badge bg-gray-800 text-white text-xs">{u.percentage}%</span>
                </div>
                {u.description && <p className="text-sm text-gray-600 mb-1">{u.description}</p>}
                {u.technical_advance && (
                  <div className="text-xs text-gray-500 bg-gray-50 rounded p-2 mt-1">
                    <span className="font-medium text-gray-700">Avance técnico: </span>{u.technical_advance}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : <div className="text-sm text-gray-400 py-4 text-center">No hay avances registrados aún</div>}
      </div>
      {/* Photos */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Fotos del Proyecto</h3>
          {canEdit && (
            <label className="btn btn-secondary btn-sm cursor-pointer">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              Subir Foto
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {project.photos?.map(p => (
            <div key={p.id} className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 relative group">
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                <div className="text-center p-2">
                  <svg className="w-8 h-8 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  {p.caption}
                </div>
              </div>
            </div>
          ))}
          {(!project.photos || project.photos.length === 0) && <div className="col-span-full text-sm text-gray-400 text-center py-8">Sin fotos aún</div>}
        </div>
      </div>
      {/* Comments */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Comentarios</h3>
          <button onClick={() => setShowCommentForm(!showCommentForm)} className="btn btn-secondary btn-sm">+ Comentar</button>
        </div>
        {showCommentForm && (
          <form onSubmit={handleComment} className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Escribe un comentario..." rows={3} required className="w-full mb-2" />
            <div className="flex gap-2">
              <button type="submit" disabled={submitting} className="btn btn-primary btn-sm">{submitting ? 'Enviando...' : 'Enviar'}</button>
              <button type="button" onClick={() => setShowCommentForm(false)} className="btn btn-secondary btn-sm">Cancelar</button>
            </div>
          </form>
        )}
        <div className="space-y-3">
          {project.comments?.map(c => (
            <div key={c.id} className="pb-3 border-b border-gray-100 last:border-0 last:pb-0">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                <span className="font-medium text-gray-700">{c.user_name}</span>
                <span className={`badge text-xs ${c.user_role === 'admin' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600'}`}>{c.user_role === 'admin' ? 'Admin' : c.user_role === 'contractor' ? 'Contratista' : 'Visitante'}</span>
                <span>{c.created_at}</span>
              </div>
              <p className="text-sm text-gray-700">{c.comment}</p>
            </div>
          ))}
          {(!project.comments || project.comments.length === 0) && <div className="text-sm text-gray-400 text-center py-4">Sin comentarios</div>}
        </div>
      </div>
    </div>
  );
}
