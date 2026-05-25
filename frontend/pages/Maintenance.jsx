import React, { useState, useEffect } from 'react';
import Button from '../components/common/Button';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import maintenanceService from '../features/maintenance/maintenanceService';

const categories = ['PLUMBING', 'ELECTRICAL', 'FURNITURE', 'CLEANING', 'OTHER'];
const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const statusFilters = [
  { key: 'all', label: 'All Requests' },
  { key: 'OPEN', label: 'Open' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'COMPLETED', label: 'Completed' },
];

export default function Maintenance() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    roomNumber: '',
    priority: 'MEDIUM',
    category: 'PLUMBING'
  });

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filter !== 'all') params.status = filter;
      const result = await maintenanceService.list(params);
      setRequests(result.items || []);
    } catch (err) {
      setError(err.message || 'Failed to load maintenance requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const handleAddRequest = async () => {
    if (!newRequest.title || !newRequest.roomNumber) return;
    try {
      await maintenanceService.create({
        ...newRequest,
        status: 'OPEN',
        reportedBy: 'Current User',
        reportedDate: new Date().toISOString().split('T')[0]
      });
      setNewRequest({ title: '', description: '', roomNumber: '', priority: 'MEDIUM', category: 'PLUMBING' });
      setShowForm(false);
      fetchRequests();
    } catch (err) {
      setError(err.message || 'Failed to create request');
    }
  };

  const handleUpdateStatus = async (request, newStatus) => {
    try {
      await maintenanceService.update(request.id, { ...request, status: newStatus });
      setUpdatingId(null);
      fetchRequests();
    } catch (err) {
      setError(err.message || 'Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'OPEN': return 'bg-red-100 text-red-800 border-red-300';
      case 'IN_PROGRESS':
      case 'ASSIGNED': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-300';
      case 'REJECTED': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'HIGH':
      case 'CRITICAL': return 'text-red-700 bg-red-50';
      case 'MEDIUM': return 'text-yellow-700 bg-yellow-50';
      case 'LOW': return 'text-green-700 bg-green-50';
      default: return 'text-gray-700 bg-gray-50';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'OPEN': return 'Open';
      case 'IN_PROGRESS': return 'In Progress';
      case 'COMPLETED': return 'Completed';
      case 'ASSIGNED': return 'Assigned';
      case 'REJECTED': return 'Rejected';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold" style={{color: 'var(--text)'}}>Maintenance Requests</h1>
          <p className="mt-2" style={{color: 'var(--muted)'}}>Track and manage maintenance issues</p>
        </div>
        <LoadingSkeleton count={4} type="card" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold" style={{color: 'var(--text)'}}>Maintenance Requests</h1>
          <p className="mt-2" style={{color: 'var(--muted)'}}>Track and manage maintenance issues</p>
        </div>
        <Button variant="primary" onClick={() => setShowForm(!showForm)}>
          + New Request
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* New Request Form */}
      {showForm && (
        <div className="border-2 rounded-xl p-6 space-y-4" style={{backgroundColor: 'var(--surface)', borderColor: 'var(--accent)'}}>
          <h2 className="text-xl font-bold" style={{color: 'var(--text)'}}>Report New Issue</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Issue Title"
              value={newRequest.title}
              onChange={(e) => setNewRequest({...newRequest, title: e.target.value})}
              className="px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Room Number"
              value={newRequest.roomNumber}
              onChange={(e) => setNewRequest({...newRequest, roomNumber: e.target.value})}
              className="px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
            />
            <select
              value={newRequest.category}
              onChange={(e) => setNewRequest({...newRequest, category: e.target.value})}
              className="px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat.charAt(0) + cat.slice(1).toLowerCase()}</option>
              ))}
            </select>
            <select
              value={newRequest.priority}
              onChange={(e) => setNewRequest({...newRequest, priority: e.target.value})}
              className="px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
            >
              {priorities.map(p => (
                <option key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</option>
              ))}
            </select>
          </div>
          <textarea
            placeholder="Describe the issue in detail..."
            value={newRequest.description}
            onChange={(e) => setNewRequest({...newRequest, description: e.target.value})}
            rows="3"
            className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
          ></textarea>
          <div className="flex gap-2">
            <Button variant="primary" onClick={handleAddRequest}>
              Submit Request
            </Button>
            <Button variant="ghost" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {statusFilters.map(({ key, label }) => (
          <Button
            key={key}
            variant={filter === key ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setFilter(key)}
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {requests.length === 0 ? (
          <div className="text-center py-12 rounded-xl border-2" style={{backgroundColor: 'var(--surface)', borderColor: 'var(--accent)'}}>
            <p style={{color: 'var(--muted)'}}>No maintenance requests found</p>
          </div>
        ) : (
          requests.map(request => (
            <div
              key={request.id}
              className="border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
              style={{backgroundColor: 'var(--surface)'}}
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold" style={{color: 'var(--text)'}}>{request.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getStatusColor(request.status)}`}>
                      {getStatusLabel(request.status)}
                    </span>
                  </div>
                  <p style={{color: 'var(--muted)'}} className="mb-3">{request.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div>
                      <span style={{color: 'var(--muted)'}}>Room:</span>
                      <span className="ml-1 font-semibold" style={{color: 'var(--text)'}}>{request.roomNumber}</span>
                    </div>
                    <div>
                      <span style={{color: 'var(--muted)'}}>Category:</span>
                      <span className="ml-1 font-semibold" style={{color: 'var(--text)'}}>{request.category}</span>
                    </div>
                    <div>
                      <span style={{color: 'var(--muted)'}}>Priority:</span>
                      <span className={`ml-1 font-semibold px-2 py-1 rounded ${getPriorityColor(request.priority)}`}>
                        {request.priority}
                      </span>
                    </div>
                    <div>
                      <span style={{color: 'var(--muted)'}}>Reported:</span>
                      <span className="ml-1 font-semibold" style={{color: 'var(--text)'}}>{request.reportedDate}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {request.assignedTo && (
                    <div className="text-sm mb-2">
                      <p style={{color: 'var(--muted)'}}>Assigned to</p>
                      <p className="font-semibold" style={{color: 'var(--text)'}}>{request.assignedTo}</p>
                    </div>
                  )}
                  {updatingId === request.id ? (
                    <div className="flex flex-col gap-1">
                      {['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED'].map(s => (
                        <button
                          key={s}
                          onClick={() => handleUpdateStatus(request, s)}
                          className={`text-xs px-3 py-1 rounded border ${s === request.status ? 'bg-blue-100 border-blue-300 font-bold' : 'border-gray-300 hover:bg-gray-100'}`}
                        >
                          {getStatusLabel(s)}
                        </button>
                      ))}
                      <button onClick={() => setUpdatingId(null)} className="text-xs text-gray-500 mt-1">Cancel</button>
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => setUpdatingId(request.id)}>
                      Update Status
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
