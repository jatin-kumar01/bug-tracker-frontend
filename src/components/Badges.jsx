import React from 'react';
import { Bug, CheckSquare, Sparkles } from 'lucide-react';

export function PriorityBadge({ priority }) {
  const styles = {
    CRITICAL: 'bg-red-100 text-red-800 border-red-200',
    HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
    MEDIUM: 'bg-amber-100 text-amber-800 border-amber-200',
    LOW: 'bg-slate-100 text-slate-700 border-slate-200',
  };
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${styles[priority] || styles.LOW}`}>
      {priority}
    </span>
  );
}

export function StatusBadge({ status }) {
  const styles = {
    TODO: 'bg-slate-200 text-slate-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    DONE: 'bg-emerald-100 text-emerald-800',
  };
  const labels = {
    TODO: 'To Do',
    IN_PROGRESS: 'In Progress',
    DONE: 'Done',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[status] || styles.TODO}`}>
      {labels[status] || status}
    </span>
  );
}

export function TypeBadge({ type }) {
  if (type === 'BUG') {
    return (
      <span className="inline-flex items-center gap-1 rounded bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700">
        <Bug className="h-3.5 w-3.5" /> Bug
      </span>
    );
  }
  if (type === 'FEATURE') {
    return (
      <span className="inline-flex items-center gap-1 rounded bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700">
        <Sparkles className="h-3.5 w-3.5" /> Feature
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700">
      <CheckSquare className="h-3.5 w-3.5" /> Task
    </span>
  );
}
