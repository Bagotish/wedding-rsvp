"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [activeTab, setActiveTab] = useState('management'); // 'management' atau 'server'
  // State untuk Modal Detail
  const [selectedDetail, setSelectedDetail] = useState<any>(null);
  const [storageUsage, setStorageUsage] = useState({ size: 0, count: 0 });
// 1. Tambah state baru
const [cloudinaryUsage, setCloudinaryUsage] = useState({ used: 0, limit: 1024, percentage: 0, count: 0 });

 const fetchData = async () => {
    setLoading(true);
    
    const { data: guests, error } = await supabase
      .from('guests')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error) setData(guests || []);
    
    // Fetch Storage Stats
    const { data: files } = await supabase.storage.from('moments').list('');
    if (files) {
      const totalSize = files.reduce((acc, file) => acc + (file.metadata?.size || 0), 0);
      setStorageUsage({ size: totalSize / (1024 * 1024), count: files.length });
    }
    // const res = await fetch('/api/server-stats');
    // const cloudData = await res.json();
    // console.log('hehe',res)
    // if (!cloudData.error) {
    //   setCloudinaryUsage(cloudData);
    // }
    setLoading(false);
  };

  useEffect(() => {
    if (isAuthorized) fetchData();
  }, [isAuthorized]);

  const handleDelete = async (id: string) => {
    if (confirm('Padam rekod ini secara kekal?')) {
      const { error } = await supabase.from('guests').delete().eq('id', id);
      if (!error) fetchData();
    }
  };
const [typeFilter, setTypeFilter] = useState('Semua'); // Semua, rsvp, live
const filteredData = data.filter((item) => {
  const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
  const matchesStatus = statusFilter === 'Semua' || item.attendance === statusFilter;
  
  // Tambah filter jenis post di sini
  const matchesType = typeFilter === 'Semua' || item.type === typeFilter;
  
  return matchesSearch && matchesStatus && matchesType;
});

