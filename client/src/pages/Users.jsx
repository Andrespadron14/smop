import { useState, useEffect } from 'react';
import api from '../utils/api';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'viewer', cargo: '' });

  const load = () => {
    Promise.all([
      api.get('/users'),
      api.get('/users/contractors')
    ]).then(([r1, r2]) => {
      setUsers(r1.data);
      setContractors(r2.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editUser) {
        await api.put(`/users/${editUser.id}`, form);
      } else {
        await api.post('/users', form);
      }
      setShowForm(false);
      setEditUser(null);
      setForm({ name: '', email: '', password: '', role: 'viewer', cargo: '' });
      load();
    } catch { alert('Error al guardar usuario'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este usuario?')) return;
    try {
      await api.delete(`/users/${id}`);
      load();
    } catch { alert('Error al eliminar'); }
  };

  const roles = [
    { value: 'admin', label: 'Administrador' },
    { value: 'contractor', label: 'Contratista' },
    { value: 'viewer', label: 'Visitante' },
  ];

  if (loading) return <div className="animate-pulse text-gray-400 text-center py-20">Cargando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
          <p className="text-sm text-gray-500 mt-1">{users.length} usuarios registrados</p>
        </div>
        <button onClick={() => { setEditUser(null); setForm({ name: '', email: '', password: '', role: 'viewer', cargo: '' }); setShowForm(!showForm); }} className="btn btn-primary">
          {showForm ? 'Cancelar' : '+ Nuevo Usuario'}
        </button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <h3 className="font-semibold text-gray-900">{editUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label>Nombre</label><input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="w-full" /></div>
            <div><label>Correo</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required className="w-full" /></div>
            <div><label>{editUser ? 'Nueva contraseña (dejar vacío para mantener)' : 'Contraseña'}</label><input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required={!editUser} className="w-full" /></div>
            <div><label>Rol</label><select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="w-full">{roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}</select></div>
            <div className="md:col-span-2"><label>Cargo</label><input type="text" value={form.cargo} onChange={e => setForm({...form, cargo: e.target.value})} placeholder="Ej: Director de Obras" className="w-full" /></div>
          </div>
          <button type="submit" className="btn btn-primary">{editUser ? 'Actualizar' : 'Crear Usuario'}</button>
        </form>
      )}
      <div className="card p-0 overflow-hidden">
        <table>
          <thead><tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Cargo</th><th className="text-right">Acciones</th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td className="font-medium text-gray-900">{u.name}</td>
                <td className="text-gray-600">{u.email}</td>
                <td><span className={`badge ${u.role === 'admin' ? 'bg-gray-800 text-white' : u.role === 'contractor' ? 'bg-gray-200 text-gray-800' : 'bg-gray-100 text-gray-600'}`}>{roles.find(r => r.value === u.role)?.label}</span></td>
                <td className="text-gray-600">{u.cargo || '—'}</td>
                <td className="text-right">
                  <button onClick={() => { setEditUser(u); setForm({ name: u.name, email: u.email, password: '', role: u.role, cargo: u.cargo }); setShowForm(true); }} className="btn btn-secondary btn-sm mr-1">Editar</button>
                  <button onClick={() => handleDelete(u.id)} className="btn btn-danger btn-sm">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Contractor list */}
      {contractors.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Contratistas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contractors.map(c => (
              <div key={c.id} className="card">
                <div className="font-semibold text-gray-900">{c.company_name}</div>
                <div className="text-sm text-gray-500 mt-1">RIF: {c.rif}</div>
                <div className="text-sm text-gray-500">Contacto: {c.contact_name} ({c.contact_email})</div>
                <div className="text-sm text-gray-500">Tel: {c.phone}</div>
                <div className="text-xs text-gray-400 mt-1">Usuario asociado: {c.user_name}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
