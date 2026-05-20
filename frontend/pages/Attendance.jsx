import React, { useState } from 'react';
import Card from '../components/common/Card';
import { CalendarDays, Check, X as XIcon, Clock } from 'lucide-react';

const mockStudents = [
  { id: 1, name: 'John Doe', rollNumber: '2024001', roomNumber: '101' },
  { id: 2, name: 'Jane Smith', rollNumber: '2024002', roomNumber: '102' },
  { id: 3, name: 'Mike Johnson', rollNumber: '2024003', roomNumber: '103' },
  { id: 4, name: 'Emily Davis', rollNumber: '2024004', roomNumber: '104' },
  { id: 5, name: 'Chris Wilson', rollNumber: '2024005', roomNumber: '105' },
];

export default function Attendance() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState({});

  const markAttendance = (studentId, status) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const markAll = (status) => {
    const all = {};
    mockStudents.forEach(s => { all[s.id] = status; });
    setAttendance(all);
  };

  const getStatusColor = (status) => {
    if (status === 'PRESENT') return 'bg-green-500 text-white';
    if (status === 'ABSENT') return 'bg-red-500 text-white';
    if (status === 'LATE') return 'bg-yellow-500 text-white';
    return 'bg-[var(--bg-primary)] border border-[var(--border-color)]';
  };

  const totalMarked = Object.keys(attendance).length;
  const presentCount = Object.values(attendance).filter(v => v === 'PRESENT').length;
  const absentCount = Object.values(attendance).filter(v => v === 'ABSENT').length;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--accent)]">Attendance</h1>
          <p className="text-sm text-[var(--text-secondary)]">Mark and track student attendance</p>
        </div>
        <div className="flex items-center gap-2">
          <CalendarDays size={16} className="text-[var(--text-secondary)]" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 sm:p-4 text-center">
          <p className="text-xs text-[var(--text-secondary)]">Marked</p>
          <p className="text-xl font-bold mt-1">{totalMarked}/{mockStudents.length}</p>
        </Card>
        <Card className="p-3 sm:p-4 text-center">
          <p className="text-xs text-green-600">Present</p>
          <p className="text-xl font-bold text-green-600 mt-1">{presentCount}</p>
        </Card>
        <Card className="p-3 sm:p-4 text-center">
          <p className="text-xs text-red-600">Absent</p>
          <p className="text-xl font-bold text-red-600 mt-1">{absentCount}</p>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => markAll('PRESENT')} className="px-3 py-2 text-xs font-medium rounded-lg bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:opacity-80">
          Mark All Present
        </button>
        <button onClick={() => markAll('ABSENT')} className="px-3 py-2 text-xs font-medium rounded-lg bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 hover:opacity-80">
          Mark All Absent
        </button>
        <button onClick={() => setAttendance({})} className="px-3 py-2 text-xs font-medium rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:opacity-80">
          Reset
        </button>
      </div>

      {/* Attendance Table - Desktop */}
      <Card className="hidden sm:block overflow-hidden">
        <div className="table-responsive">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-[var(--bg-primary)]">
                <th className="text-left px-4 py-3 font-medium text-[var(--text-secondary)]">Student</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--text-secondary)]">Roll No</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--text-secondary)] hidden md:table-cell">Room</th>
                <th className="text-center px-4 py-3 font-medium text-[var(--text-secondary)]">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockStudents.map(student => (
                <tr key={student.id} className="border-b border-[var(--border-color)]">
                  <td className="px-4 py-3 font-medium">{student.name}</td>
                  <td className="px-4 py-3 font-mono text-xs">{student.rollNumber}</td>
                  <td className="px-4 py-3 hidden md:table-cell">{student.roomNumber}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => markAttendance(student.id, 'PRESENT')}
                        className={`p-2 rounded-lg transition-all ${attendance[student.id] === 'PRESENT' ? 'bg-green-500 text-white scale-110' : 'bg-green-50 dark:bg-green-900/20 text-green-600 hover:bg-green-100'}`}>
                        <Check size={14} />
                      </button>
                      <button onClick={() => markAttendance(student.id, 'ABSENT')}
                        className={`p-2 rounded-lg transition-all ${attendance[student.id] === 'ABSENT' ? 'bg-red-500 text-white scale-110' : 'bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100'}`}>
                        <XIcon size={14} />
                      </button>
                      <button onClick={() => markAttendance(student.id, 'LATE')}
                        className={`p-2 rounded-lg transition-all ${attendance[student.id] === 'LATE' ? 'bg-yellow-500 text-white scale-110' : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 hover:bg-yellow-100'}`}>
                        <Clock size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Mobile Layout */}
      <div className="sm:hidden space-y-3">
        {mockStudents.map(student => (
          <Card key={student.id} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-medium text-sm">{student.name}</p>
                <p className="text-xs text-[var(--text-secondary)]">{student.rollNumber} • Room {student.roomNumber}</p>
              </div>
              {attendance[student.id] && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(attendance[student.id])}`}>
                  {attendance[student.id]}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={() => markAttendance(student.id, 'PRESENT')}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${attendance[student.id] === 'PRESENT' ? 'bg-green-500 text-white' : 'bg-green-50 dark:bg-green-900/20 text-green-700'}`}>
                Present
              </button>
              <button onClick={() => markAttendance(student.id, 'ABSENT')}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${attendance[student.id] === 'ABSENT' ? 'bg-red-500 text-white' : 'bg-red-50 dark:bg-red-900/20 text-red-700'}`}>
                Absent
              </button>
              <button onClick={() => markAttendance(student.id, 'LATE')}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${attendance[student.id] === 'LATE' ? 'bg-yellow-500 text-white' : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700'}`}>
                Late
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <button className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          disabled={totalMarked === 0}>
          Submit Attendance ({totalMarked}/{mockStudents.length})
        </button>
      </div>
    </div>
  );
}
