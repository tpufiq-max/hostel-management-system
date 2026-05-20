import React, { useState, useEffect } from 'react';
import Card from '../components/common/Card';
import { Search, Plus, Edit2, Trash2, X, Filter } from 'lucide-react';

const mockStudents = [
  { id: 1, name: 'John Doe', email: 'john@student.com', phone: '9876543210', rollNumber: '2024001', course: 'B.Tech CSE', year: 2, roomNumber: '101', feesStatus: 'PAID', gender: 'Male' },
  { id: 2, name: 'Jane Smith', email: 'jane@student.com', phone: '9876543211', rollNumber: '2024002', course: 'B.Tech ECE', year: 3, roomNumber: '102', feesStatus: 'PENDING', gender: 'Female' },
  { id: 3, name: 'Mike Johnson', email: 'mike@student.com', phone: '9876543212', rollNumber: '2024003', course: 'B.Tech ME', year: 1, roomNumber: '103', feesStatus: 'PAID', gender: 'Male' },
  { id: 4, name: 'Emily Davis', email: 'emily@student.com', phone: '9876543213', rollNumber: '2024004', course: 'BBA', year: 2, roomNumber: '104', feesStatus: 'OVERDUE', gender: 'Female' },
  { id: 5, name: 'Chris Wilson', email: 'chris@student.com', phone: '9876543214', rollNumber: '2024005', course: 'B.Sc Physics', year: 3, roomNumber: '105', feesStatus: 'PAID', gender: 'Male' },
];

export default function Students() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editStudent, setEditStudent] = useState(null);

  useEffect(() => {
    setTimeout(() => { setStudents(mockStudents); setLoading(false); }, 600);
  }, []);

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.rollNumber.includes(search) ||
    s.course.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const styles = {
      PAID: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      OVERDUE: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return `px-2 py-0.5 rounded-full text-[10px] font-medium ${styles[status] || styles.PENDING}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--accent)]">Students</h1>
          <p className="text-sm text-[var(--text-secondary)]">{students.length} total students</p>
        </div>
        <button
          onClick={() => { setEditStudent(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium self-start sm:self-auto"
        >
          <Plus size={16} /> Add Student
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
          <input
            type="text"
            placeholder="Search by name, roll number, course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-sm hover:bg-[var(--bg-primary)] transition-colors">
          <Filter size={14} /> Filters
        </button>
      </div>

      {/* Desktop Table */}
      <Card className="hidden md:block overflow-hidden">
        <div className="table-responsive">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-[var(--bg-primary)]">
                <th className="text-left px-4 py-3 font-medium text-[var(--text-secondary)]">Name</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--text-secondary)]">Roll No</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--text-secondary)] hidden lg:table-cell">Course</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--text-secondary)] hidden xl:table-cell">Phone</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--text-secondary)]">Room</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--text-secondary)]">Fees</th>
                <th className="text-right px-4 py-3 font-medium text-[var(--text-secondary)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(student => (
                <tr key={student.id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-primary)] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">{student.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-xs text-[var(--text-secondary)]">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{student.rollNumber}</td>
                  <td className="px-4 py-3 hidden lg:table-cell">{student.course}</td>
                  <td className="px-4 py-3 hidden xl:table-cell">{student.phone}</td>
                  <td className="px-4 py-3">{student.roomNumber}</td>
                  <td className="px-4 py-3"><span className={getStatusBadge(student.feesStatus)}>{student.feesStatus}</span></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => { setEditStudent(student); setShowModal(true); }} className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 transition-colors">
                        <Edit2 size={14} />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Mobile Card Layout */}
      <div className="md:hidden space-y-3">
        {filtered.map(student => (
          <Card key={student.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">{student.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-medium text-sm">{student.name}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{student.rollNumber} • {student.course}</p>
                </div>
              </div>
              <span className={getStatusBadge(student.feesStatus)}>{student.feesStatus}</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-[var(--text-secondary)]">
              <div>Room: <span className="font-medium text-[var(--text-primary)]">{student.roomNumber}</span></div>
              <div>Year: <span className="font-medium text-[var(--text-primary)]">{student.year}</span></div>
              <div>Phone: <span className="font-medium text-[var(--text-primary)]">{student.phone}</span></div>
              <div>Gender: <span className="font-medium text-[var(--text-primary)]">{student.gender}</span></div>
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => { setEditStudent(student); setShowModal(true); }} className="flex-1 py-2 text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 transition-colors">
                Edit
              </button>
              <button className="flex-1 py-2 text-xs font-medium text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 transition-colors">
                Delete
              </button>
            </div>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg font-medium text-[var(--text-secondary)]">No students found</p>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Try adjusting your search criteria</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-[var(--bg-secondary)] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[var(--border-color)]">
              <h3 className="text-lg font-semibold">{editStudent ? 'Edit Student' : 'Add Student'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-[var(--bg-primary)]"><X size={18} /></button>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1">Name</label>
                  <input defaultValue={editStudent?.name} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Email</label>
                  <input defaultValue={editStudent?.email} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Phone</label>
                  <input defaultValue={editStudent?.phone} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Roll Number</label>
                  <input defaultValue={editStudent?.rollNumber} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Course</label>
                  <input defaultValue={editStudent?.course} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Room Number</label>
                  <input defaultValue={editStudent?.roomNumber} className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-[var(--border-color)] text-sm font-medium hover:bg-[var(--bg-primary)] transition-colors">
                  Cancel
                </button>
                <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
                  {editStudent ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
