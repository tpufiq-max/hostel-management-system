import React, { useState } from 'react';
import Card from '../../components/common/Card';
import { Check, X as XIcon, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

export default function MyAttendance() {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Mock attendance data: date (1-31) -> status
  const attendance = {
    1: 'PRESENT', 2: 'PRESENT', 3: 'ABSENT', 4: 'PRESENT', 5: 'PRESENT',
    6: 'PRESENT', 7: 'LATE', 8: 'PRESENT', 9: 'PRESENT', 10: 'PRESENT',
    11: 'PRESENT', 12: 'ABSENT', 13: 'PRESENT', 14: 'PRESENT', 15: 'PRESENT',
    16: 'PRESENT', 17: 'PRESENT', 18: 'LATE', 19: 'PRESENT', 20: 'PRESENT',
  };

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const totalDays = Object.keys(attendance).length;
  const presentDays = Object.values(attendance).filter(s => s === 'PRESENT').length;
  const absentDays = Object.values(attendance).filter(s => s === 'ABSENT').length;
  const lateDays = Object.values(attendance).filter(s => s === 'LATE').length;
  const percentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const getDayStyle = (day) => {
    const status = attendance[day];
    if (!status) return 'bg-[var(--bg-primary)] text-[var(--text-secondary)]';
    if (status === 'PRESENT') return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800';
    if (status === 'ABSENT') return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800';
    if (status === 'LATE') return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800';
    return '';
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--accent)]">My Attendance</h1>
        <p className="text-sm text-[var(--text-secondary)]">Track your hostel attendance record</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4 text-center">
          <p className="text-xs text-[var(--text-secondary)]">Attendance</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{percentage}%</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-xs text-green-600">Present</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{presentDays}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-xs text-red-600">Absent</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{absentDays}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-xs text-yellow-600">Late</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{lateDays}</p>
        </Card>
      </div>

      {/* Calendar */}
      <Card className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            className="p-2 rounded-lg hover:bg-[var(--bg-primary)] transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <h2 className="font-semibold text-base sm:text-lg">{monthName}</h2>
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            className="p-2 rounded-lg hover:bg-[var(--bg-primary)] transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-[10px] sm:text-xs font-medium text-[var(--text-secondary)]">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {days.map((day, i) => (
            <div
              key={i}
              className={`aspect-square rounded-lg flex items-center justify-center text-xs sm:text-sm font-medium ${day ? getDayStyle(day) : 'invisible'}`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-[var(--border-color)]">
          <div className="flex items-center gap-1.5 text-xs">
            <div className="w-3 h-3 rounded bg-green-100 border border-green-300" />
            <span className="text-[var(--text-secondary)]">Present</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <div className="w-3 h-3 rounded bg-red-100 border border-red-300" />
            <span className="text-[var(--text-secondary)]">Absent</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <div className="w-3 h-3 rounded bg-yellow-100 border border-yellow-300" />
            <span className="text-[var(--text-secondary)]">Late</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
