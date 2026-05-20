import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalStudents: 0, activeStudents: 0, totalRooms: 0, occupiedRooms: 0,
    totalRevenue: 0, pendingPayments: 0, totalComplaints: 0, resolvedComplaints: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        setStats({
          totalStudents: 245, activeStudents: 238, totalRooms: 120, occupiedRooms: 115,
          totalRevenue: 125000, pendingPayments: 8500, totalComplaints: 23, resolvedComplaints: 18
        });
        setRecentActivities([
          { id: 1, action: 'New student registered', details: 'John Doe joined Room 101', time: '2 hours ago', icon: '👤' },
          { id: 2, action: 'Payment received', details: '₹2,500 from Jane Smith', time: '4 hours ago', icon: '💰' },
          { id: 3, action: 'Complaint resolved', details: 'Room maintenance issue fixed', time: '6 hours ago', icon: '✅' },
          { id: 4, action: 'Attendance marked', details: 'Evening attendance completed', time: '8 hours ago', icon: '📝' },
          { id: 5, action: 'New notice posted', details: 'Hostel rules updated', time: '1 day ago', icon: '📢' }
        ]);
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const notices = [
    { id: 1, title: 'Hostel Maintenance Schedule', date: 'Today', message: 'Electrical maintenance in Block A from 2-4 PM.', priority: 'high' },
    { id: 2, title: 'Fee Payment Deadline', date: 'Tomorrow', message: 'Monthly fee deadline approaching. Pay before 25th.', priority: 'medium' },
    { id: 3, title: 'Sports Event Registration', date: '25 Feb 2025', message: 'Inter-hostel cricket tournament registration open.', priority: 'low' }
  ];

  const quickActions = [
    { title: 'Mark Attendance', icon: '📝', path: '/attendance' },
    { title: 'Record Payment', icon: '💰', path: '/fees' },
    { title: 'View Reports', icon: '📊', path: '/reports' },
    { title: 'Manage Rooms', icon: '🏠', path: '/rooms' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-3 text-sm text-[var(--text-secondary)]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const complaintsProgress = stats.totalComplaints === 0 ? 0 : (stats.resolvedComplaints / stats.totalComplaints) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--accent)]">Dashboard</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-xs text-[var(--text-secondary)]">Last updated</p>
          <p className="text-sm font-semibold">{new Date().toLocaleTimeString()}</p>
        </div>
      </div>

      {/* Stats Grid - responsive: 1 col mobile, 2 col tablet, 4 col desktop */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <Card className="p-4 sm:p-5 hover:scale-[1.02] transition-transform" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, transparent 100%)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)]">Total Students</p>
              <p className="text-2xl sm:text-3xl font-bold mt-1">{stats.totalStudents}</p>
              <p className="text-xs text-green-500 mt-1">+12% from last month</p>
            </div>
            <div className="stat-icon" style={{ background: 'rgba(59,130,246,0.15)' }}>
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 hover:scale-[1.02] transition-transform" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, transparent 100%)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)]">Room Occupancy</p>
              <p className="text-2xl sm:text-3xl font-bold mt-1">{stats.occupiedRooms}/{stats.totalRooms}</p>
              <p className="text-xs text-blue-500 mt-1">{Math.round((stats.occupiedRooms/stats.totalRooms)*100)}% occupied</p>
            </div>
            <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)' }}>
              <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 hover:scale-[1.02] transition-transform" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, transparent 100%)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)]">Monthly Revenue</p>
              <p className="text-2xl sm:text-3xl font-bold mt-1">₹{stats.totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-green-500 mt-1">+8% from last month</p>
            </div>
            <div className="stat-icon" style={{ background: 'rgba(139,92,246,0.15)' }}>
              <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 hover:scale-[1.02] transition-transform" style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.08) 0%, transparent 100%)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)]">Pending Payments</p>
              <p className="text-2xl sm:text-3xl font-bold mt-1">₹{stats.pendingPayments.toLocaleString()}</p>
              <p className="text-xs text-red-500 mt-1">5 students pending</p>
            </div>
            <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.15)' }}>
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Recent Activities */}
        <Card className="lg:col-span-2 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Activities</h2>
            <button className="text-sm text-[var(--accent)] hover:underline">View All</button>
          </div>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] hover:shadow-sm transition-shadow">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-base flex-shrink-0" style={{ background: 'rgba(59,130,246,0.1)' }}>
                  {activity.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{activity.action}</p>
                  <p className="text-xs text-[var(--text-secondary)] truncate">{activity.details}</p>
                </div>
                <span className="text-[10px] text-[var(--text-secondary)] whitespace-nowrap flex-shrink-0">{activity.time}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions + Complaints */}
        <div className="space-y-4 lg:space-y-6">
          <Card className="p-4 sm:p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => navigate(action.path)}
                  className="p-3 sm:p-4 rounded-xl text-center bg-[var(--bg-primary)] border border-[var(--border-color)] hover:shadow-md hover:scale-105 active:scale-95 transition-all"
                >
                  <div className="text-2xl mb-1">{action.icon}</div>
                  <div className="text-xs font-medium">{action.title}</div>
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-4 sm:p-6">
            <h2 className="text-lg font-semibold mb-3">Complaints Status</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-secondary)]">Total</span>
                <span className="font-semibold">{stats.totalComplaints}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-secondary)]">Resolved</span>
                <span className="font-semibold text-green-500">{stats.resolvedComplaints}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-secondary)]">Pending</span>
                <span className="font-semibold text-red-500">{stats.totalComplaints - stats.resolvedComplaints}</span>
              </div>
              <div className="progress-track mt-3">
                <div className="progress-fill" style={{ width: `${complaintsProgress}%` }} />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Notice Board */}
      <Card className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Important Notices</h2>
          <button onClick={() => navigate('/notice')} className="text-sm text-[var(--accent)] hover:underline">View All</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {notices.map((notice) => {
            const borderColor = notice.priority === 'high' ? 'var(--danger)' : notice.priority === 'medium' ? 'var(--warning)' : 'var(--accent)';
            const pillBg = notice.priority === 'high' ? 'rgba(239,68,68,0.12)' : notice.priority === 'medium' ? 'rgba(245,158,11,0.12)' : 'rgba(59,130,246,0.12)';
            const pillColor = notice.priority === 'high' ? 'var(--danger)' : notice.priority === 'medium' ? 'var(--warning)' : 'var(--accent)';
            return (
              <div key={notice.id} className="p-3 sm:p-4 rounded-xl bg-[var(--bg-primary)]" style={{ borderLeft: `4px solid ${borderColor}` }}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-medium text-sm leading-tight">{notice.title}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: pillBg, color: pillColor }}>
                    {notice.priority}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mb-2 line-clamp-2">{notice.message}</p>
                <p className="text-[10px] text-[var(--text-secondary)]">{notice.date}</p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
