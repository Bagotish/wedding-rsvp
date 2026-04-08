'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function WeddingApp() {
  
  const [activeTab, setActiveTab] = useState<'info' | 'action' | 'rolls'>('info');
  const [subTabAction, setSubTabAction] = useState<'rsvp' | 'live'>('rsvp');
  const [subTabRolls, setSubTabRolls] = useState<'wishes' | 'moments'>('wishes');
  const [isCoverOpen, setIsCoverOpen] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
const [selectedItem, setSelectedItem] = useState<any | null>(null);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      const { data: results } = await supabase.from('guests').select('*').order('created_at', { ascending: false });
      if (results) setData(results);
    };
    fetchData();
  }, [activeTab, subTabRolls]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, type: 'rsvp' | 'live') => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      let imageUrl = '';
      if (capturedFile) {
        const cloudData = new FormData();
        cloudData.append('file', capturedFile);
        cloudData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
        const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body: cloudData });
        const fileData = await res.json();
        imageUrl = fileData.secure_url;
      }
      await supabase.from('guests').insert([{ 
        name: formData.get('name'), 
        attendance: formData.get('attendance') || 'Hadir', 
        message: formData.get('message'), 
        image_url: imageUrl, 
        type, 
        is_visible: true 
      }]);
      setPreviewUrl(null);
      setCapturedFile(null);
      setActiveTab('rolls');
      setSubTabRolls(type === 'rsvp' ? 'wishes' : 'moments');
    } catch (err) { alert("Error!"); } finally { setLoading(false); }
  };
const [isOpen, setIsOpen] = useState(false);

const handleLocation = (type:any) => {
  const address = "Puteri Palmera Glass Hall, Alor Setar, Kedah, Malaysia";
  const encodedAddress = encodeURIComponent(address);
  
  if (type === 'google') {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  } else {
    window.open(`https://waze.com/ul?q=${encodedAddress}&navigate=yes`, '_blank');
  }
};
const sectionRefs = {
  info: useRef<HTMLDivElement>(null),
  calendar: useRef<HTMLDivElement>(null),
  location: useRef<HTMLDivElement>(null),
  rsvp: useRef<HTMLDivElement>(null),
  contact: useRef<HTMLDivElement>(null),
};
const scrollToSection = (key: keyof typeof sectionRefs) => {
  sectionRefs[key].current?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
};
  return (
    <div className="min-h-screen bg-[#FCFAF7] text-[#4A443F] font-sans overflow-x-hidden selection:bg-[#E8DED1]">
      
{/* --- 1. FRONT PAGE (SPLASH) --- */}
{/* --- 1. FRONT PAGE (SPLASH) --- */}
<AnimatePresence>
  {isCoverOpen && (
    <motion.div 
      exit={{ opacity: 0, y: -100 }} 
      transition={{ duration: 1.2, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] bg-[#FCFAF7] flex flex-col items-center justify-center p-4 overflow-hidden"
    >
      {/* --- CONTAINER KAD UTAMA --- */}
      <div className="relative w-full max-w-[450px] aspect-[9/16] flex flex-col items-center justify-center">
        
        {/* 1. GAMBAR UTAMA (Aimi & Zul) */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1 }}
          className="relative z-10 w-full"
        >
          <img 
            src="/image/1.png" 
            alt="Main Invite"
            className="w-full h-auto object-contain scale-80" 
          />
        </motion.div>

        {/* --- ELEMEN DEKORASI (SCATTERED) --- */}
        {/* Susunan Bunga, Reben & Bintang di sekeliling kad */}

        {/* Imej 2: Contoh Reben Atas Kiri */}
        <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/2.png" className="absolute top-[10%] left-[-15%] w-32 z-20 rotate-[-15deg] w-50"
        />

        {/* Imej 3: Contoh Bunga Bawah Kiri */} 
        <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/3.png" className="absolute bottom-[50%] left-[-5%] w-28 z-20 w-40"
        />
         <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/3.png" className="absolute top-[30%] right-[-5%] w-40 z-0 w-40"
        />

        {/* Imej 4: Contoh Bintang Kanan Atas */}
<motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
  src="/image/4.png" 
  className="absolute top-[10%] right-[-5%] w-40 z-0" // Guna w-40 (160px) atau w-64 (256px)
/>

        {/* Imej 5: Contoh Bunga Kanan Bawah */}
        <motion.img 
          animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/5.png" className="absolute bottom-[10%] right-[-10%] w-36 z-20 rotate-[10deg] w-40"
        />

        {/* Imej 6: Contoh Bintang Tengah Atas */}
        <motion.img 
          animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/6.png" className="absolute top-[0%] left-[40%] w-12 z-0  w-40"
        /> 
               <motion.img 
                 animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/6.png" className="absolute top-[70%] left-[30%] w-32 z-20 rotate-[-15deg]  w-40"
        />
 <motion.img 
   animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/7.png" className="absolute top-[70%] left-[-5%] w-32 z-20 rotate-[-15deg] w-40 "
        />
        {/* --- BUTANG ENTER --- */}
        <div className="absolute bottom-[5%] z-30">
          <button 
            className="px-12 py-4 rounded-full bg-[#989F81] text-white font-bold text-[10px] uppercase tracking-[0.3em] shadow-xl hover:bg-[#868d6f] active:scale-95 transition-all" 
            onClick={() => setIsCoverOpen(false)}
          >
            Enter Experience
          </button>
        </div>
      </div>          
    </motion.div>
  )}
</AnimatePresence>

      <main className="max-w-md mx-auto min-h-screen flex flex-col px-8 pt-16 pb-40">
        
        {/* --- TAB 1: INFO --- */}
        {activeTab === 'info' && (
  /* Container ini akan ambil alih seluruh ruang skrin */
  <div className="fixed inset-0 top-0 left-0 w-full h-full overflow-y-auto no-scrollbar snap-y snap-mandatory bg-[#FCFAF7] z-50">
    
    {/* --- SECTION Burung --- */}
    <motion.section 
      className="relative h-screen w-full flex flex-col items-center justify-center snap-start"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ amount: 0.5 }}
      transition={{ duration: 0.8 }}
    >
      <div className="flex flex-col items-center w-full max-w-[400px]">
        {/* Gambar 8, 9, 10 anda di sini */}
<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">

           <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1 }}
          className="relative z-10 w-full"
        >
          <img 
            src="/image/8.png" 
            alt="Main Invite"
            className="w-full h-auto object-contain scale-100" 
          />
        </motion.div>
          </motion.div>

                    <motion.div 
  initial={{ scale: 0.8, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ duration: 1 }}
  className="relative z-10 w-full mt-[-30px]" // Naikkan nilai dalam kurungan untuk lagi tinggi
