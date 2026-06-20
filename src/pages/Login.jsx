import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState('');

  const users = [
    {
      id: 'auth0|local_dummy_001',
      name: 'Juan Pérez',
      email: 'juan@sanosysalvos.cl',
      role: 'admin'
    },
    {
      id: 'auth0|local_dummy_002',
      name: 'Valeska Guardia',
      email: 'valeska@sanosysalvos.cl',
      role: 'user'
    },
    {
      id: 'auth0|local_dummy_003',
      name: 'Claudio Morales',
      email: 'claudio@sanosysalvos.cl',
      role: 'user'
    }
  ];

  const handleLogin = (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    const userObj = users.find((u) => u.id === selectedUser);
    localStorage.setItem('currentUser', JSON.stringify(userObj));
    navigate('/');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-700">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-white">Sanos y Salvos</h2>
          <p className="mt-2 text-sm text-slate-400">Selecciona un usuario para ingresar al sistema de pruebas</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="user-select" className="block text-sm font-medium text-slate-300 mb-2">
              Usuario de prueba
            </label>
            <select
              id="user-select"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full bg-slate-700 text-white rounded-xl border border-slate-600 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Elige un usuario --</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role === 'admin' ? 'Administrador' : 'Persona Natural'})
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={!selectedUser}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
