'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Image from 'next/image';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
// Import required modules
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { motion, AnimatePresence,Variants } from 'framer-motion';

// --- Konfigurasi Supabase ---
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const [activePage, setActivePage] = useState<'cover' | 'invitation' | 'rsvp' | 'book'>('cover');
  const [rsvpSubTab, setRsvpSubTab] = useState<'form' | 'moments'>('form');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // --- State untuk Snackbar ---
  const [snackbar, setSnackbar] = useState({ show: false, message: '', type: 'success' });

  // --- Fungsi untuk Tunjuk Snackbar ---
  const showSnackbar = (message: string, type: 'success' | 'error' = 'success') => {
    setSnackbar({ show: true, message, type });
    setTimeout(() => {
      setSnackbar({ show: false, message: '', type: 'success' });
    }, 4000); // Hilang selepas 4 saat
  };

  // --- Fungsi Fetch Data ---
  const fetchData = async () => {
    const { data, error } = await supabase
      .from('guests')
      .select('*')
      .eq('is_visible', true)
      .order('created_at', { ascending: false });
    
    if (error) console.error('Error fetching data:', error);
    if (data) setData(data);
  };

  useEffect(() => { fetchData(); }, []);

  // --- Kira Statistik Tetamu ---
  const countHadir = data.filter(i => i.attendance === 'Hadir' && i.type==='rsvp').length;
  const countTidakHadir = data.filter(i => i.attendance === 'Tidak Hadir' && i.type==='rsvp').length;

  // --- Fungsi Submit Data ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, type: string) => {
    e.preventDefault();
    setLoading(true);
    
    const formElement = e.currentTarget;
    const formData = new FormData(formElement);
    
    const name = formData.get('name') as string;
    const message = formData.get('message') as string;
    const attendance = formData.get('attendance') as string || 'Hadir';
    const file = formData.get('image') as File;
    let imageUrl = '';
  
    try {
      // Upload ke Cloudinary
      if (file && file.size > 0) {
        const cloudData = new FormData();
        cloudData.append('file', file);
        cloudData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
  
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          { method: 'POST', body: cloudData }
        );
  
        const fileData = await res.json();
        
        if (!res.ok) throw new Error(fileData.error?.message || 'Gagal upload gambar');
        
        imageUrl = fileData.secure_url;
      }
  
      // Insert ke Supabase
      const { data: insertedData, error: supabaseError } = await supabase
        .from('guests')
        .insert([{ 
          name, 
          attendance, 
          message, 
          image_url: imageUrl, 
          type,
          is_visible: true 
        }])
        .select();
  
      if (supabaseError) throw supabaseError;
      if (insertedData && insertedData.length > 0) {
        setData((prevData) => [insertedData[0], ...prevData]);
      }
  
      // GANTI ALERT DENGAN SNACKBAR
      showSnackbar(type === 'rsvp' ? 'RSVP berjaya dihantar!' : 'Moment berjaya dikongsi!', 'success');
      formElement.reset();
  
    } catch (err: any) {
      console.error('Error detail:', err);
      // GANTI ALERT DENGAN SNACKBAR
      showSnackbar('Maaf, ralat berlaku: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

// --- KOMPONEN NAVIGASI GAYA BUKU (BOOK TABS) ---
const NavigationBar = () => (
  <div className="flex justify-center mb-12 relative">
    {/* Garisan halus melintang sebagai sandaran tab */}
    <div className="absolute bottom-0 w-64 h-[1px] bg-stone-200"></div>
    
    <nav className="flex items-end gap-1">
      {[
        { id: 'invitation', label: 'Invitation' },
        { id: 'rsvp', label: 'RSVP & Moments' },
        { id: 'book', label: 'Guestbook' }
      ].map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActivePage(tab.id as any)}
          className={`
            relative px-6 py-2 text-[10px] tracking-[0.2em] uppercase transition-all duration-300
            ${activePage === tab.id 
              ? 'bg-[#FDFBF6] border-t border-l border-r border-stone-300 text-stone-900 -translate-y-[1px] z-20' 
              : 'bg-stone-100/50 border-t border-l border-r border-stone-200 text-stone-400 hover:text-stone-600 z-10'}
            rounded-t-md
          `}
          style={{ 
            boxShadow: activePage === tab.id ? '0 -2px 10px rgba(0,0,0,0.02)' : 'none' 
          }}
        >
          {tab.label}
          {/* Menutup garisan bawah bila tab aktif supaya nampak bercantum dengan helaian */}
          {activePage === tab.id && (
            <div className="absolute -bottom-[1px] left-0 w-full h-[2px] bg-[#FDFBF6] z-30"></div>
          )}
        </button>
      ))}
    </nav>
  </div>
);
// 1. State untuk kategori aktif ('rsvp' atau 'moments')
const [activeCategory, setActiveCategory] = useState('rsvp');
const [activeCategory1, setActiveCategory1] = useState('form');
const [currentPage, setCurrentPage] = useState(1);
const [selectedItem, setSelectedItem] = useState<any>(null);
const itemsPerPage = 4;

