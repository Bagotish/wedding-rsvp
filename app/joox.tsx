"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

// WAJIB ADA: Takrifkan jenis props
interface JooxPlayerProps {
  shouldPlay: boolean;
}

export default function JooxPlayer({ shouldPlay }: JooxPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 1. INI KUNCI DIA: Bila 'shouldPlay' bertukar jadi true (lepas klik Enter)
  // Kita terus paksa isPlaying jadi true.
  useEffect(() => {
    if (shouldPlay) {
      setIsPlaying(true);
    }
  }, [shouldPlay]);

  // 2. Kemudian, logic audio ni akan jalan secara automatik
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        // play() sekarang akan berjaya sebab 'user interaction' dah berlaku pada butang Enter
        audioRef.current.play().catch(err => {
          console.log("Autoplay blocked by browser:", err);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);
  return (
    <div className="fixed top-8 left-8 z-[100] flex items-center h-[44px]">
      {/* <audio ref={audioRef} src="/song.mp3" loop /> */}

      <motion.div
        layout
        onHoverStart={() => setIsExpanded(true)}
        onHoverEnd={() => setIsExpanded(false)}
        onClick={() => setIsExpanded(!isExpanded)}
        animate={{ width: isExpanded ? "auto" : "44px" }}
        transition={{ type: "spring", stiffness: 350, damping: 35 }}
        className="relative flex items-center bg-white/60 backdrop-blur-2xl border border-white/40 p-1 shadow-2xl cursor-pointer rounded-full"
        style={{ overflow: "visible" }}
      >
        {/* --- VINYL GROUP --- */}
        <div className="relative z-20 flex-shrink-0 w-9 h-9">
          <motion.div
            animate={{ rotate: isPlaying ? 360 : 0 }}
            transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
            className="w-9 h-9 rounded-full bg-[#121212] relative flex items-center justify-center border border-black/50 shadow-sm"
          >
            <div className="absolute inset-1 rounded-full border border-white/[0.05]" />
            <div className="relative w-5 h-5 rounded-full overflow-hidden bg-white">
              <Image src="/image/52.png" alt="Vinyl Label" fill className="object-cover rounded-full" />
              <div className="absolute inset-[38%] bg-[#121212] rounded-full border border-black/30 z-10" />
            </div>
          </motion.div>

          {/* TONE ARM */}
          <div className="absolute -top-1 -right-1 w-5 h-7 pointer-events-none">
            <svg 
              width="20" height="28" viewBox="0 0 20 28" fill="none" 
              className={`transition-transform duration-700 origin-top-right ease-in-out ${isPlaying ? 'rotate-0' : 'rotate-[-22deg]'}`}
            >
              <circle cx="16" cy="4" r="2" fill="#4A443F" />
              <path d="M16 4L6 20" stroke="#8D847B" strokeWidth="1.5" strokeLinecap="round" />
              <rect x="3" y="18" width="3" height="5" rx="0.5" transform="rotate(15 3 18)" fill="#4A443F" />
            </svg>
          </div>
        </div>

        {/* --- CONTENT --- */}
        <motion.div
          initial={false}
          animate={{ 
            width: isExpanded ? "auto" : 0,
            opacity: isExpanded ? 1 : 0,
            marginRight: isExpanded ? 12 : 0
          }}
          className="overflow-hidden flex items-center"
        >
          <div className="flex items-center ml-3 pr-2">
            <div className="flex flex-col mr-4 whitespace-nowrap">
              <span className="text-[8px] font-black uppercase tracking-[0.15em] text-[#4A443F] leading-none mb-1 text-nowrap">
                If you love me for me
              </span>
              <span className="text-[7px] font-bold uppercase tracking-widest text-[#A39584]/60 leading-none">
                {isPlaying ? 'Now Playing' : 'Paused'}
              </span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsPlaying(!isPlaying);
              }}
              className="w-7 h-7 flex-shrink-0 flex items-center justify-center bg-[#4A443F] text-white rounded-full active:scale-90 shadow-md"
            >
              {isPlaying ? <span className="text-[9px]">II</span> : <span className="text-[9px] ml-0.5">▶</span>}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}