>
  <img 
    src="/image/9.png" 
    alt="Main Invite"
    className="w-full h-auto object-contain scale-100" 
  />
</motion.div>

<motion.div 
  initial={{ scale: 0.8, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ duration: 1 }}
  className="relative z-10 w-full mt-[-30px]" // Naikkan nilai dalam kurungan untuk lagi tinggi
>
  <img 
    src="/image/10.png" 
    alt="Main Invite"
    className="w-full h-auto object-contain scale-60" 
  />
</motion.div>

<motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/3.png" className="absolute bottom-[15%] left-[10%] w-28 z-20 w-40"
        />
        <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/6.png" className="absolute bottom-[80%] left-[-5%] w-28 z-20 w-40"
        />
        <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/3.png" className="absolute bottom-[85%] left-[65%] w-28 z-20 w-30"
        />
        <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/11.png" className="absolute bottom-[15%] left-[70%] w-28 z-20 w-40"
        />
        <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/12.png" className="absolute bottom-[10%] left-[50%] w-28 z-20 w-10"
        />
         <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/12.png" className="absolute bottom-[40%] left-[82%] w-28 z-20 w-6"
        />
        <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/12.png" className="absolute bottom-[85%] left-[40%] w-28 z-20 w-1"
        />      
        </div>
      {/* Dekorasi tetap berada di dalam section supaya dia fade out sekali */}
    </motion.section>

    {/* --- SECTION Pintu --- */}
    <motion.section 
      className="relative h-screen w-full flex flex-col items-center justify-center snap-start"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ amount: 0.5 }}
      transition={{ duration: 0.8 }}
    >
      <div className="flex flex-col items-center w-full max-w-[400px]">
<motion.div 
  initial={{ scale: 0.8, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ duration: 1 }}
  className="relative z-10 w-full mt-[-190px]" // <--- TUKAR NILAI NI (Lagi besar nilai, lagi tinggi dia naik)