// 2. Filter data mengikut kategori yang dipilih
const filteredData = data.filter((item) => {
  if (activeCategory === 'rsvp') {
    return item.type === 'rsvp' && item.message;
  } else {
    return item.type === 'live'&& item.message;
  }
});

// 3. Logik Pagination (sentiasa rujuk pada filteredData)
const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

// 4. Fungsi tukar kategori (Reset page ke 1)
const handleCategoryChange = (cat:any) => {
  setActiveCategory(cat);
  setCurrentPage(1);
};
const handleCategoryChange1 = (cat:any) => {
  setActiveCategory1(cat);
  setRsvpSubTab(cat)
};


const pageVariants: Variants = {
  initial: (direction: number) => ({
    rotateY: direction > 0 ? 90 : -90,
    opacity: 0,
    transformOrigin: direction > 0 ? "left" : "right",
  }),
  animate: {
    rotateY: 0,
    opacity: 1,
    transition: {
      duration: 0.8,
      // Gunakan "as const" untuk memberitahu TS ini adalah fixed bezier array
      ease: [0.645, 0.045, 0.355, 1.0] as const, 
    },
  },
  exit: (direction: number) => ({
    rotateY: direction > 0 ? -90 : 90,
    opacity: 0,
    transformOrigin: direction > 0 ? "right" : "left",
    transition: {
      duration: 0.8,
      ease: [0.645, 0.045, 0.355, 1.0] as const,
    },
  }),
};
// Tambah state direction
const [direction, setDirection] = useState(0);

