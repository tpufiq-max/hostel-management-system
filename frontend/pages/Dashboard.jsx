import React, { useState, useEffect } from 'react';
import Card from '../components/common/Card';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    totalRooms: 0,
    occupiedRooms: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    totalComplaints: 0,
    resolvedComplaints: 0
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Simulate API calls
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock data - in real app, this would come from API
        setStats({
          totalStudents: 245,
          activeStudents: 238,
          totalRooms: 120,
          occupiedRooms: 115,
          totalRevenue: 125000,
          pendingPayments: 8500,
          totalComplaints: 23,
          resolvedComplaints: 18
        });

        setRecentActivities([
          {
            id: 1,
            type: 'student',
            action: 'New student registered',
            details: 'John Doe joined Room 101',
            time: '2 hours ago',
            icon: '👤'
          },
          {
            id: 2,
            type: 'payment',
            action: 'Payment received',
            details: '₹2,500 from Jane Smith',
            time: '4 hours ago',
            icon: '💰'
          },
          {
            id: 3,
            type: 'complaint',
            action: 'Complaint resolved',
            details: 'Room maintenance issue fixed',
            time: '6 hours ago',
            icon: '✅'
          },
          {
            id: 4,
            type: 'attendance',
            action: 'Attendance marked',
            details: 'Evening attendance completed',
            time: '8 hours ago',
            icon: '📝'
          },
          {
            id: 5,
            type: 'notice',
            action: 'New notice posted',
            details: 'Hostel rules updated',
            time: '1 day ago',
            icon: '📢'
          }
        ]);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const notices = [
    {
      id: 1,
      title: 'Hostel Maintenance Schedule',
      date: 'Today',
      message: 'Electrical maintenance will be conducted in Block A from 2-4 PM. Please cooperate.',
      priority: 'high'
    },
    {
      id: 2,
      title: 'Fee Payment Deadline',
      date: 'Tomorrow',
      message: 'Monthly fee payment deadline is approaching. Pay before 25th to avoid late fees.',
      priority: 'medium'
    },
    {
      id: 3,
      title: 'Sports Event Registration',
      date: '25 Feb 2025',
      message: 'Inter-hostel cricket tournament registration is now open. Register by 28th Feb.',
      priority: 'low'
    }
  ];

  const quickActions = [
    { title: 'Mark Attendance', icon: '📝', color: 'green', action: () => console.log('Mark attendance') },
    { title: 'Record Payment', icon: '💰', color: 'purple', action: () => console.log('Record payment') },
    { title: 'View Reports', icon: '📊', color: 'orange', action: () => console.log('View reports') },
    { title: 'Manage Rooms', icon: '🏠', color: 'blue', action: () => console.log('Manage rooms') }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--accent)' }}></div>
      </div>
    );
  }

  const t = {
    title: { color: "var(--accent)" },
    muted: { color: "var(--muted)" },
    primaryText: { color: "var(--text-primary)" },
    accentText: { color: "var(--accent)" },
    success: { color: "var(--success)" },
    danger: { color: "var(--danger)" },
    warning: { color: "var(--warning)" }
  };

  const now = new Date().toLocaleTimeString();

  const totalComplaintsSafe = Math.max(0, Number(stats.totalComplaints) || 0);
  const resolvedComplaintsSafe = Math.max(0, Number(stats.resolvedComplaints) || 0);
  const pendingComplaints = Math.max(0, totalComplaintsSafe - resolvedComplaintsSafe);
  const complaintsProgress =
    totalComplaintsSafe === 0 ? 0 : (resolvedComplaintsSafe / totalComplaintsSafe) * 100;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold" style={t.title}>
            Dashboard
          </h1>
          <p className="mt-2" style={t.muted}>
            Welcome back! Here's what's happening in your hostel today.
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm" style={t.muted}>
            Last updated
          </p>
          <p className="text-lg font-semibold" style={t.title}>
            {now}
          </p>
        </div>
      </div>


      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 transition-all duration-200 hover:scale-105" hoverable style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(59,130,246,0.03) 100%)', boxShadow: '0 4px 20px rgba(59,130,246,0.15)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium label-sm">Total Students</p>
              <p className="text-3xl font-bold text-theme">{stats.totalStudents}</p>
              <p className="text-sm" style={{ color: 'var(--success)' }}>+12% from last month</p>
            </div>
            <div className="stat-icon blue" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.2) 0%, rgba(59,130,246,0.1) 100%)' }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6 transition-all duration-200 hover:scale-105" hoverable style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(16,185,129,0.03) 100%)', boxShadow: '0 4px 20px rgba(16,185,129,0.15)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium label-sm">Room Occupancy</p>
              <p className="text-3xl font-bold text-theme">{stats.occupiedRooms}/{stats.totalRooms}</p>
              <p className="text-sm" style={{ color: 'var(--accent)' }}>{Math.round((stats.occupiedRooms/stats.totalRooms)*100)}% occupied</p>
            </div>
            <div className="stat-icon green" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(16,185,129,0.1) 100%)' }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6 transition-all duration-200 hover:scale-105" hoverable style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(139,92,246,0.03) 100%)', boxShadow: '0 4px 20px rgba(139,92,246,0.15)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium label-sm">Monthly Revenue</p>
              <p className="text-3xl font-bold text-theme">₹{stats.totalRevenue.toLocaleString()}</p>
              <p className="text-sm" style={{ color: 'var(--success)' }}>+8% from last month</p>
            </div>
            <div className="stat-icon purple" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(139,92,246,0.1) 100%)' }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6 transition-all duration-200 hover:scale-105" hoverable style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(239,68,68,0.03) 100%)', boxShadow: '0 4px 20px rgba(239,68,68,0.15)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium label-sm">Pending Payments</p>
              <p className="text-3xl font-bold text-theme">₹{stats.pendingPayments.toLocaleString()}</p>
              <p className="text-sm" style={{ color: 'var(--danger)' }}>5 students pending</p>
            </div>
            <div className="stat-icon red" style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.2) 0%, rgba(239,68,68,0.1) 100%)' }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activities */}
        <Card className="lg:col-span-2 p-6" style={{ boxShadow: '0 4px 20px rgba(59,130,246,0.1)' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-theme">Recent Activities</h2>
            <button className="text-accent hover:opacity-90 font-medium text-sm transition-all hover:scale-105">View All</button>
          </div>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 p-4 rounded-xl transition-all duration-200 hover:shadow-md hover:scale-102" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.05) 0%, rgba(59,130,246,0.01) 100%)', border: '1px solid rgba(59,130,246,0.1)' }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg shadow-sm" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(59,130,246,0.05) 100%)' }}>
                  {activity.icon}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-theme">{activity.action}</p>
                  <p className="text-sm muted">{activity.details}</p>
                </div>
                <span className="text-xs muted font-medium whitespace-nowrap">{activity.time}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-6">
          <Card className="p-6" style={{ boxShadow: '0 4px 20px rgba(59,130,246,0.1)' }}>
            <h2 className="text-xl font-semibold text-theme mb-6">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className="p-5 rounded-xl text-center transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95"
                  style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(59,130,246,0.03) 100%)', border: '1px solid rgba(59,130,246,0.1)' }}
                >
                  <div className="text-3xl mb-2">{action.icon}</div>
                  <div className="text-sm font-semibold text-theme">{action.title}</div>
                </button>
              ))}
            </div>
          </Card>

          {/* Complaints Summary */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-theme mb-4">Complaints Status</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm label-sm">Total Complaints</span>
                <span className="font-semibold text-theme">{stats.totalComplaints}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm label-sm">Resolved</span>
                <span className="font-semibold" style={{ color: 'var(--success)' }}>{stats.resolvedComplaints}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm label-sm">Pending</span>
                <span className="font-semibold" style={{ color: 'var(--danger)' }}>{stats.totalComplaints - stats.resolvedComplaints}</span>
              </div>
              <div className="w-full progress-track mt-3">
                <div
                  className="progress-fill"
                  style={{ width: `${complaintsProgress}%` }}
                />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Notice Board */}
      <Card className="p-6" style={{ boxShadow: '0 4px 20px rgba(59,130,246,0.1)' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-theme">Important Notices</h2>
          <button className="text-accent hover:opacity-90 font-medium text-sm transition-all hover:scale-105">View All Notices</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notices.map((notice) => {
            const borderColor = notice.priority === 'high' ? 'var(--danger)' : notice.priority === 'medium' ? 'var(--warning)' : 'var(--accent)';
            const pillBg = notice.priority === 'high' ? 'rgba(239,68,68,0.12)' : notice.priority === 'medium' ? 'rgba(245,158,11,0.12)' : 'rgba(59,130,246,0.12)';
            const pillColor = notice.priority === 'high' ? 'var(--danger)' : notice.priority === 'medium' ? 'var(--warning)' : 'var(--accent)';
            return (
              <div key={notice.id} className="p-4 rounded-lg bg-surface" style={{ borderLeft: `4px solid ${borderColor}` }}>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-theme text-sm">{notice.title}</h3>
                  <span className="text-xs px-2 py-1 rounded-full" style={{ background: pillBg, color: pillColor }}>
                    {notice.priority}
                  </span>
                </div>
                <p className="muted text-sm mb-3">{notice.message}</p>
                <p className="text-xs muted">{notice.date}</p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
