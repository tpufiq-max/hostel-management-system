import React, { useState } from 'react';
import Card from '../components/common/Card';
import { Plus, X, Bell } from 'lucide-react';

const mockNotices = [
  { id: 1, title: 'Hostel Maintenance Schedule', content: 'Electrical maintenance in Block A from 2-4 PM tomorrow. Please plan accordingly.', priority: 'high', date: '2025-03-20', author: 'Admin' },
  { id: 2, title: 'Fee Payment Deadline', content: 'Monthly fee payment deadline is approaching. Pay before 25th to avoid late fees.', priority: 'medium', date: '2025-03-19', author: 'Admin' },
  { id: 3, title: 'Sports Event Registration', content: 'Inter-hostel cricket tournament registration is now open. Register by 28th March.', priority: 'low', date: '2025-03-18', author: 'Admin' },
  { id: 4, title: 'Water Supply Interruption', content: 'Water supply will be interrupted on Sunday 9AM-12PM due to tank cleaning.', priority: 'high', date: '2025-03-17', author: 'Warden' },
];

export default function Notice() {
  const [notices] = useState(mockNotices);
  const [showForm, setShowForm] = useState(false);

  const getPriorityStyle = (priority) => {
    const styles = {
      high: { border: 'border-l-red-500', badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
      medium: { border: 'border-l-yellow-500', badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
      low: { border: 'border-l-blue-500', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    };
    return styles[priority] || styles.low;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--accent)]">Notices</h1>
          <p className="text-sm text-[var(--text-secondary)]">Publish and manage announcements</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-medium self-start sm:self-auto">
          <Plus size={16} /> New Notice
        </button>
      </div>

      {/* Notices List */}
      <div className="space-y-3 sm:space-y-4">
        {notices.map(notice => {
          const style = getPriorityStyle(notice.priority);
          return (
            <Card key={notice.id} className={`p-4 sm:p-5 border-l-4 ${style.border}`}>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-sm sm:text-base">{notice.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${style.badge}`}>
                      {notice.priority}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] mt-2 line-clamp-2">{notice.content}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-[var(--text-secondary)]">
                    <span>{notice.date}</span>
                    <span>By {notice.author}</span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {notices.length === 0 && (
        <div className="text-center py-12">
          <Bell size={48} className="mx-auto text-[var(--text-secondary)] opacity-50" />
          <p className="text-lg font-medium text-[var(--text-secondary)] mt-3">No notices yet</p>
        </div>
      )}

      {/* New Notice Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-[var(--bg-secondary)] rounded-2xl w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[var(--border-color)]">
              <h3 className="text-lg font-semibold">New Notice</h3>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-[var(--bg-primary)]"><X size={18} /></button>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div><label className="block text-xs font-medium mb-1">Title</label>
                <input className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="Notice title" /></div>
              <div><label className="block text-xs font-medium mb-1">Content</label>
                <textarea rows={4} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Notice content..." /></div>
              <div><label className="block text-xs font-medium mb-1">Priority</label>
                <select className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-sm outline-none">
                  <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                </select></div>
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-[var(--border-color)] text-sm font-medium">Cancel</button>
                <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">Publish</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
