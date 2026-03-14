import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/apiService';
import { Check, X, User, Phone, MapPin, MessageCircle, Calendar } from 'lucide-react';

const AdoptionRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const data = await dashboardService.getAdoptionRequests();
      setRequests(data);
    } catch (err) {
      console.error("Failed to fetch requests", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id, status) => {
    try {
      await dashboardService.updateAdoptionRequestStatus(id, { status });
      fetchRequests();
    } catch (err) {
      alert("Action failed");
    }
  };

  return (
    <div className="p-8 mt-16 ml-64 min-h-screen bg-slate-50">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Adoption Requests</h1>
        <p className="text-slate-500">Review and respond to adoption applications.</p>
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="py-20 text-center text-slate-400">Loading requests...</div>
        ) : requests.length === 0 ? (
          <div className="py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-center">
             <MessageCircle size={48} className="mx-auto text-slate-200 mb-4" />
             <p className="text-slate-400 font-bold">No adoption requests received yet.</p>
          </div>
        ) : requests.map((req) => (
          <div key={req._id} className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden p-8 flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-1/3">
               <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-100">
                    <img src={req.pet?.image} alt={req.pet?.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-primary uppercase tracking-widest">Applying for</p>
                    <h3 className="text-xl font-black text-slate-900">{req.pet?.name}</h3>
                  </div>
               </div>
               <div className="bg-slate-50 rounded-2xl p-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase inline-block ${
                    req.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                    req.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                  }`}>
                    {req.status}
                  </span>
               </div>
            </div>

            <div className="flex-1 space-y-4">
               <div>
                  <h4 className="font-black text-slate-900 mb-2 flex items-center gap-2"><User size={18} className="text-slate-400" /> {req.fullName}</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm text-slate-500 font-medium">
                     <span className="flex items-center gap-2"><Phone size={14} /> {req.phone}</span>
                     <span className="flex items-center gap-2"><MapPin size={14} /> {req.address}</span>
                  </div>
               </div>

               <div className="space-y-3">
                  <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Previous Experience</p>
                    <p className="text-slate-700 font-medium text-sm italic">"{req.experience}"</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Reason for Adoption</p>
                    <p className="text-slate-700 font-medium text-sm italic">"{req.reason}"</p>
                  </div>
               </div>
            </div>

            <div className="w-full lg:w-48 flex flex-col gap-3 justify-center">
               {req.status === 'pending' ? (
                 <>
                   <button onClick={() => handleAction(req._id, 'approved')} className="w-full bg-emerald-500 text-white py-3 rounded-xl font-black shadow-lg shadow-emerald-200 hover:scale-105 transition-all flex items-center justify-center gap-2">
                     <Check size={18} /> Approve
                   </button>
                   <button onClick={() => handleAction(req._id, 'rejected')} className="w-full bg-slate-100 text-slate-600 py-3 rounded-xl font-black hover:bg-rose-50 hover:text-rose-500 transition-all flex items-center justify-center gap-2">
                     <X size={18} /> Reject
                   </button>
                 </>
               ) : (
                 <div className="h-full flex items-center justify-center text-slate-300 font-bold italic">
                   Decision Made
                 </div>
               )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdoptionRequests;
