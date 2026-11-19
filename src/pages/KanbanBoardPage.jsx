import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, GripVertical, Plus, Users } from 'lucide-react';
import { issueApi, projectApi } from '../api/services';
import { PriorityBadge, TypeBadge } from '../components/Badges';
import CreateIssueModal from '../components/CreateIssueModal';

const COLUMNS = [
  { key: 'TODO', title: 'To Do', accent: 'border-t-slate-500 bg-slate-100/80' },
  { key: 'IN_PROGRESS', title: 'In Progress', accent: 'border-t-blue-600 bg-blue-50/50' },
  { key: 'DONE', title: 'Done', accent: 'border-t-emerald-600 bg-emerald-50/50' },
];

export default function KanbanBoardPage() {
  const { projectId } = useParams();
  const [board, setBoard] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draggedIssueId, setDraggedIssueId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const loadBoard = async () => {
    setLoading(true);
    try {
      const [boardRes, projRes] = await Promise.all([
        projectApi.getBoard(projectId),
        projectApi.getAll(),
      ]);
      setBoard(boardRes.data.data);
      setProjects(projRes.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBoard();
  }, [projectId]);

  const handleDrop = async (targetStatus) => {
    if (!draggedIssueId || !board) return;

    // Find current issue
    let movingIssue = null;
    let sourceStatus = null;
    for (const col of COLUMNS) {
      const found = (board.columns[col.key] || []).find((i) => i.id === draggedIssueId);
      if (found) {
        movingIssue = found;
        sourceStatus = col.key;
        break;
      }
    }

    if (!movingIssue || sourceStatus === targetStatus) {
      setDraggedIssueId(null);
      return;
    }

    // Optimistic UI update
    const updatedColumns = { ...board.columns };
    updatedColumns[sourceStatus] = updatedColumns[sourceStatus].filter((i) => i.id !== draggedIssueId);
    updatedColumns[targetStatus] = [...updatedColumns[targetStatus], { ...movingIssue, status: targetStatus }];
    setBoard({ ...board, columns: updatedColumns });
    setDraggedIssueId(null);

    try {
      await issueApi.updateStatus(movingIssue.id, targetStatus);
    } catch (err) {
      alert(err.response?.data?.message || 'Status update failed.');
      loadBoard();
    }
  };

  if (loading && !board) {
    return <p className="py-12 text-center text-sm text-slate-500">Loading Kanban board...</p>;
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            to="/projects"
            className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> All Projects
          </Link>
          <div className="flex items-center gap-2.5">
            <span className="rounded bg-slate-900 px-2.5 py-1 font-mono text-xs font-bold text-white">
              {board?.projectKey}
            </span>
            <h1 className="text-2xl font-bold text-slate-900">{board?.projectName} Board</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/projects/${projectId}/members`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Users className="h-4 w-4" /> Team
          </Link>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" /> Create Issue
          </button>
        </div>
      </div>

      {/* 3-Column Kanban Grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {COLUMNS.map((col) => {
          const columnIssues = board?.columns?.[col.key] || [];
          return (
            <div
              key={col.key}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(col.key)}
              className={`flex min-h-[540px] flex-col rounded-xl border border-slate-200 border-t-4 p-4 ${col.accent}`}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">{col.title}</h2>
                <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-slate-700 shadow-sm">
                  {columnIssues.length}
                </span>
              </div>

              <div className="flex-1 space-y-3">
                {columnIssues.map((issue) => (
                  <div
                    key={issue.id}
                    draggable
                    onDragStart={() => setDraggedIssueId(issue.id)}
                    className="cursor-grab rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-400 hover:shadow active:cursor-grabbing"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <GripVertical className="h-4 w-4 text-slate-300" />
                        <Link
                          to={`/issues/${issue.id}`}
                          className="font-mono text-xs font-bold text-blue-600 hover:underline"
                        >
                          {issue.issueKey}
                        </Link>
                      </div>
                      <PriorityBadge priority={issue.priority} />
                    </div>

                    <Link
                      to={`/issues/${issue.id}`}
                      className="mt-2 block text-sm font-semibold text-slate-900 hover:text-blue-600"
                    >
                      {issue.title}
                    </Link>

                    <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
                      <TypeBadge type={issue.type} />
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        {issue.dueDate && (
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> {issue.dueDate}
                          </span>
                        )}
                        <span
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-[11px] font-bold text-white"
                          title={issue.assigneeName || 'Unassigned'}
                        >
                          {issue.assigneeName ? issue.assigneeName.charAt(0).toUpperCase() : '?'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {columnIssues.length === 0 && (
                  <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-slate-300 text-xs text-slate-400">
                    Drag & drop issues here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <CreateIssueModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        projects={projects}
        defaultProjectId={Number(projectId)}
        onCreated={loadBoard}
      />
    </div>
  );
}
