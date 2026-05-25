import React, { useState, useEffect } from 'react';
import StatCard from '../components/common/StatCard';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import Button from '../components/common/Button';
import analyticsService from '../features/analytics/analyticsService';

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [complaints, setComplaints] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryData, revenueData, complaintsData] = await Promise.all([
        analyticsService.getSummary(),
        analyticsService.getRevenue(),
        analyticsService.getComplaints()
      ]);
      setSummary(summaryData);
      setRevenue(revenueData);
      setComplaints(complaintsData);
    } catch (err) {
      setError(err.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold" style={{color: 'var(--text)'}}>Analytics Dashboard</h1>
          <p className="mt-2" style={{color: 'var(--muted)'}}>Comprehensive insights and performance metrics</p>
        </div>
        <LoadingSkeleton count={4} type="card" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold" style={{color: 'var(--text)'}}>Analytics Dashboard</h1>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
      </div>
    );
  }

  const totalRevenue = summary?.totalRevenue ?? summary?.totalFeeCollected ?? 0;
  const occupancyRate = summary?.occupancyRate ?? 0;
  const totalStudents = summary?.totalStudents ?? 0;
  const openComplaints = summary?.openComplaints ?? 0;
  const resolvedComplaints = summary?.resolvedComplaints ?? 0;
  const totalRooms = summary?.totalRooms ?? 0;
  const occupiedRooms = summary?.occupiedRooms ?? 0;

  // Revenue chart data
  const monthlyRevenue = Array.isArray(revenue?.monthlyRevenue) ? revenue.monthlyRevenue : (Array.isArray(revenue) ? revenue : []);

  // Complaints breakdown
  const complaintsByCategory = complaints?.byCategory ? Object.entries(complaints.byCategory) : [];
  const totalComplaintCount = complaintsByCategory.reduce((sum, [, count]) => sum + count, 0) || 1;

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
          value={totalRevenue}
          icon="💰"
          color="green"
        />
        <StatCard
          title="Room Occupancy"
          value={`${occupancyRate}%`}
          icon="🏠"
          color="blue"
          subtitle={`${occupiedRooms}/${totalRooms} rooms`}
        />
        <StatCard
          title="Active Students"
          value={totalStudents}
          icon="👥"
          color="purple"
        />
        <StatCard
          title="Open Complaints"
          value={openComplaints}
          icon="🔔"
          color="red"
          subtitle={`${resolvedComplaints} resolved`}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Chart */}
        <div className="rounded-xl border-2 p-6 hover:shadow-lg transition-shadow" style={{backgroundColor: 'var(--surface)', borderColor: 'var(--accent)'}}>
          <h2 className="text-lg font-bold mb-4" style={{color: 'var(--text)'}}>Monthly Revenue Trend</h2>
          {monthlyRevenue.length === 0 ? (
            <p className="text-center py-8" style={{color: 'var(--muted)'}}>No revenue data available.</p>
          ) : (
            <div className="h-64 flex items-end gap-3 p-4 rounded-lg" style={{backgroundColor: 'var(--background)'}}>
              {monthlyRevenue.map((item, idx) => {
                const amount = item.amount ?? item.total ?? 0;
                const label = item.month ?? item.label ?? `M${idx + 1}`;
                const maxAmount = Math.max(...monthlyRevenue.map(d => d.amount ?? d.total ?? 0), 1);
                const height = (amount / maxAmount) * 100;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-lg transition-all hover:shadow-lg hover:from-blue-600 hover:to-blue-500 cursor-pointer"
                      style={{ height: `${height}%`, minHeight: '20px' }}
                      title={`₹${amount.toLocaleString()}`}
                    ></div>
                    <span className="text-xs font-semibold" style={{color: 'var(--muted)'}}>{label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Complaints Breakdown */}
        <div className="rounded-xl border-2 p-6 hover:shadow-lg transition-shadow" style={{backgroundColor: 'var(--surface)', borderColor: 'var(--accent)'}}>
          <h2 className="text-lg font-bold mb-4" style={{color: 'var(--text)'}}>Complaint Types Distribution</h2>
          {complaintsByCategory.length === 0 ? (
            <p className="text-center py-8" style={{color: 'var(--muted)'}}>No complaint data available.</p>
          ) : (
            <div className="space-y-4">
              {complaintsByCategory.map(([type, count], idx) => {
                const percentage = Math.round((count / totalComplaintCount) * 100);
                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium" style={{color: 'var(--text)'}}>{type}</span>
                      <span className="text-sm font-bold" style={{color: 'var(--accent)'}}>{count} issues</span>
                    </div>
                    <div className="w-full rounded-full h-2.5 overflow-hidden" style={{backgroundColor: 'var(--background)'}}>
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-400 h-full rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl p-6 border-2" style={{backgroundColor: 'var(--surface)', backgroundImage: 'linear-gradient(135deg, rgba(34,197,94,0.1) 0%, rgba(34,197,94,0.03) 100%)', borderColor: 'var(--success)'}}>
          <h3 className="text-sm font-semibold mb-2" style={{color: 'var(--text)'}}>Total Students</h3>
          <p className="text-3xl font-bold" style={{color: 'var(--success)'}}>{totalStudents}</p>
          <p className="text-sm mt-2" style={{color: 'var(--muted)'}}>Registered students</p>
        </div>
        <div className="rounded-xl p-6 border-2" style={{backgroundColor: 'var(--surface)', backgroundImage: 'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(245,158,11,0.03) 100%)', borderColor: 'var(--warning)'}}>
          <h3 className="text-sm font-semibold mb-2" style={{color: 'var(--text)'}}>Occupancy Rate</h3>
          <p className="text-3xl font-bold" style={{color: 'var(--warning)'}}>{occupancyRate}%</p>
          <p className="text-sm mt-2" style={{color: 'var(--muted)'}}>Current occupancy</p>
        </div>
        <div className="rounded-xl p-6 border-2" style={{backgroundColor: 'var(--surface)', backgroundImage: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(59,130,246,0.03) 100%)', borderColor: 'var(--accent)'}}>
          <h3 className="text-sm font-semibold mb-2" style={{color: 'var(--text)'}}>Resolved Issues</h3>
          <p className="text-3xl font-bold" style={{color: 'var(--accent)'}}>{resolvedComplaints}</p>
          <p className="text-sm mt-2" style={{color: 'var(--muted)'}}>Total resolved</p>
        </div>
      </div>
    </div>
  );
}
