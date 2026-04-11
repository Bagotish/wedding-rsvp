"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase'; // Pastikan path ini betul ke file supabase client kau
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminPage() {
  // --- STATES ---
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState('management'); // management | server
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [typeFilter, setTypeFilter] = useState('Semua');
  
  // UI States
  const [selectedDetail, setSelectedDetail] = useState<any>(null);
  const [storageUsage, setStorageUsage] = useState({ size: 0, count: 0 });

  
  // --- DATA FETCHING ---
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
    setLoading(false);
  };

  useEffect(() => {
    if (isAuthorized) fetchData();
  }, [isAuthorized]);

  // --- HANDLERS ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') setIsAuthorized(true);
    else alert("Password Salah!");
  };

  const handleDelete = async (id: string) => {
    if (confirm('Padam rekod ini secara kekal?')) {
      const { error } = await supabase.from('guests').delete().eq('id', id);
      if (!error) fetchData();
    }
  };

  // --- LOGIC ---
  const filteredData = data.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'Semua' || item.attendance === statusFilter;
    const matchesType = typeFilter === 'Semua' || item.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    entries: data.length,
    totalGuests: data.filter(g => g.attendance === 'Hadir').reduce((acc, curr) => acc + (Number(curr.pax) || 1), 0),
    wishes: data.filter(g => g.type === 'rsvp').length,
    moments: data.filter(g => g.type === 'live').length,
  };

  // --- LOGIN VIEW ---
  if (!isAuthorized) {
    return (
      <div className="fixed inset-0 bg-[#FBF9F7] flex items-center justify-center p-6 z-[999]">
        <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleLogin} 
          className="w-full max-w-sm p-10 bg-white rounded-[40px] shadow-2xl border border-[#D6C7B5]/20 text-center">
          <h2 className="text-[#4A443F] font-black uppercase tracking-widest mb-8">Admin Access</h2>
          <input type="password" placeholder="PASSWORD" className="w-full bg-[#FBF9F7] px-6 py-4 rounded-2xl mb-4 outline-none border focus:border-[#A39584] text-center tracking-[0.5em]" onChange={(e) => setPassword(e.target.value)} />
          <button className="w-full py-4 bg-[#4A443F] text-white rounded-2xl font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">Enter Dashboard</button>
        </motion.form>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-[#FBF9F7] overflow-y-auto flex flex-col items-center selection:bg-[#D6C7B5]">
      <div className="w-full max-w-4xl p-6 md:p-10">
        
        {/* Header */}
        <div className="flex justify-between items-end mb-10 pt-4">
          <div>
            <h1 className="text-3xl font-black text-[#4A443F] uppercase tracking-tighter">Admin</h1>
            <p className="text-[10px] font-bold text-[#A39584] uppercase tracking-[0.3em]">Master Control</p>
          </div>
          <button onClick={() => setIsAuthorized(false)} className="text-[9px] font-black uppercase text-red-400 border border-red-100 px-4 py-2 rounded-full hover:bg-red-50 transition-colors">Logout</button>
        </div>

        {/* 1. STATS SECTION */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total Pax', val: stats.totalGuests, color: 'text-[#4A443F]' },
            { label: 'Entries', val: stats.entries, color: 'text-[#A39584]' },
            { label: 'Wishes', val: stats.wishes, color: 'text-blue-600' },
            { label: 'Moments', val: stats.moments, color: 'text-purple-600' },
          ].map((s, i) => (
            <div key={i} className="bg-white p-6 rounded-[35px] border border-[#D6C7B5]/10 shadow-sm">
              <p className="text-[8px] font-black text-[#A39584] uppercase mb-1 tracking-widest">{s.label}</p>
              <h2 className="text-2xl font-black">{s.val}</h2>
            </div>
          ))}
        </div>

        {/* 2. TAB NAVIGATION */}
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
              
              {/* FILTERS */}
              <div className="mb-8 space-y-4 px-2">
                <input type="text" placeholder="Cari nama..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} 
                  className="w-full bg-white border border-[#D6C7B5]/20 px-6 py-4 rounded-2xl text-[12px] outline-none shadow-sm focus:border-[#A39584]" />
                
                <div className="flex flex-col gap-3">
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    <span className="text-[7px] font-black uppercase text-[#A39584] self-center mr-2">Status:</span>
                    {['Semua', 'Hadir', 'Tidak Hadir'].map(s => (
                      <button key={s} onClick={() => setStatusFilter(s)} className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase border shrink-0 ${statusFilter === s ? 'bg-[#4A443F] text-white' : 'bg-white text-[#A39584]'}`}>{s}</button>
                    ))}
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    <span className="text-[7px] font-black uppercase text-[#A39584] self-center mr-2">Jenis:</span>
                    {[{id:'Semua', l:'Semua'}, {id:'rsvp', l:'RSVP'}, {id:'live', l:'Moments'}].map(t => (
                      <button key={t.id} onClick={() => setTypeFilter(t.id)} className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase border shrink-0 ${typeFilter === t.id ? 'bg-[#A39584] text-white' : 'bg-white text-[#A39584]'}`}>{t.l}</button>
                    ))}
                  </div>
                </div>
              </div>

              {/* GUEST LIST */}
              <div className="space-y-3 pb-20">
                {loading ? <div className="text-center py-20 text-[10px] font-black text-[#A39584]">LOADING...</div> : 
                  filteredData.map((item) => (
                    <motion.div layout key={item.id} onClick={() => setSelectedDetail(item)} className="bg-white/70 backdrop-blur-md p-5 rounded-[30px] border border-white flex items-center justify-between gap-4 shadow-sm hover:shadow-md cursor-pointer transition-all">
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="w-12 h-12 rounded-2xl bg-[#FBF9F7] shrink-0 flex items-center justify-center overflow-hidden border border-[#D6C7B5]/10">
                          {item.image_url ? <img src={item.image_url} className="w-full h-full object-cover" /> : '👤'}
                        </div>
                        <div className="truncate">
                          <h4 className="text-[11px] font-black text-[#4A443F] uppercase truncate">{item.name}</h4>
                          <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded ${item.attendance === 'Hadir' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                            {item.attendance} {item.attendance === 'Hadir' && `(${item.pax || 1} Pax)`}
                          </span>
                        </div>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} className="p-3 bg-red-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all"><svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg></button>
                    </motion.div>
                  ))
                }
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
                      <div className="flex justify-between mb-2"><p className="text-[9px] font-bold uppercase text-white/60">Storage (1GB Limit)</p><p className="text-[10px] font-black">{storageUsage.size.toFixed(2)} MB / 1000 MB</p></div>
                      <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
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

      {/* DETAIL MODAL */}
      <AnimatePresence>
        {selectedDetail && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedDetail(null)} className="absolute inset-0 bg-black/40 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-sm bg-white p-8 rounded-[40px] shadow-2xl text-center">
              <span className="text-[8px] font-black text-[#A39584] uppercase tracking-widest block mb-4">Guest Detail</span>
              {selectedDetail.image_url && <img src={selectedDetail.image_url} className="w-20 h-20 rounded-2xl object-cover mx-auto mb-4 border border-[#D6C7B5]/20 shadow-sm" />}
              <h3 className="text-lg font-black text-[#4A443F] uppercase tracking-tighter mb-4">{selectedDetail.name}</h3>
              <div className="bg-[#FBF9F7] p-6 rounded-[30px] mb-6 text-sm italic text-[#4A443F]">"{selectedDetail.message || 'Tiada mesej'}"</div>
              <div className="grid grid-cols-2 gap-2 mb-8 text-[9px] font-black uppercase text-[#A39584]">
                <div className="bg-white border p-3 rounded-2xl">Pax: {selectedDetail.pax || 1}</div>
                <div className="bg-white border p-3 rounded-2xl">{selectedDetail.attendance}</div>
              </div>
              <button onClick={() => setSelectedDetail(null)} className="w-full py-4 bg-[#4A443F] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">Tutup</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}