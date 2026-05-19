import React from 'react';

const reportCards = [
  { title: 'Occupancy Rate', value: '84%', detail: '12 of 14 rooms occupied' },
  { title: 'Fee Collection', value: '$9,800', detail: '92% collected this month' },
  { title: 'Pending Complaints', value: '3', detail: 'Open issues this week' },
  { title: 'Visitor Count', value: '18', detail: 'Today so far' },
];

export default function Reports() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{color: 'var(--text)'}}>Reports</h1>
        <p className="mt-2" style={{color: 'var(--muted)'}}>Get quick insights into hostel operations and performance.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {reportCards.map((card) => (
          <div key={card.title} className="rounded-3xl border p-6 hover:shadow-md transition-shadow" style={{backgroundColor: 'var(--surface)', borderColor: 'var(--accent)', borderOpacity: 0.2}}>
            <h2 className="text-sm font-semibold uppercase tracking-wide" style={{color: 'var(--accent)'}}>{card.title}</h2>
            <p className="mt-4 text-4xl font-bold" style={{color: 'var(--text)'}}>{card.value}</p>
            <p className="mt-2 text-sm" style={{color: 'var(--muted)'}}>{card.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
