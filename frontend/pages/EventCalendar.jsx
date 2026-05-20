import React from 'react';
import Card from '../components/common/Card';
import { CalendarDays } from 'lucide-react';

const events = [
  { id: 1, title: 'Inter-Hostel Cricket Match', date: '2025-03-25', time: '10:00 AM', venue: 'Sports Ground', type: 'sports' },
  { id: 2, title: 'Cultural Night', date: '2025-03-28', time: '6:00 PM', venue: 'Auditorium', type: 'cultural' },
  { id: 3, title: 'Annual Day Celebration', date: '2025-04-02', time: '5:00 PM', venue: 'Main Hall', type: 'celebration' },
  { id: 4, title: 'Career Workshop', date: '2025-04-05', time: '2:00 PM', venue: 'Seminar Hall', type: 'academic' },
  { id: 5, title: 'Health Checkup Camp', date: '2025-04-10', time: '9:00 AM', venue: 'Medical Center', type: 'health' },
];

export default function EventCalendar() {
  const getTypeColor = (type) => {
    const colors = { sports: 'blue', cultural: 'purple', celebration: 'orange', academic: 'green', health: 'red' };
    return colors[type] || 'gray';
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--accent)]">Events Calendar</h1>
        <p className="text-sm text-[var(--text-secondary)]">Upcoming hostel events and activities</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {events.map(event => {
          const color = getTypeColor(event.type);
          return (
            <Card key={event.id} className="p-4 sm:p-5 hover:scale-[1.02] transition-transform">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl bg-${color}-100 dark:bg-${color}-900/30 flex items-center justify-center flex-shrink-0`}>
                  <CalendarDays size={18} className={`text-${color}-600`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm">{event.title}</h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">{event.date} • {event.time}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{event.venue}</p>
                  <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-medium bg-${color}-100 text-${color}-700 dark:bg-${color}-900/30 dark:text-${color}-400 capitalize`}>
                    {event.type}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
