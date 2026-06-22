import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      const role = data.user.role;
      if (role === 'admin') navigate('/');
      else if (role === 'contractor') navigate('/contratista');
      else navigate('/proyectos');
    } catch {
      setError('Credenciales inválidas. Intente de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">SM</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">SMOP</h1>
          <p className="text-sm text-gray-500 mt-1">Sistema de Monitoreo de Obras Públicas</p>
          <p className="text-xs text-gray-400 mt-1">Alcaldía del Municipio Plaza</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 text-center">Iniciar Sesión</h2>
          {error && <div className="text-sm text-gray-700 bg-gray-100 border border-gray-200 rounded-md px-3 py-2">{error}</div>}
          <div>
            <label htmlFor="email">Correo Electrónico</label>
            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="correo@ejemplo.com" required className="w-full" />
          </div>
          <div>
            <label htmlFor="password">Contraseña</label>
            <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required className="w-full" />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary w-full justify-center">{loading ? 'Ingresando...' : 'Ingresar'}</button>
        </form>
        <div className="mt-6 text-center text-xs text-gray-400 space-y-1">
          <p className="font-medium text-gray-500">Credenciales de prueba:</p>
          <p>Admin: admin@municipioplaza.gob.ve / admin123</p>
          <p>Contratista: contratista1@email.com / contrato123</p>
          <p>Visitante: visitante@email.com / visitante123</p>
        </div>
      </div>
    </div>
  );
}
