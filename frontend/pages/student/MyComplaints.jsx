import React, { useState } from 'react';
import Card from '../../components/common/Card';
import { Plus, X, MessageSquare, Send } from 'lucide-react';

const myComplaints = [
  { id: 1, title: 'Water leakage in bathroom', category: 'PLUMBING', status: 'IN_PROGRESS', priority: 'HIGH', createdAt: '2025-03-18', resolutionNotes: 'Maintenance team has been notified. Will be fixed by tomorrow.' },
  { id: 2, title: 'WiFi not working properly', category: 'MAINTENANCE', status: 'RESOLVED', priority: 'MEDIUM', createdAt: '2025-03-15', resolutionNotes: 'Router replaced. Issue resolved.' },
  { id: 3, title: 'Room cleaning issue', category: 'CLEANLINESS', status: 'OPEN', priority: 'LOW', createdAt: '2025-03-19', resolutionNotes: null },
];

export default function MyComplaints() {
  const [complaints] = useState(myComplaints);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', category: 'MAINTENANCE', priority: 'MEDIUM' });

  const getStatusBadge = (status) => {
    const styles = {
      OPEN: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      RESOLVED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      CLOSED: 'bg-gray-100 text-gray-700',
    };
    return `px-2 py-0.5 rounded-full text-[10px] font-medium ${styles[status] || ''}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowForm(false);
    setFormData({ title: '', description: '', category: 'MAINTENANCE', priority: 'MEDIUM' });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--accent)]">My Complaints</h1>
          <p className="text-sm text-[var(--text-secondary)]">Submit and track your complaints</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 text-sm font-medium self-start sm:self-auto"
        >
          <Plus size={16} /> New Complaint
        </button>
      </div>

      {/* Complaints List */}
      <div className="space-y-3 sm:space-y-4">
        {complaints.map(complaint => (
          <Card key={complaint.id} className="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm sm:text-base">{complaint.title}</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  {complaint.category} • Priority: {complaint.priority} • {complaint.createdAt}
                </p>
              </div>
              <span className={getStatusBadge(complaint.status)}>{complaint.status.replace('_', ' ')}</span>
            </div>
            {complaint.resolutionNotes && (
              <div className="mt-3 p-3 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)]">
                <p className="text-xs font-semibold text-[var(--text-secondary)] mb-1">Admin Response:</p>
                <p className="text-xs">{complaint.resolutionNotes}</p>
              </div>
            )}
          </Card>
        ))}

        {complaints.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare size={48} className="mx-auto text-[var(--text-secondary)] opacity-50" />
            <p className="text-lg font-medium text-[var(--text-secondary)] mt-3">No complaints yet</p>
            <p className="text-sm text-[var(--text-secondary)]">Submit your first complaint when needed</p>
          </div>
        )}
      </div>

      {/* New Complaint Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-[var(--bg-secondary)] rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[var(--border-color)]">
              <h3 className="text-lg font-semibold">Submit Complaint</h3>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-[var(--bg-primary)]">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="Brief description of issue"
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-sm outline-none"
                  >
                    <option>MAINTENANCE</option>
                    <option>ELECTRICAL</option>
                    <option>PLUMBING</option>
                    <option>CLEANLINESS</option>
                    <option>FOOD</option>
                    <option>NOISE</option>
                    <option>OTHER</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-sm outline-none"
                  >
                    <option>LOW</option>
                    <option>MEDIUM</option>
                    <option>HIGH</option>
                    <option>URGENT</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Description</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  placeholder="Provide detailed information..."
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-[var(--border-color)] text-sm font-medium">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 flex items-center justify-center gap-2">
                  <Send size={14} /> Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
