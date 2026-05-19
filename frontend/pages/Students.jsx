import React, { useState, useEffect } from 'react';
import StudentTable from '../features/student/components/StudentTable';
import StudentForm from '../features/student/components/StudentForm';
import Modal from '../components/common/Modal';
import Card from '../components/common/Card';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    roomsOccupied: 0
  });

  // Load initial data
  useEffect(() => {
    const loadStudents = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // For now, we'll use the sample data from StudentTable
        const sampleStudents = [
          {
            id: 1,
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '+1 234 567 8900',
            room: '101',
            course: 'Computer Science',
            year: '3rd Year',
            status: 'Active',
            joinDate: '2023-08-15',
            emergencyContact: '+1 234 567 8901',
            address: '123 Main St, City, State'
          },
          {
            id: 2,
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            phone: '+1 234 567 8901',
            room: '102',
            course: 'Mechanical Engineering',
            year: '2nd Year',
            status: 'Active',
            joinDate: '2023-08-20',
            emergencyContact: '+1 234 567 8902',
            address: '456 Oak Ave, City, State'
          },
          {
            id: 3,
            name: 'Mike Johnson',
            email: 'mike.johnson@example.com',
            phone: '+1 234 567 8902',
            room: '103',
            course: 'Electrical Engineering',
            year: '4th Year',
            status: 'Inactive',
            joinDate: '2022-08-10',
            emergencyContact: '+1 234 567 8903',
            address: '789 Pine Rd, City, State'
          },
          {
            id: 4,
            name: 'Sarah Wilson',
            email: 'sarah.wilson@example.com',
            phone: '+1 234 567 8903',
            room: '104',
            course: 'Civil Engineering',
            year: '1st Year',
            status: 'Active',
            joinDate: '2024-08-25',
            emergencyContact: '+1 234 567 8904',
            address: '321 Elm St, City, State'
          },
          {
            id: 5,
            name: 'David Brown',
            email: 'david.brown@example.com',
            phone: '+1 234 567 8904',
            room: '105',
            course: 'Business Administration',
            year: '2nd Year',
            status: 'Active',
            joinDate: '2023-08-18',
            emergencyContact: '+1 234 567 8905',
            address: '654 Maple Dr, City, State'
          }
        ];

        setStudents(sampleStudents);
        updateStats(sampleStudents);
      } catch (error) {
        console.error('Error loading students:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, []);

  const updateStats = (studentList) => {
    const total = studentList.length;
    const active = studentList.filter(s => s.status === 'Active').length;
    const inactive = studentList.filter(s => s.status === 'Inactive').length;
    const roomsOccupied = new Set(studentList.filter(s => s.status === 'Active').map(s => s.room)).size;

    setStats({ total, active, inactive, roomsOccupied });
  };

  const handleAddStudent = () => {
    setEditingStudent(null);
    setIsModalOpen(true);
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setIsModalOpen(true);
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const updatedStudents = students.filter(s => s.id !== studentId);
      setStudents(updatedStudents);
      updateStats(updatedStudents);
    } catch (error) {
      console.error('Error deleting student:', error);
      alert('Failed to delete student. Please try again.');
    }
  };

  const handleStatusChange = async (studentId, newStatus) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));

      const updatedStudents = students.map(student =>
        student.id === studentId
          ? { ...student, status: newStatus }
          : student
      );
      setStudents(updatedStudents);
      updateStats(updatedStudents);
    } catch (error) {
      console.error('Error updating student status:', error);
      alert('Failed to update student status. Please try again.');
    }
  };

  const handleSubmitStudent = async (studentData) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (editingStudent) {
        // Update existing student
        const updatedStudents = students.map(student =>
          student.id === editingStudent.id
            ? { ...studentData, id: editingStudent.id }
            : student
        );
        setStudents(updatedStudents);
        updateStats(updatedStudents);
      } else {
        // Add new student
        const newStudent = { ...studentData, id: Date.now() };
        const updatedStudents = [...students, newStudent];
        setStudents(updatedStudents);
        updateStats(updatedStudents);
      }

      setIsModalOpen(false);
      setEditingStudent(null);
    } catch (error) {
      console.error('Error saving student:', error);
      alert('Failed to save student. Please try again.');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{color: 'var(--text)'}}>Students Management</h1>
          <p className="mt-2" style={{color: 'var(--muted)'}}>Manage student records and hostel allocation</p>
        </div>
        <button
          onClick={handleAddStudent}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-medium transition-colors duration-200 shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Student
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 hover:shadow-md transition-all" style={{backgroundColor: 'var(--surface)', borderLeft: '4px solid var(--accent)'}}>
          <div className="flex items-center">
            <div className="p-3 rounded-lg" style={{backgroundColor: `rgba(59,130,246,0.1)`}}>
              <svg className="w-6 h-6" style={{color: 'var(--accent)'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium" style={{color: 'var(--muted)'}}>Total Students</p>
              <p className="text-2xl font-bold" style={{color: 'var(--text)'}}>{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-md transition-all" style={{backgroundColor: 'var(--surface)', borderLeft: '4px solid var(--success)'}}>
          <div className="flex items-center">
            <div className="p-3 rounded-lg" style={{backgroundColor: `rgba(34,197,94,0.1)`}}>
              <svg className="w-6 h-6" style={{color: 'var(--success)'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium" style={{color: 'var(--muted)'}}>Active Students</p>
              <p className="text-2xl font-bold" style={{color: 'var(--text)'}}>{stats.active}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-md transition-all" style={{backgroundColor: 'var(--surface)', borderLeft: '4px solid var(--danger)'}}>
          <div className="flex items-center">
            <div className="p-3 rounded-lg" style={{backgroundColor: `rgba(239,68,68,0.1)`}}>
              <svg className="w-6 h-6" style={{color: 'var(--danger)'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium" style={{color: 'var(--muted)'}}>Inactive Students</p>
              <p className="text-2xl font-bold" style={{color: 'var(--text)'}}>{stats.inactive}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-md transition-all" style={{backgroundColor: 'var(--surface)', borderLeft: '4px solid var(--warning)'}}>
          <div className="flex items-center">
            <div className="p-3 rounded-lg" style={{backgroundColor: `rgba(245,158,11,0.1)`}}>
              <svg className="w-6 h-6" style={{color: 'var(--warning)'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium" style={{color: 'var(--muted)'}}>Rooms Occupied</p>
              <p className="text-2xl font-bold" style={{color: 'var(--text)'}}>{stats.roomsOccupied}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Students Table */}
      <Card className="overflow-hidden">
        <StudentTable
          students={students}
          onEdit={handleEditStudent}
          onDelete={handleDeleteStudent}
          onStatusChange={handleStatusChange}
        />
      </Card>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingStudent ? 'Edit Student' : 'Add New Student'}
        size="lg"
      >
        <StudentForm
          student={editingStudent}
          onClose={handleCloseModal}
          onSubmit={handleSubmitStudent}
        />
      </Modal>
    </div>
  );
}
