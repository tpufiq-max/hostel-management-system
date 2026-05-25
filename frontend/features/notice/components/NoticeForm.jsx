import React, { useState } from 'react';
import noticeService from '../noticeService';

const categories = ['GENERAL', 'ACADEMIC', 'HOSTEL', 'EMERGENCY', 'EVENT'];
const priorities = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];
const audiences = ['ALL', 'STUDENTS', 'STAFF', 'WARDENS'];

export default function NoticeForm({ notice, onClose, onSaved }) {
  const [formData, setFormData] = useState({
    title: notice?.title || '',
    content: notice?.content || '',
    category: notice?.category || 'GENERAL',
    priority: notice?.priority || 'NORMAL',
    targetAudience: notice?.targetAudience || 'ALL',
    expiresAt: notice?.expiresAt || ''
  });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      if (notice && notice.id) {
        await noticeService.update(notice.id, formData);
      } else {
        await noticeService.create(formData);
      }
      if (onSaved) onSaved();
      if (onClose) onClose();
    } catch (err) {
      setError(err.message || 'Failed to save notice');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4" style={{color: 'var(--text)'}}>
        {notice ? 'Edit Notice' : 'Create New Notice'}
      </h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2" style={{color: 'var(--text)'}}>
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Enter notice title"
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium mb-2" style={{color: 'var(--text)'}}>
            Content *
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Enter notice content"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-2" style={{color: 'var(--text)'}}>
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium mb-2" style={{color: 'var(--text)'}}>
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              {priorities.map(p => (
                <option key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="targetAudience" className="block text-sm font-medium mb-2" style={{color: 'var(--text)'}}>
              Target Audience
            </label>
            <select
              id="targetAudience"
              name="targetAudience"
              value={formData.targetAudience}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              {audiences.map(a => (
                <option key={a} value={a}>{a.charAt(0) + a.slice(1).toLowerCase()}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="expiresAt" className="block text-sm font-medium mb-2" style={{color: 'var(--text)'}}>
              Expires At
            </label>
            <input
              type="datetime-local"
              id="expiresAt"
              name="expiresAt"
              value={formData.expiresAt}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
          >
            {notice ? 'Update Notice' : 'Publish Notice'}
          </button>
        </div>
      </form>
    </div>
  );
}
