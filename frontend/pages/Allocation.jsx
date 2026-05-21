import React, { useState } from 'react';
import Card from '../components/common/Card';
import { Search, ArrowRight } from 'lucide-react';

const unallocated = [
  { id: 1, name: 'New Student A', rollNumber: '2025001', course: 'B.Tech CSE' },
  { id: 2, name: 'New Student B', rollNumber: '2025002', course: 'B.Tech ECE' },
];

const rooms = [
  { id: 1, roomNumber: '102', capacity: 2, occupied: 1, block: 'A' },
  { id: 2, roomNumber: '202', capacity: 2, occupied: 0, block: 'A' },
  { id: 3, roomNumber: '203', capacity: 3, occupied: 2, block: 'B' },
  { id: 4, roomNumber: '301', capacity: 2, occupied: 0, block: 'B' },
];

export default function Allocation() {
  const [selectedStudent, setSelectedStudent] = useState(null);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--accent)]">Room Allocation</h1>
        <p className="text-sm text-[var(--text-secondary)]">Assign rooms to new students</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Unallocated Students */}
        <Card className="p-4 sm:p-6">
          <h2 className="text-lg font-semibold mb-4">Unallocated Students</h2>
          <div className="space-y-3">
            {unallocated.map(student => (
              <div
                key={student.id}
                onClick={() => setSelectedStudent(student)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${selectedStudent?.id === student.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-[var(--border-color)] hover:border-blue-300'}`}
              >
                <p className="font-medium text-sm">{student.name}</p>
                <p className="text-xs text-[var(--text-secondary)]">{student.rollNumber} • {student.course}</p>
              </div>
            ))}
            {unallocated.length === 0 && <p className="text-sm text-[var(--text-secondary)] text-center py-4">All students allocated</p>}
          </div>
        </Card>

        {/* Available Rooms */}
        <Card className="p-4 sm:p-6">
          <h2 className="text-lg font-semibold mb-4">Available Rooms</h2>
          <div className="space-y-3">
            {rooms.filter(r => r.occupied < r.capacity).map(room => (
              <div key={room.id} className="p-3 rounded-xl border border-[var(--border-color)] flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Room {room.roomNumber}</p>
                  <p className="text-xs text-[var(--text-secondary)]">Block {room.block} • {room.occupied}/{room.capacity} beds</p>
                </div>
                <button
                  disabled={!selectedStudent}
                  className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  Allocate <ArrowRight size={12} />
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
