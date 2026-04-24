'use client';

import { useState, useEffect, useRef,useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import JooxPlayer from "./joox";
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function WeddingApp() {
  
const [activeTab, setActiveTab] = useState<
  'info' | 'calendar' | 'rsvp' | 'contact'
>('info');  
const [subTabAction, setSubTabAction] = useState<'rsvp' | 'live'>('rsvp');
  const [subTabRolls, setSubTabRolls] = useState<'wishes' | 'moments'>('wishes');
  const [isCoverOpen, setIsCoverOpen] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
const [selectedItem, setSelectedItem] = useState<any | null>(null);
const scrollContainerRef = useRef<HTMLDivElement>(null);
const [isManualScroll, setIsManualScroll] = useState(false);
const [attendance, setAttendance] = useState<string>('Hadir');
const [paxCount, setPaxCount] = useState<number>(1);
const [selectedWish, setSelectedWish] = useState<{ id: number | string; created_at?: string; message?: string; name?: string } | null>(null);
const [isOpen3, setIsOpen3] = useState(false);
const [showLockNote, setShowLockNote] = useState(false);
const options = ["Hadir", "Tidak Hadir"];
  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      const { data: results } = await supabase.from('guests').select('*').order('created_at', { ascending: false });
      if (results) setData(results);
    };
    fetchData();
  }, [activeTab, subTabRolls]);
useEffect(() => {
  const container = scrollContainerRef.current;
  if (!container) return;

  const observer = new IntersectionObserver(
    (entries) => {
      if (isManualScroll) return; // ❗ prevent conflict

      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('data-section');
          if (id) {
            setActiveTab(id as any);
          }
        }
      });
    },
    {
      root: container, // 🔥 use scroll container, bukan window
      threshold: 0.6,
    }
  );

  Object.entries(sectionRefs).forEach(([key, ref]) => {
    if (ref.current) {
      ref.current.setAttribute('data-section', key);
      observer.observe(ref.current);
    }
  });

  return () => observer.disconnect();
}, [isManualScroll]);
const [nama, setnama] = useState("");

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, type: 'rsvp' | 'live') => {
  e.preventDefault();
  setLoading(true);
  
  const form = e.currentTarget;
  const formData = new FormData(form);
  const name = formData.get('name');

if (!name) {
    showToast("SILA LENGKAPKAN", "error");
    setLoading(false);
    return;
  }
  setnama(name as string);
  try {
    let imageUrl = '';

    // Guna capturedFile yang kita set masa onChange tadi
    if (capturedFile) {
      const cloudData = new FormData();
      cloudData.append('file', capturedFile);
      cloudData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
      
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, 
        { method: 'POST', body: cloudData }
      );
      
      if (!res.ok) throw new Error('Cloudinary upload failed');
      
      const fileData = await res.json();
      imageUrl = fileData.secure_url;
    }
if(type=='rsvp') {
    // Insert ke Supabase
    const { error } = await supabase.from('guests').insert([{ 
      name: formData.get('name'), 
      attendance: formData.get('attendance') || 'Hadir', 
      message: formData.get('message'), 
      image_url: imageUrl, // Url dari cloudinary
      type, 
      is_visible: true ,
      pax: paxCount,
    }]);
        if (error) throw error;

}else{
      // Insert ke Supabase
    const { error } = await supabase.from('guests').insert([{ 
      name: formData.get('name'), 
      message: formData.get('message'), 
      image_url: imageUrl, // Url dari cloudinary
      type, 
      is_visible: true ,
    }]);
        if (error) throw error;

}
showToast("BERJAYA DIHANTAR");
if (type === 'rsvp') {
    localStorage.setItem('rsvp_submitted', 'true');
    setHasSubmittedRsvp(true);
  } else {
    localStorage.setItem('live_submitted', 'true');
    setHasSubmittedLive(true);
  }
    // --- RESET SEMUA ---
    form.reset();
    if (setAttendance) setAttendance(''); // Check if function exists
    setPreviewUrl(null);
    setCapturedFile(null);
    
    // Alihkan user ke tab result
    // setActiveTab('rolls');
    setSubTabRolls(type === 'rsvp' ? 'wishes' : 'moments');

  } catch (err) { 
    console.error(err);
    alert("Ops! Ada masalah teknikal. Sila cuba lagi."); 
  } finally { 
    setLoading(false); 
  }
};
const [isOpen, setIsOpen] = useState(false);
const [isOpen1, setIsOpen1] = useState(false);
const [isOpen2, setIsOpen2] = useState(false);

const handleLocation = (type:any) => {
  const address = "Puteri Palmera Glass Hall, Alor Setar, Kedah, Malaysia";
  const encodedAddress = encodeURIComponent(address);
  
  if (type === 'google') {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  } else {
    window.open(`https://waze.com/ul?q=${encodedAddress}&navigate=yes`, '_blank');
  }
};
const handleCall = (type:any) => {
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
  rsvp: useRef<HTMLDivElement>(null),
  contact: useRef<HTMLDivElement>(null),
  wishes: useRef<HTMLDivElement>(null),
};
const scrollToSection = (key: keyof typeof sectionRefs) => {
  setIsManualScroll(true);

  // ✅ highlight terus (no delay)
  // setActiveTab(key);

  sectionRefs[key].current?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });

  // ✅ bagi masa scroll habis baru enable observer balik
  setTimeout(() => {
    setIsManualScroll(false);
  }, 800);
};
const handleRestart = () => {
  setIsCoverOpen(true);

  setActiveTab('info'); // penting
  setPreviewUrl(null);
  setCapturedFile(null);
  setSelectedItem(null);

  scrollContainerRef.current?.scrollTo({
    top: 0,
    behavior: 'instant', // tukar ke instant (lagi clean)
  });
};
interface SnackbarProps {
  message: string;
  type: 'success' | 'error';
  isVisible: boolean;
}

const Snackbar: React.FC<SnackbarProps> = ({ message, type, isVisible }) => (
  <AnimatePresence>
    {isVisible && (
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        className="fixed top-10 left-0 right-0 z-[100] flex justify-center px-6 pointer-events-none"
      >
<div className={`
  px-8 py-4 rounded-2xl shadow-2xl flex items-center justify-center gap-3 backdrop-blur-md
  ${type === 'success' ? 'bg-[#4A443F] text-white' : 'bg-red-900/90 text-white'}
`}>
  {/* Icon simple */}
  <div className={`w-2 h-2 rounded-full animate-pulse ${type === 'success' ? 'bg-green-400' : 'bg-red-400'}`} />
  
  {/* Teks di tengah */}
  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-center">
    {message}
  </span>
</div>
      </motion.div>
    )}
  </AnimatePresence>
);
   const [snackbar, setSnackbar] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });

// 2. Function untuk trigger snackbar
const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
  setSnackbar({ show: true, message: msg, type });
  setTimeout(() => setSnackbar((prev) => ({ ...prev, show: false })), 2000);
};
// Target date: 8 Ogos 2026
// const targetDate = new Date('2026-01-01T00:00:00');
const targetDate = new Date('2026-08-08T00:00:00');
const isLocked = new Date() < targetDate;


   const [showCalendarModal, setShowCalendarModal] = useState(false);

