import React, { useState, useEffect } from 'react';
import Modal from '../components/common/Modal';
import Card from '../components/common/Card';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import visitorService from '../features/visitor/visitorService';

const relations = ['PARENT', 'SIBLING', 'FRIEND', 'RELATIVE', 'GUARDIAN', 'OTHER'];

export default function Visitor() {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingVisitor, setEditingVisitor] = useState(null);
  const [formData, setFormData] = useState({
    visitorName: '', relation: 'PARENT', purpose: '', phoneNumber: '', studentId: ''
  });

  const fetchVisitors = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await visitorService.list();
      setVisitors(result.items || []);
    } catch (err) {
      setError(err.message || 'Failed to load visitors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  const handleAddVisitor = () => {
    setEditingVisitor(null);
    setFormData({ visitorName: '', relation: 'PARENT', purpose: '', phoneNumber: '', studentId: '' });
    setShowForm(true);
  };

  const handleEditVisitor = (visitor) => {
    setEditingVisitor(visitor);
    setFormData({
      visitorName: visitor.visitorName || '',
      relation: visitor.relation || 'PARENT',
      purpose: visitor.purpose || '',
      phoneNumber: visitor.phoneNumber || '',
      studentId: visitor.studentId || ''
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (editingVisitor) {
        await visitorService.update(editingVisitor.id, formData);
      } else {
        await visitorService.create(formData);
      }
      setShowForm(false);
      fetchVisitors();
    } catch (err) {
      setError(err.message || 'Failed to save visitor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckout = async (id) => {
    try {
      await visitorService.checkout(id);
      fetchVisitors();
    } catch (err) {
      setError(err.message || 'Failed to check out visitor');
    }
  };

  const handleDeleteVisitor = async (id) => {
    try {
      await visitorService.remove(id);
      fetchVisitors();
    } catch (err) {
      setError(err.message || 'Failed to remove visitor');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold" style={{color: 'var(--text)'}}>Visitor Log</h1>
          <p className="mt-2" style={{color: 'var(--muted)'}}>Track recent visitors and their check-in status.</p>
        </div>
        <LoadingSkeleton count={5} type="table" />
      </div>
    );
  }

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

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <Card className="overflow-hidden" style={{backgroundColor: 'var(--surface)'}}>
        <div className="px-6 py-4 border-b" style={{borderColor: 'var(--accent)', backgroundColor: 'var(--background)'}}>
          <h3 className="text-lg font-semibold" style={{color: 'var(--text)'}}>Visitor Records</h3>
        </div>
        {visitors.length === 0 ? (
          <div className="text-center py-12">
            <p style={{color: 'var(--muted)'}}>No visitors found. Add a visitor to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{backgroundColor: 'var(--background)'}}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{color: 'var(--muted)'}}>Visitor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{color: 'var(--muted)'}}>Relation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{color: 'var(--muted)'}}>Check-In</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{color: 'var(--muted)'}}>Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{color: 'var(--muted)'}}>Actions</th>
                </tr>
              </thead>
              <tbody style={{backgroundColor: 'var(--surface)'}}>
                {visitors.map((visitor) => (
                  <tr key={visitor.id} className="hover:shadow-md" style={{borderColor: 'var(--accent)'}}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm mr-3">
                          {(visitor.visitorName || '').split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div className="text-sm font-medium" style={{color: 'var(--text)'}}>{visitor.visitorName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{color: 'var(--text)'}}>
                      {visitor.relation}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{color: 'var(--muted)'}}>
                      {visitor.checkInTime || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        visitor.status === 'CHECKED_IN' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {visitor.status === 'CHECKED_IN' ? 'Checked In' : visitor.status === 'CHECKED_OUT' ? 'Checked Out' : visitor.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {visitor.status === 'CHECKED_IN' && (
                        <button
                          onClick={() => handleCheckout(visitor.id)}
                          className="text-green-600 hover:text-green-900 mr-4"
                        >
                          Check Out
                        </button>
                      )}
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
        )}
      </Card>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editingVisitor ? 'Edit Visitor' : 'Add Visitor'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Visitor Name</label>
            <input
              type="text"
              value={formData.visitorName}
              onChange={(e) => setFormData({...formData, visitorName: e.target.value})}
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
                <option key={relation} value={relation}>{relation.charAt(0) + relation.slice(1).toLowerCase()}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Purpose</label>
            <input
              type="text"
              value={formData.purpose}
              onChange={(e) => setFormData({...formData, purpose: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Purpose of visit"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <input
              type="text"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 9876543210"
            />
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
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {editingVisitor ? 'Update' : 'Add'} Visitor
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
