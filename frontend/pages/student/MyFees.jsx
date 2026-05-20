import React from 'react';
import Card from '../../components/common/Card';
import { IndianRupee, Download, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function MyFees() {
  const fees = [
    { id: 1, type: 'Hostel Fees', amount: 5000, dueDate: '2025-03-25', paymentDate: '2025-03-20', paymentStatus: 'PAID', method: 'UPI', txnId: 'TXN123456' },
    { id: 2, type: 'Mess Fees', amount: 3000, dueDate: '2025-03-25', paymentDate: '2025-03-20', paymentStatus: 'PAID', method: 'UPI', txnId: 'TXN123457' },
    { id: 3, type: 'Maintenance', amount: 1000, dueDate: '2025-04-25', paymentDate: null, paymentStatus: 'PENDING', method: null, txnId: null },
  ];

  const totalPaid = fees.filter(f => f.paymentStatus === 'PAID').reduce((s, f) => s + f.amount, 0);
  const totalPending = fees.filter(f => f.paymentStatus !== 'PAID').reduce((s, f) => s + f.amount, 0);

  const StatusIcon = ({ status }) => {
    if (status === 'PAID') return <CheckCircle size={14} className="text-green-600" />;
    if (status === 'PENDING') return <Clock size={14} className="text-yellow-600" />;
    return <AlertCircle size={14} className="text-red-600" />;
  };

  const getStatusBadge = (status) => {
    const styles = {
      PAID: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      OVERDUE: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return `px-2 py-0.5 rounded-full text-[10px] font-medium ${styles[status] || styles.PENDING}`;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--accent)]">My Fees</h1>
        <p className="text-sm text-[var(--text-secondary)]">View your fee payments and history</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 xs:grid-cols-3 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs text-green-600 mb-1">
            <CheckCircle size={14} /> Paid
          </div>
          <p className="text-xl font-bold text-green-600">₹{totalPaid.toLocaleString()}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs text-yellow-600 mb-1">
            <Clock size={14} /> Pending
          </div>
          <p className="text-xl font-bold text-yellow-600">₹{totalPending.toLocaleString()}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs text-blue-600 mb-1">
            <IndianRupee size={14} /> Total
          </div>
          <p className="text-xl font-bold">₹{(totalPaid + totalPending).toLocaleString()}</p>
        </Card>
      </div>

      {/* Desktop Table */}
      <Card className="hidden md:block overflow-hidden">
        <div className="table-responsive">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-[var(--bg-primary)]">
                <th className="text-left px-4 py-3 font-medium text-[var(--text-secondary)]">Fee Type</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--text-secondary)]">Amount</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--text-secondary)]">Due Date</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--text-secondary)]">Payment</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--text-secondary)]">Status</th>
                <th className="text-right px-4 py-3 font-medium text-[var(--text-secondary)]">Action</th>
              </tr>
            </thead>
            <tbody>
              {fees.map(fee => (
                <tr key={fee.id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-primary)]">
                  <td className="px-4 py-3 font-medium">{fee.type}</td>
                  <td className="px-4 py-3 font-semibold">₹{fee.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs">{fee.dueDate}</td>
                  <td className="px-4 py-3 text-xs">{fee.paymentDate || '—'} {fee.method && `(${fee.method})`}</td>
                  <td className="px-4 py-3"><span className={getStatusBadge(fee.paymentStatus)}>{fee.paymentStatus}</span></td>
                  <td className="px-4 py-3 text-right">
                    {fee.paymentStatus === 'PAID' ? (
                      <button className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600">
                        <Download size={14} />
                      </button>
                    ) : (
                      <button className="px-3 py-1.5 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                        Pay Now
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {fees.map(fee => (
          <Card key={fee.id} className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <StatusIcon status={fee.paymentStatus} />
                <p className="font-medium text-sm">{fee.type}</p>
              </div>
              <span className={getStatusBadge(fee.paymentStatus)}>{fee.paymentStatus}</span>
            </div>
            <p className="text-xl font-bold mt-1">₹{fee.amount.toLocaleString()}</p>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-[var(--text-secondary)]">
              <div>Due: <span className="font-medium text-[var(--text-primary)]">{fee.dueDate}</span></div>
              {fee.paymentDate && <div>Paid: <span className="font-medium text-[var(--text-primary)]">{fee.paymentDate}</span></div>}
            </div>
            <div className="mt-3 flex gap-2">
              {fee.paymentStatus === 'PAID' ? (
                <button className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-primary)]">
                  <Download size={12} /> Receipt
                </button>
              ) : (
                <button className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700">
                  Pay Now
                </button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
