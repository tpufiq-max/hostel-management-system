import React, { useState } from 'react';
import Modal from '../components/common/Modal';
import Card from '../components/common/Card';

const initialRooms = [
  { id: 1, number: '101', type: 'Single', capacity: 1, status: 'Available', floor: '1st' },
  { id: 2, number: '102', type: 'Double', capacity: 2, status: 'Occupied', floor: '1st' },
  { id: 3, number: '201', type: 'Triple', capacity: 3, status: 'Available', floor: '2nd' },
  { id: 4, number: '202', type: 'Dormitory', capacity: 8, status: 'Maintenance', floor: '2nd' },
];

export default function Rooms() {
  const [rooms, setRooms] = useState(initialRooms);
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({
    number: '', type: 'Single', capacity: 1, status: 'Available', floor: '1st'
  });

  const handleAddRoom = () => {
    setEditingRoom(null);
    setFormData({ number: '', type: 'Single', capacity: 1, status: 'Available', floor: '1st' });
    setShowForm(true);
  };

  const handleEditRoom = (room) => {
    setEditingRoom(room);
    setFormData(room);
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingRoom) {
      setRooms(rooms.map(r => r.id === editingRoom.id ? { ...formData, id: editingRoom.id } : r));
    } else {
      setRooms([...rooms, { ...formData, id: Date.now() }]);
    }
    setShowForm(false);
  };

  const handleDeleteRoom = (id) => {
    setRooms(rooms.filter(r => r.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{color: 'var(--text)'}}>Rooms</h1>
          <p className="mt-2" style={{color: 'var(--muted)'}}>Manage room inventory and availability.</p>
        </div>
        <button
          onClick={handleAddRoom}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Room
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {rooms.map((room) => (
          <Card key={room.id} className="p-6 hover:shadow-lg hover:scale-105 transition-all" style={{backgroundColor: 'var(--surface)'}}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-wide" style={{color: 'var(--accent)'}}>Room {room.number}</p>
                <h2 className="mt-1 text-xl font-semibold" style={{color: 'var(--text)'}}>{room.type}</h2>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditRoom(room)}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  aria-label={`Edit room ${room.number}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDeleteRoom(room.id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  aria-label={`Delete room ${room.number}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span style={{color: 'var(--muted)'}}>Capacity:</span>
                <span className="font-medium" style={{color: 'var(--text)'}}>{room.capacity}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{color: 'var(--muted)'}}>Floor:</span>
                <span className="font-medium" style={{color: 'var(--text)'}}>{room.floor}</span>
              </div>
            </div>
            <div className="mt-4">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                room.status === 'Available' ? 'bg-green-100 text-green-700' :
                room.status === 'Occupied' ? 'bg-blue-100 text-blue-700' :
                'bg-amber-100 text-amber-700'
              }`}>
                {room.status}
              </span>
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editingRoom ? 'Edit Room' : 'Add New Room'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Room Number</label>
            <input
              type="text"
              value={formData.number}
              onChange={(e) => setFormData({...formData, number: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value, capacity: e.target.value === 'Single' ? 1 : e.target.value === 'Double' ? 2 : e.target.value === 'Triple' ? 3 : 8})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Single">Single</option>
              <option value="Double">Double</option>
              <option value="Triple">Triple</option>
              <option value="Dormitory">Dormitory</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Floor</label>
            <select
              value={formData.floor}
              onChange={(e) => setFormData({...formData, floor: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Ground">Ground</option>
              <option value="1st">1st Floor</option>
              <option value="2nd">2nd Floor</option>
              <option value="3rd">3rd Floor</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Available">Available</option>
              <option value="Occupied">Occupied</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              {editingRoom ? 'Update' : 'Add'} Room
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
