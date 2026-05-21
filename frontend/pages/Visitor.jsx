import React, { useState } from 'react';
import Card from '../components/common/Card';
import { Plus, X, UserCheck, UserMinus } from 'lucide-react';

const initialVisitors = [
  { id: 1, name: 'Alice Brown', relation: 'Parent', studentName: 'John Doe', checkIn: '09:30 AM', status: 'Checked In', phone: '9876543210' },
  { id: 2, name: 'David Green', relation: 'Friend', studentName: 'Jane Smith', checkIn: '02:15 PM', status: 'Checked Out', phone: '9876543211' },
  { id: 3, name: 'Priya Patel', relation: 'Sibling', studentName: 'Mike Johnson', checkIn: '11:00 AM', status: 'Checked In', phone: '9876543212' },
];

export default function Visitor() {
  const [visitors, setVisitors] = useState(initialVisitors);
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--accent)]">Visitors</h1>
          <p className="text-sm text-[var(--text-secondary)]">Track visitor check-in and check-out</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-medium self-start sm:self-auto">
          <Plus size={16} /> Add Visitor
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card className="p-3 sm:p-4 text-center">
          <p className="text-xs text-[var(--text-secondary)]">Today's Visitors</p>
          <p className="text-xl font-bold mt-1">{visitors.length}</p>
        </Card>
        <Card className="p-3 sm:p-4 text-center">
          <p className="text-xs text-green-600">Currently In</p>
          <p className="text-xl font-bold text-green-600 mt-1">{visitors.filter(v => v.status === 'Checked In').length}</p>
        </Card>
        <Card className="p-3 sm:p-4 text-center hidden sm:block">
          <p className="text-xs text-[var(--text-secondary)]">Checked Out</p>
          <p className="text-xl font-bold mt-1">{visitors.filter(v => v.status === 'Checked Out').length}</p>
        </Card>
      </div>

      {/* Desktop Table */}
      <Card className="hidden md:block overflow-hidden">
        <div className="table-responsive">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-[var(--bg-primary)]">
                <th className="text-left px-4 py-3 font-medium text-[var(--text-secondary)]">Visitor</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--text-secondary)]">Relation</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--text-secondary)]">Visiting</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--text-secondary)]">Check In</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--text-secondary)]">Status</th>
                <th className="text-right px-4 py-3 font-medium text-[var(--text-secondary)]">Action</th>
              </tr>
            </thead>
            <tbody>
              {visitors.map(visitor => (
                <tr key={visitor.id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-primary)]">
                  <td className="px-4 py-3">
                    <p className="font-medium">{visitor.name}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{visitor.phone}</p>
                  </td>
                  <td className="px-4 py-3">{visitor.relation}</td>
                  <td className="px-4 py-3">{visitor.studentName}</td>
                  <td className="px-4 py-3">{visitor.checkIn}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${visitor.status === 'Checked In' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'}`}>
                      {visitor.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {visitor.status === 'Checked In' && (
                      <button className="px-3 py-1.5 text-xs bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg hover:bg-red-100">Check Out</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {visitors.map(visitor => (
          <Card key={visitor.id} className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-sm">{visitor.name}</p>
                <p className="text-xs text-[var(--text-secondary)]">{visitor.relation} • Visiting {visitor.studentName}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${visitor.status === 'Checked In' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                {visitor.status}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-[var(--text-secondary)]">
              <span>Check in: {visitor.checkIn}</span>
              {visitor.status === 'Checked In' && (
                <button className="px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg text-[10px] font-medium">Check Out</button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Add Visitor Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-[var(--bg-secondary)] rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[var(--border-color)]">
              <h3 className="text-lg font-semibold">Add Visitor</h3>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-[var(--bg-primary)]"><X size={18} /></button>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div><label className="block text-xs font-medium mb-1">Visitor Name</label>
                <input className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-sm outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-medium mb-1">Phone</label>
                  <input className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-sm outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-xs font-medium mb-1">Relation</label>
                  <select className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-sm outline-none">
                    <option>Parent</option><option>Sibling</option><option>Friend</option><option>Guardian</option><option>Other</option>
                  </select></div>
              </div>
              <div><label className="block text-xs font-medium mb-1">Visiting Student</label>
                <input className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="Student name" /></div>
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-[var(--border-color)] text-sm font-medium">Cancel</button>
                <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">Check In</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
