import React, { useState, useEffect } from 'react';
import LoadingSkeleton from '../../../components/common/LoadingSkeleton';
import noticeService from '../noticeService';

export default function NoticeList({ onEdit, refreshKey }) {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotices = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await noticeService.list();
      setNotices(result.items || []);
    } catch (err) {
      setError(err.message || 'Failed to load notices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [refreshKey]);

  const handleDeleteNotice = async (id) => {
    try {
      await noticeService.remove(id);
      fetchNotices();
    } catch (err) {
      setError(err.message || 'Failed to delete notice');
    }
  };

  if (loading) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4" style={{color: 'var(--text)'}}>Recent Notices</h2>
        <LoadingSkeleton count={3} type="card" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4" style={{color: 'var(--text)'}}>Recent Notices</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {notices.map((notice) => (
          <div key={notice.id} className="rounded-lg p-4 hover:shadow-md transition-shadow" style={{backgroundColor: 'var(--background)'}}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-lg font-medium" style={{color: 'var(--text)'}}>{notice.title}</h3>
                {notice.category && (
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 font-medium">
                    {notice.category}
                  </span>
                )}
              </div>
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
            <p className="text-sm mb-2" style={{color: 'var(--muted)'}}>{notice.content}</p>
            <div className="flex gap-3 text-xs" style={{color: 'var(--muted)'}}>
              {notice.publishedAt && <span>{notice.publishedAt}</span>}
              {notice.priority && <span className="font-semibold">{notice.priority}</span>}
            </div>
          </div>
        ))}
      </div>

      {notices.length === 0 && !error && (
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium" style={{color: 'var(--text)'}}>No notices</h3>
          <p className="mt-1 text-sm" style={{color: 'var(--muted)'}}>Create your first notice to get started.</p>
        </div>
      )}
    </div>
  );
}
