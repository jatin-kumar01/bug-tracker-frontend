import React, { useEffect, useState } from 'react';
import { UserPlus } from 'lucide-react';
import { userApi } from '../api/services';
import { useAuth } from '../context/AuthContext';

export default function UsersAdminPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'DEVELOPER' });
  const [error, setError] = useState('');

  const loadUsers = async () => {
    const res = await userApi.getAll();
    setUsers(res.data.data || []);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await userApi.create(form);
      setForm({ fullName: '', email: '', password: '', role: 'DEVELOPER' });
      setShowCreate(false);
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user.');
    }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      await userApi.updateRole(userId, role);
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not update role.');
    }
  };

  const handleDeactivate = async (userId) => {
    if (!window.confirm('Deactivate this user account?')) return;
    try {
      await userApi.deactivate(userId);
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not deactivate user.');
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Team & Role Management</h1>
          <p className="text-sm text-slate-500">Create team members, assign system roles, and manage access.</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <UserPlus className="h-4 w-4" /> Add User
        </button>
      </div>

      {showCreate && (
        <form
          onSubmit={handleCreate}
          className="mb-6 grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-4"
        >
          {error && <div className="rounded bg-red-50 p-2 text-sm text-red-700 md:col-span-4">{error}</div>}
          <input
            type="text"
            required
            placeholder="Full Name"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            type="email"
            required
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Password (min 6 chars)"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <div className="flex gap-2">
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="DEVELOPER">DEVELOPER</option>
              <option value="MANAGER">MANAGER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
            <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
              Save
            </button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-600">
            <tr>
              <th className="px-6 py-3.5">User</th>
              <th className="px-6 py-3.5">Role</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-6 py-4">
                  <p className="font-semibold text-slate-900">{u.fullName}</p>
                  <p className="text-xs text-slate-500">{u.email}</p>
                </td>
                <td className="px-6 py-4">
                  <select
                    value={u.role}
                    disabled={u.id === currentUser?.id}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    className="rounded border border-slate-300 px-2.5 py-1 text-xs font-semibold"
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="DEVELOPER">DEVELOPER</option>
                  </select>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      u.active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {u.active ? 'Active' : 'Deactivated'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {u.active && u.id !== currentUser?.id && (
                    <button
                      onClick={() => handleDeactivate(u.id)}
                      className="text-xs font-semibold text-red-600 hover:underline"
                    >
                      Deactivate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
