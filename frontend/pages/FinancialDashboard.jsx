import React, { useState } from 'react';
import Button from '../components/common/Button';

export default function FinancialDashboard() {
  const [timeRange, setTimeRange] = useState('month');

  const financialData = {
    totalRevenue: 95000,
    totalExpenses: 28000,
    netIncome: 67000,
    outstandingFees: 12500,
    recentTransactions: [
      { id: 1, type: 'income', description: 'Monthly fees from Room 101', amount: 8000, date: '2024-05-18', status: 'completed' },
      { id: 2, type: 'expense', description: 'Electricity bill', amount: 5000, date: '2024-05-17', status: 'completed' },
      { id: 3, type: 'income', description: 'Monthly fees from Room 205', amount: 8000, date: '2024-05-16', status: 'completed' },
      { id: 4, type: 'expense', description: 'Water supply charges', amount: 3000, date: '2024-05-16', status: 'completed' },
      { id: 5, type: 'income', description: 'Monthly fees from Room 310', amount: 8000, date: '2024-05-15', status: 'pending' },
    ],
    expenseBreakdown: [
      { category: 'Utilities', amount: 10000, percentage: 35 },
      { category: 'Maintenance', amount: 8000, percentage: 28 },
      { category: 'Staff Salary', amount: 7000, percentage: 25 },
      { category: 'Supplies', amount: 3000, percentage: 12 }
    ],
    pendingPayments: [
      { studentName: 'Neha Singh (Room 215)', amount: 5000, daysOverdue: 5 },
      { studentName: 'Vikram Das (Room 115)', amount: 2500, daysOverdue: 2 },
      { studentName: 'Others', amount: 5000, daysOverdue: 0 }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold" style={{color: 'var(--text)'}}>Financial Dashboard</h1>
          <p className="mt-2" style={{color: 'var(--muted)'}}>Revenue, expenses, and financial overview</p>
        </div>
        <div className="flex gap-2">
          {['week', 'month', 'year'].map(range => (
            <Button
              key={range}
              variant={timeRange === range ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="border-2 rounded-xl p-6" style={{backgroundColor: 'var(--surface)', backgroundImage: 'linear-gradient(135deg, rgba(34,197,94,0.1) 0%, rgba(34,197,94,0.03) 100%)', borderColor: 'var(--success)', borderOpacity: 0.3}}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold" style={{color: 'var(--success)'}}>Total Revenue</p>
              <p className="text-4xl font-bold" style={{color: 'var(--text)'}}>₹{financialData.totalRevenue.toLocaleString()}</p>
              <p className="text-xs mt-2" style={{color: 'var(--muted)'}}>+8% from last period</p>
            </div>
            <div className="text-5xl opacity-30">💰</div>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="border-2 rounded-xl p-6" style={{backgroundColor: 'var(--surface)', backgroundImage: 'linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(239,68,68,0.03) 100%)', borderColor: 'var(--danger)', borderOpacity: 0.3}}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold" style={{color: 'var(--danger)'}}>Total Expenses</p>
              <p className="text-4xl font-bold" style={{color: 'var(--text)'}}>₹{financialData.totalExpenses.toLocaleString()}</p>
              <p className="text-xs mt-2" style={{color: 'var(--muted)'}}>-3% from last period</p>
            </div>
            <div className="text-5xl opacity-30">💸</div>
          </div>
        </div>

        {/* Net Income */}
        <div className="border-2 rounded-xl p-6" style={{backgroundColor: 'var(--surface)', backgroundImage: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(59,130,246,0.03) 100%)', borderColor: 'var(--accent)', borderOpacity: 0.3}}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold" style={{color: 'var(--accent)'}}>Net Income</p>
              <p className="text-4xl font-bold" style={{color: 'var(--text)'}}>₹{financialData.netIncome.toLocaleString()}</p>
              <p className="text-xs mt-2" style={{color: 'var(--muted)'}}>Profit margin: 70%</p>
            </div>
            <div className="text-5xl opacity-30">📈</div>
          </div>
        </div>

        {/* Outstanding Fees */}
        <div className="border-2 rounded-xl p-6" style={{backgroundColor: 'var(--surface)', backgroundImage: 'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(245,158,11,0.03) 100%)', borderColor: 'var(--warning)', borderOpacity: 0.3}}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold" style={{color: 'var(--warning)'}}>Outstanding Fees</p>
              <p className="text-4xl font-bold" style={{color: 'var(--text)'}}>₹{financialData.outstandingFees.toLocaleString()}</p>
              <p className="text-xs mt-2" style={{color: 'var(--muted)'}}>From 3 students</p>
            </div>
            <div className="text-5xl opacity-30">⚠️</div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 rounded-xl border-2 p-6" style={{backgroundColor: 'var(--surface)', borderColor: 'var(--accent)', borderOpacity: 0.2}}>
          <h2 className="text-lg font-bold mb-4" style={{color: 'var(--text)'}}>Recent Transactions</h2>
          <div className="space-y-3">
            {financialData.recentTransactions.map(transaction => (
              <div
                key={transaction.id}
                className={`flex items-center justify-between p-4 rounded-lg border-2`}
                style={{
                  backgroundColor: 'var(--background)',
                  borderColor: transaction.type === 'income' ? 'var(--success)' : 'var(--danger)',
                  borderOpacity: 0.2
                }}
              >
                <div className="flex-1">
                  <p className="font-bold" style={{color: 'var(--text)'}}>
                    {transaction.description}
                  </p>
                  <p className="text-sm" style={{color: 'var(--muted)'}}>
                    {transaction.date} • {transaction.status === 'pending' ? '⏳ Pending' : '✓ Completed'}
                  </p>
                </div>
                <p className="text-xl font-bold" style={{color: transaction.type === 'income' ? 'var(--success)' : 'var(--danger)'}}>
                  {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Payments */}
        <div className="rounded-xl border-2 p-6" style={{backgroundColor: 'var(--surface)', borderColor: 'var(--accent)', borderOpacity: 0.2}}>
          <h2 className="text-lg font-bold mb-4" style={{color: 'var(--text)'}}>Pending Collections</h2>
          <div className="space-y-3">
            {financialData.pendingPayments.map((payment, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border-2`}
                style={{
                  backgroundColor: 'var(--background)',
                  borderColor: payment.daysOverdue > 3 ? 'var(--danger)' : payment.daysOverdue > 0 ? 'var(--warning)' : 'var(--accent)',
                  borderOpacity: 0.2
                }}
              >
                <p className="font-bold text-sm text-gray-900">{payment.studentName}</p>
                <p className="text-xl font-bold mt-2 text-gray-900">₹{payment.amount.toLocaleString()}</p>
                {payment.daysOverdue > 0 && (
                  <p className={`text-xs font-semibold mt-1 ${
                    payment.daysOverdue > 3 ? 'text-red-700' : 'text-yellow-700'
                  }`}>
                    ⚠️ {payment.daysOverdue} days overdue
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Expense Breakdown */}
      <div className="bg-[var(--bg-secondary)] rounded-xl border-2 border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Expense Breakdown</h2>
        <div className="space-y-4">
          {financialData.expenseBreakdown.map((expense, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-700">{expense.category}</span>
                <span className="font-bold text-gray-900">₹{expense.amount.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-400 h-full rounded-full transition-all"
                  style={{ width: `${expense.percentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500">{expense.percentage}% of total expenses</p>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button variant="primary" fullWidth>📋 Generate Report</Button>
        <Button variant="secondary" fullWidth>💾 Export Data</Button>
        <Button variant="secondary" fullWidth>📧 Send Reminders</Button>
        <Button variant="secondary" fullWidth>⚙️ Settings</Button>
      </div>
    </div>
  );
}
