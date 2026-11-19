import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Clock, FolderKanban, Plus } from 'lucide-react';
import { issueApi, projectApi } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { PriorityBadge, StatusBadge, TypeBadge } from '../components/Badges';
import CreateIssueModal from '../components/CreateIssueModal';

export default function DashboardPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [projRes, issueRes] = await Promise.all([
        projectApi.getAll(),
        issueApi.getAll({ page: 0, size: 50, sortBy: 'updatedAt', sortDir: 'desc' }),
      ]);
      setProjects(projRes.data.data || []);
      setIssues(issueRes.data.data?.content || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const todoCount = issues.filter((i) => i.status === 'TODO').length;
  const inProgressCount = issues.filter((i) => i.status === 'IN_PROGRESS').length;
  const doneCount = issues.filter((i) => i.status === 'DONE').length;

  const stats = [
    { label: 'Active Projects', value: projects.length, icon: FolderKanban, color: 'text-blue-600 bg-blue-50' },
    { label: 'To Do Issues', value: todoCount, icon: AlertCircle, color: 'text-slate-700 bg-slate-100' },
    { label: 'In Progress', value: inProgressCount, icon: Clock, color: 'text-amber-600 bg-amber-50' },
    { label: 'Completed', value: doneCount, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
  ];

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.fullName}</h1>
          <p className="text-sm text-slate-500">Here is an overview of your projects and issue activity.</p>
        </div>
        {projects.length > 0 && (
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" /> Create Issue
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">{label}</span>
              <div className={`rounded-lg p-2 ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold text-slate-900">{loading ? '—' : value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Issues */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Recently Updated Issues</h2>
            <Link to="/issues" className="text-sm font-medium text-blue-600 hover:underline">
              View all
            </Link>
          </div>

          {loading ? (
            <p className="py-8 text-center text-sm text-slate-500">Loading issues...</p>
          ) : issues.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 py-10 text-center">
              <p className="text-sm text-slate-500">No issues tracked yet.</p>
              <Link to="/projects" className="mt-2 inline-block text-sm font-semibold text-blue-600 hover:underline">
                Go to Projects to get started →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {issues.slice(0, 7).map((issue) => (
                <Link
                  key={issue.id}
                  to={`/issues/${issue.id}`}
                  className="flex items-center justify-between gap-4 py-3 transition hover:bg-slate-50"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-600">{issue.issueKey}</span>
                      <TypeBadge type={issue.type} />
                    </div>
                    <p className="mt-1 truncate text-sm font-medium text-slate-900">{issue.title}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <PriorityBadge priority={issue.priority} />
                    <StatusBadge status={issue.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Projects Quick Jump */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Your Projects</h2>
            <Link to="/projects" className="text-sm font-medium text-blue-600 hover:underline">
              Manage
            </Link>
          </div>

          {projects.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">No projects available.</p>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}/board`}
                  className="block rounded-lg border border-slate-200 p-3.5 transition hover:border-blue-400 hover:bg-blue-50/30"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded bg-slate-900 px-2 py-0.5 font-mono text-xs font-bold text-white">
                      {project.projectKey}
                    </span>
                    <span className="text-xs font-medium text-blue-600">Open Board →</span>
                  </div>
                  <p className="mt-2 font-semibold text-slate-900">{project.name}</p>
                  <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                    {project.description || 'No description'}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateIssueModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        projects={projects}
        onCreated={loadData}
      />
    </div>
  );
}
