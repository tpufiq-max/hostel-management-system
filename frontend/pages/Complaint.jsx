import React, { useState, useEffect } from 'react';
import Card from '../components/common/Card';
import { Plus, Search, X, MessageSquare } from 'lucide-react';

const mockComplaints = [
  { id: 1, studentName: 'John Doe', title: 'Water leakage in bathroom', category: 'PLUMBING', complaintStatus: 'OPEN', priority: 'HIGH', createdAt: '2025-03-18' },
  { id: 2, studentName: 'Jane Smith', title: 'AC not working properly', category: 'ELECTRICAL', complaintStatus: 'IN_PROGRESS', priority: 'MEDIUM', createdAt: '2025-03-17' },
  { id: 3, studentName: 'Mike Johnson', title: 'WiFi connectivity issues', category: 'MAINTENANCE', complaintStatus: 'RESOLVED', priority: 'LOW', createdAt: '2025-03-15' },
  { id: 4, studentName: 'Emily Davis', title: 'Noisy neighbors at night', category: 'NOISE', complaintStatus: 'OPEN', priority: 'MEDIUM', createdAt: '2025-03-19' },
  { id: 5, studentName: 'Chris Wilson', title: 'Broken window lock', category: 'SECURITY', complaintStatus: 'IN_PROGRESS', priority: 'HIGH', createdAt: '2025-03-16' },
];

export default function Complaint() {
  const [complaints, setComplaints] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setTimeout(() => { setComplaints(mockComplaints); setLoading(false); }, 500);
  }, []);

  const filtered = complaints.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.studentName.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'ALL' || c.complaintStatus === filter;
    return matchSearch && matchFilter;
  });

  const getStatusBadge = (status) => {
    const styles = {
      OPEN: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      RESOLVED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      CLOSED: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
    };
    return `px-2 py-0.5 rounded-full text-[10px] font-medium ${styles[status] || ''}`;
  };

  const getPriorityDot = (priority) => {
    const colors = { HIGH: 'bg-red-500', MEDIUM: 'bg-yellow-500', LOW: 'bg-green-500', URGENT: 'bg-purple-500' };
    return colors[priority] || 'bg-gray-500';
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--accent)]">Complaints</h1>
          <p className="text-sm text-[var(--text-secondary)]">{complaints.length} total complaints</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-medium self-start sm:self-auto">
          <Plus size={16} /> New Complaint
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
          <input type="text" placeholder="Search complaints..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap ${filter === f ? 'bg-blue-600 text-white' : 'bg-[var(--bg-secondary)] border border-[var(--border-color)]'}`}>
              {f === 'ALL' ? 'All' : f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Complaints Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {filtered.map(complaint => (
          <Card key={complaint.id} className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3 min-w-0">
                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${getPriorityDot(complaint.priority)}`} />
                <div className="min-w-0">
                  <h3 className="font-medium text-sm truncate">{complaint.title}</h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">{complaint.studentName} • {complaint.category}</p>
                </div>
              </div>
              <span className={getStatusBadge(complaint.complaintStatus)}>
                {complaint.complaintStatus.replace('_', ' ')}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-[var(--text-secondary)]">
              <span>{complaint.createdAt}</span>
              <span className="capitalize">Priority: {complaint.priority.toLowerCase()}</span>
            </div>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare size={48} className="mx-auto text-[var(--text-secondary)] opacity-50" />
          <p className="text-lg font-medium text-[var(--text-secondary)] mt-3">No complaints found</p>
        </div>
      )}

      {/* New Complaint Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-[var(--bg-secondary)] rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[var(--border-color)]">
              <h3 className="text-lg font-semibold">New Complaint</h3>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-[var(--bg-primary)]"><X size={18} /></button>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1">Title</label>
                <input className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="Brief description of issue" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1">Category</label>
                  <select className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-sm outline-none">
                    <option>MAINTENANCE</option><option>ELECTRICAL</option><option>PLUMBING</option><option>CLEANLINESS</option><option>NOISE</option><option>SECURITY</option><option>OTHER</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Priority</label>
                  <select className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-sm outline-none">
                    <option>LOW</option><option>MEDIUM</option><option>HIGH</option><option>URGENT</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Description</label>
                <textarea rows={3} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Detailed description..." />
              </div>
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-[var(--border-color)] text-sm font-medium">Cancel</button>
                <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">Submit</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
