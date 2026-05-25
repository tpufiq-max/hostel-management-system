import React, { useState, useEffect, useRef } from 'react';
import Button from '../components/common/Button';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import studentService from '../features/student/studentService';

export default function StudentProfiles() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const debounceRef = useRef(null);

  const fetchStudents = async (query, pageNum) => {
    setLoading(true);
    setError(null);
    try {
      let result;
      if (query && query.trim()) {
        result = await studentService.search({ query, page: pageNum, size: 12 });
      } else {
        result = await studentService.list({ page: pageNum, size: 12 });
      }
      setStudents(result.items || []);
      setTotalPages(result.totalPages || 0);
    } catch (err) {
      setError(err.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents(searchTerm, page);
  }, [page]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(0);
      fetchStudents(value, 0);
    }, 400);
  };

  if (loading && students.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold" style={{color: 'var(--text)'}}>Student Profiles</h1>
          <p className="mt-2" style={{color: 'var(--muted)'}}>Manage and view student information</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <LoadingSkeleton count={6} type="card" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold" style={{color: 'var(--text)'}}>Student Profiles</h1>
        <p className="mt-2" style={{color: 'var(--muted)'}}>Manage and view student information</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
      )}

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none transition-colors"
        />
      </div>

      {/* Students Grid */}
      {students.length === 0 && !loading ? (
        <div className="text-center py-12 rounded-xl border-2" style={{backgroundColor: 'var(--surface)', borderColor: 'var(--accent)'}}>
          <p style={{color: 'var(--muted)'}}>No students found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map(student => (
            <div
              key={student.id}
              onClick={() => setSelectedStudent(student)}
              className="rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer overflow-hidden group"
              style={{backgroundColor: 'var(--surface)'}}
            >
              {/* Header with gradient */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white flex items-center gap-4">
                <div className="text-4xl">👨‍🎓</div>
                <div>
                  <h3 className="font-bold text-lg">{student.name || `${student.firstName || ''} ${student.lastName || ''}`.trim()}</h3>
                  <p className="text-blue-100">Room {student.roomNumber || student.room || '-'}</p>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm" style={{color: 'var(--muted)'}}>
                  <span>📧</span>
                  <span className="truncate">{student.email || '-'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm" style={{color: 'var(--muted)'}}>
                  <span>📱</span>
                  <span>{student.phone || student.contactNumber || '-'}</span>
                </div>

                {/* Status badges */}
                <div className="flex gap-2 pt-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    student.status === 'ACTIVE' || student.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {student.status === 'ACTIVE' || student.status === 'active' ? '✓ Active' : student.status || 'Unknown'}
                  </span>
                </div>

                {/* Action button */}
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedStudent(student);
                  }}
                >
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            Previous
          </Button>
          <span className="px-4 py-2 text-sm" style={{color: 'var(--text)'}}>
            Page {page + 1} of {totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
          >
            Next
          </Button>
        </div>
      )}

      {/* Modal for selected student */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" style={{backgroundColor: 'var(--surface)'}}>
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white sticky top-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-5xl">👨‍🎓</div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedStudent.name || `${selectedStudent.firstName || ''} ${selectedStudent.lastName || ''}`.trim()}</h2>
                    <p className="text-blue-100">Room {selectedStudent.roomNumber || selectedStudent.room || '-'}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="text-2xl hover:opacity-80 transition-opacity"
                >
                  x
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Contact Info */}
              <div>
                <h3 className="text-lg font-bold mb-3" style={{color: 'var(--text)'}}>Contact Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg" style={{backgroundColor: 'var(--background)'}}>
                    <p className="text-sm" style={{color: 'var(--muted)'}}>Email</p>
                    <p className="font-semibold" style={{color: 'var(--text)'}}>{selectedStudent.email || '-'}</p>
                  </div>
                  <div className="p-4 rounded-lg" style={{backgroundColor: 'var(--background)'}}>
                    <p className="text-sm" style={{color: 'var(--muted)'}}>Phone</p>
                    <p className="font-semibold" style={{color: 'var(--text)'}}>{selectedStudent.phone || selectedStudent.contactNumber || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Accommodation Details */}
              <div>
                <h3 className="text-lg font-bold mb-3" style={{color: 'var(--text)'}}>Accommodation</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                    <p className="text-sm text-blue-600 font-semibold">Room Number</p>
                    <p className="text-2xl font-bold text-blue-900">{selectedStudent.roomNumber || selectedStudent.room || '-'}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                    <p className="text-sm text-blue-600 font-semibold">Status</p>
                    <p className="text-2xl font-bold text-blue-900">{selectedStudent.status || '-'}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                    <p className="text-sm text-blue-600 font-semibold">Join Date</p>
                    <p className="text-lg font-bold text-blue-900">{selectedStudent.joinDate || selectedStudent.admissionDate || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
                <Button variant="primary" fullWidth onClick={() => setSelectedStudent(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
