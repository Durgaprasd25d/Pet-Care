import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/apiService';
import { ShoppingBag, Truck, CheckCircle, XCircle, Clock, MapPin, Phone } from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 group">
    <div className="flex items-center justify-between mb-6">
      <div className={`p-3 rounded-xl ${color} text-white group-hover:scale-110 transition-transform duration-300`}>
        <Icon size={26} />
      </div>
    </div>
    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{label}</p>
    <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
  </div>
);

const StoreOrderManagement = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getStoreOrders();
      setOrders(data);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user?._id]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await dashboardService.updateOrderStatus(id, status);
      fetchOrders();
    } catch (err) {
      console.error("Status update failed", err);
    }
  };

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'placed': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'confirmed': return 'bg-indigo-100 text-indigo-600 border-indigo-200';
      case 'out_for_delivery': return 'bg-amber-100 text-amber-600 border-amber-200';
      case 'delivered': return 'bg-emerald-100 text-emerald-600 border-emerald-200';
      case 'cancelled': return 'bg-rose-100 text-rose-600 border-rose-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="p-10 mt-16 ml-64 min-h-screen bg-slate-50/50">
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Order Management</h1>
          <p className="text-slate-500 font-medium mt-1">Track and process customer orders for your store.</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
          {['all', 'placed', 'confirmed', 'out_for_delivery', 'delivered'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                filter === f ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
        <StatCard label="New Orders" value={orders.filter(o => o.status === 'placed').length} icon={ShoppingBag} color="bg-blue-500" />
        <StatCard label="Processing" value={orders.filter(o => ['confirmed', 'out_for_delivery'].includes(o.status)).length} icon={Clock} color="bg-indigo-500" />
        <StatCard label="Completed" value={orders.filter(o => o.status === 'delivered').length} icon={CheckCircle} color="bg-emerald-500" />
        <StatCard label="Revoked" value={orders.filter(o => o.status === 'cancelled').length} icon={XCircle} color="bg-rose-500" />
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="bg-white p-20 rounded-3xl border border-slate-200 text-center text-slate-300 font-bold italic">Synchronizing order stream...</div>
        ) : filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <div key={order._id} className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <ShoppingBag size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 tracking-tight">Order #{order._id.substring(18).toUpperCase()}</h3>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(order.status)}`}>
                    {order.status.replace('_', ' ')}
                  </span>
                  <div className="h-8 w-px bg-slate-200 mx-2"></div>
                  <p className="text-xl font-black text-primary">₹{Math.round(order.totalPrice)}</p>
                </div>
              </div>
              
              <div className="p-8 grid grid-cols-3 gap-8">
                <div className="col-span-2 space-y-4">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest border-b border-slate-50 pb-2">Order Items</p>
                  <div className="grid grid-cols-1 gap-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50/50 border border-slate-100">
                        <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 overflow-hidden">
                          <img src={item.image} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-slate-800 text-sm">{item.name}</p>
                          <p className="text-xs text-slate-400 font-medium">Qty: {item.quantity} × ₹{Math.round(item.price)}</p>
                        </div>
                        <p className="font-black text-slate-700 font-mono text-sm">₹{Math.round(item.quantity * item.price)}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-4 p-6 rounded-3xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Shipment Info</p>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 text-sm font-bold text-slate-600">
                        <MapPin size={16} className="text-slate-300 mt-0.5 shrink-0" />
                        <p>{order.address}</p>
                      </div>
                      <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                         <Phone size={16} className="text-slate-300 shrink-0" />
                         <p>{order.phone}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Update Pipeline</p>
                    <div className="grid grid-cols-2 gap-2">
                      {order.status === 'placed' && (
                        <button 
                          onClick={() => handleUpdateStatus(order._id, 'confirmed')}
                          className="col-span-2 bg-indigo-600 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
                        >
                          Confirm Order
                        </button>
                      )}
                      {order.status === 'confirmed' && (
                        <button 
                          onClick={() => handleUpdateStatus(order._id, 'out_for_delivery')}
                          className="col-span-2 bg-amber-500 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-amber-200 hover:bg-amber-600 transition-all flex items-center justify-center gap-2"
                        >
                          <Truck size={14} /> Mark Shipped
                        </button>
                      )}
                      {order.status === 'out_for_delivery' && (
                        <button 
                           onClick={() => handleUpdateStatus(order._id, 'delivered')}
                           className="col-span-2 bg-emerald-500 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition-all"
                        >
                          Confirm Delivery
                        </button>
                      )}
                      {['placed', 'confirmed'].includes(order.status) && (
                        <button 
                          onClick={() => handleUpdateStatus(order._id, 'cancelled')}
                          className="col-span-2 border border-rose-200 text-rose-500 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-rose-50 transition-all"
                        >
                          Revoke Order
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-20 text-center bg-white rounded-3xl border border-slate-200 border-dashed">
            <ShoppingBag size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="font-bold text-slate-400">No orders found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreOrderManagement;