// Gantikan cara panggil setActivePage dengan fungsi ini
const paginate = (newPage: 'cover' | 'invitation' | 'rsvp' | 'book') => {
  const pages = ['cover', 'invitation', 'rsvp', 'book'];
  const currentIndex = pages.indexOf(activePage);
  const nextIndex = pages.indexOf(newPage);
  
  setDirection(nextIndex > currentIndex ? 1 : -1);
  setActivePage(newPage);
};
  return (
    <main className="min-h-screen bg-[#FDFBF6] p-4 md:p-8 font-serif text-stone-900">
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={activePage}
          custom={direction}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          style={{ backfaceVisibility: 'hidden' }}
          className="w-full h-full"
        >
      {/* --- Komponen Snackbar --- */}
      {snackbar.show && (
        <div className={`fixed bottom-5 right-5 z-50 px-6 py-3 rounded-sm text-white text-sm shadow-lg ${snackbar.type === 'success' ? 'bg-emerald-700' : 'bg-red-700'}`}>
          {snackbar.message}
        </div>
      )}

      {/* Outer Border Frame */}
      <div className="min-h-[95vh] border-[10px] border-double border-stone-300 p-6 rounded-3xl bg-[#FDFBF6]">
        
        {/* --- PAGE 1: MUKA DEPAN --- */}
        {activePage === 'cover' && (
          <div className="flex flex-col items-center justify-center min-h-[85vh] text-center animate-in fade-in duration-1000">
            <p className="text-sm tracking-[0.3em] text-stone-500 uppercase mb-4">Wedding Invitation</p>
            <h1 className="text-7xl md:text-8xl font-bold tracking-widest text-stone-900 mb-6">Guestbook</h1>
            <p className="text-4xl md:text-5xl font-light italic text-stone-700 mb-12">Aimi<span className="font-serif not-italic text-stone-400">&</span>Zulhilmi</p>
            <button 
              onClick={() => setActivePage('invitation')}
              className="px-12 py-4 border-2 border-stone-900 text-stone-900 text-sm tracking-widest uppercase font-medium hover:bg-stone-900 hover:text-white transition-all duration-300 rounded-sm"
            >
              Open Invitation
            </button>
          </div>
        )}

        {/* --- PAGE 2: INVITATION --- */}
        {activePage === 'invitation' && (
          <div className="animate-in fade-in duration-500">
            <NavigationBar />
            <header className="text-center mb-6">

            <h1 className="text-3xl md:text-4xl font-serif font-bold italic text-stone-800 tracking-widest">Invitation</h1>
            <p className="text-xl md:text-5xl font-light italic text-stone-700 mb-12">Aimi<span className="font-serif not-italic text-stone-400">&</span>Zulhilmi</p>
              <p className="text-stone-600 mt-4">[Sila isi kandungan jemputan di sini]</p>
              </header>

            </div>
        )}

        {/* --- PAGE 3: RSVP & MOMENTS --- */}
        {activePage === 'rsvp' && (
          <div className="animate-in fade-in duration-500">
            <NavigationBar />
            <header className="text-center mb-10">
              {/* <h1 className="text-4xl font-bold tracking-widest text-stone-900 mb-2">RSVP & Moments</h1> */}
              <h1 className="text-3xl md:text-4xl font-bold font-serif italic text-stone-800 tracking-widest">RSVP & Moments</h1>
              <p className="text-xl md:text-5xl font-light italic text-stone-700 mb-12">Aimi<span className="font-serif not-italic text-stone-400">&</span>Zulhilmi</p>
              </header>

            {/* Statistik */}
             {/* Sub-Tab Switcher */}
             <div className="flex justify-center gap-8 mb-12 border-b border-stone-100 pb-4">
            <button 
              onClick={() => handleCategoryChange1('form')}
              className={`font-serif italic tracking-widest text-sm transition-all ${activeCategory1 === 'form' ? 'text-stone-800 border-b-2 border-stone-800' : 'text-stone-300 hover:text-stone-500'}`}
            >
              Wishes (RSVP)
            </button>
            <button 
              onClick={() => handleCategoryChange1('moments')}
              className={`font-serif italic tracking-widest text-sm transition-all ${activeCategory1 === 'moments' ? 'text-stone-800 border-b-2 border-stone-800' : 'text-stone-300 hover:text-stone-500'}`}
            >
              Moments
            </button>
          </div>

            <div className="grid grid-cols-2 gap-4 mb-10 max-w-lg mx-auto">
              <div className="bg-white border border-stone-200 p-6 rounded-xl text-center shadow-sm">
                <p className="text-xs tracking-[0.2em] uppercase text-stone-500 mb-2">Attend</p>
                <p className="text-5xl font-bold text-stone-950">{countHadir}</p>
              </div>
              <div className="bg-white border border-stone-200 p-6 rounded-xl text-center shadow-sm">
                <p className="text-xs tracking-[0.2em] uppercase text-stone-500 mb-2">Not Attend</p>
                <p className="text-5xl font-bold text-stone-950">{countTidakHadir}</p>
              </div>
            </div>

           
           

            {/* Kandungan Sub-Tab: Form RSVP */}
            {rsvpSubTab === 'form' && (
              <div className="max-w-4xl mx-auto mb-16 animate-in fade-in duration-300">
                <form onSubmit={(e) => handleSubmit(e, 'rsvp')} className="border border-stone-300 p-8 rounded-sm bg-white shadow-sm space-y-6">
                  <div className="border-b border-stone-300 pb-2">
                      <label className="text-xs uppercase tracking-widest text-stone-500">Name:</label>
                      <input name="name" required className="w-full mt-1 outline-none text-lg" />
                  </div>
                  <div className="border-b border-stone-300 pb-2">
                      <label className="text-xs uppercase tracking-widest text-stone-500">Attendance:</label>
                      <select name="attendance" className="w-full mt-1 outline-none text-lg bg-transparent appearance-none">
                      <option value="Hadir">Accepts with pleasure</option>
                      <option value="Tidak Hadir">Declines with regret</option>
                      </select>
                  </div>
                  <div className="border-b border-stone-300 pb-2">
                      <label className="text-xs uppercase tracking-widest text-stone-500">Message:</label>
                      <input name="message" required className="w-full mt-1 outline-none text-lg" />
                  </div>
                  <div >
                      <label className="text-xs uppercase tracking-widest text-stone-500">Picture:</label>
                  </div>
                  <div className="border-2 border-dashed border-stone-300 p-6 text-center">
                      <input type="file" name="image" accept="image/*" capture="environment"  className="text-sm" />
                  </div>
                  <button disabled={loading} className="w-full bg-stone-900 text-white py-4 text-sm tracking-widest uppercase font-medium hover:bg-stone-700 transition">
                      {loading ? 'Processing...' : 'Submit RSVP'}
                  </button>
                </form>
                <div className="mt-16 px-4 overflow-hidden"> {/* overflow-hidden untuk elak shadow kad terpotong buruk */}
  <h3 className="text-2xl font-bold mb-8 text-center text-stone-900 tracking-tight">
    Guest Responses
  </h3>
  
  <Swiper
    // --- KONFIGURASI ENDLESS & RESPONSIVE ---
    loop={true} // Ini yang buat dia pusing tanpa henti
    centeredSlides={true} // Kad aktif sentiasa kat tengah (bagus untuk mobile)
    breakpoints={{
      0: {
        slidesPerView: 3, // Nampak sikit kad kiri & kanan
        spaceBetween: 20,
      },
      640: {
        slidesPerView: 2.5,
        spaceBetween: 25,
      },
      1024: {
        slidesPerView: 5,
        spaceBetween: 15,
      },
    }}
    autoplay={{
      delay: 3000,
      disableOnInteraction: false,
      pauseOnMouseEnter: true, // Berhenti jap kalau orang hover/tahan guna jari
    }}
    modules={[Autoplay]} 
    className="py-4" // Padding atas bawah supaya shadow tak kena cut
  >
    {data.filter(i => i.type === 'rsvp' && i.message).map((item, index) => (
      <SwiperSlide key={`${item.id}-${index}`} className="h-auto">
        
        {/* --- KAD POLAROID --- */}
        <div className="bg-white p-5 rounded-sm shadow-md border border-stone-100 h-[110px] w-[130px] flex flex-col justify-between transition-all duration-500">
          
          <div className="text-center">
            {/* Nama Guest */}
            <p className="text-[10px] font-bold tracking-[0.2em] text-stone-400 uppercase mb-2 truncate">
              {item.name}
            </p>
            
            {/* Status Kehadiran - Dot Style */}
            <div className="flex justify-center items-center gap-1.5 mb-3">
              <span className={`w-1.5 h-1.5 rounded-full ${item.attendance === 'Hadir' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
              <span className="text-[10px] font-medium text-stone-500 uppercase tracking-tighter">{item.attendance}</span>
            </div>
            
            {/* Ucapan */}
            <p className="text-xs sm:text-sm text-stone-700 italic leading-relaxed line-clamp-1">
              "{item.message}"
            </p>
          </div>

        </div>
        
      </SwiperSlide>
    ))}
  </Swiper>
</div>
              </div>
            )}

            {/* Kandungan Sub-Tab: Moments */}
            {rsvpSubTab === 'moments' && (
              <div className="max-w-2xl mx-auto mb-10 animate-in fade-in duration-300">
                {/* <h3 className="text-2xl font-bold mb-6 text-center">Share Your Moment</h3> */}
                <form onSubmit={(e) => handleSubmit(e, 'live')} className="border border-stone-300 p-8 rounded-sm bg-white shadow-sm space-y-6 mb-10">
                  <div className="border-b border-stone-300 pb-2">
                      <label className="text-xs uppercase tracking-widest text-stone-500">Name:</label>
                      <input name="name" required className="w-full mt-1 outline-none text-lg" />
                  </div>
                  <div >
                      <label className="text-xs uppercase tracking-widest text-stone-500">Share Your Moments on the wedding day:</label>
                  </div>

                  <div className="border-2 border-dashed border-stone-300 p-6 text-center">
                      <input type="file" name="image" accept="image/*" capture="environment" required className="text-sm" />
                  </div>
                  <div className="border-b border-stone-300 pb-2">
                      <label className="text-xs uppercase tracking-widest text-stone-500">Caption:</label>
                      <input name="message" required className="w-full mt-1 outline-none text-lg" />
                  </div>
                  <button disabled={loading} className="w-full bg-stone-900 text-white py-4 text-sm tracking-widest uppercase font-medium hover:bg-stone-700 transition">
                      {loading ? 'Uploading...' : 'Publish Moment'}
                  </button>
                </form>

                {/* <div className="columns-2 md:columns-3 gap-4 space-y-4">
                  {data.filter(i => i.type === 'live').map(item => (
                    <div key={item.id} className="break-inside-avoid border border-stone-200 p-2 bg-white rounded-sm">
                      {item.image_url && (
                        <div className="relative w-full aspect-square overflow-hidden rounded-sm">
                          <Image src={item.image_url} alt="Live" fill className="object-cover" />
                        </div>
                      )}
                      <p className="font-bold text-xs text-stone-900 mt-2">{item.name}</p>
                      <p className="text-xs text-stone-500">{item.message}</p>
                    </div>
                  ))}
                </div> */}
              </div>
            )}
          </div>
        )}

        {/* --- PAGE 4: GUESTBOOK --- */}
        {activePage === 'book' && (
          <div className="animate-in fade-in duration-500">
          <NavigationBar />
          
          <header className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-serif font-bold italic text-stone-800 tracking-widest">Guestbook</h1>
            <p className="text-xl md:text-5xl font-light italic text-stone-700 mb-12">Aimi<span className="font-serif not-italic text-stone-400">&</span>Zulhilmi</p>
          </header>
    
          {/* --- TAB PEMBAHAGIAN (RSVP vs MOMENTS) --- */}
          <div className="flex justify-center gap-8 mb-12 border-b border-stone-100 pb-4">
            <button 
              onClick={() => handleCategoryChange('rsvp')}
              className={`font-serif italic tracking-widest text-sm transition-all ${activeCategory === 'rsvp' ? 'text-stone-800 border-b-2 border-stone-800' : 'text-stone-300 hover:text-stone-500'}`}
            >
              Wishes (RSVP)
            </button>
            <button 
              onClick={() => handleCategoryChange('moments')}
              className={`font-serif italic tracking-widest text-sm transition-all ${activeCategory === 'moments' ? 'text-stone-800 border-b-2 border-stone-800' : 'text-stone-300 hover:text-stone-500'}`}
            >
              Moments
            </button>
          </div>
    
          <p className="text-center text-stone-400 text-[10px] tracking-[0.3em] uppercase mb-10">
            {activeCategory} — Page {currentPage} of {totalPages}
          </p>
    
          {/* Grid Utama */}
          <div className="flex-grow grid grid-cols-2 gap-x-4 gap-y-12 md:gap-x-12 md:gap-y-20 items-start">
            {currentItems.map((item, index) => (
              <div 
                key={item.id} 
                onClick={() => setSelectedItem(item)}
                className={`flex flex-col items-center cursor-pointer group transition-all hover:scale-[1.02] ${index % 2 === 0 ? '-rotate-1' : 'rotate-1'}`}
              >
                            {item.image_url ? (
              <>
                <div className="relative bg-[#fdfdfb] p-2 pb-8 md:p-3 md:pb-14 shadow-lg border border-stone-200 w-full max-w-[160px] md:max-w-[260px]">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-10 md:w-16 h-6 bg-white/40 backdrop-blur-[2px] rotate-3 border border-white/10 z-10"></div>
                  <div className="relative aspect-square overflow-hidden bg-stone-100">
                    <Image src={item.image_url} alt={item.name} fill className="object-cover sepia-[0.1]" />
                  </div>
                </div>
                <div className="max-w-[150px] md:max-w-[240px] mt-4 text-center">
                <p className="font-handwriting text-base md:text-xl text-[#6b5d41] leading-tight text-center italic line-clamp-5 break-words overflow-hidden w-full px-2">
  "{item.message}"
</p>
                </div>
              </>
            ) : (
              <div className="relative w-full max-w-[160px] md:max-w-[260px] flex flex-col items-center border-t border-b border-stone-100 py-8 px-2">
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-stone-300"></div>
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-stone-300"></div>
                <div className="w-full">
                {/* line-clamp-5 untuk nota supaya boleh baca lebih sikit sebab ruang luas */}
                <p className="font-handwriting text-base md:text-xl text-[#6b5d41] leading-tight text-center italic line-clamp-5 break-words overflow-hidden w-full px-2">
  "{item.message}"
</p>              </div>
              </div>
            )}
                <p className="font-handwriting text-sm md:text-lg text-stone-400 mt-2">-{item.name || 'Guest'}-</p>
              </div>
            ))}
          </div>
    
                {/* --- MODAL / POP-OUT (Sama Teks Melimpah) --- */}
      {selectedItem && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in zoom-in duration-300"
          onClick={() => setSelectedItem(null)} // Tutup bila klik luar
        >
          {/* Tambah h-auto supaya kotak memanjang ke bawah, bukan ke tepi */}
          <div 
            className="bg-[#fdfdfb] max-w-[90%] md:max-w-lg w-full h-auto max-h-[90vh] overflow-y-auto scrollbar-hide p-6 md:p-10 shadow-2xl relative border border-stone-200"
            onClick={(e) => e.stopPropagation()} // Halang tutup bila klik dalam kotak
          >
            <button 
              className="absolute top-1 right-2 text-stone-400 hover:text-stone-800 text-xl"
              onClick={() => setSelectedItem(null)}
            >✕</button>

            {selectedItem.image_url ? (
              <div>
              <div className="relative aspect-square w-full mb-8 shadow-md border-4 border-white">
                <Image src={selectedItem.image_url} alt={selectedItem.name} fill className="object-cover" />
              </div>
              <div className="text-center">
              {/* Gunakan class break-words dan w-full untuk memaksa teks putus dan sambung di baris baru */}
              <p className="font-handwriting text-sm md:text-xl text-[#5a4d31] leading-relaxed mb-6 w-full break-words px-2">
                "{selectedItem.message}"
              </p>
              <div className="w-12 h-px bg-stone-200 mx-auto mb-4"></div>
              <p className="font-handwriting text-xl md:text-2xl text-stone-500 italic">
                -{selectedItem.name}-
              </p>
              <p className="text-[10px] text-stone-300 uppercase tracking-[0.2em] mt-2">
                {new Date(selectedItem.created_at).toLocaleDateString()}
              </p>
            </div></div>
              
            ):(
              <div className="text-center">
              {/* Gunakan class break-words dan w-full untuk memaksa teks putus dan sambung di baris baru */}
              <p className="font-handwriting text-2xl md:text-4xl text-[#5a4d31] leading-relaxed mb-6 w-full break-words px-2">
                "{selectedItem.message}"
              </p>
              <div className="w-12 h-px bg-stone-200 mx-auto mb-4"></div>
              <p className="font-handwriting text-xl md:text-2xl text-stone-500 italic">
                -{selectedItem.name}-
              </p>
              <p className="text-[10px] text-stone-300 uppercase tracking-[0.2em] mt-2">
                {new Date(selectedItem.created_at).toLocaleDateString()}
              </p>
            </div>
            )}

            
          </div>
        </div>
      )}
    
          {/* Navigation Buttons */}
          <div className="mt-16 flex justify-between items-center max-w-xs mx-auto w-full pt-6 border-t border-stone-100">
             <button onClick={() => { setCurrentPage(p => Math.max(p-1, 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }} disabled={currentPage === 1} className="p-2 text-stone-300 hover:text-stone-800 disabled:opacity-10 text-xl">←</button>
             <span className="font-serif italic text-stone-400 text-sm">{currentPage} / {totalPages}</span>
             <button onClick={() => { setCurrentPage(p => Math.min(p+1, totalPages)); window.scrollTo({ top: 0, behavior: 'smooth' }); }} disabled={currentPage === totalPages} className="p-2 text-stone-300 hover:text-stone-800 disabled:opacity-10 text-xl">→</button>
          </div>
        </div>
)}

      </div>
      </motion.div>
      </AnimatePresence>
    </main>
  );
}