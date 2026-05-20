import React, { useState } from 'react';
import Card from '../components/common/Card';
import { Search, Mail, Phone, MapPin } from 'lucide-react';

const students = [
  { id: 1, name: 'John Doe', email: 'john@student.com', phone: '9876543210', course: 'B.Tech CSE', year: 2, roomNumber: '101', bloodGroup: 'O+', guardianName: 'Robert Doe' },
  { id: 2, name: 'Jane Smith', email: 'jane@student.com', phone: '9876543211', course: 'B.Tech ECE', year: 3, roomNumber: '102', bloodGroup: 'A+', guardianName: 'Mary Smith' },
  { id: 3, name: 'Mike Johnson', email: 'mike@student.com', phone: '9876543212', course: 'B.Tech ME', year: 1, roomNumber: '103', bloodGroup: 'B+', guardianName: 'Tom Johnson' },
  { id: 4, name: 'Emily Davis', email: 'emily@student.com', phone: '9876543213', course: 'BBA', year: 2, roomNumber: '104', bloodGroup: 'AB+', guardianName: 'Lisa Davis' },
];

export default function StudentProfiles() {
  const [search, setSearch] = useState('');
  const filtered = students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.course.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--accent)]">Student Profiles</h1>
        <p className="text-sm text-[var(--text-secondary)]">Detailed student information</p>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
        <input type="text" placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
        {filtered.map(student => (
          <Card key={student.id} className="p-4 sm:p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">{student.name.charAt(0)}</span>
              </div>
              <div>
                <h3 className="font-semibold text-sm">{student.name}</h3>
                <p className="text-xs text-[var(--text-secondary)]">{student.course} • Year {student.year}</p>
              </div>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                <Mail size={12} /> <span>{student.email}</span>
              </div>
              <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                <Phone size={12} /> <span>{student.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                <MapPin size={12} /> <span>Room {student.roomNumber}</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-[var(--border-color)] grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-[var(--text-secondary)]">Blood:</span> <span className="font-medium">{student.bloodGroup}</span></div>
              <div><span className="text-[var(--text-secondary)]">Guardian:</span> <span className="font-medium">{student.guardianName}</span></div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
