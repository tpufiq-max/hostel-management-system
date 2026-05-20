import React, { useState } from 'react';
import Card from '../components/common/Card';

const mealSchedule = [
  { meal: 'Breakfast', time: '7:30 AM - 9:00 AM', menu: 'Poha, Bread, Eggs, Tea/Coffee' },
  { meal: 'Lunch', time: '12:30 PM - 2:00 PM', menu: 'Rice, Dal, Sabji, Roti, Salad' },
  { meal: 'Snacks', time: '4:30 PM - 5:30 PM', menu: 'Samosa, Tea/Coffee' },
  { meal: 'Dinner', time: '7:30 PM - 9:00 PM', menu: 'Rice, Dal, Sabji, Roti, Sweet' },
];

export default function Mess() {
  const [selectedDay, setSelectedDay] = useState('Monday');
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--accent)]">Mess Management</h1>
        <p className="text-sm text-[var(--text-secondary)]">Manage meal schedules and mess operations</p>
      </div>

      {/* Day Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {days.map(day => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${selectedDay === day ? 'bg-blue-600 text-white' : 'bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:bg-[var(--bg-primary)]'}`}
          >
            {day.slice(0, 3)}
          </button>
        ))}
      </div>

      {/* Meal Schedule */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {mealSchedule.map((item, i) => (
          <Card key={i} className="p-4 sm:p-5">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-sm">{item.meal}</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">{item.time}</span>
            </div>
            <p className="text-sm text-[var(--text-secondary)] mt-2">{item.menu}</p>
          </Card>
        ))}
      </div>

      {/* Monthly Bill Summary */}
      <Card className="p-4 sm:p-6">
        <h2 className="text-lg font-semibold mb-4">Monthly Bill Summary</h2>
        <div className="grid grid-cols-1 xs:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-[var(--bg-primary)] text-center">
            <p className="text-xs text-[var(--text-secondary)]">Meal Charges</p>
            <p className="text-lg font-bold mt-1">₹3,000</p>
          </div>
          <div className="p-3 rounded-xl bg-[var(--bg-primary)] text-center">
            <p className="text-xs text-[var(--text-secondary)]">Extra Items</p>
            <p className="text-lg font-bold mt-1">₹450</p>
          </div>
          <div className="p-3 rounded-xl bg-[var(--bg-primary)] text-center">
            <p className="text-xs text-[var(--text-secondary)]">Total Bill</p>
            <p className="text-lg font-bold text-[var(--accent)] mt-1">₹3,450</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