const addToCalendar = (type: 'google' | 'apple') => {
  const event = {
    title: "Majlis Perkahwinan Aimi & Zulhilmi",
    description: "Setiap detik yang berlalu terasa lebih indah apabila kita menantinya bersama. Di bawah langit yang sama, kami ingin membina sebuah mahligai impian. Sudilah kiranya hadir, untuk berkongsi tawa dan merestui langkah kami dalam perjalanan yang baru bermula ini.",
    location: "Puteri Palmera Glass Hall, Alor Setar, Kedah, Malaysia",
    startTime: "2026-08-08T11:00:00", 
    endTime: "2026-08-08T16:00:00"
  };

  if (type === 'google') {
    const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}&dates=${event.startTime.replace(/[-:]/g, '')}/${event.endTime.replace(/[-:]/g, '')}`;
    window.open(url, '_blank');
  } else {
    // Apple/Outlook guna format .ics
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description}`,
      `LOCATION:${event.location}`,
      `DTSTART:${event.startTime.replace(/[-:]/g, '')}`,
      `DTEND:${event.endTime.replace(/[-:]/g, '')}`,
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute("download", "majlis_perkahwinan.ics");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
const navRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (navRef.current) {
    // Cari button yang aktif berdasarkan data-tab attribute
    const activeElement = navRef.current.querySelector(`[data-tab="${activeTab}"]`);
    
    if (activeElement) {
      activeElement.scrollIntoView({
        behavior: 'smooth', // Animasi smooth
        block: 'nearest',   // Tak perlu gerak vertical
        inline: 'center',   // Tengah-tengahkan button dalam scrollable area
      });
    }
  }
}, [activeTab]);

const [selectedImage, setSelectedImage] = useState<string | null>(null);
const [hasSubmittedRsvp, setHasSubmittedRsvp] = useState(false);
const [hasSubmittedLive, setHasSubmittedLive] = useState(false);

// Check localStorage bila page load
useEffect(() => {
  if (localStorage.getItem('rsvp_submitted') === 'true') setHasSubmittedRsvp(true);
  if (localStorage.getItem('live_submitted') === 'true') setHasSubmittedLive(true);
}, []);
const thankYouMessages = [
  "Tika tirai disingkap, kehadiran anda menjadi saksi cinta ini. Terima kasih kerana sudi menjadi sebahagian daripada kanvas memori Aimi dan Zulhilmi.",
  "Kehadiran anda melengkapkan hari bahagia ini. Terima kasih kerana sudi meraikan cinta Aimi dan Zulhilmi dengan doa dan restu yang tidak ternilai.",
  "Setiap langkah yang anda atur untuk ke sini adalah hadiah yang paling indah. Terima kasih kerana sudi berkongsi rasa bahagia ini bersama Aimi dan Zulhilmi.",
  "Jauh atau dekat langkah diatur, terima kasih kerana sudi hadir. Kehadiran kalian adalah penyempurna hari bahagia buat Aimi dan Zulhilmi.",
  "Aimi dan Zulhilmi dengan rendah hati ingin mengucapkan ribuan terima kasih atas kehadiran anda. Semoga ikatan ini diberkati, seperti doa kalian buat kami.",
  "Terima kasih kerana sudi meluangkan masa, meraikan cinta, dan berkongsi memori. Kehadiran anda amat bermakna buat Aimi dan Zulhilmi.",
  "Bukan sekadar tetamu, anda adalah sebahagian daripada cerita Aimi dan Zulhilmi. Terima kasih kerana sudi hadir dan mendoakan kebahagiaan ini.",
  "Pucuk pauh delima batu,\nTempat hinggap si rama-rama,\nDoa yang baik kami restu,\nTerima kasih hadir bersama.",
  "Kalau ada sumur di ladang,\nBoleh kita menumpang mandi,\nTerima kasih sudi bertandang,\nMenyerikan majlis bahagia Aimi dan Zulhilmi.",
  "Layang-layang terbang ke awan,\nPutus tali jatuh ke bumi,\nTerima kasih atas kehadiran,\nSudi meraikan hari bahagia Aimi dan Zulhilmi.",
];

const randomMessage = useMemo(() => {
  const randomIndex = Math.floor(Math.random() * thankYouMessages.length);
  return thankYouMessages[randomIndex];
}, []); // [] bermaksud dia hanya 'random' sekali masa pertama kali load

return (
    <div className="min-h-screen bg-[#FCFAF7] text-[#4A443F] font-sans overflow-x-hidden selection:bg-[#E8DED1]">
      

      
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
<div 
  ref={scrollContainerRef}
  className="fixed inset-0 w-full h-full overflow-y-auto no-scrollbar snap-y snap-mandatory bg-[#FCFAF7] z-40 pb-20"
>  
    {/* --- SECTION Burung --- */}
    <motion.section 
      ref={sectionRefs.info}
      className="relative h-screen w-full flex flex-col items-center justify-center snap-start overflow-x-hidden"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ amount: 0.5 }}
      transition={{ duration: 0.8 }}
    >
      <div className="relative w-full max-w-[450px] aspect-[9/16] flex flex-col items-center justify-center">
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
            className="w-full h-auto object-contain scale-90" 
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
    className="w-full h-auto object-contain scale-75" 
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
    className="w-full h-auto object-contain scale-55" 
  />
</motion.div>
<motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/3.png" className="absolute bottom-[15%] left-[10%] w-28 z-20 w-[100px]"
        />
        <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/6.png" className="absolute bottom-[75%] left-[5%] w-28 z-20 w-20"
        />
        <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/3.png" className="absolute bottom-[80%] left-[80%] w-28 z-20 w-20"
        />
        <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/11.png" className="absolute bottom-[15%] left-[70%] w-28 z-20 w-[80px]"
        />
        <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/12.png" className="absolute bottom-[8%] left-[40%] w-28 z-20 w-[80px]"
        />
         <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/12.png" className="absolute bottom-[40%] left-[82%] w-28 z-20 w-[60px]"
        />
        <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/12.png" className="absolute bottom-[80%] left-[45%] w-28 z-20 w-[70px]"
        />      
        </div>
      {/* Dekorasi tetap berada di dalam section supaya dia fade out sekali */}
    </motion.section>

    {/* --- SECTION Pintu --- */}
    <motion.section 
      className="relative h-screen w-full flex flex-col items-center justify-center snap-start overflow-x-hidden"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ amount: 0.5 }}
      transition={{ duration: 0.8 }}
    >
      <div className="relative w-full max-w-[450px] aspect-[9/16] flex flex-col items-center justify-center">
<motion.div 
  initial={{ scale: 0.8, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ duration: 1 }}
  className="relative z-10 w-full mt-[-50px] ml-5" // <--- TUKAR NILAI NI (Lagi besar nilai, lagi tinggi dia naik)
>
  <img 
    src="/image/54.png" 
    alt="Main Invite"
    className="w-full h-auto object-contain scale-130" 
  />
</motion.div>

<motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/3.png" className="absolute bottom-[70%] left-[80%] w-28 z-20 w-20"
        />
        <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/6.png" className="absolute bottom-[75%] left-[5%] w-28 z-20 w-20"
        />
         <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/4.png" className="absolute bottom-[15%] left-[60%] w-28 z-20 w-[90px]"
        />
         <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/7.png" className="absolute bottom-[15%] left-[15%] w-28 z-20 w-[90px]"
        />
        <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/16.png" className="absolute bottom-[85%] left-[40%] w-28 z-20 w-30"
        />
        {/* <motion.img 
          src="/image/17.png" className="absolute bottom-[17%] left-[30%] w-28 z-20 w-60"
        /> */}
        <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/3.png" className="absolute bottom-[30%] left-[10%] w-28 z-20 w-4"
        />
        <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/6.png" className="absolute bottom-[20%] left-[70%] w-28 z-20 w-1"
        />
             </div>
    </motion.section>
        {/* --- SECTION Sofa --- */}
    <motion.section 
      className="relative h-screen w-full flex flex-col items-center justify-center snap-start overflow-x-hidden"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ amount: 0.5 }}
      transition={{ duration: 0.8 }}
    >
      <div className="relative w-full max-w-[450px] aspect-[9/16] flex flex-col items-center justify-center">
{/* <motion.img 
          src="/image/47.png" className="absolute bottom-[70%] left-[23%] w-28 z-20 w-90"
        /> */}
              <motion.div 
  initial={{ scale: 0.8, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ duration: 1 }}
  className="relative z-10 w-full mt-[10px]" // <--- TUKAR NILAI NI (Lagi besar nilai, lagi tinggi dia naik)
