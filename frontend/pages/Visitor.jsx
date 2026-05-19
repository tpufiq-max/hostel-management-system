import React, { useState } from 'react';
import Modal from '../components/common/Modal';
import Card from '../components/common/Card';

const initialVisitors = [
  { id: 1, name: 'Alice Brown', relation: 'Parent', checkIn: '09:30 AM', status: 'Checked In' },
  { id: 2, name: 'David Green', relation: 'Friend', checkIn: '02:15 PM', status: 'Checked Out' },
  { id: 3, name: 'Priya Patel', relation: 'Sibling', checkIn: '11:00 AM', status: 'Checked In' },
];

const relations = ['Parent', 'Sibling', 'Friend', 'Relative', 'Guardian', 'Other'];
const statuses = ['Checked In', 'Checked Out'];

export default function Visitor() {
  const [visitors, setVisitors] = useState(initialVisitors);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingVisitor, setEditingVisitor] = useState(null);
  const [formData, setFormData] = useState({
    name: '', relation: 'Parent', checkIn: '', status: 'Checked In'
  });

  const handleAddVisitor = () => {
    setEditingVisitor(null);
    setFormData({ name: '', relation: 'Parent', checkIn: '', status: 'Checked In' });
    setShowForm(true);
  };

  const handleEditVisitor = (visitor) => {
    setEditingVisitor(visitor);
    setFormData(visitor);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Simulated persistence (replace with visitorService when backend is ready)
      await new Promise((r) => setTimeout(r, 400));

      if (editingVisitor) {
        setVisitors(
          visitors.map((v) =>
            v.id === editingVisitor.id ? { ...formData, id: editingVisitor.id } : v
          )
        );
      } else {
        setVisitors([...visitors, { ...formData, id: Date.now() }]);
      }

      setShowForm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVisitor = (id) => {
    setVisitors(visitors.filter(v => v.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{color: 'var(--text)'}}>Visitor Log</h1>
          <p className="mt-2" style={{color: 'var(--muted)'}}>Track recent visitors and their check-in status.</p>
        </div>
        <button
          onClick={handleAddVisitor}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Visitor
        </button>
      </div>

      <Card className="overflow-hidden" style={{backgroundColor: 'var(--surface)'}}>
        <div className="px-6 py-4 border-b" style={{borderColor: 'var(--accent)', borderOpacity: 0.1, backgroundColor: 'var(--background)'}}>
          <h3 className="text-lg font-semibold" style={{color: 'var(--text)'}}>Visitor Records</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{backgroundColor: 'var(--background)'}}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{color: 'var(--muted)'}}>
                  Visitor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{color: 'var(--muted)'}}>
                  Relation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{color: 'var(--muted)'}}>
                  Check-In
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{color: 'var(--muted)'}}>
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{color: 'var(--muted)'}}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody style={{backgroundColor: 'var(--surface)'}}>
              {visitors.map((visitor) => (
                <tr key={visitor.id} className="hover:shadow-md" style={{borderColor: 'var(--accent)', borderOpacity: 0.1}}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm mr-3">
                        {visitor.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="text-sm font-medium" style={{color: 'var(--text)'}}>{visitor.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {visitor.relation}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {visitor.checkIn}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      visitor.status === 'Checked In' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {visitor.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEditVisitor(visitor)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteVisitor(visitor.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editingVisitor ? 'Edit Visitor' : 'Add Visitor'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Visitor Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter visitor name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Relation</label>
            <select
              value={formData.relation}
              onChange={(e) => setFormData({...formData, relation: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {relations.map(relation => (
                <option key={relation} value={relation}>{relation}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Check-In Time</label>
            <input
              type="text"
              value={formData.checkIn}
              onChange={(e) => setFormData({...formData, checkIn: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 09:30 AM"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              {editingVisitor ? 'Update' : 'Add'} Visitor
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
