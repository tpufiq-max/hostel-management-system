import React, { useState, useEffect } from 'react';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import reportService from '../features/reports/reportService';

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await reportService.getReportData();
        setData(result);
      } catch (err) {
        setError(err.message || 'Failed to load report data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold" style={{color: 'var(--text)'}}>Reports</h1>
          <p className="mt-2" style={{color: 'var(--muted)'}}>Get quick insights into hostel operations and performance.</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <LoadingSkeleton count={4} type="card" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold" style={{color: 'var(--text)'}}>Reports</h1>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
      </div>
    );
  }

  const occupancyRate = data?.occupancyRate ?? 0;
  const totalRevenue = data?.totalRevenue ?? 0;
  const openComplaints = data?.openComplaints ?? 0;
  const activeVisitors = data?.activeVisitors ?? 0;
  const totalRooms = data?.totalRooms ?? 0;
  const occupiedRooms = data?.occupiedRooms ?? 0;

  const reportCards = [
    {
      title: 'Occupancy Rate',
      value: `${occupancyRate}%`,
      detail: `${occupiedRooms} of ${totalRooms} rooms occupied`
    },
    {
      title: 'Fee Collection',
      value: `₹${totalRevenue.toLocaleString()}`,
      detail: 'Total revenue collected'
    },
    {
      title: 'Pending Complaints',
      value: String(openComplaints),
      detail: 'Open issues requiring attention'
    },
    {
      title: 'Active Visitors',
      value: String(activeVisitors),
      detail: 'Currently checked in'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{color: 'var(--text)'}}>Reports</h1>
        <p className="mt-2" style={{color: 'var(--muted)'}}>Get quick insights into hostel operations and performance.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {reportCards.map((card) => (
          <div key={card.title} className="rounded-3xl border p-6 hover:shadow-md transition-shadow" style={{backgroundColor: 'var(--surface)', borderColor: 'var(--accent)'}}>
            <h2 className="text-sm font-semibold uppercase tracking-wide" style={{color: 'var(--accent)'}}>{card.title}</h2>
            <p className="mt-4 text-4xl font-bold" style={{color: 'var(--text)'}}>{card.value}</p>
            <p className="mt-2 text-sm" style={{color: 'var(--muted)'}}>{card.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