>
  {/* <img 
    src="/image/53.png" 
    alt="Main Invite"
    className="w-full h-auto object-contain scale-130" 
  /> */}
    <img 
    src="/image/53.png" 
    alt="Main Invite"
    className="w-full h-auto object-contain scale-130" 
  /> 
  <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/16.png" className="absolute bottom-[110%] left-[40%] w-28 z-20 w-[100px]"
        />
          <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/3.png" className="absolute bottom-[95%] left-[10%] w-28 z-20 w-[100px]"
        />
         <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/64.png" className="absolute bottom-[85%] left-[2%] w-28 z-20 w-[15px]"
        />
                 <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/64.png" className="absolute bottom-[100%] left-[85%] w-28 z-20 w-[15px]"
        />
                         <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/6.png" className="absolute bottom-[100%] left-[80%] w-28 z-20 w-[100px]"
        />
        <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/65.png" className="absolute bottom-[105%] left-[10%] w-28 z-20 w-[40px]"
        />
                <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/65.png" className="absolute bottom-[100%] left-[75%] w-28 z-20 w-[40px]"
        />
        {/* <motion.img 
          src="/image/48.png" className="absolute bottom-[65%] left-[60%] w-28 z-20 w-[200px]"
        />
                <motion.img 
          src="/image/49.png" className="absolute bottom-[70%] left-[15%] w-28 z-20 w-[190px]"
        /> */}
</motion.div>
  </div>

    </motion.section>
            {/* --- SECTION MAMA ABAH --- */}
    <motion.section 
      className="relative h-screen w-full flex flex-col items-center justify-center snap-start overflow-x-hidden"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ amount: 0.5 }}
      transition={{ duration: 0.8 }}
    >
      <div className="relative w-full max-w-[450px] aspect-[9/16] flex flex-col items-center justify-center">
 
  <motion.img 
          src="/image/80.png" className="absolute top-[16%] left-[55%] w-32 z-20 w-[95px]"
        />
          <motion.img 
          src="/image/81.png" className="absolute top-[16%] left-[25%] w-32 z-20 w-[95px]"
        />
        <motion.img 
          src="/image/72.png" className="absolute top-[55%] left-[55%] w-32 z-20 w-[100px]"
        />
          <motion.img 
          src="/image/73.png" className="absolute top-[55%] left-[25%] w-32 z-20 w-[95px]"
        />
                  <motion.img 
          src="/image/78.png" className="absolute top-[10%] left-[25%] w-32 z-20 w-[200px]"
        />
                          <motion.img 
          src="/image/79.png" className="absolute top-[50%] left-[35%] w-32 z-20 w-[140px]"
        />
         <motion.img 
          src="/image/76.png" className="absolute top-[38%] left-[25%] w-32 z-20 w-[100px]"
        />
                 <motion.img 
          src="/image/77.png" className="absolute top-[38%] left-[58%] w-32 z-20 w-[110px]"
        />
                 <motion.img 
          src="/image/74.png" className="absolute top-[78%] left-[25%] w-32 z-20 w-[120px]"
        />
                 <motion.img 
          src="/image/75.png" className="absolute top-[78%] left-[58%] w-32 z-20 w-[110px]"
        />
                         <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/64.png" className="absolute bottom-[50%] left-[10%] w-28 z-20 w-[20px]"
        />
                                 <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/64.png" className="absolute bottom-[70%] left-[90%] w-28 z-20 w-[20px]"
        />
         <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/65.png" className="absolute bottom-[60%] left-[80%] w-28 z-20 w-[50px]"
        />
                 <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/65.png" className="absolute bottom-[50%] left-[1%] w-28 z-20 w-[40px]"
        />
<motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }}
  src="/image/2.png" 
  className="absolute top-[10%] left-[-15%] w-32 rotate-[-15deg] w-50 z-0" 
/>
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
          src="/image/5.png" className="absolute bottom-[10%] right-[-10%] w-36 z-[-10] rotate-[10deg] w-40 "
        />
 <motion.img 
   animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/7.png" className="absolute top-[70%] left-[-5%] w-32 z-20 rotate-[-15deg] w-40 z-0"
        />             

  </div>

    </motion.section>
            {/* --- SECTION Date and Location --- */}
 <motion.section 
      ref={sectionRefs.calendar}
      className="relative h-screen w-full flex flex-col items-center justify-center snap-start overflow-x-hidden"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ amount: 0.5 }}
      transition={{ duration: 0.8 }}
    >
      <div className="relative w-full max-w-[450px] aspect-[9/16] flex flex-col items-center justify-center">
               <motion.div 
  initial={{ scale: 0.8, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ duration: 1 }}
  className="relative z-10 w-full mt-[-80px]" // <--- TUKAR NILAI NI (Lagi besar nilai, lagi tinggi dia naik)
>
  <img 
    src="/image/63.png" 
    alt="Main Invite"
    className="w-full h-auto object-contain scale-80" 
        onClick={() => setShowCalendarModal(true)}

  />
</motion.div>
<motion.div 
  initial={{ scale: 0.8, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ duration: 1 }}
  className="relative z-10 w-full mt-[-70px]"
>
  <img 
    src="/image/56.png" 
    alt="Main Invite"
    className="w-full h-auto object-contain scale-60" 
  onClick={() => setIsOpen(true)}
  />
</motion.div>
{/* <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/36.png" className="absolute bottom-[80%] left-[10%] w-28 z-20 w-[150px]"
        /> */}
         <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/42.png" className="absolute bottom-[52%] left-[61%] w-28 z-20 w-[90px]"
        onClick={() => setShowCalendarModal(true)}
        />
         {/* <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/39.png" className="absolute bottom-[40%] left-[35%] w-28 z-20 w-[150px]"
              onClick={() => setShowCalendarModal(true)}
        /> */}
                 {/* <motion.img 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/40.png" className="absolute bottom-[30%] left-[35%] w-28 z-20 w-[70px]"
          whileTap={{ scale: 0.9 }} // Tambah feedback bila ditekan
  onClick={() => setIsOpen(true)}
        /> */}
         {/* <motion.img 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/50.png" className="absolute bottom-[26%] left-[37%] w-28 z-20 w-[150px]"
          whileTap={{ scale: 0.9 }} // Tambah feedback bila ditekan
  onClick={() => setIsOpen(true)}
        /> */}
        {/* <motion.img 
  // transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/41.png" 
          // className="absolute bottom-[25%] left-[23%] w-28 z-20 w-[300px]"
            className="absolute bottom-[25%] left-[23%] w-28 z-20 w-[300px] cursor-pointer"
  whileTap={{ scale: 0.9 }} // Tambah feedback bila ditekan
  onClick={() => setIsOpen(true)}
        /> */}
        <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/3.png" className="absolute bottom-[70%] left-[10%] w-28 z-20 w-[100px]"
        />
        <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/6.png" className="absolute bottom-[80%] left-[70%] w-28 z-20 w-[100px]"
        />
                <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/3.png" className="absolute bottom-[30%] left-[80%] w-28 z-20 w-[70px]"
        />
         <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/38.png" className="absolute bottom-[70%] left-[75%] w-28 z-20 w-[100px]"
        />
         <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/7.png" className="absolute bottom-[15%] left-[5%] w-28 z-20 w-[90px]"
        />
                 <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/12.png" className="absolute bottom-[10%] left-[70%] w-28 z-20 w-[130px]"
        />
         <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/12.png" className="absolute bottom-[90%] left-[1%] w-28 z-20 w-[50px]"
        />
{/* <motion.img 
  src="/image/44.png" 
  className="absolute bottom-[17%] left-[33%] z-20 w-[200px] cursor-pointer"
  whileTap={{ scale: 0.9 }} // Tambah feedback bila ditekan
  onClick={() => setIsOpen(true)}
/> */}
            </div>

    </motion.section>
{/* --- SECTION RSVP --- */}
<motion.section 
  ref={sectionRefs.rsvp}
  className="relative min-h-screen w-full flex flex-col items-center snap-start px-6 pt-24 pb-32 bg-[#FBF9F7] overflow-x-hidden"
  initial={{ opacity: 0 }}
  whileInView={{ opacity: 1 }}
  viewport={{ amount: 0.3 }}
  transition={{ duration: 0.8 }}
