import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/common/StatCard';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

export default function DashboardEnhanced() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setStats({
        totalStudents: { value: 245, trend: { isPositive: true, percentage: 12, label: 'from last month' } },
        activeStudents: { value: 238, trend: { isPositive: true, percentage: 8, label: 'this month' } },
        totalRooms: { value: 120, trend: null },
        occupiedRooms: { value: 115, trend: { isPositive: true, percentage: 5, label: 'this month' } },
        totalRevenue: { value: 125000, trend: { isPositive: true, percentage: 8, label: 'growth' } },
        pendingPayments: { value: 8500, trend: { isPositive: false, percentage: 3, label: 'increase' } }
      });

      setActivities([
        { id: 1, type: 'success', title: 'Payment Received', desc: '₹2,500 from Jane Smith', time: '2 hours ago', icon: '💰' },
        { id: 2, type: 'info', title: 'New Student', desc: 'John Doe registered', time: '4 hours ago', icon: '👤' },
        { id: 3, type: 'success', title: 'Issue Resolved', desc: 'Room maintenance completed', time: '6 hours ago', icon: '✅' },
        { id: 4, type: 'warning', title: 'Pending Fee', desc: 'Neha Singh - Room 215', time: '8 hours ago', icon: '⚠️' },
        { id: 5, type: 'info', title: 'Event Added', desc: 'Sports day scheduled', time: '1 day ago', icon: '📅' }
      ]);

      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  if (loading || !stats) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton count={4} type="card" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Welcome Back! 👋</h1>
            <p className="text-blue-100">Here's your hostel management summary for today</p>
          </div>
          <div className="text-6xl opacity-20">🏢</div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Total Students"
            value={stats.totalStudents.value}
            icon="👥"
            color="blue"
            trend={stats.totalStudents.trend}
          />
          <StatCard
            title="Active Students"
            value={stats.activeStudents.value}
            icon="✓"
            color="green"
            trend={stats.activeStudents.trend}
          />
          <StatCard
            title="Room Occupancy"
            value={115}
            icon="🏠"
            color="purple"
            subtitle="out of 120 rooms"
          />
          <StatCard
            title="Monthly Revenue"
            value={stats.totalRevenue.value}
            icon="💰"
            color="green"
            trend={stats.totalRevenue.trend}
          />
          <StatCard
            title="Pending Payments"
            value={stats.pendingPayments.value}
            icon="⚠️"
            color="red"
            trend={stats.pendingPayments.trend}
          />
          <StatCard
            title="Open Complaints"
            value={8}
            icon="🔔"
            color="yellow"
            subtitle="5 resolved this month"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button 
            variant="primary" 
            fullWidth 
            onClick={() => navigate('/attendance')}
            className="h-auto py-4"
          >
            📝 Mark Attendance
          </Button>
          <Button 
            variant="secondary" 
            fullWidth 
            onClick={() => navigate('/fees')}
            className="h-auto py-4"
          >
            💳 Process Payment
          </Button>
          <Button 
            variant="secondary" 
            fullWidth 
            onClick={() => navigate('/analytics')}
            className="h-auto py-4"
          >
            📊 View Analytics
          </Button>
          <Button 
            variant="secondary" 
            fullWidth 
            onClick={() => navigate('/maintenance')}
            className="h-auto py-4"
          >
            🔧 Check Maintenance
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-[var(--bg-secondary)] rounded-xl border-2 border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Activities</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/reports')}>
              View All →
            </Button>
          </div>

          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors border-l-4 border-transparent hover:border-blue-500"
              >
                <div className="text-2xl flex-shrink-0">{activity.icon}</div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{activity.desc}</p>
                </div>
                <div className="text-xs text-gray-500 flex-shrink-0 text-right">
                  {activity.time}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications & Alerts */}
        <div className="bg-[var(--bg-secondary)] rounded-xl border-2 border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Alerts & Notices</h2>

          <div className="space-y-3">
            {/* Critical Alert */}
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <span className="text-xl">🔴</span>
                <div>
                  <p className="font-bold text-red-900 text-sm">Urgent</p>
                  <p className="text-xs text-red-700 mt-1">5 pending fee collections</p>
                </div>
              </div>
            </div>

            {/* Warning Alert */}
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <span className="text-xl">⚠️</span>
                <div>
                  <p className="font-bold text-yellow-900 text-sm">Maintenance</p>
                  <p className="text-xs text-yellow-700 mt-1">3 pending maintenance issues</p>
                </div>
              </div>
            </div>

            {/* Info Alert */}
            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <span className="text-xl">ℹ️</span>
                <div>
                  <p className="font-bold text-blue-900 text-sm">Upcoming</p>
                  <p className="text-xs text-blue-700 mt-1">Sports day - May 25, 2024</p>
                </div>
              </div>
            </div>
          </div>

          <Button variant="primary" fullWidth className="mt-4">
            📢 View All Notices
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-300">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-green-700">Fees Collected</p>
              <p className="text-3xl font-bold text-green-900 mt-2">85%</p>
              <p className="text-xs text-green-700 mt-2">of monthly target</p>
            </div>
            <Badge text="On Track" variant="success" icon="✓" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-300">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-700">Occupancy Rate</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">96%</p>
              <p className="text-xs text-blue-700 mt-2">115 of 120 rooms</p>
            </div>
            <Badge text="Excellent" variant="primary" icon="⭐" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border-2 border-purple-300">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-purple-700">Satisfaction</p>
              <p className="text-3xl font-bold text-purple-900 mt-2">4.2/5</p>
              <p className="text-xs text-purple-700 mt-2">Based on feedback</p>
            </div>
            <Badge text="Good" variant="purple" glowing />
          </div>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="bg-gray-50 rounded-xl border-2 border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Today's Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-600">12</p>
            <p className="text-sm text-gray-600">New Registrations</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">₹45K</p>
            <p className="text-sm text-gray-600">Fees Collected</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-600">3</p>
            <p className="text-sm text-gray-600">Issues Resolved</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-orange-600">2</p>
            <p className="text-sm text-gray-600">Events Scheduled</p>
          </div>
        </div>
      </div>
    </div>
  );
}
