import React, { useState, useEffect } from 'react';
import Card from '../components/common/Card';
import { Search, Plus, Filter, X, IndianRupee } from 'lucide-react';
import feeService from '../services/feeService';

const fallbackFees = [
  { id: 1, studentName: 'John Doe', rollNumber: '2024001', amount: 5000, dueDate: '2025-03-25', paymentDate: '2025-03-20', paymentStatus: 'PAID', feeType: 'HOSTEL', paymentMethod: 'UPI' },
  { id: 2, studentName: 'Jane Smith', rollNumber: '2024002', amount: 5000, dueDate: '2025-03-25', paymentDate: null, paymentStatus: 'PENDING', feeType: 'HOSTEL', paymentMethod: null },
  { id: 3, studentName: 'Mike Johnson', rollNumber: '2024003', amount: 3000, dueDate: '2025-03-15', paymentDate: null, paymentStatus: 'OVERDUE', feeType: 'MESS', paymentMethod: null },
  { id: 4, studentName: 'Emily Davis', rollNumber: '2024004', amount: 5000, dueDate: '2025-03-25', paymentDate: '2025-03-22', paymentStatus: 'PAID', feeType: 'HOSTEL', paymentMethod: 'Card' },
  { id: 5, studentName: 'Chris Wilson', rollNumber: '2024005', amount: 2000, dueDate: '2025-03-20', paymentDate: null, paymentStatus: 'PENDING', feeType: 'MAINTENANCE', paymentMethod: null },
];

export default function Fees() {
  const [fees, setFees] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await feeService.getAll(0, 50);
        const data = response?.data || response;
        const list = data?.content || data || [];
        setFees(list.length > 0 ? list : fallbackFees);
      } catch {
        setFees(fallbackFees);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = fees.filter(f => {
    const matchSearch = f.studentName.toLowerCase().includes(search.toLowerCase()) || f.rollNumber.includes(search);
    const matchFilter = filter === 'ALL' || f.paymentStatus === filter;
    return matchSearch && matchFilter;
  });

  const getStatusBadge = (status) => {
    const styles = {
      PAID: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      OVERDUE: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return `px-2 py-0.5 rounded-full text-[10px] font-medium ${styles[status] || styles.PENDING}`;
  };

  const totalCollected = fees.filter(f => f.paymentStatus === 'PAID').reduce((acc, f) => acc + f.amount, 0);
  const totalPending = fees.filter(f => f.paymentStatus !== 'PAID').reduce((acc, f) => acc + f.amount, 0);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--accent)]">Fees Management</h1>
          <p className="text-sm text-[var(--text-secondary)]">Track and manage student payments</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-medium self-start sm:self-auto">
          <Plus size={16} /> Record Payment
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 xs:grid-cols-3 gap-3">
        <Card className="p-4 text-center">
          <p className="text-xs text-[var(--text-secondary)]">Total Collected</p>
          <p className="text-xl font-bold text-green-600 mt-1">₹{totalCollected.toLocaleString()}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-xs text-[var(--text-secondary)]">Pending Amount</p>
          <p className="text-xl font-bold text-orange-600 mt-1">₹{totalPending.toLocaleString()}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-xs text-[var(--text-secondary)]">Total Records</p>
          <p className="text-xl font-bold mt-1">{fees.length}</p>
        </Card>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
          <input type="text" placeholder="Search by student name or roll..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {['ALL', 'PAID', 'PENDING', 'OVERDUE'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${filter === f ? 'bg-blue-600 text-white' : 'bg-[var(--bg-secondary)] border border-[var(--border-color)]'}`}>
              {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Table */}
      <Card className="hidden md:block overflow-hidden">
        <div className="table-responsive">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-[var(--bg-primary)]">
                <th className="text-left px-4 py-3 font-medium text-[var(--text-secondary)]">Student</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--text-secondary)]">Type</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--text-secondary)]">Amount</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--text-secondary)] hidden lg:table-cell">Due Date</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--text-secondary)] hidden lg:table-cell">Method</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--text-secondary)]">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(fee => (
                <tr key={fee.id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-primary)] transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium">{fee.studentName}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{fee.rollNumber}</p>
                  </td>
                  <td className="px-4 py-3 text-xs">{fee.feeType}</td>
                  <td className="px-4 py-3 font-semibold">₹{fee.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs hidden lg:table-cell">{fee.dueDate}</td>
                  <td className="px-4 py-3 text-xs hidden lg:table-cell">{fee.paymentMethod || '—'}</td>
                  <td className="px-4 py-3"><span className={getStatusBadge(fee.paymentStatus)}>{fee.paymentStatus}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Mobile Card Layout */}
      <div className="md:hidden space-y-3">
        {filtered.map(fee => (
          <Card key={fee.id} className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-sm">{fee.studentName}</p>
                <p className="text-xs text-[var(--text-secondary)]">{fee.rollNumber} • {fee.feeType}</p>
              </div>
              <span className={getStatusBadge(fee.paymentStatus)}>{fee.paymentStatus}</span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-lg font-bold">₹{fee.amount.toLocaleString()}</p>
              <p className="text-xs text-[var(--text-secondary)]">Due: {fee.dueDate}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-[var(--bg-secondary)] rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[var(--border-color)]">
              <h3 className="text-lg font-semibold">Record Payment</h3>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-[var(--bg-primary)]"><X size={18} /></button>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1">Student</label>
                <select className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-sm outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Select student</option>
                  {fees.map(f => <option key={f.id}>{f.studentName}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1">Amount (₹)</label>
                  <input type="number" className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Method</label>
                  <select className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-sm outline-none focus:ring-2 focus:ring-blue-500">
                    <option>UPI</option><option>Card</option><option>Cash</option><option>Bank Transfer</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-[var(--border-color)] text-sm font-medium">Cancel</button>
                <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">Record Payment</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
