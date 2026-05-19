import React, { useState } from 'react';
import Button from '../components/common/Button';

export default function StudentProfiles() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [sortBy, setSortBy] = useState('name');

  const students = [
    {
      id: 1,
      name: 'Rahul Kumar',
      email: 'rahul@example.com',
      phone: '9876543210',
      room: '101',
      floor: '1',
      joinDate: '2024-01-15',
      status: 'active',
      feesStatus: 'paid',
      balance: 0,
      profileImage: '👨‍🎓'
    },
    {
      id: 2,
      name: 'Priya Sharma',
      email: 'priya@example.com',
      phone: '9876543211',
      room: '205',
      floor: '2',
      joinDate: '2024-02-20',
      status: 'active',
      feesStatus: 'pending',
      balance: 2500,
      profileImage: '👩‍🎓'
    },
    {
      id: 3,
      name: 'Aditya Patel',
      email: 'aditya@example.com',
      phone: '9876543212',
      room: '310',
      floor: '3',
      joinDate: '2023-08-10',
      status: 'active',
      feesStatus: 'paid',
      balance: 0,
      profileImage: '👨‍🎓'
    },
    {
      id: 4,
      name: 'Neha Singh',
      email: 'neha@example.com',
      phone: '9876543213',
      room: '215',
      floor: '2',
      joinDate: '2024-03-05',
      status: 'inactive',
      feesStatus: 'pending',
      balance: 5000,
      profileImage: '👩‍🎓'
    },
    {
      id: 5,
      name: 'Vikram Das',
      email: 'vikram@example.com',
      phone: '9876543214',
      room: '115',
      floor: '1',
      joinDate: '2024-01-22',
      status: 'active',
      feesStatus: 'paid',
      balance: 0,
      profileImage: '👨‍🎓'
    },
  ];

  const filteredStudents = students
    .filter(student => 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'room') return parseInt(a.room) - parseInt(b.room);
      if (sortBy === 'status') return a.status.localeCompare(b.status);
      return 0;
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold" style={{color: 'var(--text)'}}>Student Profiles</h1>
        <p className="mt-2" style={{color: 'var(--muted)'}}>Manage and view student information</p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none transition-colors"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none transition-colors"
        >
          <option value="name">Sort by Name</option>
          <option value="room">Sort by Room</option>
          <option value="status">Sort by Status</option>
        </select>
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map(student => (
          <div
            key={student.id}
            onClick={() => setSelectedStudent(student)}
            className="bg-[var(--bg-secondary)] rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer overflow-hidden group"
          >
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white flex items-center gap-4">
              <div className="text-4xl">{student.profileImage}</div>
              <div>
                <h3 className="font-bold text-lg">{student.name}</h3>
                <p className="text-blue-100">Room {student.room}</p>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>📧</span>
                <span className="truncate">{student.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>📱</span>
                <span>{student.phone}</span>
              </div>

              {/* Status badges */}
              <div className="flex gap-2 pt-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  student.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {student.status === 'active' ? '✓ Active' : '○ Inactive'}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  student.feesStatus === 'paid'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {student.feesStatus === 'paid' ? '✓ Fees Paid' : '⏳ Pending'}
                </span>
              </div>

              {/* Balance */}
              {student.balance > 0 && (
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded">
                  <p className="text-sm font-semibold text-yellow-900">
                    Balance Due: ₹{student.balance.toLocaleString()}
                  </p>
                </div>
              )}

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

      {/* Modal for selected student */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--bg-secondary)] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white sticky top-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-5xl">{selectedStudent.profileImage}</div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedStudent.name}</h2>
                    <p className="text-blue-100">Room {selectedStudent.room} • Floor {selectedStudent.floor}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="text-2xl hover:opacity-80 transition-opacity"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Contact Info */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Contact Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold text-gray-900">{selectedStudent.email}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-semibold text-gray-900">{selectedStudent.phone}</p>
                  </div>
                </div>
              </div>

              {/* Accommodation Details */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Accommodation</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                    <p className="text-sm text-blue-600 font-semibold">Room Number</p>
                    <p className="text-2xl font-bold text-blue-900">{selectedStudent.room}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                    <p className="text-sm text-blue-600 font-semibold">Floor</p>
                    <p className="text-2xl font-bold text-blue-900">{selectedStudent.floor}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                    <p className="text-sm text-blue-600 font-semibold">Status</p>
                    <p className="text-2xl font-bold text-blue-900">{selectedStudent.status === 'active' ? '✓ Active' : 'Inactive'}</p>
                  </div>
                </div>
              </div>

              {/* Financial Status */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Financial Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="font-semibold text-gray-700">Fees Status</span>
                    <span className={`px-4 py-2 rounded-full font-bold text-sm ${
                      selectedStudent.feesStatus === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedStudent.feesStatus === 'paid' ? '✓ Paid' : '⏳ Pending'}
                    </span>
                  </div>
                  {selectedStudent.balance > 0 && (
                    <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border-2 border-yellow-200">
                      <span className="font-semibold text-yellow-900">Outstanding Balance</span>
                      <span className="text-2xl font-bold text-yellow-900">₹{selectedStudent.balance.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
                <Button variant="primary" fullWidth>
                  📧 Send Message
                </Button>
                <Button variant="secondary" fullWidth>
                  📋 View Complaints
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
