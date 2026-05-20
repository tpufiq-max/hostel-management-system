import React from 'react';
import Card from '../components/common/Card';

export default function Analytics() {
  const stats = [
    { label: 'Occupancy Rate', value: '96%', change: '+2%', color: 'blue' },
    { label: 'Fee Collection Rate', value: '87%', change: '+5%', color: 'green' },
    { label: 'Attendance Rate', value: '92%', change: '-1%', color: 'purple' },
    { label: 'Complaint Resolution', value: '78%', change: '+12%', color: 'orange' },
  ];

  const monthlyData = [
    { month: 'Jan', students: 220, revenue: 110000 },
    { month: 'Feb', students: 228, revenue: 114000 },
    { month: 'Mar', students: 235, revenue: 117500 },
    { month: 'Apr', students: 240, revenue: 120000 },
    { month: 'May', students: 245, revenue: 125000 },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--accent)]">Analytics</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Hostel performance overview and trends</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="p-4 sm:p-5">
            <p className="text-xs text-[var(--text-secondary)]">{stat.label}</p>
            <p className="text-2xl sm:text-3xl font-bold mt-1">{stat.value}</p>
            <p className={`text-xs mt-1 ${stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
              {stat.change} from last month
            </p>
          </Card>
        ))}
      </div>

      {/* Charts placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <Card className="p-4 sm:p-6">
          <h3 className="text-lg font-semibold mb-4">Student Growth</h3>
          <div className="space-y-3">
            {monthlyData.map((d, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-[var(--text-secondary)] w-8">{d.month}</span>
                <div className="flex-1 h-6 bg-[var(--bg-primary)] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all"
                    style={{ width: `${(d.students / 250) * 100}%` }} />
                </div>
                <span className="text-xs font-medium w-8 text-right">{d.students}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
          <div className="space-y-3">
            {monthlyData.map((d, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-[var(--text-secondary)] w-8">{d.month}</span>
                <div className="flex-1 h-6 bg-[var(--bg-primary)] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all"
                    style={{ width: `${(d.revenue / 130000) * 100}%` }} />
                </div>
                <span className="text-xs font-medium w-16 text-right">₹{(d.revenue/1000).toFixed(0)}K</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Summary Table */}
      <Card className="p-4 sm:p-6">
        <h3 className="text-lg font-semibold mb-4">Monthly Summary</h3>
        <div className="table-responsive">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-color)]">
                <th className="text-left py-2 text-[var(--text-secondary)] font-medium">Month</th>
                <th className="text-right py-2 text-[var(--text-secondary)] font-medium">Students</th>
                <th className="text-right py-2 text-[var(--text-secondary)] font-medium">Revenue</th>
                <th className="text-right py-2 text-[var(--text-secondary)] font-medium hidden sm:table-cell">Growth</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((d, i) => (
                <tr key={i} className="border-b border-[var(--border-color)]">
                  <td className="py-2.5 font-medium">{d.month} 2025</td>
                  <td className="py-2.5 text-right">{d.students}</td>
                  <td className="py-2.5 text-right">₹{d.revenue.toLocaleString()}</td>
                  <td className="py-2.5 text-right text-green-500 hidden sm:table-cell">+{i > 0 ? Math.round(((d.students - monthlyData[i-1].students) / monthlyData[i-1].students) * 100) : 0}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
