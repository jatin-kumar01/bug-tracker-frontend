import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, UserPlus, XCircle } from 'lucide-react';
import { projectApi, userApi } from '../api/services';
import { useAuth } from '../context/AuthContext';

export default function ProjectMembersPage() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [projectRole, setProjectRole] = useState('MEMBER');
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      const [projRes, memRes] = await Promise.all([
        projectApi.getById(projectId),
        projectApi.getMembers(projectId),
      ]);
      setProject(projRes.data.data);
      setMembers(memRes.data.data || []);

      if (user?.role === 'ADMIN') {
        const usersRes = await userApi.getAll();
        setAllUsers(usersRes.data.data || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load project members.');
    }
  };

  useEffect(() => {
    loadData();
  }, [projectId]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    setError('');
    if (!selectedUserId) return;
    try {
      await projectApi.addMember(projectId, {
        userId: Number(selectedUserId),
        projectRole,
      });
      setSelectedUserId('');
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to add member.');
    }
  };

  const handleRemove = async (userId) => {
    try {
      await projectApi.removeMember(projectId, userId);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to remove member.');
    }
  };

  const availableUsers = allUsers.filter(
    (u) => u.active && !members.some((m) => m.userId === u.id)
  );

  return (
    <div>
      <Link
        to="/projects"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Projects
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {project ? `[${project.projectKey}] ${project.name} — Team` : 'Project Team'}
          </h1>
          <p className="text-sm text-slate-500">Manage who can view, report, and work on issues in this project.</p>
        </div>
        <Link
          to={`/projects/${projectId}/board`}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Open Kanban Board
        </Link>
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      {/* Add Member Form */}
      {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
        <form
          onSubmit={handleAddMember}
          className="mb-6 flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="min-w-[240px] flex-1">
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-600">
              {allUsers.length > 0 ? 'Select User' : 'User ID'}
            </label>
            {allUsers.length > 0 ? (
              <select
                required
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="">Choose team member...</option>
                {availableUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName} ({u.email}) — {u.role}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="number"
                required
                placeholder="Enter User ID"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            )}
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-600">Project Role</label>
            <select
              value={projectRole}
              onChange={(e) => setProjectRole(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="MEMBER">MEMBER</option>
              <option value="PROJECT_LEAD">PROJECT_LEAD</option>
            </select>
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <UserPlus className="h-4 w-4" /> Add Member
          </button>
        </form>
      )}

      {/* Members Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-600">
            <tr>
              <th className="px-6 py-3.5">Member</th>
              <th className="px-6 py-3.5">System Role</th>
              <th className="px-6 py-3.5">Project Role</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {members.map((m) => (
              <tr key={m.id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <p className="font-semibold text-slate-900">{m.fullName}</p>
                  <p className="text-xs text-slate-500">{m.email}</p>
                </td>
                <td className="px-6 py-4">
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                    {m.systemRole}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                    {m.projectRole}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {project?.createdById !== m.userId && (
                    <button
                      onClick={() => handleRemove(m.userId)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-800"
                    >
                      <XCircle className="h-4 w-4" /> Remove
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
