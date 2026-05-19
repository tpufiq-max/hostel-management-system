import React, { useState } from 'react';

const initialFees = [
  { id: 1, student: 'John Doe', amount: '$1200', dueDate: '2025-06-01', status: 'Paid' },
  { id: 2, student: 'Jane Smith', amount: '$1100', dueDate: '2025-06-05', status: 'Pending' },
  { id: 3, student: 'Mike Johnson', amount: '$1300', dueDate: '2025-06-10', status: 'Overdue' },
];

const students = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Alice Brown', 'David Green'];
const statuses = ['Paid', 'Pending', 'Overdue'];

export default function Fees() {
  const [fees, setFees] = useState(initialFees);
  const [showForm, setShowForm] = useState(false);
  const [editingFee, setEditingFee] = useState(null);
  const [formData, setFormData] = useState({
    student: '', amount: '', dueDate: new Date().toISOString().split('T')[0], status: 'Pending'
  });

  const handleAddFee = () => {
    setEditingFee(null);
    setFormData({ student: '', amount: '', dueDate: new Date().toISOString().split('T')[0], status: 'Pending' });
    setShowForm(true);
  };

  const handleEditFee = (fee) => {
    setEditingFee(fee);
    setFormData(fee);
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingFee) {
      setFees(fees.map(f => f.id === editingFee.id ? { ...formData, id: editingFee.id } : f));
    } else {
      setFees([...fees, { ...formData, id: Date.now() }]);
    }
    setShowForm(false);
  };

  const handleDeleteFee = (id) => {
    setFees(fees.filter(f => f.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{color: 'var(--text)'}}>Fees Management</h1>
          <p className="mt-2" style={{color: 'var(--muted)'}}>Track payments and manage outstanding student fees.</p>
        </div>
        <button
          onClick={handleAddFee}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Fee Record
        </button>
      </div>

      <div className="rounded-xl shadow-sm border overflow-hidden" style={{backgroundColor: 'var(--surface)', borderColor: 'var(--accent)', borderOpacity: 0.2}}>
        <div className="px-6 py-4 border-b" style={{borderColor: 'var(--accent)', borderOpacity: 0.1, backgroundColor: 'var(--background)'}}>
          <h3 className="text-lg font-semibold" style={{color: 'var(--text)'}}>Fee Records</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{backgroundColor: 'var(--background)'}}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{color: 'var(--muted)'}}>
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{color: 'var(--muted)'}}>
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{color: 'var(--muted)'}}>
                  Due Date
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
              {fees.map((fee) => (
                <tr key={fee.id} className="hover:shadow-md" style={{borderColor: 'var(--accent)', borderOpacity: 0.1, backgroundColor: 'var(--surface)'}}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-semibold text-sm mr-3">
                        {fee.student.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="text-sm font-medium" style={{color: 'var(--text)'}}>{fee.student}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold" style={{color: 'var(--text)'}}>
                    {fee.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {fee.dueDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      fee.status === 'Paid' ? 'bg-green-100 text-green-800' :
                      fee.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {fee.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEditFee(fee)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteFee(fee.id)}
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
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-secondary)] rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingFee ? 'Edit Fee Record' : 'Add Fee Record'}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Student</label>
                  <select
                    value={formData.student}
                    onChange={(e) => setFormData({...formData, student: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select student</option>
                    {students.map(student => (
                      <option key={student} value={student}>{student}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                  <input
                    type="text"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="$1200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    {editingFee ? 'Update' : 'Add'} Fee Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
