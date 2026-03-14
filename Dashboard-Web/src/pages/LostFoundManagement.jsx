import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/apiService';
import { AlertOctagon, Check, Clock, Phone, MapPin, Trash2 } from 'lucide-react';

const LostFoundManagement = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      const data = await dashboardService.getLostPets();
      setReports(data);
    } catch (err) {
      console.error("Failed to fetch reports", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await dashboardService.updateLostPetStatus(id, status);
      fetchReports();
    } catch (err) {
      alert("Status update failed");
    }
  };

  return (
    <div className="p-8 mt-16 ml-64 min-h-screen bg-slate-50">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Lost & Found Reports</h1>
          <p className="text-slate-500">Manage sensitive reports and help reunite pets.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-amber-50 px-4 py-2 rounded-lg border border-amber-100 text-sm font-semibold text-amber-600">
            Open Reports: {reports.filter(r => r.status !== 'resolved').length}
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Pet / Type</th>
                <th className="px-6 py-4">Location & Date</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-400">Loading reports...</td></tr>
              ) : reports.map((report) => (
                <tr key={report._id} className={`${report.status === 'resolved' ? 'bg-slate-50/50 grayscale' : ''} hover:bg-slate-50 transition-colors`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img src={report.image} className="w-12 h-12 rounded-lg object-cover" />
                        <span className={`absolute -top-1 -right-1 p-1 rounded-full border-2 border-white text-[8px] font-bold text-white ${report.type === 'lost' ? 'bg-red-500' : 'bg-blue-500'}`}>
                          {report.type === 'lost' ? 'L' : 'F'}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{report.petName}</p>
                        <p className="text-xs text-slate-500">{report.breed}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <MapPin size={14} className="text-slate-400" />
                      {report.lastSeenLocation}
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs mt-1">
                      <Clock size={12} />
                      {new Date(report.lastSeenDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <Phone size={12} className="text-slate-400" />
                      {report.contactInfo?.phone || 'No Phone'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${report.status === 'resolved' ? 'bg-slate-200 text-slate-500' : report.type === 'lost' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                      {report.status || report.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {report.status !== 'resolved' && (
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleStatusUpdate(report._id, 'resolved')}
                          className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors" 
                          title="Mark as Resolved"
                        >
                          <Check size={18} />
                        </button>
                      </div>
                    )}
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

export default LostFoundManagement;
