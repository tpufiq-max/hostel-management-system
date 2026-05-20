import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import {
  User, BedDouble, IndianRupee, CalendarDays, Bell, FileText, ArrowRight, CheckCircle,
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const stats = [
    { label: 'Room', value: '101', icon: BedDouble, color: 'blue', path: '/student/profile' },
    { label: 'Fees Status', value: 'PAID', icon: IndianRupee, color: 'green', path: '/student/fees' },
    { label: 'Attendance', value: '94%', icon: CalendarDays, color: 'purple', path: '/student/attendance' },
    { label: 'Complaints', value: '1', icon: Bell, color: 'orange', path: '/student/complaints' },
  ];

  const announcements = [
    { id: 1, title: 'Hostel Maintenance', message: 'Block A water supply will be off Sunday 9-12 AM', date: 'Today', priority: 'high' },
    { id: 2, title: 'Fee Reminder', message: 'Monthly fee due by 25th of this month', date: 'Yesterday', priority: 'medium' },
    { id: 3, title: 'Cultural Night', message: 'Join us this Friday at 7 PM in the auditorium', date: '2 days ago', priority: 'low' },
  ];

  const quickActions = [
    { label: 'View Profile', icon: User, path: '/student/profile', color: 'blue' },
    { label: 'Submit Complaint', icon: Bell, path: '/student/complaints', color: 'orange' },
    { label: 'View Fees', icon: IndianRupee, path: '/student/fees', color: 'green' },
    { label: 'Attendance', icon: CalendarDays, path: '/student/attendance', color: 'purple' },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome Card */}
      <div className="relative bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl p-5 sm:p-7 text-white overflow-hidden">
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full blur-xl" />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-emerald-50 text-sm">Welcome back,</p>
            <h1 className="text-2xl sm:text-3xl font-bold mt-1">{user?.name || 'Student'}!</h1>
            <p className="text-emerald-50 text-xs sm:text-sm mt-1">Here's your hostel summary today</p>
          </div>
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-2 rounded-xl text-sm self-start sm:self-auto">
            <CheckCircle size={16} />
            <span className="font-medium">All Active</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card
              key={i}
              className="p-4 cursor-pointer hover:scale-[1.02] transition-transform"
              onClick={() => navigate(stat.path)}
            >
              <div className="flex items-start justify-between">
                <div className={`w-9 h-9 rounded-xl bg-${stat.color}-100 dark:bg-${stat.color}-900/30 flex items-center justify-center`}>
                  <Icon size={18} className={`text-${stat.color}-600`} />
                </div>
                <ArrowRight size={14} className="text-[var(--text-secondary)]" />
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-3">{stat.label}</p>
              <p className="text-xl font-bold mt-0.5">{stat.value}</p>
            </Card>
          );
        })}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Announcements */}
        <Card className="lg:col-span-2 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Announcements</h2>
            <button onClick={() => navigate('/student/notices')} className="text-xs text-emerald-600 hover:underline font-medium">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {announcements.map(a => {
              const colors = {
                high: 'border-l-red-500 bg-red-50 dark:bg-red-900/10',
                medium: 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10',
                low: 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/10',
              };
              return (
                <div key={a.id} className={`p-3 rounded-xl border-l-4 ${colors[a.priority]}`}>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium text-sm">{a.title}</h3>
                    <span className="text-[10px] text-[var(--text-secondary)] flex-shrink-0">{a.date}</span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">{a.message}</p>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-4 sm:p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {quickActions.map((action, i) => {
              const Icon = action.icon;
              return (
                <button
                  key={i}
                  onClick={() => navigate(action.path)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-primary)] hover:bg-[var(--border-color)] transition-colors text-left group"
                >
                  <div className={`w-9 h-9 rounded-lg bg-${action.color}-100 dark:bg-${action.color}-900/30 flex items-center justify-center flex-shrink-0`}>
                    <Icon size={16} className={`text-${action.color}-600`} />
                  </div>
                  <span className="font-medium text-sm flex-1">{action.label}</span>
                  <ArrowRight size={14} className="text-[var(--text-secondary)] group-hover:translate-x-1 transition-transform" />
                </button>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