>
  <motion.div 
    initial={{ opacity: 0, y: 20 }} 
    whileInView={{ opacity: 1, y: 0 }}
    className="w-full max-w-md space-y-10"
  >
    {/* Sub-tab Selector - More Modern & Rounded */}
    <div className="flex bg-[#F3EFE9] p-1 rounded-full border border-[#D6C7B5]/20 shadow-inner">
  
  <button 
    onClick={() => {
      setSubTabAction('rsvp');
      setPreviewUrl(null);
    }} 
    className={`flex-1 py-2.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all ${subTabAction === 'rsvp' ? 'bg-white shadow-sm text-[#4A443F]' : 'text-[#A39584]'}`}
  >
    RSVP
  </button>
  
  <button 
    onClick={() => {
      if(isLocked) {
        // Guna Snackbar/Toast yang kita buat tadi
        showToast("LIVE SNAP AKAN DIBUKA PADA 08.08.2026", "error");
      } else {
        setSubTabAction('live');
        setPreviewUrl(null);
      }
    }} 
    className={`
      flex-1 py-2.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2
      ${isLocked ? 'text-[#A39584]/50' : (subTabAction === 'live' ? 'bg-white shadow-sm text-[#4A443F]' : 'text-[#A39584]')}
    `}
  >
    {isLocked && (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5 opacity-60">
        <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3H5.25A2.25 2.25 0 003 12v9a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 21v-9a2.25 2.25 0 00-2.25-2.25h-1.5v-3A5.25 5.25 0 0012 1.5zm-3.75 8.25v-3a3.75 3.75 0 117.5 0v3H8.25z" clipRule="evenodd" />
      </svg>
    )}
    Live Snap
  </button>
