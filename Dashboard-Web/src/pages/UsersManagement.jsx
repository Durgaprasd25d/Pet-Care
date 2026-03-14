import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/apiService';
import { User as UserIcon, Trash2, Shield, Mail, MapPin, Phone } from 'lucide-react';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const data = await dashboardService.getUsers();
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleVerification = async (id) => {
    try {
      const result = await dashboardService.updateUserVerification(id);
      setUsers(users.map(u => u._id === id ? { ...u, isVerified: result.isVerified } : u));
    } catch (err) {
      console.error("Failed to toggle verification", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await dashboardService.deleteUser(id);
        setUsers(users.filter(u => u._id !== id));
      } catch (err) {
        console.error("Failed to delete user", err);
      }
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-10 mt-16 ml-64 min-h-screen bg-slate-50/50">
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">User Community</h1>
          <p className="text-slate-500 font-medium mt-1">Oversight and management of all registered pet owners.</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-200 text-sm font-black text-slate-700 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <UserIcon size={18} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest leading-none mb-1">Total Users</p>
            <p className="text-lg leading-none">{users.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-8 py-5">Profile Name</th>
                <th className="px-8 py-5">Contact Node</th>
                <th className="px-8 py-5">Geo Location</th>
                <th className="px-8 py-5">Verification</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="5" className="px-8 py-20 text-center text-slate-300 font-bold italic">Synchronizing user data...</td></tr>
              ) : users.map((user) => (
                <tr key={user._id} className="group hover:bg-slate-50/80 transition-all duration-200">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shadow-sm group-hover:scale-110 transition-transform duration-300">
                        {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <UserIcon size={24} className="text-slate-300" />}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 tracking-tight leading-tight">{user.name}</p>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">
                          {user.role || 'User'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-bold">
                        <Mail size={12} className="text-slate-300" /> {user.email}
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-bold">
                          <Phone size={12} className="text-slate-300" /> {user.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-sm text-slate-500 font-bold">
                      <MapPin size={14} className="text-slate-300" />
                      {user.location || 'Unknown'}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <button 
                      onClick={() => toggleVerification(user._id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        user.isVerified 
                          ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' 
                          : 'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}
                    >
                      {user.isVerified ? (
                        <>
                          <Shield size={12} />
                          Verified
                        </>
                      ) : (
                        <>
                          <Shield size={12} className="opacity-50" />
                          Unverified
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button 
                      onClick={() => handleDelete(user._id)}
                      className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-white hover:shadow-lg rounded-xl transition-all border border-transparent hover:border-slate-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UsersManagement;