>
  <img 
    src="/image/34.png" 
    alt="Main Invite"
    className="w-full h-auto object-contain scale-100" 
  />
</motion.div>

<motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/3.png" className="absolute bottom-[70%] left-[80%] w-28 z-20 w-40"
        />
        <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/6.png" className="absolute bottom-[80%] left-[-5%] w-28 z-20 w-40"
        />
         <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/4.png" className="absolute bottom-[10%] left-[60%] w-28 z-20 w-40"
        />
         <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/7.png" className="absolute bottom-[10%] left-[5%] w-28 z-20 w-50"
        />
        <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/16.png" className="absolute bottom-[85%] left-[40%] w-28 z-20 w-30"
        />
        <motion.img 
          src="/image/17.png" className="absolute bottom-[17%] left-[30%] w-28 z-20 w-60"
        />
        <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/3.png" className="absolute bottom-[25%] left-[25%] w-28 z-20 w-4"
        />
        <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/6.png" className="absolute bottom-[20%] left-[60%] w-28 z-20 w-1"
        />
             </div>
    </motion.section>
        {/* --- SECTION Sofa --- */}
    <motion.section 
      className="relative h-screen w-full flex flex-col items-center justify-center snap-start"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ amount: 0.5 }}
      transition={{ duration: 0.8 }}
    >
            <div className="flex flex-col items-center w-full max-w-[400px]">
<motion.img 
          src="/image/47.png" className="absolute bottom-[70%] left-[23%] w-28 z-20 w-90"
        />
              <motion.div 
  initial={{ scale: 0.8, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ duration: 1 }}
  className="relative z-10 w-full mt-[-50px]" // <--- TUKAR NILAI NI (Lagi besar nilai, lagi tinggi dia naik)
>
  <img 
    src="/image/35.png" 
    alt="Main Invite"
    className="w-full h-auto object-contain scale-140" 
  />
  <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/16.png" className="absolute bottom-[120%] left-[45%] w-28 z-20 w-[100px]"
        />
          <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/3.png" className="absolute bottom-[110%] left-[5%] w-28 z-20 w-[100px]"
        />
         <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/3.png" className="absolute bottom-[80%] left-[100%] w-28 z-20 w-[100px]"
        />
        <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/6.png" className="absolute bottom-[60%] left-[10%] w-28 z-20 w-[100px]"
        />
        <motion.img 
          src="/image/48.png" className="absolute bottom-[65%] left-[60%] w-28 z-20 w-[200px]"
        />
                <motion.img 
          src="/image/49.png" className="absolute bottom-[70%] left-[15%] w-28 z-20 w-[190px]"
        />
</motion.div>
  </div>

    </motion.section>
            {/* --- SECTION Date and Location --- */}
 <motion.section 
      className="relative h-screen w-full flex flex-col items-center justify-center snap-start"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ amount: 0.5 }}
      transition={{ duration: 0.8 }}
    >
            <div className="flex flex-col items-center w-full max-w-[400px]">  
               <motion.div 
  initial={{ scale: 0.8, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ duration: 1 }}
  className="relative z-10 w-full mt-[-400px]" // <--- TUKAR NILAI NI (Lagi besar nilai, lagi tinggi dia naik)
>
  <img 
    src="/image/37.png" 
    alt="Main Invite"
    className="w-full h-auto object-contain scale-50" 
  />
</motion.div>
<motion.div 
  initial={{ scale: 0.8, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ duration: 1 }}
  className="relative z-10 w-full mt-[-50px]" // <--- TUKAR NILAI NI (Lagi besar nilai, lagi tinggi dia naik)
>
  <img 
    src="/image/43.png" 
    alt="Main Invite"
    className="w-full h-auto object-contain scale-100" 
  />
