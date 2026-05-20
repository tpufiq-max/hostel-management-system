import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import { Mail, Phone, MapPin, Calendar, BookOpen, Heart, User as UserIcon, BedDouble, KeyRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MyProfile() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // In real app, this comes from API - using mock for now
  const profile = {
    name: user?.name || 'John Doe',
    email: user?.email || 'student@hostel.com',
    phone: '+91 9876543210',
    rollNumber: '2024001',
    course: 'B.Tech Computer Science',
    year: 2,
    department: 'Engineering',
    roomNumber: '101',
    bedNumber: 'A',
    block: 'A',
    floor: 1,
    address: '123 Main St, Mumbai, Maharashtra',
    dateOfBirth: '2003-05-15',
    gender: 'Male',
    bloodGroup: 'O+',
    guardianName: 'Robert Doe',
    guardianPhone: '+91 9876543200',
    admissionDate: '2024-07-15',
  };

  const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 py-2">
      <Icon size={14} className="text-[var(--text-secondary)] mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-[var(--text-secondary)]">{label}</p>
        <p className="text-sm font-medium truncate">{value || '—'}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--accent)]">My Profile</h1>
          <p className="text-sm text-[var(--text-secondary)]">View and manage your personal information</p>
        </div>
        <button
          onClick={() => navigate('/change-password')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border-color)] hover:bg-[var(--bg-primary)] transition-colors text-sm font-medium self-start sm:self-auto"
        >
          <KeyRound size={14} /> Change Password
        </button>
      </div>

      {/* Profile Header Card */}
      <Card className="overflow-hidden">
        <div className="relative bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 h-24 sm:h-32" />
        <div className="px-4 sm:px-6 pb-4 sm:pb-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-end gap-3 -mt-10 sm:-mt-12">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center border-4 border-[var(--bg-secondary)] shadow-lg flex-shrink-0">
              <span className="text-white text-2xl sm:text-3xl font-bold">{profile.name.charAt(0)}</span>
            </div>
            <div className="flex-1 sm:pb-2">
              <h2 className="text-xl sm:text-2xl font-bold">{profile.name}</h2>
              <p className="text-sm text-[var(--text-secondary)]">{profile.rollNumber} • {profile.course}</p>
            </div>
            <div className="flex flex-wrap gap-2 sm:pb-2">
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium">Year {profile.year}</span>
              <span className="px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium">Active</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Info Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        {/* Personal Info */}
        <Card className="p-4 sm:p-6">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <UserIcon size={16} className="text-emerald-600" /> Personal Information
          </h3>
          <div className="divide-y divide-[var(--border-color)]">
            <InfoRow icon={Mail} label="Email" value={profile.email} />
            <InfoRow icon={Phone} label="Phone" value={profile.phone} />
            <InfoRow icon={Calendar} label="Date of Birth" value={profile.dateOfBirth} />
            <InfoRow icon={UserIcon} label="Gender" value={profile.gender} />
            <InfoRow icon={Heart} label="Blood Group" value={profile.bloodGroup} />
            <InfoRow icon={MapPin} label="Address" value={profile.address} />
          </div>
        </Card>

        {/* Academic Info */}
        <Card className="p-4 sm:p-6">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <BookOpen size={16} className="text-blue-600" /> Academic Details
          </h3>
          <div className="divide-y divide-[var(--border-color)]">
            <InfoRow icon={BookOpen} label="Roll Number" value={profile.rollNumber} />
            <InfoRow icon={BookOpen} label="Course" value={profile.course} />
            <InfoRow icon={BookOpen} label="Department" value={profile.department} />
            <InfoRow icon={BookOpen} label="Year" value={`Year ${profile.year}`} />
            <InfoRow icon={Calendar} label="Admission Date" value={profile.admissionDate} />
          </div>
        </Card>

        {/* Hostel Info */}
        <Card className="p-4 sm:p-6">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <BedDouble size={16} className="text-purple-600" /> Hostel Details
          </h3>
          <div className="divide-y divide-[var(--border-color)]">
            <InfoRow icon={BedDouble} label="Room Number" value={profile.roomNumber} />
            <InfoRow icon={BedDouble} label="Bed" value={profile.bedNumber} />
            <InfoRow icon={MapPin} label="Block" value={profile.block} />
            <InfoRow icon={MapPin} label="Floor" value={`Floor ${profile.floor}`} />
          </div>
        </Card>

        {/* Guardian Info */}
        <Card className="p-4 sm:p-6">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <UserIcon size={16} className="text-orange-600" /> Guardian Information
          </h3>
          <div className="divide-y divide-[var(--border-color)]">
            <InfoRow icon={UserIcon} label="Guardian Name" value={profile.guardianName} />
            <InfoRow icon={Phone} label="Guardian Phone" value={profile.guardianPhone} />
          </div>
        </Card>
      </div>
    </div>
  );
}