</div>
{subTabAction === 'rsvp' ? (
  hasSubmittedRsvp ? (
    // Paparan Success
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="relative w-full max-w-[300px] mx-auto my-12"
    >
      {/* Glass Container */}
      <div className="bg-white/20 backdrop-blur-lg border border-white/40 shadow-[0_8px_32px_rgba(74,68,63,0.1)] rounded-[2.5rem] p-8 text-center">

        <div className="flex flex-col items-center justify-center space-y-6">

<div className="w-12 h-12 border border-[#D6C7B5] rounded-full flex items-center justify-center">
    {/* <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4A443F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg> */}
        <img
    src="/image/52.png"
    alt="Main Invite"
    className="w-full h-auto object-contain scale-130"
  />
  </div>

      <div className="space-y-2">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#4A443F]">
         Terima Kasih {nama}!
        </h3>
<p className="text-[9px] uppercase tracking-[0.2em] text-[#4A443F]/80 leading-relaxed text-center whitespace-pre-line">
  {randomMessage}
</p>
</div>

    </div>
  </div>
</motion.div>
  ) : (
    // Form asal anda
    
 <form onSubmit={(e) => handleSubmit(e, 'rsvp')} className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
    {/* Main Card Container (Style ikut Live Snap) */}
    <div className="bg-white p-4 rounded-[2.5rem] shadow-[0_20px_50px_rgba(74,68,63,0.08)] border border-[#D6C7B5]/10">
      
      <div className="px-2 py-4 space-y-5">
        
        {/* Field Nama */}
        <div className="space-y-2">
          {/* <label className="text-[7px] font-black uppercase tracking-[0.3em] text-[#A39584] ml-2">Nama</label> */}
          <input 
            name="name" 
            // required 
            placeholder="NAMA" 
              className="w-full bg-[#FBF9F7] px-5 py-4 rounded-xl text-[10px] font-bold outline-none focus:ring-1 focus:ring-[#D6C7B5] uppercase tracking-widest transition-all" 
          />
        </div>

        {/* Field Kehadiran Custom Dropdown */}
        <div className="relative w-full space-y-2">
          {/* <label className="text-[7px] font-black uppercase tracking-[0.3em] text-[#A39584] ml-2">Kehadiran</label> */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsOpen3(!isOpen3)}
              className="w-full bg-[#FBF9F7] border border-[#D6C7B5]/10 px-6 py-4 rounded-2xl text-[10px] font-bold outline-none flex items-center justify-between uppercase tracking-widest transition-all"
            >
              <span className={attendance ? "text-[#4A443F]" : "text-[#D6C7B5]"}>
                {attendance === "Hadir" ? "Saya Akan Hadir" : 
                 attendance === "Tidak Hadir" ? "Tidak Dapat Hadir" : 
                 "Pilih Kehadiran"}
              </span>
              <motion.span animate={{ rotate: isOpen3 ? 180 : 0 }} className="text-[8px] text-[#A39584]">▼</motion.span>
            </button>

            <AnimatePresence>
              {isOpen3 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-50 w-full mt-2 bg-white/95 backdrop-blur-xl border border-[#D6C7B5]/20 rounded-2xl shadow-xl overflow-hidden"
                >
                  {["Hadir", "Tidak Hadir"].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => { setAttendance(opt); setIsOpen3(false); }}
                      className={`w-full px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-left transition-colors hover:bg-[#4A443F] hover:text-white
                        ${attendance === opt ? 'bg-[#F9F7F4] text-[#4A443F]' : 'text-[#A39584]'}
                      `}
                    >
                      {opt === "Hadir" ? "Saya Akan Hadir" : "Mohon Maaf, Tidak Dapat Hadir"}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Counter Pax - Hanya muncul jika Hadir */}
        <AnimatePresence>
          {attendance === 'Hadir' && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 overflow-hidden"
            >
              {/* <label className="text-[7px] font-black uppercase tracking-[0.3em] text-[#A39584] ml-2">Jumlah Tetamu</label> */}
              <div className="flex items-center justify-between bg-[#FBF9F7] border border-[#D6C7B5]/10 px-4 py-3 rounded-2xl">
                <button 
                  type="button"
                  onClick={() => setPaxCount(Math.max(1, paxCount - 1))}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-[#4A443F] shadow-sm active:scale-90 transition-all"
                >—</button>
                <div className="flex flex-col items-center">
                  <span className="text-sm font-black text-[#4A443F]">{paxCount}</span>
                  <span className="text-[7px] font-bold uppercase tracking-widest text-[#D6C7B5]">Orang</span>
                  <input type="hidden" name="pax" value={paxCount} />
                </div>
                <button 
                  type="button"
                  onClick={() => setPaxCount(paxCount + 1)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#4A443F] text-white active:scale-90 transition-all shadow-md shadow-[#4A443F]/20"
                >+</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Field Ucapan */}
        <div className="space-y-2">
          {/* <label className="text-[7px] font-black uppercase tracking-[0.3em] text-[#A39584] ml-2">Ucapan</label> */}
          <textarea 
            name="message" 
            placeholder="UCAPAN" 
            className="w-full bg-[#FBF9F7] px-5 py-4 rounded-xl text-[10px] font-bold outline-none focus:ring-1 focus:ring-[#D6C7B5] uppercase tracking-widest transition-all  h-28" 
          />
        </div>

        {/* Submit Button (Style ikut Live Snap) */}
        <button 
          disabled={loading} 
          className="w-full py-5 bg-[#4A443F] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-[#4A443F]/10 active:scale-[0.98] transition-all disabled:opacity-50 mt-2"
        >
          {loading ? 'SEDANG DIHANTAR...' : 'HANTAR RSVP'}
        </button>
      </div>
    </div>
  </form>
  )

) : (
    <form onSubmit={(e) => handleSubmit(e, 'live')} className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">

<div className="space-y-8 animate-in fade-in duration-700">
  
  {/* Card Container */}
  <div className="bg-white p-4 rounded-[2.5rem] shadow-[0_20px_50px_rgba(74,68,63,0.08)] border border-[#D6C7B5]/10">
    
    {/* 1. Viewfinder Area */}
    <div className="relative aspect-square w-full bg-[#FBF9F7] rounded-[2rem] overflow-hidden group">
      {previewUrl ? (
        <Image src={previewUrl} alt="Live Capture" fill className="object-cover" />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
           {/* Camera Icon Aesthetic */}
           <div className="w-16 h-16 border border-[#D6C7B5]/40 rounded-full flex items-center justify-center mb-4">
              <div className="w-8 h-8 border-2 border-[#D6C7B5] rounded-lg relative">
                 <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-1 bg-[#D6C7B5] rounded-full" />
                 <div className="absolute inset-1 border border-[#D6C7B5] rounded-full" />
              </div>
           </div>
           <p className="text-[8px] font-black uppercase tracking-[0.4em] text-[#D6C7B5]">Tiada Gambar</p>
        </div>
      )}

      {/* Camera Trigger (Only show if no preview) */}
      {!previewUrl && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity">
           <input 
            type="file" 
            accept="image/*" 
            capture="environment" 
      onChange={(e) => {
  const f = e.target.files?.[0]; 
  if(f){ 
    setPreviewUrl(URL.createObjectURL(f)); // Untuk tunjuk gambar
    setCapturedFile(f);                   // Simpan file object untuk upload (PENTING!)
  }
}} 
            className="absolute inset-0 opacity-0 cursor-pointer z-10" 
          />
        </div>
      )}
    </div>

    {/* 2. Form Area (Below Image inside the same card) */}
    <div className="mt-6 px-2 pb-2 space-y-4">
      {!previewUrl ? (
        /* Tombol Ambil Gambar kalau belum ada gambar */
        <div className="relative">
          <input 
            type="file" 
            accept="image/*" 
            capture="environment" 
            onChange={(e) => {
              const f = e.target.files?.[0]; 
              if(f){ setPreviewUrl(URL.createObjectURL(f)); }
            }} 
            className="absolute inset-0 opacity-0 cursor-pointer z-10" 
          />
          <button className="w-full py-4 bg-[#4A443F] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">
            Ambil Gambar Live
          </button>
        </div>
      ) : (
        /* Form Input kalau gambar dah ada */
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="space-y-4"
        >
          <div className="space-y-3">
            <input 
              name="name" 
              placeholder="NAMA" 
              className="w-full bg-[#FBF9F7] px-5 py-4 rounded-xl text-[10px] font-bold outline-none focus:ring-1 focus:ring-[#D6C7B5] uppercase tracking-widest transition-all" 
            />
            <input 
              name="message" 
              placeholder="CAPTION" 
              className="w-full bg-[#FBF9F7] px-5 py-4 rounded-xl text-[10px] font-bold outline-none focus:ring-1 focus:ring-[#D6C7B5] uppercase tracking-widest transition-all" 
            />
          </div>

          <div className="flex gap-2">
            <button 
              type="button" 
              onClick={() => setPreviewUrl(null)} 
              className="flex-1 py-4 text-[8px] font-black uppercase tracking-widest text-[#A39584]"
            >
              Padam
            </button>
            <button 
              disabled={loading} 
              className="flex-[2.5] py-4 bg-[#4A443F] text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all"
            >
              {loading ? 'Hantar...' : 'Kongsi Memori'}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  </div>
</div>
  </form>

)}
  </motion.div>
</motion.section>
                {/* --- SECTION Contact --- */}

<motion.section 
      ref={sectionRefs.contact}
      className="relative h-screen w-full flex flex-col items-center justify-center snap-start overflow-x-hidden"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ amount: 0.5 }}
      transition={{ duration: 0.8 }}
    >
      <div className="relative w-full max-w-[450px] aspect-[9/16] flex flex-col items-center justify-center">
        <motion.div 
  initial={{ scale: 0.8, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ duration: 1 }}
  className="flex justify-center z-10 w-full mt-[-50px] ml-10" // <--- TUKAR NILAI NI (Lagi besar nilai, lagi tinggi dia naik)
>
  <img 
    src="/image/62.png" 
    alt="Main Invite"
    className="w-full h-auto object-contain scale-90" 
      // onClick={() => setIsOpen1(true)}
  />
</motion.div>
<motion.div 
  initial={{ scale: 0.8, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ duration: 1 }}
  className="relative z-10 w-full mt-[-30px]" // <--- TUKAR NILAI NI (Lagi besar nilai, lagi tinggi dia naik)
>
  <img 
    src="/image/21.png" 
    className="w-full h-auto object-contain scale-90"     alt="Main Invite"

  />
</motion.div>

<motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/3.png" className="absolute bottom-[65%] left-[70%] w-28 z-20 w-[90px]"
        />
        <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/3.png" className="absolute bottom-[80%] left-[80%] w-28 z-20 w-[80px]"
        />
        <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/3.png" className="absolute bottom-[35%] left-[10%] w-28 z-20 w-[100px]"
        />
        <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/65.png" className="absolute bottom-[70%] left-[10%] w-28 z-20 w-[50px]"
        />
        {/* <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/18.png" className="absolute bottom-[68%] left-[25%] w-28 z-20 w-60"
        /> */}
        {/* <motion.img 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/19.png" className="absolute bottom-[68%] left-[30%] w-28 z-20 w-80"
        /> */}
         {/* <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/20.png" className="absolute bottom-[60%] left-[20%] w-28 z-20 w-[50px]"
        /> */}
         <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/20.png" className="absolute bottom-[40%] left-[80%] w-28 z-20 w-[50px]"
        />
        <motion.img 
  animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/20.png" className="absolute bottom-[80%] left-[10%] w-28 z-20 w-[50px]"
        />
             {/* <motion.img 
          src="/image/46.png" className="absolute bottom-[45%] left-[10%] w-28 z-20 w-[400px]"
        /> */}
        <motion.img 
          src="/image/60.png" className="absolute bottom-[38%] left-[38%] w-28 z-20 w-[40px]"
            whileTap={{ scale: 0.9 }} // Tambah feedback bila ditekan
  onClick={() => setIsOpen1(true)}

        />
                <motion.img 
          src="/image/61.png" className="absolute bottom-[38%] left-[55%] w-28 z-20 w-[35px]"
            whileTap={{ scale: 0.9 }} // Tambah feedback bila ditekan
  onClick={() => setIsOpen2(true)}

        />
             </div>
             
    </motion.section>
                {/* --- SECTION Best Regards --- */}
{/* <motion.section 
  ref={sectionRefs.wishes}
      className="relative h-screen w-full flex flex-col items-center justify-center snap-start overflow-x-hidden"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ amount: 0.5 }}
      transition={{ duration: 0.8 }}
    >
      <div className="relative w-full max-w-[450px] aspect-[9/16] flex flex-col items-center justify-center">

 <motion.div 
  initial={{ scale: 0.8, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ duration: 1 }}
  className="flex justify-center z-10 w-full mt-[-55px] ml-1" // <--- TUKAR NILAI NI (Lagi besar nilai, lagi tinggi dia naik)
>
  <img 
    src="/image/59.png" 
    alt="Main Invite"
    className="w-full h-auto object-contain scale-100" 
  />
</motion.div>
        <motion.img 
          animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/3.png" className="absolute  bottom-[30%] left-[85%] w-28 z-20 w-[90px]"
        />
        <motion.img 
          animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/6.png" className="absolute bottom-[20%] left-[30%] w-28 z-20 w-[100px]"
        />
        <motion.img 
          animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/3.png" className="absolute bottom-[75%] left-[38%] w-28 z-20 w-[100px]"
        />
        <motion.img 
          animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/12.png" className="absolute bottom-[45%] left-[1%] w-28 z-20 w-[70px]"
        />
                <motion.img 
          animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/12.png" className="absolute bottom-[60%] left-[85%] w-28 z-20 w-[50px]"
        />
         <motion.img 
          animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/11.png" className="absolute bottom-[83%] left-[80%] w-28 z-20 w-[70px]"
        />
        </div>

    </motion.section> */}
<motion.section 
  ref={sectionRefs.wishes}
      className="relative h-screen w-full flex flex-col items-center justify-center snap-start overflow-x-hidden"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ amount: 0.5 }}
      transition={{ duration: 0.8 }}
    >
      <div className="relative w-full max-w-[450px] aspect-[9/16] flex flex-col items-center justify-center">
<motion.img 
  src="/image/19.png" 
  className="absolute bottom-[73%] left-[1%] w-[230px] z-20 -scale-x-100"
/>
 <motion.img 
 onClick={() => setSelectedImage("/image/70.png")}
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/70.png" className="absolute bottom-[40%] left-[73%] w-28 z-20 w-[90px]"
        />
         <motion.img 
          onClick={() => setSelectedImage("/image/69.png")}
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/69.png" className="absolute bottom-[45%] left-[45%] w-28 z-20 w-[90px]"
        />
        <motion.img 
          onClick={() => setSelectedImage("/image/32.png")}
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/32.png" className="absolute bottom-[70%] left-[6%] w-28 z-20 w-[140px]"
        />
         <motion.img 
                   onClick={() => setSelectedImage("/image/71.png")}
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/71.png" className="absolute bottom-[50%] left-[6%] w-28 z-20 w-[140px]"
        />
        <motion.img 
         onClick={() => setSelectedImage("/image/31.png")}
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/31.png" className="absolute bottom-[65%] left-[45%] w-28 z-20 w-[200px]"
        />
 <motion.img 
          src="/image/29.png" className="absolute bottom-[27%] left-[40%] w-28 z-20 w-[200px]"
        />
         <motion.img 
          src="/image/45.png" className="absolute bottom-[17%] left-[45%] w-28 z-20 w-[180px]"
        />
         <motion.img 
                  onClick={() => setSelectedImage("/image/33.png")}
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/33.png" className="absolute bottom-[15%] left-[3%] w-28 z-20 w-[150px]"
        />
        <motion.img 
          animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/3.png" className="absolute  bottom-[28%] left-[85%] w-28 z-20 w-[80px]"
        />
        <motion.img 
          animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/6.png" className="absolute bottom-[15%] left-[32%] w-28 z-20 w-[80px]"
        />
        <motion.img 
          animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/3.png" className="absolute bottom-[85%] left-[40%] w-28 z-20 w-[70px]"
        />
        <motion.img 
          animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/12.png" className="absolute bottom-[41%] left-[1%] w-28 z-20 w-[70px]"
        />
         <motion.img 
          animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/12.png" className="absolute bottom-[57%] left-[80%] w-28 z-20 w-[70px]"
        />  
        <motion.img 
          animate={{ scale: [1, 1.2, 1] }} 
  transition={{ repeat: Infinity, duration: 3 }} // Tambah ni supaya dia sentiasa berdenyut
          src="/image/11.png" className="absolute bottom-[88%] left-[80%] w-28 z-20 w-[70px]"
        />
          </div>

    </motion.section>
   {/* --- SECTION Wishes & Moments --- */}
<motion.section 
  /* Guna min-h-[100dvh] untuk mobile yang lebih tepat */
  className="relative min-h-[100dvh] w-full flex flex-col items-center snap-start px-4 pt-20 pb-20 overflow-x-hidden"
  initial={{ opacity: 0 }}
  whileInView={{ opacity: 1 }}
  /* Kurangkan amount kepada 0.1 supaya lebih mudah trigger */
  viewport={{ amount: 0.1, once: true }} 
  transition={{ duration: 0.5 }}
>
  <motion.div 
    initial={{ opacity: 0, y: 20 }} 
    whileInView={{ opacity: 1, y: 0 }}
    className="w-full max-w-md space-y-8"
  >

    {/* Sub-tab Selector IG Style */}
    <div className="flex bg-[#F3EFE9] p-1 rounded-full border border-[#D6C7B5]/20 shadow-inner">
  {/* Wishes Button */}
  <button 
    onClick={() => setSubTabRolls('wishes')} 
    className={`flex-1 py-3 rounded-full text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
      subTabRolls === 'wishes' ? 'bg-white shadow-md text-[#4A443F]' : 'text-[#A39584]/60'
    }`}
  >
    Wishes
  </button>

  {/* Moments Button dengan Lock Logic */}
  <button 
    onClick={() => {
      if (isLocked) {
        // Panggil snackbar/toast bagitahu tarikh
        showToast("MOMENTS AKAN DIBUKA PADA 08.08.2026", "error");
      } else {
        setSubTabRolls('moments');
      }
    }} 
    className={`flex-1 py-3 rounded-full text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-2 ${
      subTabRolls === 'moments' 
        ? 'bg-white shadow-md text-[#4A443F]' 
        : (isLocked ? 'text-[#A39584]/30' : 'text-[#A39584]/60')
    }`}
  >
    {isLocked && (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5 opacity-50">
        <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3H5.25A2.25 2.25 0 003 12v9a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 21v-9a2.25 2.25 0 00-2.25-2.25h-1.5v-3A5.25 5.25 0 0012 1.5zm-3.75 8.25v-3a3.75 3.75 0 117.5 0v3H8.25z" clipRule="evenodd" />
      </svg>
    )}
    Moments
  </button>
</div>

    {/* Content Area */}
    <div className="min-h-[400px]">
      <AnimatePresence mode="wait">
        {subTabRolls === 'wishes' ? (

<motion.div 
  key="wishes-canvas"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  className="columns-2 gap-4 pt-4 space-y-4 px-2"
>
  {data.filter(item => item.type === 'rsvp').map((item, index) => (
   <motion.div
  key={item.id}
  layoutId={`card-${item.id}`}
  onClick={() => setSelectedWish(item)}          
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ delay: index * 0.05 }}
  className="break-inside-avoid inline-block w-full 
             relative p-6
             bg-white/60 backdrop-blur-3xl 
             border border-white/40 
             rounded-[35px] 
             shadow-[0_20px_40px_rgba(74,68,63,0.08)]
             text-center"
>
  <div className="relative flex flex-col items-center">

    {/* Message */}
    <p className="text-[12px] text-[#4A443F] leading-relaxed font-serif italic mb-6 
                  break-words w-full overflow-hidden whitespace-pre-wrap">
      "{item.message}"
    </p>

    {/* Divider */}
    <div className="w-8 h-[1px] bg-[#A39584]/20 mb-3 mx-auto" />

    {/* Sender */}
    <div className="flex flex-col items-center">
      <span className="text-[6px] font-bold uppercase tracking-[0.2em] text-[#A39584] mb-1">
        Sender
      </span>
      <h4 className="text-[10px] font-black text-[#4A443F] uppercase tracking-widest leading-tight">
        {item.name}
      </h4>
    </div>
  </div>
</motion.div>
  ))}
</motion.div> 
) : (
          /* --- VIEW 2: MOMENTS GRID (INSTAGRAM STYLE) --- */
          <motion.div 
            key="moments-grid"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="grid grid-cols-3 gap-[2px] bg-[#D6C7B5]/10 border border-[#D6C7B5]/10 rounded-2xl overflow-hidden mt-4"
          >
            {data.filter(item => item.type === 'live').length > 0 ? (
              data.filter(item => item.type === 'live').map((item) => (
                <motion.div 
                  key={item.id} 
                  className="relative aspect-square bg-[#F3EFE9] overflow-hidden cursor-pointer group"
                  onClick={() => setSelectedItem(item)}
                  whileHover={{ opacity: 0.9 }}
                >
                  {item.image_url ? (
                    <Image 
                      src={item.image_url} 
                      alt="Moment" 
                      fill 
                      className="object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#E5E1DA]">
                      <span className="text-[8px] text-[#A39584]">No Image</span>
                    </div>
                  )}
                  {/* Overlay Info on Hover */}
                  <div className="absolute inset-0 bg-[#4A443F]/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-2 text-center">
                    <p className="text-[7px] font-black text-white uppercase tracking-widest truncate">{item.name}</p>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-3 py-20 text-center text-[9px] text-[#A39584] uppercase tracking-widest opacity-50 italic">Tiada momen dikongsi...</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>

    {/* Bottom Spacer for Mobile Navigation */}
    <div className="h-24" />
  </motion.div>
</motion.section>

  </div>
        {/* --- GLOBAL NAVIGATION --- */}
{!isCoverOpen&& !isOpen && !selectedWish&& !isOpen1&&!selectedItem&&!showCalendarModal&&!isOpen2&&!selectedImage&& (
  <>
       <nav ref={navRef} className="fixed bottom-5 left-1/2 -translate-x-1/2 flex items-center p-1.5 bg-white/40 backdrop-blur-2xl border border-white/60 rounded-full shadow-[0_20px_50px_rgba(214,199,181,0.2)] z-[200] pointer-events-auto max-w-[90vw] overflow-x-auto scrollbar-hide">
<button
  onClick={handleRestart}
  className="
    ml-1 p-2.5 rounded-full text-[#A39584] 
    transition-all duration-500 group flex-shrink-0
    hover:bg-gradient-to-tr hover:from-[#D6C7B5]/30 hover:to-white
    hover:shadow-[0_0_15px_rgba(214,199,181,0.5)]
    hover:scale-110
  "
>
  <RotateCcw 
    size={16} 
    className="group-hover:animate-spin-slow transition-all duration-500"
  />
</button>
  
  <div className="flex items-center gap-1"> {/* Tambah div wrapper untuk list button */}
    {[
      { id: 'info', label: 'Info' },
      { id: 'calendar', label: 'Calendar & Location' },
      { id: 'rsvp', label: 'RSVP' },
      { id: 'contact', label: 'Contact' },
      { id: 'wishes', label: 'Wishes' }
    ].map((tab) => (
      <button
        key={tab.id}
        data-tab={tab.id} // Tambah attribute ni untuk querySelector
        onClick={() => scrollToSection(tab.id as any)}
        className={`
          px-4 py-2.5 rounded-full 
          text-[8px] font-black uppercase tracking-[0.15em]
          transition-all duration-500 whitespace-nowrap flex-shrink-0
          ${activeTab === tab.id 
            ? 'bg-[#4A443F] text-white shadow-lg scale-105'
            : 'text-[#A39584]'
          }
        `}
      >
        {tab.label}
      </button>
    ))}
  </div>
</nav>
</>

)}
      </main>
      
      {/* --- POLAROID MODAL --- */}
<AnimatePresence>
  {selectedItem && (
<motion.div 
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  // Ubah z-index jadi lebih rendah dan kurangkan opacity background
  className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6"
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

{/* Polaroid Bottom Label - Tipografi Baru */}
<div className="pt-8 pb-2 px-2 text-center flex flex-col items-center">
  
  {/* 1. Quote/Message: Gunakan font serif yang lebih lembut & saiz yang sedikit besar */}
  <p className="text-[13px] font-serif italic text-[#3d3834] leading-[1.6] mb-4 px-2">
    "{selectedItem.message||"-"}"
  </p>

  {/* 2. Divider: Gunakan dot kecil atau garis yang lebih halus */}
  <div className="flex items-center gap-3 w-24 mb-4 opacity-30">
    <div className="h-[0.5px] flex-grow bg-[#D6C7B5]" />
    <div className="w-1 h-1 rounded-full bg-[#D6C7B5]" />
    <div className="h-[0.5px] flex-grow bg-[#D6C7B5]" />
  </div>

  {/* 3. Name: Gunakan font yang sangat bold & wide tracking untuk vibe 'Luxury' */}
  <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-[#4A443F] mb-1">
    {selectedItem.name}
  </h4>

  {/* 4. Date: Gunakan font yang sangat halus (muted) */}
  <p className="text-[7px] font-bold uppercase tracking-[0.2em] text-[#A39584]/70">
    {new Date(selectedItem.created_at).toLocaleDateString('en-GB', { 
      day: '2-digit', month: 'short' , year: 'numeric'
    })}
  </p>
</div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
{selectedWish && (
  <div 
    onClick={() => setSelectedWish(null)}
    className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-white/40 backdrop-blur-sm transition-all duration-500"
  >
    {/* Box Modal: Style disesuaikan */}
    <div 
      onClick={(e) => e.stopPropagation()}
      className="relative w-full max-w-[280px] p-8 bg-white/60 backdrop-blur-3xl border border-white/100 rounded-[40px] shadow-[0_30px_60px_rgba(74,68,63,0.15)] text-center flex flex-col items-center"
    >
      {/* Header: Date (Style 'Inactive' kecil) */}
      <div className="mb-8">
        <span className="text-[10px] font-black text-[#A39584] uppercase tracking-[0.2em]">
          {new Date(selectedWish.created_at ?? Date.now()).toLocaleDateString('en-GB', { 
            day: '2-digit', month: 'long', year: 'numeric'
          })}
        </span>
      </div>

      {/* Message: Dengan Scrollbar */}
      <div className="w-full max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
        <p className="text-[15px] text-[#4A443F] leading-relaxed font-serif italic break-words">
          "{selectedWish.message || "-"}"
        </p>
      </div>

      {/* Divider Kecil */}
      <div className="w-10 h-[1px] bg-[#A39584]/30 my-8" />

      {/* Sender Info */}
      <div className="flex flex-col items-center">
        <span className="text-[7px] font-bold uppercase tracking-[0.2em] text-[#A39584] mb-2">
          Sender
        </span>
        <h4 className="text-[14px] font-black text-[#4A443F] uppercase tracking-[0.15em]">
          {selectedWish.name}
        </h4>
      </div>
    </div>
  </div>
)}
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
{isOpen1 && (
  <div 
    onClick={() => setIsOpen1(false)} 
    className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-white/40 backdrop-blur-sm transition-all duration-500"
  >
    <div 
      onClick={(e) => e.stopPropagation()} 
      className="w-full max-w-[320px] p-6 bg-white/60 backdrop-blur-3xl border border-white/40 rounded-[40px] shadow-[0_30px_60px_rgba(74,68,63,0.15)]"
    >
      <h3 className="text-[#A39584] text-[10px] font-black uppercase tracking-[0.3em] mb-6 text-center">
        Hubungi Whatsapp
      </h3>
      
      <div className="grid grid-cols-2 gap-3">
        
        {/* Butang 1: Aimi Najwa */}
        <button 
          onClick={() => window.open('https://wa.me/+60163799397', '_blank')}
          className="flex flex-col items-center justify-center p-4 bg-[#4A443F] text-white rounded-[1.8rem] shadow-lg active:scale-95 transition-all duration-500"
        >
          <span className="text-[9px] font-black uppercase tracking-wider mb-1">
            Aimi Najwa
          </span>
          <span className="text-[6px] font-medium uppercase tracking-tight text-white/50 text-center leading-tight">
            Pengantin<br/>Perempuan
          </span>
        </button>

        {/* Butang 2: Zulhilmi */}
        <button 
          onClick={() => window.open('https://wa.me/60177117852', '_blank')}
          className="flex flex-col items-center justify-center p-4 bg-[#4A443F] text-white rounded-[1.8rem] shadow-lg active:scale-95 transition-all duration-500"
        >
          <span className="text-[9px] font-black uppercase tracking-wider mb-1">
            Zulhilmi
          </span>
          <span className="text-[6px] font-medium uppercase tracking-tight text-white/50 text-center leading-tight">
            Pengantin<br/>Lelaki
          </span>
        </button>

        {/* Butang 3: Abd Raof */}
        <button 
          onClick={() => window.open('https://wa.me/60123456789', '_blank')}
          className="flex flex-col items-center justify-center p-4 bg-[#4A443F] text-white rounded-[1.8rem] shadow-lg active:scale-95 transition-all duration-500"
        >
          <span className="text-[9px] font-black uppercase tracking-wider mb-1">
            Abd Raof
          </span>
          <span className="text-[6px] font-medium uppercase tracking-tight text-white/50 text-center leading-tight">
            Bapa Pengantin<br/>Perempuan
          </span>
        </button>

        {/* Butang 4: Abdul Latiff */}
        <button 
          onClick={() => window.open('https://wa.me/60123456789', '_blank')}
          className="flex flex-col items-center justify-center p-4 bg-[#4A443F] text-white rounded-[1.8rem] shadow-lg active:scale-95 transition-all duration-500"
        >
          <span className="text-[9px] font-black uppercase tracking-wider mb-1">
            Abdul Latiff
          </span>
          <span className="text-[6px] font-medium uppercase tracking-tight text-white/50 text-center leading-tight">
            Bapa Pengantin<br/>Lelaki
          </span>
        </button>

      </div>
    </div>
  </div>
)}
{isOpen2 && (
  <div 
    onClick={() => setIsOpen2(false)} 
    className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-white/40 backdrop-blur-sm transition-all duration-500"
  >
    <div 
      onClick={(e) => e.stopPropagation()} 
      className="w-full max-w-[320px] p-6 bg-white/60 backdrop-blur-3xl border border-white/40 rounded-[40px] shadow-[0_30px_60px_rgba(74,68,63,0.15)]"
    >
      <h3 className="text-[#A39584] text-[10px] font-black uppercase tracking-[0.3em] mb-6 text-center">
        Hubungi Telefon
      </h3>
      
      <div className="grid grid-cols-2 gap-3">
        
        {/* Butang 1: Aimi Najwa */}
        <button 
onClick={() => window.location.href = 'tel:+60163799397'}
          className="flex flex-col items-center justify-center p-4 bg-[#4A443F] text-white rounded-[1.8rem] shadow-lg active:scale-95 transition-all duration-500"
        >
          <span className="text-[9px] font-black uppercase tracking-wider mb-1">
            Aimi Najwa
          </span>
          <span className="text-[6px] font-medium uppercase tracking-tight text-white/50 text-center leading-tight">
            Pengantin<br/>Perempuan
          </span>
        </button>

        {/* Butang 2: Zulhilmi */}
        <button 
onClick={() => window.location.href = 'tel:+60177117852'}
          className="flex flex-col items-center justify-center p-4 bg-[#4A443F] text-white rounded-[1.8rem] shadow-lg active:scale-95 transition-all duration-500"
        >
          <span className="text-[9px] font-black uppercase tracking-wider mb-1">
            Zulhilmi
          </span>
          <span className="text-[6px] font-medium uppercase tracking-tight text-white/50 text-center leading-tight">
            Pengantin<br/>Lelaki
          </span>
        </button>

        {/* Butang 3: Abd Raof */}
        <button 
onClick={() => window.location.href = 'tel:+60163799397'}
          className="flex flex-col items-center justify-center p-4 bg-[#4A443F] text-white rounded-[1.8rem] shadow-lg active:scale-95 transition-all duration-500"
        >
          <span className="text-[9px] font-black uppercase tracking-wider mb-1">
            Abd Raof
          </span>
          <span className="text-[6px] font-medium uppercase tracking-tight text-white/50 text-center leading-tight">
            Bapa Pengantin<br/>Perempuan
          </span>
        </button>

        {/* Butang 4: Abdul Latiff */}
        <button 
onClick={() => window.location.href = 'tel:+60163799397'}
          className="flex flex-col items-center justify-center p-4 bg-[#4A443F] text-white rounded-[1.8rem] shadow-lg active:scale-95 transition-all duration-500"
        >
          <span className="text-[9px] font-black uppercase tracking-wider mb-1">
            Abdul Latiff
          </span>
          <span className="text-[6px] font-medium uppercase tracking-tight text-white/50 text-center leading-tight">
            Bapa Pengantin<br/>Lelaki
          </span>
        </button>

      </div>
    </div>
  </div>
)}
{/* Modal Calendar: Seiras dengan style Location Modal kau */}
{showCalendarModal && (
  <div 
    onClick={() => setShowCalendarModal(false)}
    className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-white/40 backdrop-blur-sm transition-all duration-500 animate-in fade-in"
  >
    {/* Box Modal: Glassmorphism container */}
    <div 
      onClick={(e) => e.stopPropagation()} 
      className="w-full max-w-[280px] p-8 bg-white/20 backdrop-blur-3xl border border-white/60 rounded-[40px] shadow-[0_20px_50px_rgba(214,199,181,0.15)]"
    >
      {/* Tajuk */}
      <h3 className="text-[#A39584] text-[10px] font-black uppercase tracking-[0.2em] mb-8 text-center">
        Save The Date
      </h3>
      
      <div className="flex flex-col gap-3">
        {/* Button Google Calendar */}
        <button 
          onClick={() => addToCalendar('google')}
          className="w-full px-8 py-3.5 bg-[#4A443F] text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all duration-500"
        >
          Google Calendar
        </button>

        {/* Button Apple / Outlook */}
        <button 
          onClick={() => addToCalendar('apple')}
          className="w-full px-8 py-3.5 bg-[#4A443F] text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all duration-500"
        >
          Apple / Outlook
        </button>
      </div>
    </div>
  </div>
)}
{selectedImage && (
  <div 
    className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-white/40 backdrop-blur-sm transition-all duration-500"
    onClick={() => setSelectedImage(null)} // Tekan luar gambar untuk tutup
  >
    <motion.img 
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      src={selectedImage} 
      className="max-w-[90%] max-h-[90%] object-contain rounded-lg"
    />
  </div>
)}
{/* <JooxPlayer/> */}
<JooxPlayer shouldPlay={!isCoverOpen} />
<Snackbar 
      isVisible={snackbar.show} 
      message={snackbar.message} 
      type={snackbar.type} 
    />
    </div>
    
  );
}