</motion.div>
<motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/36.png" className="absolute bottom-[80%] left-[10%] w-28 z-20 w-[150px]"
        />
         <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/42.png" className="absolute bottom-[51%] left-[60%] w-28 z-20 w-[100px]"
        />
         <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/39.png" className="absolute bottom-[40%] left-[35%] w-28 z-20 w-[150px]"
        />
                 <motion.img 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/40.png" className="absolute bottom-[30%] left-[44%] w-28 z-20 w-[70px]"
          whileTap={{ scale: 0.9 }} // Tambah feedback bila ditekan
  onClick={() => setIsOpen(true)}
        />
        <motion.img 
  // transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/41.png" 
          // className="absolute bottom-[25%] left-[23%] w-28 z-20 w-[300px]"
            className="absolute bottom-[25%] left-[23%] w-28 z-20 w-[300px] cursor-pointer"
  whileTap={{ scale: 0.9 }} // Tambah feedback bila ditekan
  onClick={() => setIsOpen(true)}
        />
        <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/3.png" className="absolute bottom-[70%] left-[10%] w-28 z-20 w-[150px]"
        />
        <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/6.png" className="absolute bottom-[80%] left-[70%] w-28 z-20 w-[150px]"
        />
                <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/3.png" className="absolute bottom-[30%] left-[80%] w-28 z-20 w-[130px]"
        />
         <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/38.png" className="absolute bottom-[70%] left-[80%] w-28 z-20 w-[100px]"
        />
         <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/7.png" className="absolute bottom-[10%] left-[10%] w-28 z-20 w-[130px]"
        />
                 <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/12.png" className="absolute bottom-[10%] left-[75%] w-28 z-20 w-[130px]"
        />
         <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/12.png" className="absolute bottom-[90%] left-[1%] w-28 z-20 w-[50px]"
        />
<motion.img 
  src="/image/44.png" 
  className="absolute bottom-[17%] left-[33%] z-20 w-[200px] cursor-pointer"
  whileTap={{ scale: 0.9 }} // Tambah feedback bila ditekan
  onClick={() => setIsOpen(true)}
/>
            </div>

    </motion.section>
                        {/* --- SECTION RSVP --- */}
    <motion.section 
      className="relative h-screen w-full flex flex-col items-center justify-center snap-start"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ amount: 0.5 }}
      transition={{ duration: 0.8 }}
    ></motion.section>
                {/* --- SECTION Contact --- */}

<motion.section 
      className="relative h-screen w-full flex flex-col items-center justify-center snap-start"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ amount: 0.5 }}
      transition={{ duration: 0.8 }}
    >
      <div className="flex flex-col items-center w-full max-w-[400px]">
<motion.div 
  initial={{ scale: 0.8, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ duration: 1 }}
  className="relative z-10 w-full mt-[300px]" // <--- TUKAR NILAI NI (Lagi besar nilai, lagi tinggi dia naik)
>
  <img 
    src="/image/21.png" 
    alt="Main Invite"
    className="w-full h-auto object-contain scale-100" 
  />
</motion.div>

<motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/3.png" className="absolute bottom-[60%] left-[70%] w-28 z-20 w-40"
        />
        <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/3.png" className="absolute bottom-[83%] left-[65%] w-28 z-20 w-10"
        />
        <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/3.png" className="absolute bottom-[70%] left-[10%] w-28 z-20 w-20"
        />
        <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/18.png" className="absolute bottom-[68%] left-[25%] w-28 z-20 w-60"
        />
        <motion.img 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/19.png" className="absolute bottom-[68%] left-[30%] w-28 z-20 w-80"
        />
         <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/20.png" className="absolute bottom-[60%] left-[20%] w-28 z-20 w-[50px]"
        />
         <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/20.png" className="absolute bottom-[40%] left-[80%] w-28 z-20 w-[50px]"
        />
        <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/20.png" className="absolute bottom-[90%] left-[25%] w-28 z-20 w-[50px]"
        />
             <motion.img 
          src="/image/46.png" className="absolute bottom-[45%] left-[10%] w-28 z-20 w-[400px]"
        />
             </div>
             
    </motion.section>
                {/* --- SECTION Best Regards --- */}
