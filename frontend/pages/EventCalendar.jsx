import React, { useState, useEffect } from 'react';
import Button from '../components/common/Button';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import eventService from '../features/events/eventService';

const categoryColors = {
  CULTURAL: 'bg-purple-100 text-purple-800 border-purple-300',
  SPORTS: 'bg-green-100 text-green-800 border-green-300',
  ACADEMIC: 'bg-blue-100 text-blue-800 border-blue-300',
  SOCIAL: 'bg-orange-100 text-orange-800 border-orange-300',
  OTHER: 'bg-gray-100 text-gray-800 border-gray-300'
};

const eventCategories = ['CULTURAL', 'SPORTS', 'ACADEMIC', 'SOCIAL', 'OTHER'];

export default function EventCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', eventDate: '', startTime: '', endTime: '',
    venue: '', organizer: '', category: 'CULTURAL', maxParticipants: ''
  });

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
        .toISOString().split('T')[0];
      const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
        .toISOString().split('T')[0];
      const result = await eventService.list({ startDate, endDate });
      setEvents(result.items || []);
    } catch (err) {
      setError(err.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [currentMonth]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (payload.maxParticipants) {
        payload.maxParticipants = parseInt(payload.maxParticipants, 10);
      } else {
        delete payload.maxParticipants;
      }
      await eventService.create(payload);
      setShowForm(false);
      setFormData({ title: '', description: '', eventDate: '', startTime: '', endTime: '', venue: '', organizer: '', category: 'CULTURAL', maxParticipants: '' });
      fetchEvents();
    } catch (err) {
      setError(err.message || 'Failed to create event');
    }
  };

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const getEventsForDate = (day) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.eventDate === dateStr);
  };

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold" style={{color: 'var(--text)'}}>Event Calendar</h1>
          <p className="mt-2" style={{color: 'var(--muted)'}}>Hostel events and important dates</p>
        </div>
        <LoadingSkeleton count={4} type="card" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold" style={{color: 'var(--text)'}}>Event Calendar</h1>
        <p className="mt-2" style={{color: 'var(--muted)'}}>Hostel events and important dates</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 rounded-xl border-2 p-6" style={{backgroundColor: 'var(--surface)', borderColor: 'var(--accent)'}}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold" style={{color: 'var(--text)'}}>
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={prevMonth}>&#8592; Prev</Button>
              <Button variant="ghost" size="sm" onClick={nextMonth}>Next &#8594;</Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-bold py-2" style={{color: 'var(--muted)'}}>
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {days.map((day, idx) => {
              const dayEvents = day ? getEventsForDate(day) : [];
              const isToday = day === new Date().getDate() && currentMonth.getMonth() === new Date().getMonth() && currentMonth.getFullYear() === new Date().getFullYear();

              return (
                <div
                  key={idx}
                  className="min-h-24 p-2 rounded-lg border-2 transition-all"
                  style={{
                    backgroundColor: day === null ? 'var(--background)' : isToday ? 'var(--accent)' : 'var(--surface)',
                    borderColor: day === null ? 'var(--background)' : 'var(--accent)'
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
                            className={`text-xs p-1 rounded border-2 truncate font-semibold ${categoryColors[event.category] || categoryColors.OTHER}`}
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
        <div className="rounded-xl border-2 p-6" style={{backgroundColor: 'var(--surface)', borderColor: 'var(--accent)'}}>
          <h3 className="text-xl font-bold mb-4" style={{color: 'var(--text)'}}>Events This Month</h3>
          {events.length === 0 ? (
            <p className="text-center py-4" style={{color: 'var(--muted)'}}>No events this month.</p>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {events.map((event, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border-2 ${categoryColors[event.category] || categoryColors.OTHER} hover:shadow-md transition-shadow`}
                >
                  <p className="font-bold text-sm mb-1">{event.title}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span>📅</span>
                    <span>{event.eventDate}</span>
                  </div>
                  {event.startTime && (
                    <div className="flex items-center gap-2 text-xs mt-1">
                      <span>🕐</span>
                      <span>{event.startTime}{event.endTime ? ` - ${event.endTime}` : ''}</span>
                    </div>
                  )}
                  {event.venue && (
                    <div className="flex items-center gap-2 text-xs mt-1">
                      <span>📍</span>
                      <span>{event.venue}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <Button variant="primary" fullWidth className="mt-4" onClick={() => setShowForm(true)}>
            + Add Event
          </Button>
        </div>
      </div>

      {/* Add Event Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" style={{backgroundColor: 'var(--surface)'}}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold" style={{color: 'var(--text)'}}>Add Event</h2>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{color: 'var(--text)'}}>Title *</label>
                  <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{color: 'var(--text)'}}>Description</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{color: 'var(--text)'}}>Event Date *</label>
                    <input type="date" value={formData.eventDate} onChange={(e) => setFormData({...formData, eventDate: e.target.value})} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{color: 'var(--text)'}}>Category</label>
                    <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      {eventCategories.map(c => <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{color: 'var(--text)'}}>Start Time</label>
                    <input type="time" value={formData.startTime} onChange={(e) => setFormData({...formData, startTime: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{color: 'var(--text)'}}>End Time</label>
                    <input type="time" value={formData.endTime} onChange={(e) => setFormData({...formData, endTime: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{color: 'var(--text)'}}>Venue</label>
                  <input type="text" value={formData.venue} onChange={(e) => setFormData({...formData, venue: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{color: 'var(--text)'}}>Organizer</label>
                    <input type="text" value={formData.organizer} onChange={(e) => setFormData({...formData, organizer: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{color: 'var(--text)'}}>Max Participants</label>
                    <input type="number" value={formData.maxParticipants} onChange={(e) => setFormData({...formData, maxParticipants: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">Create Event</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
