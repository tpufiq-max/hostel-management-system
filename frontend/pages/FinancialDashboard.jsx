import React from 'react';
import Card from '../components/common/Card';
import { TrendingUp, TrendingDown, IndianRupee } from 'lucide-react';

export default function FinancialDashboard() {
  const income = [
    { source: 'Hostel Fees', amount: 612500, percentage: 65 },
    { source: 'Mess Charges', amount: 187500, percentage: 20 },
    { source: 'Security Deposits', amount: 93750, percentage: 10 },
    { source: 'Other', amount: 46875, percentage: 5 },
  ];

  const expenses = [
    { category: 'Staff Salaries', amount: 250000, percentage: 45 },
    { category: 'Maintenance', amount: 110000, percentage: 20 },
    { category: 'Utilities', amount: 83000, percentage: 15 },
    { category: 'Food & Mess', amount: 110000, percentage: 20 },
  ];

  const totalIncome = income.reduce((s, i) => s + i.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--accent)]">Financial Dashboard</h1>
        <p className="text-sm text-[var(--text-secondary)]">Revenue and expenditure overview</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 xs:grid-cols-3 gap-3 sm:gap-4">
        <Card className="p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-green-500" />
            <span className="text-xs text-[var(--text-secondary)]">Total Income</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-green-600">₹{(totalIncome/100000).toFixed(1)}L</p>
        </Card>
        <Card className="p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown size={16} className="text-red-500" />
            <span className="text-xs text-[var(--text-secondary)]">Total Expenses</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-red-600">₹{(totalExpenses/100000).toFixed(1)}L</p>
        </Card>
        <Card className="p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-2">
            <IndianRupee size={16} className="text-blue-500" />
            <span className="text-xs text-[var(--text-secondary)]">Net Profit</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-blue-600">₹{((totalIncome-totalExpenses)/100000).toFixed(1)}L</p>
        </Card>
      </div>

      {/* Income & Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <Card className="p-4 sm:p-6">
          <h2 className="text-lg font-semibold mb-4 text-green-600">Income Breakdown</h2>
          <div className="space-y-3">
            {income.map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{item.source}</span>
                  <span className="font-medium">₹{item.amount.toLocaleString()}</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--bg-primary)] overflow-hidden">
                  <div className="h-full rounded-full bg-green-500" style={{ width: `${item.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <h2 className="text-lg font-semibold mb-4 text-red-600">Expense Breakdown</h2>
          <div className="space-y-3">
            {expenses.map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{item.category}</span>
                  <span className="font-medium">₹{item.amount.toLocaleString()}</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--bg-primary)] overflow-hidden">
                  <div className="h-full rounded-full bg-red-500" style={{ width: `${item.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
