import React, { useState } from 'react';
import Card from '../components/common/Card';
import { Plus, Wrench, X } from 'lucide-react';

const mockRequests = [
  { id: 1, title: 'Broken tap in Room 101', category: 'Plumbing', status: 'PENDING', priority: 'HIGH', createdAt: '2025-03-19' },
  { id: 2, title: 'Light flickering in corridor', category: 'Electrical', status: 'IN_PROGRESS', priority: 'MEDIUM', createdAt: '2025-03-18' },
  { id: 3, title: 'Door lock replacement', category: 'General', status: 'COMPLETED', priority: 'LOW', createdAt: '2025-03-15' },
  { id: 4, title: 'AC not cooling properly', category: 'HVAC', status: 'PENDING', priority: 'HIGH', createdAt: '2025-03-20' },
];

export default function Maintenance() {
  const [requests] = useState(mockRequests);
  const [showForm, setShowForm] = useState(false);

  const getStatusBadge = (status) => {
    const s = { PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', IN_PROGRESS: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', COMPLETED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' };
    return `px-2 py-0.5 rounded-full text-[10px] font-medium ${s[status] || s.PENDING}`;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--accent)]">Maintenance</h1>
          <p className="text-sm text-[var(--text-secondary)]">Track repair and maintenance requests</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-medium self-start sm:self-auto">
          <Plus size={16} /> New Request
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {requests.map(req => (
          <Card key={req.id} className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                  <Wrench size={16} className="text-orange-600" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">{req.title}</h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">{req.category} • {req.createdAt}</p>
                </div>
              </div>
              <span className={getStatusBadge(req.status)}>{req.status.replace('_', ' ')}</span>
            </div>
          </Card>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-[var(--bg-secondary)] rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[var(--border-color)]">
              <h3 className="text-lg font-semibold">New Maintenance Request</h3>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-[var(--bg-primary)]"><X size={18} /></button>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div><label className="block text-xs font-medium mb-1">Title</label><input className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-sm outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-medium mb-1">Category</label>
                  <select className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-sm outline-none"><option>Plumbing</option><option>Electrical</option><option>HVAC</option><option>General</option></select></div>
                <div><label className="block text-xs font-medium mb-1">Priority</label>
                  <select className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-sm outline-none"><option>LOW</option><option>MEDIUM</option><option>HIGH</option></select></div>
              </div>
              <div><label className="block text-xs font-medium mb-1">Description</label>
                <textarea rows={3} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-sm outline-none resize-none focus:ring-2 focus:ring-blue-500" /></div>
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-[var(--border-color)] text-sm font-medium">Cancel</button>
                <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">Submit</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
