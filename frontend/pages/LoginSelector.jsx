import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, GraduationCap, ArrowRight } from 'lucide-react';

export default function LoginSelector() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4 py-8">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Hostel Management System
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-slate-400">
            Choose your portal to continue
          </p>
        </div>

        {/* Two Cards Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Admin Card */}
          <button
            onClick={() => navigate('/admin/login')}
            className="group relative bg-white dark:bg-slate-900 rounded-2xl shadow-lg hover:shadow-2xl border border-gray-200 dark:border-slate-800 p-6 sm:p-8 text-left transition-all duration-300 hover:-translate-y-1 overflow-hidden"
          >
            {/* Gradient bg accent */}
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />

            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <Shield size={28} className="text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Admin Portal
              </h2>
              <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
                Manage students, rooms, fees, attendance & more. Full administrative access.
              </p>
              <ul className="text-xs sm:text-sm text-gray-500 dark:text-slate-500 space-y-1 mb-5">
                <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-purple-500" /> Manage all students & rooms</li>
                <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-purple-500" /> Fee collection & reports</li>
                <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-purple-500" /> Analytics & complaints</li>
              </ul>
              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-semibold text-sm group-hover:gap-3 transition-all">
                Login as Admin <ArrowRight size={16} />
              </div>
            </div>
          </button>

          {/* Student Card */}
          <button
            onClick={() => navigate('/student/login')}
            className="group relative bg-white dark:bg-slate-900 rounded-2xl shadow-lg hover:shadow-2xl border border-gray-200 dark:border-slate-800 p-6 sm:p-8 text-left transition-all duration-300 hover:-translate-y-1 overflow-hidden"
          >
            {/* Gradient bg accent */}
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />

            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <GraduationCap size={28} className="text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Student Portal
              </h2>
              <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
                View your profile, fees, attendance, and submit complaints.
              </p>
              <ul className="text-xs sm:text-sm text-gray-500 dark:text-slate-500 space-y-1 mb-5">
                <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-emerald-500" /> View profile & room details</li>
                <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-emerald-500" /> Check fees & attendance</li>
                <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-emerald-500" /> Submit complaints</li>
              </ul>
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm group-hover:gap-3 transition-all">
                Login as Student <ArrowRight size={16} />
              </div>
            </div>
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 dark:text-slate-500 mt-8">
          Don't have an account? Contact your administrator
        </p>
      </div>
    </div>
  );
}
