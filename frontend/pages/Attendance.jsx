import React, { useState } from 'react';

const initialAttendanceRecords = [
  { id: 1, student: 'John Doe', date: '2025-05-01', status: 'Present' },
  { id: 2, student: 'Jane Smith', date: '2025-05-01', status: 'Absent' },
  { id: 3, student: 'Mike Johnson', date: '2025-05-01', status: 'Present' },
];

const students = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Alice Brown', 'David Green'];
const statuses = ['Present', 'Absent', 'Late', 'Excused'];

export default function Attendance() {
  const [attendanceRecords, setAttendanceRecords] = useState(initialAttendanceRecords);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    student: '', date: new Date().toISOString().split('T')[0], status: 'Present'
  });

  const handleAddRecord = () => {
    setEditingRecord(null);
    setFormData({ student: '', date: new Date().toISOString().split('T')[0], status: 'Present' });
    setShowForm(true);
  };

  const handleEditRecord = (record) => {
    setEditingRecord(record);
    setFormData(record);
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingRecord) {
      setAttendanceRecords(attendanceRecords.map(r => r.id === editingRecord.id ? { ...formData, id: editingRecord.id } : r));
    } else {
      setAttendanceRecords([...attendanceRecords, { ...formData, id: Date.now() }]);
    }
    setShowForm(false);
  };

  const handleDeleteRecord = (id) => {
    setAttendanceRecords(attendanceRecords.filter(r => r.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{color: 'var(--text)'}}>Attendance</h1>
          <p className="mt-2" style={{color: 'var(--muted)'}}>Review and manage attendance records and student presence.</p>
        </div>
        <button
          onClick={handleAddRecord}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Mark Attendance
        </button>
      </div>

      <div className="rounded-xl shadow-sm border overflow-hidden" style={{backgroundColor: 'var(--surface)', borderColor: 'var(--accent)', borderOpacity: 0.2}}>
        <div className="px-6 py-4 border-b" style={{borderColor: 'var(--accent)', borderOpacity: 0.1, backgroundColor: 'var(--background)'}}>
          <h3 className="text-lg font-semibold" style={{color: 'var(--text)'}}>Attendance Records</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{backgroundColor: 'var(--background)'}}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{color: 'var(--muted)'}}>
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{color: 'var(--muted)'}}>
                  Date
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
              {attendanceRecords.map((record) => (
                <tr key={record.id} className="hover:shadow-md" style={{borderColor: 'var(--accent)', borderOpacity: 0.1}}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-semibold text-sm mr-3">
                        {record.student.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="text-sm font-medium" style={{color: 'var(--text)'}}>{record.student}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{color: 'var(--muted)'}}>
                    {record.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      record.status === 'Present' ? 'bg-green-100 text-green-800' :
                      record.status === 'Absent' ? 'bg-red-100 text-red-800' :
                      record.status === 'Late' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEditRecord(record)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteRecord(record.id)}
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
                  {editingRecord ? 'Edit Attendance' : 'Mark Attendance'}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
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
                    {editingRecord ? 'Update' : 'Mark'} Attendance
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
