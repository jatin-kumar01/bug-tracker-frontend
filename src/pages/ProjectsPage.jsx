import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderKanban, Plus, Trash2, Users } from 'lucide-react';
import { projectApi } from '../api/services';
import { useAuth } from '../context/AuthContext';

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ projectKey: '', name: '', description: '' });
  const [error, setError] = useState('');

  const canCreate = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await projectApi.getAll();
      setProjects(res.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await projectApi.create({
        projectKey: form.projectKey.toUpperCase(),
        name: form.name,
        description: form.description,
      });
      setForm({ projectKey: '', name: '', description: '' });
      setShowCreate(false);
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project.');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete project "${name}" and all its issues?`)) return;
    try {
      await projectApi.delete(id);
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete project.');
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
          <p className="text-sm text-slate-500">Manage workspaces, Kanban boards, and project teams.</p>
        </div>
        {canCreate && (
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" /> New Project
          </button>
        )}
      </div>

      {showCreate && (
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-bold text-slate-900">Create New Project</h2>
          {error && <div className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          <form onSubmit={handleCreate} className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-slate-600">Project Key *</label>
              <input
                type="text"
                required
                minLength={2}
                maxLength={10}
                placeholder="BUG"
                value={form.projectKey}
                onChange={(e) => setForm({ ...form, projectKey: e.target.value.toUpperCase() })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm uppercase focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-semibold uppercase text-slate-600">Project Name *</label>
              <input
                type="text"
                required
                placeholder="Core Platform Backend"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="md:col-span-3">
              <label className="mb-1 block text-xs font-semibold uppercase text-slate-600">Description</label>
              <input
                type="text"
                placeholder="Brief overview of the project goals..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 md:col-span-3">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Create Project
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p className="py-12 text-center text-sm text-slate-500">Loading projects...</p>
      ) : projects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <FolderKanban className="mx-auto h-10 w-10 text-slate-400" />
          <h3 className="mt-3 text-base font-semibold text-slate-900">No projects yet</h3>
          <p className="mt-1 text-sm text-slate-500">
            {canCreate
              ? 'Create your first project to begin tracking issues.'
              : 'Ask an Admin or Manager to add you to a project.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-blue-50 px-2.5 py-1 font-mono text-xs font-bold text-blue-700">
                    {project.projectKey}
                  </span>
                  {(user?.role === 'ADMIN' || project.createdById === user?.id) && (
                    <button
                      onClick={() => handleDelete(project.id, project.name)}
                      className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      title="Delete project"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <h3 className="mt-3 text-lg font-bold text-slate-900">{project.name}</h3>
                <p className="mt-1.5 line-clamp-2 text-sm text-slate-500">
                  {project.description || 'No project description provided.'}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                <Link
                  to={`/projects/${project.id}/members`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  <Users className="h-4 w-4" /> Team
                </Link>
                <Link
                  to={`/projects/${project.id}/board`}
                  className="rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-600"
                >
                  Kanban Board →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
