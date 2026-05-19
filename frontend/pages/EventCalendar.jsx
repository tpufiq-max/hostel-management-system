import React, { useState } from 'react';
import Button from '../components/common/Button';

export default function EventCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date(2024, 4)); // May 2024
  const [events, setEvents] = useState([
    { date: 5, title: 'Sports Day', color: 'green', time: '10:00 AM' },
    { date: 10, title: 'Hostel Meeting', color: 'blue', time: '3:00 PM' },
    { date: 15, title: 'Fee Submission Deadline', color: 'red', time: '5:00 PM' },
    { date: 20, title: 'Cultural Program', color: 'purple', time: '6:00 PM' },
    { date: 25, title: 'Room Inspection', color: 'orange', time: '11:00 AM' }
  ]);

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const getEventsForDate = (date) => {
    return events.filter(e => e.date === date);
  };

  const colorMap = {
    green: 'bg-green-100 text-green-800 border-green-300',
    blue: 'bg-blue-100 text-blue-800 border-blue-300',
    red: 'bg-red-100 text-red-800 border-red-300',
    purple: 'bg-purple-100 text-purple-800 border-purple-300',
    orange: 'bg-orange-100 text-orange-800 border-orange-300'
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold" style={{color: 'var(--text)'}}>Event Calendar</h1>
        <p className="mt-2" style={{color: 'var(--muted)'}}>Hostel events and important dates</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 rounded-xl border-2 p-6" style={{backgroundColor: 'var(--surface)', borderColor: 'var(--accent)', borderOpacity: 0.2}}>
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold" style={{color: 'var(--text)'}}>
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={prevMonth}>← Prev</Button>
              <Button variant="ghost" size="sm" onClick={nextMonth}>Next →</Button>
            </div>
          </div>

          {/* Days of week */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-bold py-2" style={{color: 'var(--muted)'}}>
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, idx) => {
              const dayEvents = day ? getEventsForDate(day) : [];
              const isToday = day === new Date().getDate() && currentMonth.getMonth() === new Date().getMonth();

              return (
                <div
                  key={idx}
                  className={`min-h-24 p-2 rounded-lg border-2 transition-all`}
                  style={{
                    backgroundColor: day === null ? 'var(--background)' : isToday ? 'var(--accent)' : 'var(--surface)',
                    borderColor: day === null ? 'var(--background)' : isToday ? 'var(--accent)' : 'var(--accent)',
                    borderOpacity: 0.2
                  }}
                >
                  {day && (
                    <div>
                      <p className="font-bold mb-1" style={{color: isToday ? 'white' : 'var(--text)'}}>
                        {day}
                      </p>
                      <div className="space-y-1">
                        {dayEvents.map((event, i) => (
                          <div
                            key={i}
                            className={`text-xs p-1 rounded border-2 truncate font-semibold ${colorMap[event.color]}`}
                            title={event.title}
                          >
                            {event.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Events Sidebar */}
        <div className="rounded-xl border-2 p-6" style={{backgroundColor: 'var(--surface)', borderColor: 'var(--accent)', borderOpacity: 0.2}}>
          <h3 className="text-xl font-bold mb-4" style={{color: 'var(--text)'}}>Upcoming Events</h3>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {events.map((event, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border-2 ${colorMap[event.color]} hover:shadow-md transition-shadow`}
              >
                <p className="font-bold text-sm mb-1">{event.title}</p>
                <div className="flex items-center gap-2 text-xs">
                  <span>📅</span>
                  <span>{currentMonth.getFullYear()}-{String(currentMonth.getMonth() + 1).padStart(2, '0')}-{String(event.date).padStart(2, '0')}</span>
                </div>
                <div className="flex items-center gap-2 text-xs mt-1">
                  <span>🕐</span>
                  <span>{event.time}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Add Event Button */}
          <Button variant="primary" fullWidth className="mt-4">
            + Add Event
          </Button>
        </div>
      </div>
    </div>
  );
}