// Statistik Calculation
  const stats = {
    // 1. Bilangan 'Hantaran' (Berapa orang isi form)
    entries: data.length,

    // 2. JUMLAH TETAMU (Sum of Pax bagi yang Hadir)
    // Kita guna .reduce untuk tambah semua nilai pax
    totalGuests: data
      .filter(g => g.attendance === 'Hadir')
      .reduce((acc, curr) => acc + (Number(curr.pax) || 1), 0), 

    // 3. Bilangan Wishes & Moments
    wishes: data.filter(g => g.type === 'rsvp').length,
    moments: data.filter(g => g.type === 'live').length,
  };

  if (!isAuthorized) {
    return (
      <div className="fixed inset-0 bg-[#FBF9F7] flex items-center justify-center p-6 z-[999]">
        <form onSubmit={(e) => { e.preventDefault(); if(password === 'admin123') setIsAuthorized(true); else alert('Salah!'); }} 
              className="w-full max-w-sm p-10 bg-white rounded-[40px] shadow-2xl border border-[#D6C7B5]/20 text-center">
          <h2 className="text-[#4A443F] font-black uppercase tracking-widest mb-8 text-sm">Admin Access</h2>
          <input type="password" placeholder="PASSWORD" className="w-full bg-[#FBF9F7] px-6 py-4 rounded-2xl mb-4 outline-none border text-center tracking-[0.5em]" onChange={(e) => setPassword(e.target.value)} />
          <button className="w-full py-4 bg-[#4A443F] text-white rounded-2xl font-black uppercase tracking-widest">Enter Dashboard</button>
        </form>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-[#FBF9F7] overflow-y-auto flex flex-col items-center selection:bg-[#D6C7B5]">
      <div className="w-full max-w-4xl p-6 md:p-10 flex flex-col min-h-min">
        
        {/* Header */}
        <div className="flex justify-between items-end mb-10 w-full pt-4">
          <div>
            <h1 className="text-3xl font-black text-[#4A443F] uppercase tracking-tighter">Admin</h1>
            <p className="text-[10px] font-bold text-[#A39584] uppercase tracking-[0.3em]">Guest & Moments Manager</p>
          </div>
<div className="flex items-center gap-2">
  {/* Button Reset RSVP */}
  <button 
    onClick={() => { localStorage.setItem('rsvp_submitted', 'false'), localStorage.setItem('rsvp_sender','');alert('RSVP Berjaya Direset!'); }} 
    className="text-[9px] font-black uppercase text-gray-500 border border-gray-200 px-4 py-2 rounded-full hover:bg-gray-50 transition-all"
  >
    Reset RSVP
  </button>

  {/* Button Logout */}
  <button 
    onClick={() => setIsAuthorized(false)} 
    className="text-[9px] font-black uppercase text-red-400 border border-red-100 px-4 py-2 rounded-full hover:bg-red-50 transition-all"
  >
    Logout
  </button>
</div>        </div>

       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 w-full">
  {[
    { label: 'Jumlah Tetamu (Pax)', val: stats.totalGuests, color: 'text-[#4A443F]' },
    { label: 'Jumlah Entry', val: stats.entries, color: 'text-[#A39584]' },
    { label: 'RSVP', val: stats.wishes, color: 'text-blue-600' },
    { label: 'Live Moments', val: stats.moments, color: 'text-purple-600' },
  ].map((s, i) => (
    <div key={i} className="bg-white p-6 rounded-[35px] border border-[#D6C7B5]/10 shadow-sm">
      <p className="text-[8px] font-black text-[#A39584] uppercase mb-1 tracking-widest">{s.label}</p>
      <h2 className={`text-2xl font-black ${s.color}`}>{s.val}</h2>
    </div>
  ))}
</div>
        <div className="flex gap-8 mb-8 px-2 border-b border-[#D6C7B5]/20">
          {['management', 'server'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] relative transition-colors ${activeTab === tab ? 'text-[#4A443F]' : 'text-[#A39584]/40'}`}>
              {tab === 'management' ? 'Management' : 'Server Health'}
              {activeTab === tab && <motion.div layoutId="tabLine" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4A443F]" />}
            </button>
          ))}
        </div>
 <AnimatePresence mode="wait">
          {activeTab === 'management' ? (
            <motion.div key="mgmt" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
              {/* Search & Filter Section */}
<div className="mb-8 space-y-4 w-full px-2">
  {/* Search Bar */}
  <input 
    type="text" 
    placeholder="Cari nama tetamu..." 
    value={searchTerm} 
    onChange={(e) => setSearchTerm(e.target.value)} 
    className="w-full bg-white border border-[#D6C7B5]/20 px-6 py-4 rounded-2xl text-[12px] outline-none shadow-sm focus:border-[#A39584]"
  />

  <div className="flex flex-col gap-3">
    {/* Filter Status Kehadiran */}
    <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
      <span className="text-[7px] font-black uppercase text-[#A39584] self-center mr-2 shrink-0">Status:</span>
      {['Semua', 'Hadir', 'Tidak Hadir'].map((status) => (
        <button key={status} onClick={() => setStatusFilter(status)} 
          className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border shrink-0 transition-all ${statusFilter === status ? 'bg-[#4A443F] text-white' : 'bg-white text-[#A39584]'}`}>
          {status}
        </button>
      ))}
    </div>

    {/* Filter Jenis Post (RSVP / Live) */}
    <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
      <span className="text-[7px] font-black uppercase text-[#A39584] self-center mr-2 shrink-0">Jenis:</span>
      {[
        { id: 'Semua', label: 'Semua Post' },
        { id: 'rsvp', label: 'RSVP & Wishes' },
        { id: 'live', label: 'Live Moments' }
      ].map((type) => (
        <button key={type.id} onClick={() => setTypeFilter(type.id)} 
          className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border shrink-0 transition-all ${typeFilter === type.id ? 'bg-[#A39584] text-white border-[#A39584]' : 'bg-white text-[#A39584]'}`}>
          {type.label}
        </button>
      ))}
    </div>
  </div>
</div>

        {/* List Table */}
        <div className="w-full pb-20">
          <div className="flex justify-between items-center mb-6 border-b border-[#D6C7B5]/20 pb-4">
            <h3 className="text-[12px] font-black text-[#4A443F] uppercase tracking-widest">Senarai Tetamu ({filteredData.length})</h3>
            <button onClick={fetchData} className="text-[10px] font-bold text-[#A39584] uppercase">Refresh</button>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-20 animate-pulse text-[#A39584] text-[10px] font-black">LOADING DATA...</div>
            ) : filteredData.map((item) => (
              <motion.div 
                layout 
                key={item.id} 
                onClick={() => setSelectedDetail(item)} // Tekan row untuk modal
                className="bg-white/70 backdrop-blur-md p-5 rounded-[30px] border border-white flex items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className={`w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center text-lg ${item.image_url ? 'p-0 overflow-hidden' : 'bg-[#FBF9F7]'}`}>
                    {item.image_url ? <img src={item.image_url} className="w-full h-full object-cover" /> : '👤'}
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-[11px] font-black text-[#4A443F] uppercase truncate group-hover:text-[#A39584] transition-colors">{item.name}</h4>
                      <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded ${item.attendance === 'Hadir' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                        {item.attendance} {item.attendance === 'Hadir' && `(${item.pax || 1} Pax)`}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#A39584] italic truncate max-w-[200px]">"{item.message || '-'}"</p>
                  </div>
                </div>

                <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} 
                  className="p-3 bg-red-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all active:scale-90 shadow-sm"
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg>
                </button>
              </motion.div>
            ))}
          </div>
        </div>
               </motion.div>
          ) : (
            /* SERVER HEALTH VIEW */
            <motion.div key="srv" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
              <div className="bg-[#4A443F] rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-8"><div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" /><h3 className="text-[10px] font-black uppercase tracking-[0.3em]">System Status: Healthy</h3></div>
                  <div className="space-y-8">
                    <div>
{/* Cloudinary Storage Monitor */}
<div>
  <div className="flex justify-between mb-2">
    <p className="text-[9px] font-bold uppercase text-white/60">Cloudinary Media (Free 25GB)</p>
    <p className="text-[10px] font-black">
      {cloudinaryUsage.used.toFixed(2)} MB / {cloudinaryUsage.limit.toFixed(0)} MB
    </p>
  </div>
  
  <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
    <motion.div 
      initial={{ width: 0 }} 
      animate={{ width: `${cloudinaryUsage.percentage}%` }} 
      className={`h-full ${cloudinaryUsage.percentage > 80 ? 'bg-red-400' : 'bg-blue-400'}`} 
    />
  </div>
  
  <p className="text-[8px] mt-2 text-white/40 uppercase italic">
    Total Assets: {cloudinaryUsage.count} files
  </p>
</div>                      <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${(storageUsage.size / 1000) * 100}%` }} className={`h-full ${(storageUsage.size/1000)*100 > 80 ? 'bg-red-400' : 'bg-[#D6C7B5]'}`} />
                      </div>
                      <p className="text-[8px] mt-2 text-white/40 uppercase italic">Terdiri daripada {storageUsage.count} fail gambar.</p>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2"><p className="text-[9px] font-bold uppercase text-white/60">Database Rows</p><p className="text-[10px] font-black">{data.length} / 500,000</p></div>
                      <div className="w-full h-1 bg-white/10 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
       
      {/* MODAL DETAIL GUEST */}
      <AnimatePresence>
        {selectedDetail && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedDetail(null)}
              className="absolute inset-0 bg-[#4A443F]/20 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-white/90 backdrop-blur-2xl border border-white p-8 rounded-[40px] shadow-2xl text-center"
            >
              <span className="text-[8px] font-black text-[#A39584] uppercase tracking-[0.4em] mb-4 block">Detail Tetamu</span>
              
              {selectedDetail.image_url && (
                <img src={selectedDetail.image_url} className="w-24 h-24 rounded-3xl object-cover mx-auto mb-6 border-4 border-white shadow-lg" />
              )}

              <h3 className="text-lg font-black text-[#4A443F] uppercase tracking-tighter mb-1">{selectedDetail.name}</h3>
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                <span className={`text-[8px] font-bold px-3 py-1 rounded-full uppercase ${selectedDetail.attendance === 'Hadir' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                  {selectedDetail.attendance}
                </span>
                {selectedDetail.attendance === 'Hadir' && (
                  <span className="text-[8px] font-bold px-3 py-1 rounded-full bg-[#FBF9F7] text-[#A39584] uppercase">
                    {selectedDetail.pax || 1} Pax
                  </span>
                )}
                <span className="text-[8px] font-bold px-3 py-1 rounded-full bg-gray-100 text-gray-400 uppercase">
                  {selectedDetail.type}
                </span>
              </div>

              <div className="bg-[#FBF9F7] p-6 rounded-[30px] mb-8">
                <p className="text-[13px] text-[#4A443F] italic leading-relaxed font-serif">
                  "{selectedDetail.message || 'Tiada mesej ditinggalkan'}"
                </p>
              </div>

              <div className="text-[9px] text-[#A39584] font-medium uppercase tracking-widest mb-8">
                Tarikh: {new Date(selectedDetail.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}