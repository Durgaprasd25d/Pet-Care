import React from 'react';
import { Shield, Calendar, Users, Heart, AlertCircle, ShoppingBag, Activity } from 'lucide-react';
import { dashboardService } from '../services/apiService';

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
    <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-4`}>
      <Icon size={24} className="text-white" />
    </div>
    <p className="text-slate-400 text-xs font-black uppercase tracking-widest">{label}</p>
    <p className="text-2xl font-black text-slate-900 mt-1">{value}</p>
  </div>
);

export const VetDashboard = ({ user }) => {
  const [stats, setStats] = React.useState({ todayAppointments: 0, totalPatients: 0, medicalReports: 0 });
  const [appointments, setAppointments] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [s, a] = await Promise.all([
          dashboardService.getVetStats(),
          dashboardService.getAppointments()
        ]);
        setStats(s);
        setAppointments(a);
      } catch (err) {
        console.error("Vet Dashboard data fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="p-10 mt-16 ml-64 min-h-screen bg-slate-50/50">
      <div className="mb-10 relative overflow-hidden bg-indigo-600 rounded-3xl p-10 text-white shadow-2xl">
        <div className="relative z-10">
          <h1 className="text-3xl font-black mb-2 tracking-tight">Veterinarian Panel</h1>
          <p className="text-indigo-100 font-medium max-w-md">Welcome back, Dr. {user?.name}. Manage your appointments and patients efficiently.</p>
        </div>
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        <StatCard label="Total Appointments" value={loading ? '...' : stats.totalAppointments} icon={Calendar} color="bg-indigo-500" />
        <StatCard label="Total Patients" value={loading ? '...' : stats.totalPatients} icon={Activity} color="bg-rose-500" />
        <StatCard label="Prescriptions Written" value={loading ? '...' : stats.totalPrescriptions} icon={Shield} color="bg-emerald-500" />
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
          <div>
            <h2 className="font-black text-xl text-slate-900 tracking-tight">Recent Patient Visits</h2>
            <p className="text-slate-400 text-sm font-medium mt-1">Confirmed and pending appointments for your attention.</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-8 py-5">Patient Name</th>
                <th className="px-8 py-5">Owner</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {appointments.length > 0 ? (
                appointments.slice(0, 5).map((appt, i) => (
                  <tr key={i} className="group hover:bg-slate-50/80 transition-all duration-200">
                    <td className="px-8 py-5 font-bold text-slate-800">{appt.petId?.name || "Unknown"}</td>
                    <td className="px-8 py-5 text-slate-500 font-semibold">{appt.userId?.name || "Client"}</td>
                    <td className="px-8 py-5">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        appt.status === 'scheduled' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'
                      }`}>
                        {appt.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-slate-400 font-mono text-xs font-bold">
                      {new Date(appt.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-8 py-16 text-center text-slate-400 font-medium">No recent appointments found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const NGODashboard = ({ user }) => {
  const [stats, setStats] = React.useState({ pendingAdoptions: 0, lostPetReports: 0, activeCampaigns: 0 });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await dashboardService.getNgoStats();
        setStats(data);
      } catch (err) {
        console.error("NGO Dashboard data fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="p-10 mt-16 ml-64 min-h-screen bg-slate-50/50">
      <div className="mb-10 relative overflow-hidden bg-rose-600 rounded-3xl p-10 text-white shadow-2xl">
        <div className="relative z-10">
          <h1 className="text-3xl font-black mb-2 tracking-tight">NGO Dashboard</h1>
          <p className="text-rose-100 font-medium max-w-md">Welcome back, {user?.name}. Your contribution to pet welfare matters.</p>
        </div>
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        <StatCard label="Pending Adoptions" value={loading ? '...' : stats.pendingAdoptions} icon={Heart} color="bg-rose-500" />
        <StatCard label="Lost Pet Reports" value={loading ? '...' : stats.lostPetReports} icon={AlertCircle} color="bg-amber-500" />
        {/* <StatCard label="Active Campaigns" value={loading ? '...' : stats.activeCampaigns} icon={Users} color="bg-indigo-500" /> */}
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-10 shadow-sm text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mx-auto mb-6 transform hover:rotate-12 transition-transform">
            <Heart size={32} />
          </div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Adoption Flow Integrated</h3>
          <p className="text-slate-500 font-medium mt-2 leading-relaxed">
            All adoption metrics are now synced with the live database. Use the sidebar to manage listings and review requests.
          </p>
        </div>
      </div>
    </div>
  );
};

export const StoreDashboard = ({ user }) => {
  const [stats, setStats] = React.useState({ totalProducts: 0, activeBookings: 0, customerContacts: 0 });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await dashboardService.getStoreStats();
        setStats(data);
      } catch (err) {
        console.error("Store Dashboard data fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="p-10 mt-16 ml-64 min-h-screen bg-slate-50/50">
      <div className="mb-10 relative overflow-hidden bg-emerald-600 rounded-3xl p-10 text-white shadow-2xl">
        <div className="relative z-10">
          <h1 className="text-3xl font-black mb-2 tracking-tight">Pet Store Manager</h1>
          <p className="text-emerald-100 font-medium max-w-md">Welcome back, {user?.name}. Manage your inventory and services efficiently.</p>
        </div>
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        <StatCard label="Total Products" value={loading ? '...' : stats.totalProducts} icon={ShoppingBag} color="bg-emerald-500" />
        <StatCard label="Active Bookings" value={loading ? '...' : stats.activeBookings} icon={Calendar} color="bg-blue-500" />
        {/* <StatCard label="Customer Contacts" value={loading ? '...' : stats.customerContacts} icon={Users} color="bg-purple-500" /> */}
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-10 shadow-sm text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 mx-auto mb-6 transform hover:rotate-12 transition-transform">
            <ShoppingBag size={32} />
          </div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Inventory System Active</h3>
          <p className="text-slate-500 font-medium mt-2 leading-relaxed">
            Your store is currently live. Monitor product stock and incoming orders directly from your personal dashboard.
          </p>
        </div>
      </div>
    </div>
  );
};
