import React, { useState, useEffect } from 'react';
import { 
  AlertOctagon, 
  MapPin, 
  Phone, 
  Clock, 
  CheckCircle2, 
  User, 
  Dog,
  ExternalLink,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { dashboardService } from '../services/apiService';

const EmergencyCard = ({ emergency, onAccept, onComplete }) => {
  const isPending = emergency.status === 'pending';
  const isAccepted = emergency.status === 'accepted';

  return (
    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.04)] relative overflow-hidden group hover:translate-y-[-4px] transition-all duration-300">
      {/* Claymorphism Inner Shadow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 to-transparent pointer-events-none" />
      
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="flex gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isPending ? 'bg-rose-500 shadow-rose-200' : 'bg-emerald-500 shadow-emerald-200'} shadow-lg group-hover:scale-110 transition-transform`}>
            <ShieldAlert size={28} className="text-white" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800">{emergency.petId?.name || 'Unknown Pet'}</h3>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{emergency.emergencyType || 'Critical Emergency'}</p>
          </div>
        </div>
        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border ${
          isPending ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
        }`}>
          {emergency.status}
        </span>
      </div>

      <div className="space-y-4 mb-8 relative z-10">
        <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <MapPin size={18} className="text-primary" />
          <div className="flex-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</p>
            <p className="text-sm font-bold text-slate-700 truncate">{emergency.location?.address || 'Geolocation detected'}</p>
          </div>
          <a 
            href={`https://www.google.com/maps?q=${emergency.location?.latitude},${emergency.location?.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-white rounded-xl border border-slate-200 text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
          >
            <ExternalLink size={16} />
          </a>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2 mb-1">
              <User size={14} className="text-slate-400" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Owner</p>
            </div>
            <p className="text-sm font-bold text-slate-800">{emergency.userId?.name || 'Pet Owner'}</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2 mb-1">
              <Clock size={14} className="text-slate-400" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time</p>
            </div>
            <p className="text-sm font-bold text-slate-800">{new Date(emergency.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-3 relative z-10">
        <a 
          href={`tel:${emergency.userId?.phone}`}
          className="flex-1 bg-white border-2 border-slate-100 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-slate-600 font-bold hover:bg-slate-50 transition-all text-sm"
        >
          <Phone size={18} />
          Call Owner
        </a>
        
        {isPending && (
          <button 
            onClick={() => onAccept(emergency._id)}
            className="flex-[1.5] bg-rose-500 text-white flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black shadow-lg shadow-rose-200 hover:bg-rose-600 hover:scale-[1.02] transition-all text-sm uppercase tracking-wider"
          >
            Accept SOS
          </button>
        )}

        {isAccepted && (
          <button 
            onClick={() => onComplete(emergency._id)}
            className="flex-[1.5] bg-emerald-500 text-white flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black shadow-lg shadow-emerald-200 hover:bg-emerald-600 hover:scale-[1.02] transition-all text-sm uppercase tracking-wider"
          >
            Mark Resolved
          </button>
        )}
      </div>

      {/* Decorative pulse for pending items */}
      {isPending && (
        <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-rose-50 px-2 py-1 rounded-full border border-rose-100">
           <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
           <span className="text-[8px] font-black text-rose-600 uppercase">Live</span>
        </div>
      )}
    </div>
  );
};

const EmergencyManagement = () => {
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active'); // active, history

  const fetchEmergencies = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getEmergencies();
      setEmergencies(data);
    } catch (err) {
      console.error("Failed to fetch emergencies", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmergencies();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await dashboardService.updateEmergencyStatus(id, status);
      fetchEmergencies();
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const activeEmergencies = emergencies.filter(e => e.status !== 'resolved' && e.status !== 'cancelled');
  const pastEmergencies = emergencies.filter(e => e.status === 'resolved' || e.status === 'cancelled');

  return (
    <div className="p-10 mt-16 ml-64 min-h-screen bg-slate-50/50">
      <div className="mb-10 relative overflow-hidden bg-rose-600 rounded-[3rem] p-12 text-white shadow-2xl shadow-rose-200">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                <AlertOctagon size={24} className="text-white" />
              </div>
              <span className="text-xs font-black uppercase tracking-[0.3em] text-rose-100">Emergency Hub</span>
            </div>
            <h1 className="text-4xl font-black mb-3 tracking-tight">SOS Monitoring</h1>
            <p className="text-rose-100 font-medium max-w-lg leading-relaxed">Respond to critical pet emergencies in real-time. Every second counts for a pet's life.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/20 flex flex-col items-center">
            <span className="text-[10px] font-black text-rose-100 uppercase tracking-widest mb-1">Active Alerts</span>
            <span className="text-4xl font-black">{activeEmergencies.length}</span>
          </div>
        </div>
        {/* Claymorphism Orbs */}
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute right-40 -bottom-20 w-48 h-48 bg-rose-400/20 rounded-full blur-2xl" />
      </div>

      <div className="flex gap-4 mb-10">
        <button 
          onClick={() => setFilter('active')}
          className={`px-8 py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
            filter === 'active' 
              ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' 
              : 'bg-white text-slate-400 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Active Alerts
        </button>
        <button 
          onClick={() => setFilter('history')}
          className={`px-8 py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
            filter === 'history' 
              ? 'bg-slate-800 text-white shadow-lg shadow-slate-200' 
              : 'bg-white text-slate-400 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Resolution History
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 font-bold italic">Polling for emergency frequencies...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {(filter === 'active' ? activeEmergencies : pastEmergencies).map(emergency => (
            <EmergencyCard 
              key={emergency._id} 
              emergency={emergency} 
              onAccept={(id) => handleUpdateStatus(id, 'accepted')}
              onComplete={(id) => handleUpdateStatus(id, 'resolved')}
            />
          ))}
          
          {(filter === 'active' ? activeEmergencies : pastEmergencies).length === 0 && (
            <div className="col-span-full bg-white rounded-[2.5rem] p-24 border-2 border-dashed border-slate-200 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 mb-6">
                <Dog size={48} />
              </div>
              <h3 className="text-xl font-black text-slate-400">All Quiet in the Sector</h3>
              <p className="text-slate-300 font-medium mt-2">No {filter} emergencies detected at this timestamp.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EmergencyManagement;
