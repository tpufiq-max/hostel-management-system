import React, { useState } from 'react';

const initialNotices = [
  { id: 1, title: 'Welcome to Hostel', content: 'Welcome message for new students.', date: '2023-10-01' },
  { id: 2, title: 'Maintenance Schedule', content: 'Water supply will be off tomorrow.', date: '2023-10-02' },
  { id: 3, title: 'Event Reminder', content: 'Annual fest starts next week.', date: '2023-10-03' },
];

export default function NoticeList({ onEdit }) {
  const [notices, setNotices] = useState(initialNotices);

  const handleDeleteNotice = (id) => {
    setNotices(notices.filter(n => n.id !== id));
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Notices</h2>
      <div className="space-y-4">
        {notices.map((notice) => (
          <div key={notice.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-medium text-gray-900">{notice.title}</h3>
              <div className="flex gap-2">
                {onEdit && (
                  <button
                    onClick={() => onEdit(notice)}
                    className="text-blue-600 hover:text-blue-900 text-sm"
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={() => handleDeleteNotice(notice.id)}
                  className="text-red-600 hover:text-red-900 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-2">{notice.content}</p>
            <span className="text-xs text-gray-500">{notice.date}</span>
          </div>
        ))}
      </div>
      {notices.length === 0 && (
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No notices</h3>
          <p className="mt-1 text-sm text-gray-500">Create your first notice to get started.</p>
        </div>
      )}
    </div>
  );
}
