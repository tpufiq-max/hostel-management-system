import React, { useState } from 'react';

const initialAllocations = [
  { id: 1, student: 'John Doe', room: '101', course: 'Computer Science', assignedOn: '2025-01-10' },
  { id: 2, student: 'Jane Smith', room: '102', course: 'Mechanical Engineering', assignedOn: '2025-02-03' },
  { id: 3, student: 'Mike Johnson', room: '201', course: 'Electrical Engineering', assignedOn: '2025-03-15' },
];

const students = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Alice Brown', 'David Green'];
const rooms = ['101', '102', '201', '202', '301'];
const courses = ['Computer Science', 'Mechanical Engineering', 'Electrical Engineering', 'Civil Engineering', 'Business Administration'];

export default function Allocation() {
  const [allocations, setAllocations] = useState(initialAllocations);
  const [showForm, setShowForm] = useState(false);
  const [editingAllocation, setEditingAllocation] = useState(null);
  const [formData, setFormData] = useState({
    student: '', room: '', course: '', assignedOn: new Date().toISOString().split('T')[0]
  });

  const handleAddAllocation = () => {
    setEditingAllocation(null);
    setFormData({ student: '', room: '', course: '', assignedOn: new Date().toISOString().split('T')[0] });
    setShowForm(true);
  };

  const handleEditAllocation = (allocation) => {
    setEditingAllocation(allocation);
    setFormData(allocation);
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingAllocation) {
      setAllocations(allocations.map(a => a.id === editingAllocation.id ? { ...formData, id: editingAllocation.id } : a));
    } else {
      setAllocations([...allocations, { ...formData, id: Date.now() }]);
    }
    setShowForm(false);
  };

  const handleDeleteAllocation = (id) => {
    setAllocations(allocations.filter(a => a.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{color: 'var(--text)'}}>Room Allocation</h1>
          <p className="mt-2" style={{color: 'var(--muted)'}}>Manage student room assignments and allocation history.</p>
        </div>
        <button
          onClick={handleAddAllocation}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Allocate Room
        </button>
      </div>

      <div className="rounded-xl shadow-sm border overflow-hidden" style={{backgroundColor: 'var(--surface)', borderColor: 'var(--accent)', borderOpacity: 0.2}}>
        <div className="px-6 py-4 border-b" style={{borderColor: 'var(--accent)', borderOpacity: 0.1, backgroundColor: 'var(--background)'}}>
          <h3 className="text-lg font-semibold" style={{color: 'var(--text)'}}>Current Allocations</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{backgroundColor: 'var(--background)'}}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{color: 'var(--muted)'}}>
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{color: 'var(--muted)'}}>
                  Room
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{color: 'var(--muted)'}}>
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{color: 'var(--muted)'}}>
                  Assigned On
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{color: 'var(--muted)'}}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody style={{backgroundColor: 'var(--surface)'}}>
              {allocations.map((allocation) => (
                <tr key={allocation.id} className="hover:shadow-md" style={{borderColor: 'var(--accent)', borderOpacity: 0.1}}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm mr-3">
                        {allocation.student.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="text-sm font-medium" style={{color: 'var(--text)'}}>{allocation.student}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      Room {allocation.room}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {allocation.course}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {allocation.assignedOn}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEditAllocation(allocation)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAllocation(allocation.id)}
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
                  {editingAllocation ? 'Edit Allocation' : 'Allocate Room'}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Room</label>
                  <select
                    value={formData.room}
                    onChange={(e) => setFormData({...formData, room: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select room</option>
                    {rooms.map(room => (
                      <option key={room} value={room}>{room}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
                  <select
                    value={formData.course}
                    onChange={(e) => setFormData({...formData, course: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select course</option>
                    {courses.map(course => (
                      <option key={course} value={course}>{course}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assignment Date</label>
                  <input
                    type="date"
                    value={formData.assignedOn}
                    onChange={(e) => setFormData({...formData, assignedOn: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
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
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    {editingAllocation ? 'Update' : 'Allocate'} Room
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
