import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus, Search } from 'lucide-react';
import { issueApi, projectApi } from '../api/services';
import { PriorityBadge, StatusBadge, TypeBadge } from '../components/Badges';
import CreateIssueModal from '../components/CreateIssueModal';

export default function IssuesListPage() {
  const [projects, setProjects] = useState([]);
  const [pagedData, setPagedData] = useState({ content: [], page: 0, totalPages: 0, totalElements: 0 });
  const [filters, setFilters] = useState({
    projectId: '',
    status: '',
    priority: '',
    type: '',
    search: '',
    page: 0,
    size: 10,
  });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const loadIssues = async () => {
    setLoading(true);
    try {
      const params = {
        page: filters.page,
        size: filters.size,
        sortBy: 'createdAt',
        sortDir: 'desc',
      };
      if (filters.projectId) params.projectId = filters.projectId;
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.type) params.type = filters.type;
      if (filters.search) params.search = filters.search;

      const res = await issueApi.getAll(params);
      setPagedData(res.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    projectApi.getAll().then((res) => setProjects(res.data.data || []));
  }, []);

  useEffect(() => {
    loadIssues();
  }, [filters]);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 0 }));
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">All Issues</h1>
          <p className="text-sm text-slate-500">
            Filter, search, and triage bugs, tasks, and features across your projects.
          </p>
        </div>
        {projects.length > 0 && (
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" /> Create Issue
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="mb-6 grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-5">
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by key (BUG-101) or title..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <select
          value={filters.projectId}
          onChange={(e) => updateFilter('projectId', e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">All Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              [{p.projectKey}] {p.name}
            </option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={(e) => updateFilter('status', e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">All Statuses</option>
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="DONE">Done</option>
        </select>

        <select
          value={filters.priority}
          onChange={(e) => updateFilter('priority', e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">All Priorities</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
      </div>

      {/* Issues Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-600">
            <tr>
              <th className="px-5 py-3.5">Key</th>
              <th className="px-5 py-3.5">Summary</th>
              <th className="px-5 py-3.5">Type</th>
              <th className="px-5 py-3.5">Priority</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5">Assignee</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-slate-500">
                  Loading issues...
                </td>
              </tr>
            ) : pagedData.content.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-slate-500">
                  No matching issues found.
                </td>
              </tr>
            ) : (
              pagedData.content.map((issue) => (
                <tr key={issue.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3.5 font-mono text-xs font-bold text-blue-600">
                    <Link to={`/issues/${issue.id}`} className="hover:underline">
                      {issue.issueKey}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 font-medium text-slate-900">
                    <Link to={`/issues/${issue.id}`} className="hover:text-blue-600">
                      {issue.title}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5">
                    <TypeBadge type={issue.type} />
                  </td>
                  <td className="px-5 py-3.5">
                    <PriorityBadge priority={issue.priority} />
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={issue.status} />
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">
                    {issue.assigneeName || <span className="italic text-slate-400">Unassigned</span>}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-5 py-3 text-xs text-slate-600">
          <span>
            Showing page <strong>{pagedData.page + 1}</strong> of{' '}
            <strong>{Math.max(pagedData.totalPages, 1)}</strong> ({pagedData.totalElements} total issues)
          </span>
          <div className="flex gap-2">
            <button
              disabled={pagedData.page === 0}
              onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
              className="inline-flex items-center gap-1 rounded border border-slate-300 bg-white px-2.5 py-1 font-medium disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Prev
            </button>
            <button
              disabled={pagedData.last || pagedData.totalPages === 0}
              onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
              className="inline-flex items-center gap-1 rounded border border-slate-300 bg-white px-2.5 py-1 font-medium disabled:opacity-40"
            >
              Next <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      <CreateIssueModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        projects={projects}
        onCreated={loadIssues}
      />
    </div>
  );
}
