import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Paperclip, Send, Trash2 } from 'lucide-react';
import { attachmentApi, commentApi, issueApi, projectApi } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { PriorityBadge, TypeBadge } from '../components/Badges';

export default function IssueDetailPage() {
  const { issueId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [issue, setIssue] = useState(null);
  const [members, setMembers] = useState([]);
  const [comments, setComments] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [uploading, setUploading] = useState(false);

  const loadIssueData = async () => {
    try {
      const [issueRes, commentRes, attachRes] = await Promise.all([
        issueApi.getById(issueId),
        commentApi.getByIssue(issueId),
        attachmentApi.getByIssue(issueId),
      ]);
      const issueData = issueRes.data.data;
      setIssue(issueData);
      setComments(commentRes.data.data || []);
      setAttachments(attachRes.data.data || []);

      const memRes = await projectApi.getMembers(issueData.projectId);
      setMembers(memRes.data.data || []);
    } catch {
      navigate('/issues');
    }
  };

  useEffect(() => {
    loadIssueData();
  }, [issueId]);

  const handleStatusChange = async (status) => {
    try {
      const res = await issueApi.updateStatus(issueId, status);
      setIssue(res.data.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to update status.');
    }
  };

  const handlePriorityChange = async (priority) => {
    try {
      const res = await issueApi.update(issueId, { priority });
      setIssue(res.data.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to update priority.');
    }
  };

  const handleAssigneeChange = async (assigneeId) => {
    try {
      const res = await issueApi.assign(issueId, assigneeId ? Number(assigneeId) : null);
      setIssue(res.data.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to assign issue.');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await commentApi.add(issueId, newComment);
      setNewComment('');
      const res = await commentApi.getByIssue(issueId);
      setComments(res.data.data || []);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add comment.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await commentApi.delete(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete comment.');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await attachmentApi.upload(issueId, file);
      const res = await attachmentApi.getByIssue(issueId);
      setAttachments(res.data.data || []);
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed (max 5MB; PNG/JPG/WEBP/PDF/TXT only).');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDownload = async (attachment) => {
    try {
      const res = await attachmentApi.download(attachment.id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', attachment.fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert('Failed to download file.');
    }
  };

  const handleDeleteIssue = async () => {
    if (!window.confirm(`Delete ${issue.issueKey} permanently?`)) return;
    try {
      await issueApi.delete(issueId);
      navigate(`/projects/${issue.projectId}/board`);
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to delete issue.');
    }
  };

  if (!issue) {
    return <p className="py-12 text-center text-sm text-slate-500">Loading issue details...</p>;
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <Link
          to={`/projects/${issue.projectId}/board`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" /> Back to {issue.projectKey} Board
        </Link>
        <button
          onClick={handleDeleteIssue}
          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
        >
          <Trash2 className="h-3.5 w-3.5" /> Delete Issue
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Description, Attachments, Comments */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-2.5">
              <span className="rounded bg-blue-50 px-2.5 py-0.5 font-mono text-xs font-bold text-blue-700">
                {issue.issueKey}
              </span>
              <TypeBadge type={issue.type} />
              <PriorityBadge priority={issue.priority} />
            </div>
            <h1 className="text-xl font-bold text-slate-900">{issue.title}</h1>
            <div className="mt-4 whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
              {issue.description || 'No detailed description provided.'}
            </div>
          </div>

          {/* Attachments */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">
                Attachments ({attachments.length})
              </h2>
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                <Paperclip className="h-3.5 w-3.5" />
                {uploading ? 'Uploading...' : 'Attach File'}
                <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
              </label>
            </div>

            {attachments.length === 0 ? (
              <p className="text-xs text-slate-500">No screenshots or logs attached.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {attachments.map((att) => (
                  <div key={att.id} className="flex items-center justify-between py-2.5 text-sm">
                    <div>
                      <p className="font-medium text-slate-800">{att.fileName}</p>
                      <p className="text-xs text-slate-400">
                        {(att.fileSize / 1024).toFixed(1)} KB • Uploaded by {att.uploadedByName}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDownload(att)}
                      className="inline-flex items-center gap-1 rounded bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                    >
                      <Download className="h-3.5 w-3.5" /> Download
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Comments */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-bold text-slate-900">
              Discussion ({comments.length})
            </h2>

            <form onSubmit={handleAddComment} className="mb-6 flex gap-2">
              <input
                type="text"
                placeholder="Write a comment or status update..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Send className="h-4 w-4" /> Post
              </button>
            </form>

            <div className="space-y-4">
              {comments.map((c) => (
                <div key={c.id} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">{c.authorName}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-slate-400">
                        {new Date(c.createdAt).toLocaleString()}
                      </span>
                      {(c.authorId === user?.id || user?.role === 'ADMIN') && (
                        <button
                          onClick={() => handleDeleteComment(c.id)}
                          className="text-xs text-red-500 hover:underline"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-slate-700">{c.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Metadata & Controls */}
        <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm h-fit">
          <h2 className="border-b pb-3 text-sm font-bold uppercase tracking-wider text-slate-500">
            Issue Details
          </h2>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Status</label>
            <select
              value={issue.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium"
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Priority</label>
            <select
              value={issue.priority}
              onChange={(e) => handlePriorityChange(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Assignee</label>
            <select
              value={issue.assigneeId || ''}
              onChange={(e) => handleAssigneeChange(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium"
            >
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.fullName}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 border-t pt-4 text-xs text-slate-600">
            <div className="flex justify-between">
              <span className="text-slate-400">Reporter:</span>
              <span className="font-semibold text-slate-800">{issue.reporterName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Due Date:</span>
              <span className="font-semibold text-slate-800">{issue.dueDate || 'None'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Created:</span>
              <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
