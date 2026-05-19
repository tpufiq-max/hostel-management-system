import React, { useState } from 'react';

const initialComplaints = [
  { id: 1, student: 'John Doe', subject: 'Room lighting issue', status: 'Open', submitted: '2025-04-20' },
  { id: 2, student: 'Jane Smith', subject: 'Mess quality', status: 'In Progress', submitted: '2025-04-18' },
  { id: 3, student: 'Mike Johnson', subject: 'Laundry delay', status: 'Resolved', submitted: '2025-04-14' },
];

const students = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Alice Brown', 'David Green'];
const statuses = ['Open', 'In Progress', 'Resolved', 'Closed'];

export default function Complaint() {
  const [complaints, setComplaints] = useState(initialComplaints);
  const [showForm, setShowForm] = useState(false);
  const [editingComplaint, setEditingComplaint] = useState(null);
  const [formData, setFormData] = useState({
    student: '', subject: '', status: 'Open', submitted: new Date().toISOString().split('T')[0]
  });

  const handleAddComplaint = () => {
    setEditingComplaint(null);
    setFormData({ student: '', subject: '', status: 'Open', submitted: new Date().toISOString().split('T')[0] });
    setShowForm(true);
  };

  const handleEditComplaint = (complaint) => {
    setEditingComplaint(complaint);
    setFormData(complaint);
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingComplaint) {
      setComplaints(complaints.map(c => c.id === editingComplaint.id ? { ...formData, id: editingComplaint.id } : c));
    } else {
      setComplaints([...complaints, { ...formData, id: Date.now() }]);
    }
    setShowForm(false);
  };

  const handleDeleteComplaint = (id) => {
    setComplaints(complaints.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-theme">Complaints</h1>
          <p className="mt-2 muted">Monitor and manage student complaints with clear status updates.</p>
        </div>
        <button onClick={handleAddComplaint} className="btn-primary">
          Add Complaint
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {complaints.map((complaint) => {
          const statusKey = complaint.status === 'Resolved' ? 'resolved' : complaint.status === 'In Progress' ? 'inprogress' : 'open';
          return (
            <div key={complaint.id} className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-theme">{complaint.subject}</h2>
                <div className="flex gap-2">
                  <button onClick={() => handleEditComplaint(complaint)} className="text-accent text-sm">
                    Edit
                  </button>
                  <button onClick={() => handleDeleteComplaint(complaint.id)} className="text-danger text-sm">
                    Delete
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className={`chip ${statusKey}`}>
                  {complaint.status}
                </span>
              </div>
              <p className="text-sm muted">Submitted by {complaint.student}</p>
              <p className="mt-2 text-sm muted">{complaint.submitted}</p>
            </div>
          );
        })}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-theme">
                  {editingComplaint ? 'Edit Complaint' : 'Add Complaint'}
                </h2>
                <button onClick={() => setShowForm(false)} className="text-accent">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium muted mb-2">Student</label>
                  <select
                    value={formData.student}
                    onChange={(e) => setFormData({...formData, student: e.target.value})}
                    className="input"
                    required
                  >
                    <option value="">Select student</option>
                    {students.map(student => (
                      <option key={student} value={student}>{student}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium muted mb-2">Subject</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="input"
                    placeholder="Enter complaint subject"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium muted mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="input"
                    required
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium muted mb-2">Submitted Date</label>
                  <input
                    type="date"
                    value={formData.submitted}
                    onChange={(e) => setFormData({...formData, submitted: e.target.value})}
                    className="input"
                    required
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowForm(false)} className="btn-ghost flex-1">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary flex-1">
                    {editingComplaint ? 'Update' : 'Add'} Complaint
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
