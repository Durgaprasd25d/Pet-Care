import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Dog, 
  Calendar, 
  User as UserIcon, 
  Settings, 
  LogOut,
  Bell,
  Search,
  Heart,
  AlertOctagon,
  MessageSquare,
  ShieldCheck,
  Stethoscope,
  Briefcase,
  Store,
  Package,
  Home,
  FileText,
  ShoppingBag
} from 'lucide-react';
import { dashboardService } from './services/apiService';
import Login from './Login';
import Register from './Register';
import { VetDashboard, NGODashboard, StoreDashboard } from './pages/RoleDashboards';

// Import Pages
import UsersManagement from './pages/UsersManagement';
import PetsManagement from './pages/PetsManagement';
import AppointmentsManagement from './pages/AppointmentsManagement';
import AdoptionManagement from './pages/AdoptionManagement';
import LostFoundManagement from './pages/LostFoundManagement';
import CommunityManagement from './pages/CommunityManagement';
import PrescriptionsManagement from './pages/PrescriptionsManagement';
import ClinicManagement from './pages/ClinicManagement';
import InventoryManagement from './pages/InventoryManagement';
import StoreOrderManagement from './pages/StoreOrderManagement';
import StoreProfile from './pages/StoreProfile';
import AdoptionRequests from './pages/AdoptionRequests';
import EmergencyManagement from './pages/EmergencyManagement';

const SidebarItem = ({ icon: Icon, label, href, active }) => (
  <Link 
    to={href}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      active 
        ? 'bg-primary text-white shadow-md shadow-primary/20' 
        : 'text-slate-500 hover:bg-slate-100'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </Link>
);

