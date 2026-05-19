import React, { useState } from 'react';
import NoticeForm from '../features/notice/components/NoticeForm';
import NoticeList from '../features/notice/components/NoticeList';

export default function Notice() {
  const [editingNotice, setEditingNotice] = useState(null);

  const handleEditNotice = (notice) => {
    setEditingNotice(notice);
  };

  const handleCloseForm = () => {
    setEditingNotice(null);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold" style={{color: 'var(--text)'}}>Notices</h1>
        <p className="mt-2" style={{color: 'var(--muted)'}}>Publish announcements and keep students informed.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-3xl border overflow-hidden p-6" style={{backgroundColor: 'var(--surface)', borderColor: 'var(--accent)', borderOpacity: 0.2}}>
          <NoticeForm notice={editingNotice} onClose={handleCloseForm} />
        </div>
        <div className="rounded-3xl border overflow-hidden p-6" style={{backgroundColor: 'var(--surface)', borderColor: 'var(--accent)', borderOpacity: 0.2}}>
          <NoticeList onEdit={handleEditNotice} />
        </div>
      </div>
    </div>
  );
}
