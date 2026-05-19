import React, { useState, useEffect } from 'react';
import StatCard from '../components/common/StatCard';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import Button from '../components/common/Button';

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('month');
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setAnalyticsData({
        revenue: {
          current: 95000,
          previous: 82000,
          growth: 15.85
        },
        occupancy: {
          current: 115,
          total: 120,
          percentage: 95.8
        },
        students: {
          new: 12,
          graduated: 5,
          active: 238
        },
        complaints: {
          open: 8,
          resolved: 45,
          avgResolutionTime: '2.5 days'
        },
        monthlyRevenue: [
          { month: 'Jan', amount: 78000 },
          { month: 'Feb', amount: 82000 },
          { month: 'Mar', amount: 88000 },
          { month: 'Apr', amount: 92000 },
          { month: 'May', amount: 95000 }
        ],
        topComplaints: [
          { type: 'Maintenance', count: 15, percentage: 33 },
          { type: 'Cleanliness', count: 12, percentage: 27 },
          { type: 'Noise', count: 10, percentage: 22 },
          { type: 'Others', count: 8, percentage: 18 }
        ]
      });
      setLoading(false);
    }, 800);
  }, [timeRange]);

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton count={4} type="card" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with time range */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold" style={{color: 'var(--text)'}}>Analytics Dashboard</h1>
          <p className="mt-2" style={{color: 'var(--muted)'}}>Comprehensive insights and performance metrics</p>
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={analyticsData.revenue.current}
          icon="💰"
          color="green"
          trend={{
            isPositive: true,
            percentage: analyticsData.revenue.growth,
            label: 'vs last month'
          }}
        />
        <StatCard
          title="Room Occupancy"
          value={analyticsData.occupancy.percentage}
          icon="🏠"
          color="blue"
          subtitle={`${analyticsData.occupancy.current}/${analyticsData.occupancy.total} rooms`}
        />
        <StatCard
          title="Active Students"
          value={analyticsData.students.active}
          icon="👥"
          color="purple"
          trend={{
            isPositive: true,
            percentage: 5,
            label: 'new this month'
          }}
        />
        <StatCard
          title="Complaints"
          value={analyticsData.complaints.open}
          icon="🔔"
          color="red"
          subtitle={`${analyticsData.complaints.resolved} resolved`}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Chart */}
        <div className="rounded-xl border-2 p-6 hover:shadow-lg transition-shadow" style={{backgroundColor: 'var(--surface)', borderColor: 'var(--accent)', borderOpacity: 0.2}}>
          <h2 className="text-lg font-bold mb-4" style={{color: 'var(--text)'}}>Monthly Revenue Trend</h2>
          <div className="h-64 flex items-end gap-3 p-4 rounded-lg" style={{backgroundColor: 'var(--background)'}}>
            {analyticsData.monthlyRevenue.map((item, idx) => {
              const maxAmount = Math.max(...analyticsData.monthlyRevenue.map(d => d.amount));
              const height = (item.amount / maxAmount) * 100;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-lg transition-all hover:shadow-lg hover:from-blue-600 hover:to-blue-500 cursor-pointer"
                    style={{ height: `${height}%`, minHeight: '20px' }}
                    title={`₹${item.amount.toLocaleString()}`}
                  ></div>
                  <span className="text-xs font-semibold" style={{color: 'var(--muted)'}}>{item.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Complaints Breakdown */}
        <div className="rounded-xl border-2 p-6 hover:shadow-lg transition-shadow" style={{backgroundColor: 'var(--surface)', borderColor: 'var(--accent)', borderOpacity: 0.2}}>
          <h2 className="text-lg font-bold mb-4" style={{color: 'var(--text)'}}>Complaint Types Distribution</h2>
          <div className="space-y-4">
            {analyticsData.topComplaints.map((item, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium" style={{color: 'var(--text)'}}>{item.type}</span>
                  <span className="text-sm font-bold" style={{color: 'var(--accent)'}}>{item.count} issues</span>
                </div>
                <div className="w-full rounded-full h-2.5 overflow-hidden" style={{backgroundColor: 'var(--background)'}}>
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-400 h-full rounded-full transition-all"
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl p-6 border-2" style={{backgroundColor: 'var(--surface)', backgroundImage: 'linear-gradient(135deg, rgba(34,197,94,0.1) 0%, rgba(34,197,94,0.03) 100%)', borderColor: 'var(--success)', borderOpacity: 0.3}}>
          <h3 className="text-sm font-semibold mb-2" style={{color: 'var(--text)'}}>New Admissions</h3>
          <p className="text-3xl font-bold" style={{color: 'var(--success)'}}>{analyticsData.students.new}</p>
          <p className="text-sm mt-2" style={{color: 'var(--muted)'}}>This month</p>
        </div>
        <div className="rounded-xl p-6 border-2" style={{backgroundColor: 'var(--surface)', backgroundImage: 'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(245,158,11,0.03) 100%)', borderColor: 'var(--warning)', borderOpacity: 0.3}}>
          <h3 className="text-sm font-semibold mb-2" style={{color: 'var(--text)'}}>Avg. Resolution Time</h3>
          <p className="text-3xl font-bold" style={{color: 'var(--warning)'}}>{analyticsData.complaints.avgResolutionTime}</p>
          <p className="text-sm mt-2" style={{color: 'var(--muted)'}}>For complaints</p>
        </div>
        <div className="rounded-xl p-6 border-2" style={{backgroundColor: 'var(--surface)', backgroundImage: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(59,130,246,0.03) 100%)', borderColor: 'var(--accent)', borderOpacity: 0.3}}>
          <h3 className="text-sm font-semibold mb-2" style={{color: 'var(--text)'}}>Resolved Issues</h3>
          <p className="text-3xl font-bold" style={{color: 'var(--accent)'}}>{analyticsData.complaints.resolved}</p>
          <p className="text-sm mt-2" style={{color: 'var(--muted)'}}>This month</p>
        </div>
      </div>
    </div>
  );
}