<motion.section 
      className="relative h-screen w-full flex flex-col items-center justify-center snap-start"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ amount: 0.5 }}
      transition={{ duration: 0.8 }}
    >

 <motion.img 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/30.png" className="absolute bottom-[50%] left-[50%] w-28 z-20 w-[250px]"
        />
        <motion.img 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/32.png" className="absolute bottom-[70%] left-[10%] w-28 z-20 w-[200px]"
        />
         <motion.img 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/32.png" className="absolute bottom-[50%] left-[10%] w-28 z-20 w-[200px]"
        />
        <motion.img 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/31.png" className="absolute bottom-[70%] left-[50%] w-28 z-20 w-[250px]"
        />
 <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/29.png" className="absolute bottom-[27%] left-[45%] w-28 z-20 w-[250px]"
        />
         <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/45.png" className="absolute bottom-[20%] left-[53%] w-28 z-20 w-[184px]"
        />
        {/* <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/28.png" className="absolute bottom-[20%] left-[70%] w-28 z-20 w-[120px]"
        /> */}
         <motion.img 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/33.png" className="absolute bottom-[15%] left-[1%] w-28 z-20 w-[250px]"
        />
        <motion.img 
          animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/3.png" className="absolute  bottom-[35%] left-[75%] w-28 z-20 w-[200px]"
        />
        <motion.img 
          animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/6.png" className="absolute bottom-[15%] left-[40%] w-28 z-20 w-[100px]"
        />
        <motion.img 
          animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/3.png" className="absolute bottom-[80%] left-[45%] w-28 z-20 w-[100px]"
        />
        <motion.img 
          animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/12.png" className="absolute bottom-[40%] left-[1%] w-28 z-20 w-[100px]"
        />
         <motion.img 
          animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/12.png" className="absolute bottom-[65%] left-[90%] w-28 z-20 w-[70px]"
        />
                <motion.img 
          animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/2.png" className="absolute bottom-[83%] left-[10%] w-28 z-20 w-[200px]"
        />
    </motion.section>

  </div>
)}

        {/* --- TAB 2: RSVP & SNAP (ACTION) --- */}
        {activeTab === 'action' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            {/* Sub-tab Selector */}
            <div className="flex bg-[#F3EFE9] p-1 rounded-full border border-[#D6C7B5]/20">
              <button onClick={() => {setSubTabAction('rsvp'); setPreviewUrl(null);}} className={`flex-1 py-2.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all ${subTabAction === 'rsvp' ? 'bg-white shadow-sm text-[#4A443F]' : 'text-[#A39584]'}`}>RSVP</button>
              <button onClick={() => {setSubTabAction('live'); setPreviewUrl(null);}} className={`flex-1 py-2.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all ${subTabAction === 'live' ? 'bg-white shadow-sm text-[#4A443F]' : 'text-[#A39584]'}`}>Live Snap</button>
            </div>

            {subTabAction === 'rsvp' ? (
              <form onSubmit={(e) => handleSubmit(e, 'rsvp')} className="space-y-6 animate-in fade-in duration-500">
                <div className="aspect-square bg-white rounded-3xl overflow-hidden border border-[#D6C7B5]/30 relative shadow-sm">
                  {previewUrl ? <Image src={previewUrl} alt="Preview" fill className="object-cover" /> : 
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-[#D6C7B5]">
                    <input type="file" accept="image/*" onChange={(e) => {const f = e.target.files?.[0]; if(f){setCapturedFile(f); setPreviewUrl(URL.createObjectURL(f));}}} className="absolute inset-0 opacity-0 z-10" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">Add a Photo</p>
                  </div>}
                </div>
                <input name="name" required placeholder="YOUR NAME" className="w-full bg-transparent border-b border-[#D6C7B5]/40 py-3 text-[10px] font-bold outline-none uppercase tracking-widest" />
                <select name="attendance" className="w-full bg-transparent border-b border-[#D6C7B5]/40 py-3 text-[10px] font-bold outline-none uppercase tracking-widest">
                  <option value="Hadir">Will Attend</option>
                  <option value="Tidak Hadir">Cannot Attend</option>
                </select>
                <textarea name="message" required placeholder="YOUR WISHES" className="w-full bg-transparent border-b border-[#D6C7B5]/40 py-3 text-[10px] font-bold outline-none uppercase tracking-widest h-20" />
                <button disabled={loading} className="w-full py-4 bg-[#4A443F] text-white rounded-2xl text-[9px] font-bold uppercase tracking-widest">{loading ? 'Sending...' : 'Confirm RSVP'}</button>
              </form>
            ) : (
<div className="space-y-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
    
    {/* Viewfinder Area */}
    <div className="relative aspect-[4/5] bg-white rounded-[2.5rem] overflow-hidden shadow-[0_30px_60px_-12px_rgba(214,199,181,0.3)] border border-white/60 group">
      {previewUrl ? (
        <Image src={previewUrl} alt="Live Capture" fill className="object-cover" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center p-10">
          <div className="w-full h-full border border-[#D6C7B5]/20 rounded-[1.5rem] flex flex-col items-center justify-center relative">
             <div className="w-4 h-4 border-t border-l border-[#D6C7B5]/40 absolute top-4 left-4" />
             <div className="w-4 h-4 border-b border-r border-[#D6C7B5]/40 absolute bottom-4 right-4" />
             <p className="text-[8px] uppercase tracking-[0.5em] text-[#D6C7B5]/40 animate-pulse">Waiting for Shot</p>
          </div>
        </div>
      )}
      
      {/* Aesthetic HUD */}
      <div className="absolute top-6 left-8 text-[7px] font-bold tracking-widest text-black/20 uppercase mix-blend-difference">POV_MODE</div>
      <div className="absolute bottom-6 right-8 text-[7px] font-bold tracking-widest text-black/20 uppercase mix-blend-difference">REC ●</div>
    </div>

    {!previewUrl ? (
      /* Step 1: Capture Button */
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <input 
            type="file" 
            accept="image/*" 
            capture="environment" 
            onChange={(e) => {
              const f = e.target.files?.[0]; 
              if(f){ setCapturedFile(f); setPreviewUrl(URL.createObjectURL(f)); }
            }} 
            className="absolute inset-0 opacity-0 cursor-pointer z-10" 
          />
          <div className="w-24 h-24 rounded-full border border-[#D6C7B5] p-2 flex items-center justify-center transition-all active:scale-90 bg-white/50 backdrop-blur-sm">
            <div className="w-full h-full bg-[#4A443F] rounded-full shadow-xl shadow-[#4A443F]/20" />
          </div>
        </div>
        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[#A39584]">Take a Live Photo</p>
      </div>
    ) : (
      /* Step 2: Form after Capture */
      <motion.form 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        onSubmit={(e) => handleSubmit(e, 'live')} 
        className="space-y-6 text-left"
      >
        <div className="space-y-4">
          <div className="group">
            <label className="text-[8px] font-black uppercase tracking-widest text-[#D6C7B5] ml-1">Captured By</label>
            <input 
              name="name" 
              required 
              placeholder="ENTER YOUR NAME" 
              className="w-full bg-transparent border-b border-[#D6C7B5]/40 py-3 text-[10px] font-bold outline-none focus:border-[#4A443F] uppercase tracking-widest transition-colors" 
            />
          </div>
          
          <div className="group">
            <label className="text-[8px] font-black uppercase tracking-widest text-[#D6C7B5] ml-1">The Vibe / Caption</label>
            <input 
              name="message" 
              required 
              placeholder="E.G. BEAUTIFUL BRIDE!" 
              className="w-full bg-transparent border-b border-[#D6C7B5]/40 py-3 text-[10px] font-bold outline-none focus:border-[#4A443F] uppercase tracking-widest transition-colors" 
            />
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button 
            type="button" 
            onClick={() => { setPreviewUrl(null); setCapturedFile(null); }} 
            className="flex-1 py-4 text-[9px] font-bold uppercase tracking-widest text-[#A39584] hover:text-[#4A443F]"
          >
            Retake
          </button>
          <button 
            disabled={loading} 
            className="flex-1 py-4 bg-[#4A443F] text-white rounded-2xl text-[9px] font-bold uppercase tracking-widest shadow-lg active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Post to Moments'}
          </button>
        </div>
      </motion.form>
    )}
  </div>
            )}
          </motion.div>
        )}

{activeTab === 'rolls' && (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 -mx-4">
    {/* Sub-tab Selector IG Style */}
                <div className="flex bg-[#F3EFE9] p-1 rounded-full border border-[#D6C7B5]/20">
              <button onClick={() => setSubTabRolls('wishes')} className={`flex-1 py-2.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all ${subTabRolls === 'wishes' ? 'bg-white shadow-sm text-[#4A443F]' : 'text-[#A39584]'}`}>Wishes</button>
              <button onClick={() => setSubTabRolls('moments')} className={`flex-1 py-2.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all ${subTabRolls === 'moments' ? 'bg-white shadow-sm text-[#4A443F]' : 'text-[#A39584]'}`}>Moments</button>
            </div>
{/* Instagram 3-Column Grid with Hover Effect */}
<div className="grid grid-cols-3 gap-[2px] bg-white border-t border-[#D6C7B5]/10">
  {data.filter(item => item.type === (subTabRolls === 'wishes' ? 'rsvp' : 'live')).map((item) => (
    <motion.div 
      key={item.id} 
      className="relative aspect-square bg-[#F3EFE9] overflow-hidden cursor-pointer group"
      onClick={() => setSelectedItem(item)}
    >
      {/* Image */}
      {item.image_url && (
        <Image 
          src={item.image_url} 
          alt="Gallery" 
          fill 
          className="object-cover transition-transform duration-700 group-hover:scale-110" 
        />
      )}

      {/* Hover Overlay (Desktop) / Info Preview */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-2 text-center backdrop-blur-[2px]">
        <p className="text-[8px] font-black text-white uppercase tracking-widest truncate w-full">{item.name}</p>
        <p className="text-[7px] text-white/80 italic line-clamp-2 mt-1 px-1 leading-tight">"{item.message}"</p>
      </div>
    </motion.div>
  ))}
</div>

    {/* Bottom Spacer for Nav */}
    <div className="h-20" />
  </motion.div>
)}

        {/* --- GLOBAL NAVIGATION --- */}
        <nav className="fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center p-2 bg-white/40 backdrop-blur-2xl border border-white/60 rounded-full shadow-[0_20px_50px_rgba(214,199,181,0.2)] z-50">
          {[
            { id: 'info', label: 'Info' },
            { id: 'action', label: 'Snap' },
            { id: 'rolls', label: 'Rolls' }
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-8 py-3.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${activeTab === tab.id ? 'bg-[#4A443F] text-white shadow-xl' : 'text-[#A39584]'}`}>{tab.label}</button>
          ))}
        </nav>
      </main>
      {/* --- POLAROID MODAL --- */}
<AnimatePresence>
  {selectedItem && (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] bg-[#FCFAF7]/95 backdrop-blur-md flex items-center justify-center p-6"
      onClick={() => setSelectedItem(null)}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20, rotate: -2 }}
        animate={{ scale: 1, y: 0, rotate: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white p-4 pb-12 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-[#F3EFE9] w-full max-w-xs aspect-[4/5] flex flex-col"
      >
        {/* Photo Area */}
        <div className="relative flex-grow bg-[#F3EFE9] overflow-hidden shadow-inner border border-black/5">
          {selectedItem.image_url && (
            <Image 
              src={selectedItem.image_url} 
              alt="Polaroid" 
              fill 
              className="object-cover"
            />
          )}
          {/* Subtle Film Grain Texture Over Image */}
          <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
        </div>

        {/* Polaroid Bottom Label */}
        <div className="pt-6 px-1 text-center space-y-2">
          <p className="text-xs font-serif italic text-[#4A443F] leading-relaxed">
            "{selectedItem.message}"
          </p>
          <div className="w-4 h-[1px] bg-[#D6C7B5] mx-auto opacity-50" />
          <p className="text-[8px] font-black uppercase tracking-[0.3em] text-[#A39584]">
            {selectedItem.name} — 04.04
          </p>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
{isOpen && (
  <div 
    // Klik luar untuk tutup
    onClick={() => setIsOpen(false)} 
    // Opacity yang diperbetulkan (bg-black/10)
    className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-white/40 backdrop-blur-sm transition-all duration-500"
  >
    {/* Box Modal: Copy sebijik style Nav kau */}
    <div 
      onClick={(e) => e.stopPropagation()} 
className="w-full max-w-[280px] p-8 bg-white/20 backdrop-blur-3xl border border-white/40 rounded-[40px] shadow-[0_20px_50px_rgba(214,199,181,0.15)]"    >
      {/* Tajuk: Ikut style text 'Inactive' kau tapi center */}
      <h3 className="text-[#A39584] text-[10px] font-black uppercase tracking-[0.2em] mb-8 text-center">
        Pilih Navigasi
      </h3>
      
      <div className="flex flex-col gap-3">
        {/* Button: Copy sebijik style 'Active' tab kau */}
        <button 
          onClick={() => handleLocation('google')}
          className="w-full px-8 py-3.5 bg-[#4A443F] text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all duration-500"
        >
          Google Maps
        </button>

        <button 
          onClick={() => handleLocation('waze')}
          className="w-full px-8 py-3.5 bg-[#4A443F] text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all duration-500"
        >
          Waze
        </button>

        
      </div>
    </div>
  </div>
)}
    </div>
  );
}