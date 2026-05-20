import React from 'react';
import Card from '../components/common/Card';
import { FileText, Download, TrendingUp, Users, IndianRupee, CalendarDays } from 'lucide-react';

const reports = [
  { id: 1, title: 'Student Report', description: 'Complete list of all students with details', icon: Users, color: 'blue' },
  { id: 2, title: 'Fee Collection Report', description: 'Monthly fee collection summary', icon: IndianRupee, color: 'green' },
  { id: 3, title: 'Attendance Report', description: 'Student attendance summary by month', icon: CalendarDays, color: 'purple' },
  { id: 4, title: 'Room Occupancy Report', description: 'Room allocation and vacancy details', icon: FileText, color: 'orange' },
  { id: 5, title: 'Complaint Report', description: 'Complaint resolution statistics', icon: TrendingUp, color: 'red' },
  { id: 6, title: 'Financial Report', description: 'Revenue and expenditure overview', icon: IndianRupee, color: 'emerald' },
];

export default function Reports() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--accent)]">Reports</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Generate and download hostel reports</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {reports.map(report => {
          const Icon = report.icon;
          return (
            <Card key={report.id} className="p-4 sm:p-5 hover:scale-[1.02] transition-transform">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-${report.color}-100 dark:bg-${report.color}-900/30`}>
                  <Icon size={20} className={`text-${report.color}-600`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm">{report.title}</h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">{report.description}</p>
                </div>
              </div>
              <button className="w-full mt-4 flex items-center justify-center gap-2 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-xs font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-colors">
                <Download size={14} /> Generate Report
              </button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
