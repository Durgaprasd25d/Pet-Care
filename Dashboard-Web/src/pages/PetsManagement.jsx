import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/apiService';
import { Dog, Trash2, ExternalLink, Calendar, User, X, Stethoscope, Clock, CheckCircle } from 'lucide-react';

const PetsManagement = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPet, setSelectedPet] = useState(null);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchPets = async () => {
    try {
      const data = await dashboardService.getPets();
      setPets(data);
    } catch (err) {
      console.error("Failed to fetch pets", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPets();
  }, []);

  const handleViewDetails = async (pet) => {
    setSelectedPet(pet);
    setLoadingHistory(true);
    try {
      const history = await dashboardService.getPetHistory(pet._id);
      setMedicalHistory(history);
    } catch (err) {
      console.error("Failed to fetch medical history", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this pet?")) {
      try {
        await dashboardService.deletePet(id);
        setPets(pets.filter(p => p._id !== id));
      } catch (err) {
        alert("Failed to delete pet");
      }
    }
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = user.role || 'admin';

  const renderHistoryItem = (record) => {
    switch(record.type) {
      case 'appointment':
        return (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Calendar size={16} />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-800 tracking-tight">{record.title}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Physical Visit</p>
                </div>
              </div>
              <div className="px-3 py-1 bg-slate-50 rounded-lg border border-slate-100 text-[10px] font-black text-slate-500 uppercase">
                {new Date(record.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Clinic</p>
                <p className="text-xs font-bold text-slate-700">{record.clinic}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Veterinarian</p>
                <p className="text-xs font-bold text-slate-700">Dr. {record.vet}</p>
              </div>
            </div>
          </div>
        );
      case 'prescription':
        return (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <Stethoscope size={16} />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-800 tracking-tight">{record.title}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Medication Plan</p>
                </div>
              </div>
              <div className="px-3 py-1 bg-slate-50 rounded-lg border border-slate-100 text-[10px] font-black text-slate-500 uppercase">
                {new Date(record.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Prescribed Medication</p>
                <div className="flex flex-wrap gap-2">
                  {record.medicines.map((med, midx) => (
                    <span key={midx} className="bg-emerald-50 text-emerald-600 text-[11px] font-bold px-3 py-1 rounded-lg border border-emerald-100">
                      {med.name} ({med.dosage})
                    </span>
                  ))}
                </div>
              </div>
              {record.instructions && (
                <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Clinical Instructions</p>
                  <p className="text-xs text-slate-600 font-medium italic">"{record.instructions}"</p>
                </div>
              )}
            </div>
          </div>
        );
      case 'vaccination':
        return (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                  <CheckCircle size={16} />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-800 tracking-tight">{record.title}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Immunization</p>
                </div>
              </div>
              <div className="px-3 py-1 bg-slate-50 rounded-lg border border-slate-100 text-[10px] font-black text-slate-500 uppercase">
                {new Date(record.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
            {record.nextDue && (
              <div className="mt-2 text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-2">
                <Clock size={12} /> Next Due: {new Date(record.nextDue).toLocaleDateString()}
              </div>
            )}
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="p-10 mt-16 ml-64 min-h-screen bg-slate-50/50 relative overflow-hidden">
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {role === 'vet' ? 'My Patients' : 'Pet Registry'}
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            {role === 'vet' ? 'Pets currently under your care and treatment.' : 'Lifecycle management for all platform members.'}
          </p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-200 text-sm font-black text-slate-700 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Dog size={18} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest leading-none mb-1">
              {role === 'vet' ? 'Total Patients' : 'Total Members'}
            </p>
            <p className="text-lg leading-none">{pets.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-8 py-5">Pet Details</th>
                <th className="px-8 py-5">Classification</th>
                <th className="px-8 py-5">Verified Owner</th>
                <th className="px-8 py-5">Account Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="5" className="px-8 py-20 text-center text-slate-300 font-bold italic">Gathering pet data...</td></tr>
              ) : pets.map((pet) => (
                <tr key={pet._id} className="group hover:bg-slate-50/80 transition-all duration-200 cursor-pointer" onClick={() => handleViewDetails(pet)}>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shadow-sm group-hover:scale-110 transition-transform duration-300">
                        <img src={pet.image || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=100"} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-black text-slate-800 text-lg tracking-tight leading-tight">{pet.name}</p>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">{pet.gender} • {pet.age} Years</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="space-y-1">
                      <div className="text-sm font-black text-slate-700">{pet.type}</div>
                      <div className="text-xs text-slate-400 font-bold uppercase tracking-tight">{pet.breed}</div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-sm text-slate-600 font-bold">
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                        <User size={12} className="text-slate-400" />
                      </div>
                      {pet.ownerId?.name || 'Undefined Owner'}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-600 border border-emerald-200">
                      Active
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* <button 
                        onClick={(e) => { e.stopPropagation(); handleViewDetails(pet); }}
                        className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-white hover:shadow-lg rounded-xl transition-all border border-transparent hover:border-slate-100"
                      >
                        <ExternalLink size={18} />
                      </button> */}
                      {role === 'admin' && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDelete(pet._id); }}
                          className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-white hover:shadow-lg rounded-xl transition-all border border-transparent hover:border-slate-100"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pet Profile Slide-over */}
      {selectedPet && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setSelectedPet(null)} />
          <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl border-4 border-white shadow-lg overflow-hidden">
                  <img src={selectedPet.image || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=100"} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 leading-tight">{selectedPet.name}</h2>
                  <p className="text-xs font-black text-primary uppercase tracking-[0.2em]">{selectedPet.breed} • {selectedPet.type}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedPet(null)}
                className="w-10 h-10 rounded-full hover:bg-white flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all border border-transparent hover:border-rose-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-12">
              <section>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-primary rounded-full" /> Patient Particulars
                </h3>
                <div className="grid grid-cols-3 gap-6">
                  {[
                    { label: 'Age', value: `${selectedPet.age} Years` },
                    { label: 'Gender', value: selectedPet.gender },
                    { label: 'Weight', value: selectedPet.weight ? `${selectedPet.weight} kg` : 'N/A' },
                  ].map((item, idx) => (
                    <div key={idx} className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                      <p className="text-sm font-black text-slate-700">{item.value}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-rose-500 rounded-full" /> Medical History Timeline
                  </h3>
                  <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-tighter">
                    {medicalHistory.length} Record(s) Found
                  </span>
                </div>

                {loadingHistory ? (
                  <div className="py-12 text-center text-slate-400 italic animate-pulse font-bold">Retrieving patient history...</div>
                ) : medicalHistory.length === 0 ? (
                  <div className="bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-12 text-center">
                    <Dog size={40} className="mx-auto text-slate-200 mb-4" />
                    <p className="text-slate-400 font-black text-xs uppercase tracking-widest">No previous medical records discovered</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {medicalHistory.map((record, idx) => (
                      <div key={record._id || idx} className="relative pl-10 before:absolute before:left-3 before:top-2 before:bottom-[-24px] before:w-[2px] before:bg-slate-100 last:before:hidden">
                        <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-white border-2 border-primary flex items-center justify-center z-10">
                          <div className={`w-2 h-2 rounded-full ${record.type === 'prescription' ? 'bg-emerald-500' : record.type === 'appointment' ? 'bg-blue-500' : 'bg-purple-500'}`} />
                        </div>
                        {renderHistoryItem(record)}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
            
            <div className="p-8 border-t border-slate-100 bg-slate-50/30">
              <button 
                onClick={() => setSelectedPet(null)}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm tracking-widest uppercase hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-200"
              >
                Close Patient Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PetsManagement;