const Sidebar = ({ onLogout, user }) => {
  const location = useLocation();
  const role = user?.role || 'admin';

  return (
    <div className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col p-4 fixed left-0 top-0 overflow-y-auto z-20">
      <div className="flex items-center gap-3 px-2 mb-10">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100 overflow-hidden">
          <img src="/logo.png" alt="PetCare Logo" className="w-full h-full object-contain p-1" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-black tracking-tight text-slate-800 leading-none">PetCare</span>
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">
            {role === 'admin' ? 'Admin Panel' : role === 'vet' ? 'Veterinary Portal' : role === 'ngo' ? 'NGO Portal' : 'Pet Store Portal'}
          </span>
        </div>
      </div>
      
      <nav className="flex-1 space-y-1">
        <SidebarItem icon={LayoutDashboard} label="Dashboard" href="/" active={location.pathname === '/'} />
        
        {role === 'admin' && (
          <>
            <SidebarItem icon={UserIcon} label="Users" href="/users" active={location.pathname === '/users'} />
            <SidebarItem icon={Dog} label="Pets" href="/pets" active={location.pathname === '/pets'} />
            <SidebarItem icon={Calendar} label="Appointments" href="/appointments" active={location.pathname === '/appointments'} />
            
            <div className="pt-6 pb-2 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ecosystem</div>
            <SidebarItem icon={Heart} label="Adoptions" href="/adoptions" active={location.pathname === '/adoptions'} />
            <SidebarItem icon={AlertOctagon} label="Lost & Found" href="/lost-found" active={location.pathname === '/lost-found'} />
            <SidebarItem icon={MessageSquare} label="Community" href="/community" active={location.pathname === '/community'} />
          </>
        )}

        {role === 'vet' && (
          <>
            <SidebarItem icon={Calendar} label="My Appointments" href="/appointments" active={location.pathname === '/appointments'} />
            <SidebarItem icon={Dog} label="Patients" href="/pets" active={location.pathname === '/pets'} />
            <SidebarItem icon={FileText} label="Prescriptions" href="/prescriptions" active={location.pathname === '/prescriptions'} />
            <SidebarItem icon={Stethoscope} label="Clinic Info" href="/clinic" active={location.pathname === '/clinic'} />
            <div className="pt-6 pb-2 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Urgent Care</div>
            {/* <SidebarItem icon={AlertOctagon} label="Emergency SOS" href="/emergency" active={location.pathname === '/emergency'} /> */}
          </>
        )}

        {role === 'ngo' && (
          <>
            <SidebarItem icon={Heart} label="Adoption Listings" href="/adoptions" active={location.pathname === '/adoptions'} />
            <SidebarItem icon={MessageSquare} label="Adoption Requests" href="/adoption-requests" active={location.pathname === '/adoption-requests'} />
            <SidebarItem icon={AlertOctagon} label="Lost & Found" href="/lost-found" active={location.pathname === '/lost-found'} />
            {/* <SidebarItem icon={Home} label="Shelter Profile" href="/shelter" active={location.pathname === '/shelter'} /> */}
            {/* <SidebarItem icon={Briefcase} label="Volunteers" href="/volunteers" active={location.pathname === '/volunteers'} /> */}
          </>
        )}

        {role === 'store' && (
          <>
            <SidebarItem icon={Package} label="Inventory" href="/inventory" active={location.pathname === '/inventory'} />
            <SidebarItem icon={ShoppingBag} label="Orders" href="/store-orders" active={location.pathname === '/store-orders'} />
            {/* <SidebarItem icon={Calendar} label="Service Bookings" href="/bookings" active={location.pathname === '/bookings'} /> */}
            {/* <SidebarItem icon={Store} label="Store Profile" href="/store-profile" active={location.pathname === '/store-profile'} /> */}
            {/* <SidebarItem icon={Dog} label="Customers" href="/pets" active={location.pathname === '/pets'} /> */}
          </>
        )}
        
        {/* <div className="pt-6 pb-2 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">System</div>
        <SidebarItem icon={Settings} label="Settings" href="/settings" active={location.pathname === '/settings'} /> */}
      </nav>

      <div className="mt-auto pt-4 border-t border-slate-100">
        <button 
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-lg w-full transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};



const Topbar = ({ user, onLogout }) => (
  <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 fixed top-0 right-0 left-64 z-10">
    <div className="relative w-96">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
      <input 
        type="text" 
        placeholder="Search everything..." 
        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
      />
    </div>

    <div className="flex items-center gap-4">
      <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-full relative">
        <Bell size={20} />
        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
      </button>
      <div className="h-8 w-px bg-slate-200 mx-2"></div>
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-slate-900">{user?.name || 'User'}</p>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">{user?.role || 'admin'}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-slate-200 border border-slate-300 overflow-hidden">
          {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : null}
        </div>
        <button 
          onClick={onLogout}
          className="ml-2 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all group"
          title="Sign Out"
        >
          <LogOut size={20} className="group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </div>
  </div>
);

const DashboardHome = () => {
  const [stats, setStats] = useState({ totalPets: 0, appointments: 0, activeUsers: 856, newReports: 12 });
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [s, a] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getRecentAppointments()
        ]);
        setStats(s);
        setAppointments(a);
      } catch (err) {
        console.error("Dashboard data fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="p-10 mt-16 ml-64 min-h-screen bg-slate-50/50">
      <div className="mb-10 relative overflow-hidden bg-primary rounded-3xl p-10 text-white shadow-2xl shadow-primary/20">
        <div className="relative z-10">
          <h1 className="text-3xl font-black mb-2 tracking-tight">System Overview</h1>
          <p className="text-white/80 font-medium max-w-md">Welcome back to your PetCare portal. Manage your operations efficiently from this dashboard.</p>
        </div>
        {/* Abstract shapes for premium feel */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute right-10 -bottom-20 w-48 h-48 bg-emerald-400/20 rounded-full blur-2xl"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
        {[
          { label: 'Total Pets', value: stats.totalPets, icon: Dog, color: 'text-blue-600', bg: 'bg-blue-600/10' },
          { label: 'Appointments', value: stats.appointments, icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-600/10' },
          { label: 'Active Users', value: stats.activeUsers, icon: UserIcon, color: 'text-emerald-600', bg: 'bg-emerald-600/10' },
          { label: 'New Reports', value: stats.newReports, icon: Bell, color: 'text-rose-600', bg: 'bg-rose-600/10' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-6">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon size={26} />
              </div>
              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider">Live</span>
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-3xl font-black text-slate-900 tracking-tight">{loading ? '...' : stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden mb-10">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
          <div>
            <h2 className="font-black text-xl text-slate-900 tracking-tight">Recent Appointments</h2>
            <p className="text-slate-400 text-sm font-medium mt-1">Pending and recently completed visits.</p>
          </div>
          <button className="bg-primary/10 text-primary px-5 py-2.5 rounded-xl text-sm font-black hover:bg-primary hover:text-white transition-all duration-300">View History</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-8 py-5">Pet Patient</th>
                <th className="px-8 py-5">Assigned Vet</th>
                <th className="px-8 py-5">Current Status</th>
                <th className="px-8 py-5">Appointment Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {appointments.length > 0 ? appointments.map((appt, i) => (
                <tr key={i} className="group hover:bg-slate-50/80 transition-all duration-200">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold border border-slate-200 group-hover:bg-white group-hover:scale-110 transition-all">
                        {appt.petId?.name?.charAt(0) || 'P'}
                      </div>
                      <span className="font-bold text-slate-800">{appt.petId?.name || 'Unknown Pet'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-slate-500 font-semibold">{appt.vetId?.name || 'Dr. Unassigned'}</td>
                  <td className="px-8 py-5">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      appt.status === 'scheduled' 
                        ? 'bg-blue-100 text-blue-600 border border-blue-200' 
                        : 'bg-emerald-100 text-emerald-600 border border-emerald-200'
                    }`}>
                      {appt.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-slate-400 font-mono text-xs font-bold">{new Date(appt.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="px-8 py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 text-slate-300">
                      <Calendar size={48} className="opacity-20" />
                      <p className="font-bold italic">No recent activity detected</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ProtectedRoute = ({ children, allowedRoles, user }) => {
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setUser(JSON.parse(localStorage.getItem('user')));
    navigate('/');
  };

  const handleLogout = () => {
    dashboardService.logout();
    setIsAuthenticated(false);
    setUser(null);
    navigate('/login');
  };

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar onLogout={handleLogout} user={user} />
      <Topbar user={user} onLogout={handleLogout} />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={
            user?.role === 'vet' ? <VetDashboard user={user} /> :
            user?.role === 'ngo' ? <NGODashboard user={user} /> :
            user?.role === 'store' ? <StoreDashboard user={user} /> :
            <DashboardHome />
          } />
          <Route path="/users" element={
            <ProtectedRoute user={user} allowedRoles={['admin']}>
              <UsersManagement />
            </ProtectedRoute>
          } />
          <Route path="/pets" element={
            <ProtectedRoute user={user} allowedRoles={['admin', 'vet', 'store']}>
              <PetsManagement />
            </ProtectedRoute>
          } />
          <Route path="/appointments" element={
            <ProtectedRoute user={user} allowedRoles={['admin', 'vet']}>
              <AppointmentsManagement />
            </ProtectedRoute>
          } />
          <Route path="/adoptions" element={
            <ProtectedRoute user={user} allowedRoles={['admin', 'ngo']}>
              <AdoptionManagement user={user} />
            </ProtectedRoute>
          } />
          <Route path="/adoption-requests" element={
            <ProtectedRoute user={user} allowedRoles={['admin', 'ngo']}>
              <AdoptionRequests />
            </ProtectedRoute>
          } />
          <Route path="/lost-found" element={
            <ProtectedRoute user={user} allowedRoles={['admin', 'ngo']}>
              <LostFoundManagement />
            </ProtectedRoute>
          } />
          <Route path="/community" element={
            <ProtectedRoute user={user} allowedRoles={['admin']}>
              <CommunityManagement />
            </ProtectedRoute>
          } />
          <Route path="/emergency" element={
            <ProtectedRoute user={user} allowedRoles={['admin', 'vet']}>
              <EmergencyManagement />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={<div className="p-8 mt-16 ml-64">Settings Page</div>} />
          
          {/* Boilerplate redirect for new modules */}
          <Route path="/prescriptions" element={<PrescriptionsManagement />} />
          <Route path="/clinic" element={<ClinicManagement />} />
          <Route path="/shelter" element={<NGODashboard user={user} />} />
          <Route path="/volunteers" element={<NGODashboard user={user} />} />
          <Route path="/inventory" element={<InventoryManagement user={user} />} />
          <Route path="/bookings" element={<StoreDashboard user={user} />} />
          <Route path="/store-profile" element={<StoreProfile user={user} />} />
          <Route path="/store-orders" element={<StoreOrderManagement user={user} />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
