import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/apiService';
import { Heart, Trash2, Edit, Plus, User,X, Info, CheckCircle, Clock } from 'lucide-react';

const AdoptionManagement = ({ user }) => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPet, setNewPet] = useState({
    name: '',
    type: 'Dog',
    breed: '',
    age: '',
    gender: 'Male',
    description: '',
    healthStatus: '',
    vaccinationStatus: '',
     personality: '',
    location: '',
  });
  const [imageFile, setImageFile] = useState(null);

  const fetchPets = async () => {
    try {
      const data = await dashboardService.getShelterPets();
      setPets(data);
    } catch (err) {
      console.error("Failed to fetch shelter pets", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPets();
  }, []);

  const handleAddPet = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(newPet).forEach(key => formData.append(key, newPet[key]));
    if (imageFile) formData.append('image', imageFile);

    try {
      await dashboardService.createAdoptionPet(formData);
      setShowAddModal(false);
      fetchPets();
      setNewPet({ name: '', type: 'Dog', breed: '', age: '', gender: 'Male', description: '', healthStatus: '', vaccinationStatus: '', personality: '', location: '' });
      setImageFile(null);
    } catch (err) {
      alert("Failed to add pet");
    }
  };

  return (
    <div className="p-8 mt-16 ml-64 min-h-screen bg-slate-50">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Adoption Listings</h1>
          <p className="text-slate-500">Manage your pets available for adoption.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-all"
        >
          <Plus size={20} /> List New Pet
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center text-slate-400">Loading your pets...</div>
        ) : pets.length === 0 ? (
          <div className="col-span-full py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-center">
             <Heart size={48} className="mx-auto text-slate-200 mb-4" />
             <p className="text-slate-400 font-bold">No pets listed yet. Start by adding one!</p>
          </div>
        ) : pets.map((pet) => (
          <div key={pet._id} className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex">
            <div className="w-48 h-full min-h-[200px] overflow-hidden">
              <img src={pet.image} alt={pet.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 p-6">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-black text-xl text-slate-900">{pet.name}</h3>
                  <p className="text-xs text-primary uppercase tracking-widest font-black">{pet.type} • {pet.breed}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                  pet.status === 'available' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                }`}>
                  {pet.status}
                </div>
              </div>
              
              <div className="flex gap-4 mt-4 text-xs text-slate-500 font-bold">
                <span className="flex items-center gap-1"><Clock size={14} /> {pet.age}</span>
                <span className="flex items-center gap-1"><User size={14} /> {pet.gender}</span>
              </div>

              <div className="mt-6 flex gap-2">
                <button className="flex-1 bg-slate-100 text-slate-600 py-2.5 rounded-xl font-bold hover:bg-slate-200 transition-all text-sm">Edit Details</button>
                <button className="px-4 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 transition-all"><Trash2 size={18} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-black text-slate-900">List Pet for Adoption</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleAddPet} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pet Name</label>
                  <input type="text" required value={newPet.name} onChange={e => setNewPet({...newPet, name: e.target.value})} className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pet Type</label>
                  <select value={newPet.type} onChange={e => setNewPet({...newPet, type: e.target.value})} className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary outline-none font-bold">
                    <option>Dog</option>
                    <option>Cat</option>
                    <option>Bird</option>
                    <option>Rabbit</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Breed</label>
                  <input type="text" required value={newPet.breed} onChange={e => setNewPet({...newPet, breed: e.target.value})} className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Age (e.g. 2 Years)</label>
                  <input type="text" required value={newPet.age} onChange={e => setNewPet({...newPet, age: e.target.value})} className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Gender</label>
                  <select value={newPet.gender} onChange={e => setNewPet({...newPet, gender: e.target.value})} className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold">
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Health Status</label>
                <input type="text" required value={newPet.healthStatus} onChange={e => setNewPet({...newPet, healthStatus: e.target.value})} className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" placeholder="e.g. Fit & Healthy, All clear" />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Vaccination Status</label>
                <input type="text" required value={newPet.vaccinationStatus} onChange={e => setNewPet({...newPet, vaccinationStatus: e.target.value})} className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" placeholder="e.g. Fully Vaccinated, 1 dose pending" />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Description</label>
                <textarea required value={newPet.description} onChange={e => setNewPet({...newPet, description: e.target.value})} className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold h-32 resize-none" placeholder="Write something about the pet..." />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pet Photo</label>
                <input type="file" onChange={e => setImageFile(e.target.files[0])} className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" />
              </div>

              <button type="submit" className="w-full bg-primary text-white py-4 rounded-2xl font-black shadow-xl shadow-primary/30 hover:scale-[1.02] transition-all">Publish Adoption Listing</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdoptionManagement;
