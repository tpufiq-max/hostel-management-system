import React, { useState, useEffect } from 'react';
import Card from '../components/common/Card';
import { Search, Plus, BedDouble, Users, X } from 'lucide-react';
import roomService from '../services/roomService';

const fallbackRooms = [
  { id: 1, roomNumber: '101', capacity: 2, occupied: 2, block: 'A', floor: 1, type: 'DOUBLE', status: 'OCCUPIED', monthlyRent: 5000 },
  { id: 2, roomNumber: '102', capacity: 2, occupied: 1, block: 'A', floor: 1, type: 'DOUBLE', status: 'AVAILABLE', monthlyRent: 5000 },
  { id: 3, roomNumber: '103', capacity: 3, occupied: 3, block: 'A', floor: 1, type: 'TRIPLE', status: 'OCCUPIED', monthlyRent: 4000 },
  { id: 4, roomNumber: '104', capacity: 2, occupied: 0, block: 'A', floor: 1, type: 'DOUBLE', status: 'MAINTENANCE', monthlyRent: 5000 },
  { id: 5, roomNumber: '201', capacity: 1, occupied: 1, block: 'A', floor: 2, type: 'SINGLE', status: 'OCCUPIED', monthlyRent: 7000 },
  { id: 6, roomNumber: '202', capacity: 2, occupied: 0, block: 'A', floor: 2, type: 'DOUBLE', status: 'AVAILABLE', monthlyRent: 5000 },
  { id: 7, roomNumber: '203', capacity: 3, occupied: 2, block: 'B', floor: 2, type: 'TRIPLE', status: 'AVAILABLE', monthlyRent: 4000 },
  { id: 8, roomNumber: '301', capacity: 2, occupied: 0, block: 'B', floor: 3, type: 'DOUBLE', status: 'AVAILABLE', monthlyRent: 5000 },
];

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await roomService.getAll(0, 50);
        const data = response?.data || response;
        const list = data?.content || data || [];
        setRooms(list.length > 0 ? list : fallbackRooms);
      } catch {
        setRooms(fallbackRooms);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = rooms.filter(r => {
    const matchesSearch = r.roomNumber.includes(search) || r.block.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'ALL' || r.status === filter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    const colors = {
      AVAILABLE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      OCCUPIED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      MAINTENANCE: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      RESERVED: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    };
    return colors[status] || colors.AVAILABLE;
  };

  const stats = {
    total: rooms.length,
    available: rooms.filter(r => r.status === 'AVAILABLE').length,
    occupied: rooms.filter(r => r.status === 'OCCUPIED').length,
    maintenance: rooms.filter(r => r.status === 'MAINTENANCE').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--accent)]">Rooms</h1>
          <p className="text-sm text-[var(--text-secondary)]">Manage hostel rooms and allocations</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium self-start sm:self-auto"
        >
          <Plus size={16} /> Add Room
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 sm:p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
          <p className="text-xs text-[var(--text-secondary)]">Total Rooms</p>
          <p className="text-xl font-bold mt-1">{stats.total}</p>
        </div>
        <div className="p-3 sm:p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
          <p className="text-xs text-green-600">Available</p>
          <p className="text-xl font-bold mt-1 text-green-600">{stats.available}</p>
        </div>
        <div className="p-3 sm:p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
          <p className="text-xs text-blue-600">Occupied</p>
          <p className="text-xl font-bold mt-1 text-blue-600">{stats.occupied}</p>
        </div>
        <div className="p-3 sm:p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
          <p className="text-xs text-orange-600">Maintenance</p>
          <p className="text-xl font-bold mt-1 text-orange-600">{stats.maintenance}</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
          <input
            type="text"
            placeholder="Search by room number or block..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {['ALL', 'AVAILABLE', 'OCCUPIED', 'MAINTENANCE'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                filter === f ? 'bg-blue-600 text-white' : 'bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:bg-[var(--bg-primary)]'
              }`}
            >
              {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Room Grid - responsive */}
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {filtered.map(room => (
          <Card key={room.id} className="p-4 hover:scale-[1.02] transition-transform">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <BedDouble size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-sm">Room {room.roomNumber}</p>
                  <p className="text-[10px] text-[var(--text-secondary)]">Block {room.block} • Floor {room.floor}</p>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(room.status)}`}>
                {room.status}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-[var(--text-secondary)]">Type</span>
                <span className="font-medium">{room.type}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[var(--text-secondary)]">Occupancy</span>
                <span className="font-medium">{room.occupied}/{room.capacity}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[var(--text-secondary)]">Rent</span>
                <span className="font-medium">₹{room.monthlyRent.toLocaleString()}/mo</span>
              </div>
            </div>

            {/* Occupancy bar */}
            <div className="mt-3">
              <div className="h-1.5 rounded-full bg-[var(--border-color)] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    room.occupied === room.capacity ? 'bg-red-500' : room.occupied > 0 ? 'bg-blue-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${(room.occupied / room.capacity) * 100}%` }}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <BedDouble size={48} className="mx-auto text-[var(--text-secondary)] opacity-50" />
          <p className="text-lg font-medium text-[var(--text-secondary)] mt-3">No rooms found</p>
        </div>
      )}

      {/* Add Room Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-[var(--bg-secondary)] rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[var(--border-color)]">
              <h3 className="text-lg font-semibold">Add Room</h3>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-[var(--bg-primary)]"><X size={18} /></button>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1">Room Number</label>
                  <input className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Capacity</label>
                  <input type="number" className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Block</label>
                  <input className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Floor</label>
                  <input type="number" className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Monthly Rent (₹)</label>
                <input type="number" className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-[var(--border-color)] text-sm font-medium">Cancel</button>
                <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">Create Room</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
