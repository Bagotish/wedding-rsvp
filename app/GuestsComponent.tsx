import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const GuestsComponent = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [subTabRolls, setSubTabRolls] = useState('wishes');
  const observerTarget = useRef(null);
  const PAGE_SIZE = 10;

  // 1. Logic Fetching Data
  const fetchData = async (reset = false) => {
    if (loading) return;
    setLoading(true);

    const from = reset ? 0 : page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const typeFilter = subTabRolls === 'wishes' ? 'rsvp' : 'live';

    const { data: results, error } = await supabase
      .from('guests')
      .select('*')
      .eq('type', typeFilter)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (results) {
      setData(prev => (reset ? results : [...prev, ...results]));
      setHasMore(results.length === PAGE_SIZE);
    }
    setLoading(false);
  };

  // 2. Reset bila tukar Tab
  useEffect(() => {
    setPage(0);
    setData([]);
    fetchData(true);
  }, [subTabRolls]);

  // 3. Load next page bila 'page' berubah
  useEffect(() => {
    if (page > 0) fetchData(false);
  }, [page]);

  // 4. Observer untuk Infinite Scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 1.0, rootMargin: '200px' }
    );

    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [hasMore, loading]);

  return (
    <motion.section 
      className="relative min-h-[100dvh] w-full flex flex-col items-center snap-start px-4 pt-20 pb-20 overflow-x-hidden"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ amount: 0.1, once: true }} 
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        whileInView={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8"
      >
        {/* Tab Selector */}
        <div className="flex bg-[#F3EFE9] p-1 rounded-full border border-[#D6C7B5]/20 shadow-inner">
          <button 
            onClick={() => setSubTabRolls('wishes')} 
            className={`flex-1 py-3 rounded-full text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
              subTabRolls === 'wishes' ? 'bg-white shadow-md text-[#4A443F]' : 'text-[#A39584]/60'
            }`}
          >
            Wishes
          </button>
          <button 
            onClick={() => isLocked ? showToast("MOMENTS AKAN DIBUKA PADA 08.08.2026", "error") : setSubTabRolls('moments')} 
            className={`flex-1 py-3 rounded-full text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-2 ${
              subTabRolls === 'moments' ? 'bg-white shadow-md text-[#4A443F]' : (isLocked ? 'text-[#A39584]/30' : 'text-[#A39584]/60')
            }`}
          >
            Moments
          </button>
        </div>

        {/* Content Area */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            {subTabRolls === 'wishes' ? (
              <motion.div key="wishes-canvas" className="columns-2 gap-4 pt-4 space-y-4 px-2">
                {data.map((item) => (
                  <motion.div key={item.id} className="break-inside-avoid inline-block w-full relative p-6 bg-white/60 backdrop-blur-3xl border border-white/40 rounded-[35px] shadow-[0_20px_40px_rgba(74,68,63,0.08)] text-center">
                    <p className="text-[12px] text-[#4A443F] leading-relaxed font-serif italic mb-6 break-words">{item.message}</p>
                    <div className="w-8 h-[1px] bg-[#A39584]/20 mb-3 mx-auto" />
                    <h4 className="text-[10px] font-black text-[#4A443F] uppercase tracking-widest">{item.name}</h4>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div key="moments-grid" className="grid grid-cols-3 gap-[2px] bg-[#D6C7B5]/10 border border-[#D6C7B5]/10 rounded-2xl overflow-hidden mt-4">
                {data.map((item) => (
                  <div key={item.id} className="relative aspect-square bg-[#F3EFE9] overflow-hidden cursor-pointer">
                     {/* Image & Content Here */}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sentinel (Observer Target) */}
          <div ref={observerTarget} className="h-10 w-full" />
          
          {loading && (
            <div className="text-center py-4 text-[9px] text-[#A39584] animate-pulse">Memuatkan lagi...</div>
          )}
        </div>
      </motion.div>
    </motion.section>
  );
};