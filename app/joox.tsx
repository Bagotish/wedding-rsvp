"use client";

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Play, Pause } from 'lucide-react';
// WAJIB ADA: Takrifkan jenis props
interface JooxPlayerProps {
  shouldPlay: boolean;
}

export interface JooxPlayerHandle {
  playAudio: () => Promise<void>;
  pauseAudio: () => void;
}

const JooxPlayer = forwardRef<JooxPlayerHandle, JooxPlayerProps>(({ shouldPlay }, ref) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playAudio = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      audio.volume = 1;
      await audio.play();
      setIsPlaying(true);
    } catch (err) {
      console.log("Audio play blocked:", err);
    }
  };

  const pauseAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setIsPlaying(false);
  };

  useImperativeHandle(ref, () => ({ playAudio, pauseAudio }), [playAudio, pauseAudio]);


  useEffect(() => {
    if (shouldPlay) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
      playAudio();
    } else {
      pauseAudio();
    }
  }, [shouldPlay]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const fadeStep = 0.05;
    const fadeInterval = 50;
    let fadeTimer: number | null = null;

    if (isPlaying) {
      // --- PLAY ---
      audio.play().catch(err => console.log("Autoplay blocked:", err));

      fadeTimer = window.setInterval(() => {
        if (audio.volume < 0.95) {
          audio.volume = Math.min(1, audio.volume + fadeStep);
        } else {
          audio.volume = 1;
          if (fadeTimer !== null) {
            window.clearInterval(fadeTimer);
            fadeTimer = null;
          }
        }
      }, fadeInterval);
    } else {
      // --- PAUSE IMMEDIATELY FOR MOBILE SAFETY ---
      audio.pause();
      if (audio.volume > 0) {
        audio.volume = 0;
      }

      fadeTimer = window.setInterval(() => {
        if (audio.volume > 0.05) {
          audio.volume = Math.max(0, audio.volume - fadeStep);
        } else {
          audio.volume = 0;
          if (fadeTimer !== null) {
            window.clearInterval(fadeTimer);
            fadeTimer = null;
          }
        }
      }, fadeInterval);
    }

    return () => {
      if (fadeTimer !== null) {
        window.clearInterval(fadeTimer);
      }
    };
  }, [isPlaying]);
  return (
    <div className="fixed top-8 left-8 z-[100] flex items-center h-[44px]">
      <audio ref={audioRef} src="/song.mp3" loop preload="auto" playsInline />

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
  className="w-7 h-7 flex-shrink-0 flex items-center justify-center bg-[#4A443F] text-white rounded-full active:scale-95 transition-transform shadow-md"
>
  {isPlaying ? (
    <Pause size={10} fill="currentColor" />
  ) : (
    <Play size={10} fill="currentColor" className="ml-0.5" />
  )}
</button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
});

JooxPlayer.displayName = 'JooxPlayer';

export default JooxPlayer;
