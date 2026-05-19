import React, { useState } from 'react';
import Button from '../components/common/Button';

export default function Maintenance() {
  const [requests, setRequests] = useState([
    {
      id: 1,
      title: 'Leaking Faucet in Room 101',
      description: 'Water is leaking from the bathroom faucet',
      room: '101',
      priority: 'high',
      status: 'in-progress',
      reportedBy: 'Rahul Kumar',
      reportedDate: '2024-05-15',
      category: 'Plumbing',
      assignedTo: 'John - Maintenance Staff',
      daysOpen: 2
    },
    {
      id: 2,
      title: 'AC Not Cooling - Room 205',
      description: 'Air conditioner is running but not cooling properly',
      room: '205',
      priority: 'high',
      status: 'open',
      reportedBy: 'Priya Sharma',
      reportedDate: '2024-05-18',
      category: 'Electrical',
      assignedTo: null,
      daysOpen: 0
    },
    {
      id: 3,
      title: 'Broken Door Lock - Room 310',
      description: 'Main door lock is not working properly',
      room: '310',
      priority: 'medium',
      status: 'open',
      reportedBy: 'Aditya Patel',
      reportedDate: '2024-05-17',
      category: 'Hardware',
      assignedTo: null,
      daysOpen: 1
    },
    {
      id: 4,
      title: 'Light Bulb Replacement - Room 215',
      description: 'Two bulbs need to be replaced in the room',
      room: '215',
      priority: 'low',
      status: 'completed',
      reportedBy: 'Neha Singh',
      reportedDate: '2024-05-10',
      category: 'Electrical',
      assignedTo: 'Mike - Maintenance Staff',
      daysOpen: 8
    }
  ]);

  const [filter, setFilter] = useState('all');
  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    room: '',
    priority: 'medium',
    category: 'Plumbing'
  });
  const [showForm, setShowForm] = useState(false);

  const categories = ['Plumbing', 'Electrical', 'Hardware', 'Cleaning', 'Other'];
  const priorities = ['low', 'medium', 'high'];
  const statuses = ['open', 'in-progress', 'completed'];

  const filteredRequests = filter === 'all'
    ? requests
    : requests.filter(r => r.status === filter);

  const handleAddRequest = () => {
    if (newRequest.title && newRequest.room) {
      setRequests([
        {
          id: Math.max(...requests.map(r => r.id), 0) + 1,
          ...newRequest,
          status: 'open',
          reportedBy: 'Current User',
          reportedDate: new Date().toISOString().split('T')[0],
          assignedTo: null,
          daysOpen: 0
        },
        ...requests
      ]);
      setNewRequest({
        title: '',
        description: '',
        room: '',
        priority: 'medium',
        category: 'Plumbing'
      });
      setShowForm(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'open': return 'bg-red-100 text-red-800 border-red-300';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'completed': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'text-red-700 bg-red-50';
      case 'medium': return 'text-yellow-700 bg-yellow-50';
      case 'low': return 'text-green-700 bg-green-50';
      default: return 'text-gray-700 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold" style={{color: 'var(--text)'}}>Maintenance Requests</h1>
          <p className="mt-2" style={{color: 'var(--muted)'}}>Track and manage maintenance issues</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowForm(!showForm)}
        >
          + New Request
        </Button>
      </div>

      {/* New Request Form */}
      {showForm && (
        <div className="border-2 rounded-xl p-6 space-y-4" style={{backgroundColor: 'var(--surface)', backgroundImage: 'linear-gradient(135deg, rgba(59,130,246,0.05) 0%, rgba(59,130,246,0.02) 100%)', borderColor: 'var(--accent)', borderOpacity: 0.3}}>
          <h2 className="text-xl font-bold" style={{color: 'var(--text)'}}>Report New Issue</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Issue Title"
              value={newRequest.title}
              onChange={(e) => setNewRequest({...newRequest, title: e.target.value})}
              className="px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
            />
            <select
              value={newRequest.room}
              onChange={(e) => setNewRequest({...newRequest, room: e.target.value})}
              className="px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
            >
              <option value="">Select Room</option>
              {Array.from({length: 120}, (_, i) => (i + 101).toString()).map(room => (
                <option key={room} value={room}>{room}</option>
              ))}
            </select>
            <select
              value={newRequest.category}
              onChange={(e) => setNewRequest({...newRequest, category: e.target.value})}
              className="px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              value={newRequest.priority}
              onChange={(e) => setNewRequest({...newRequest, priority: e.target.value})}
              className="px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
            >
              {priorities.map(p => (
                <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
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
        {['all', 'open', 'in-progress', 'completed'].map(status => (
          <Button
            key={status}
            variant={filter === status ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setFilter(status)}
          >
            {status === 'all' ? 'All Requests' : status === 'in-progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        ))}
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-gray-200">
            <p className="text-gray-600">No maintenance requests found</p>
          </div>
        ) : (
          filteredRequests.map(request => (
            <div
              key={request.id}
              className="bg-[var(--bg-secondary)] border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{request.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getStatusColor(request.status)}`}>
                      {request.status === 'in-progress' ? '⏳ In Progress' : request.status === 'completed' ? '✓ Completed' : '🔴 Open'}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{request.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Room:</span>
                      <span className="ml-1 font-semibold text-gray-900">{request.room}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Category:</span>
                      <span className="ml-1 font-semibold text-gray-900">{request.category}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Priority:</span>
                      <span className={`ml-1 font-semibold px-2 py-1 rounded ${getPriorityColor(request.priority)}`}>
                        {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Reported:</span>
                      <span className="ml-1 font-semibold text-gray-900">{request.reportedDate}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {request.assignedTo && (
                    <div className="text-sm mb-2">
                      <p className="text-gray-500">Assigned to</p>
                      <p className="font-semibold text-gray-900">{request.assignedTo}</p>
                    </div>
                  )}
                  <Button variant="outline" size="sm">
                    Update Status
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
