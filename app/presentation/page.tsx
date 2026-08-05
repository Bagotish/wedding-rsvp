'use client';

import { useState, useEffect } from 'react';

export default function PresentationPage() {
  const [currentSlide, setCurrentSlide] = useState(1);
  const TOTAL_SLIDES = 14; // Set this to the number of slides in your presentation
  const CANVA_EMBED_BASE = "https://www.canva.com/design/DAHRZIIqLwY/2W_VP9hkpIdHrSMp7spJKA/view?embed";
  const CANVA_EMBED_URL = `${CANVA_EMBED_BASE}#${currentSlide}`;
  const AUTO_ADVANCE_INTERVAL = 15000; // milliseconds
//   const AUTO_ADVANCE_INTERVAL = 3000; // milliseconds

  const wrapSlide = (value: number) => ((value - 1 + TOTAL_SLIDES) % TOTAL_SLIDES) + 1;
  const advanceSlide = (prev: number) => wrapSlide(prev + 1);
  const retreatSlide = (prev: number) => wrapSlide(prev - 1);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentSlide((prev) => advanceSlide(prev));
    }, AUTO_ADVANCE_INTERVAL);

    return () => window.clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setCurrentSlide((prev) => retreatSlide(prev));
  };

  const handleNext = () => {
    setCurrentSlide((prev) => advanceSlide(prev));
  };

  return (
    <main className="fixed inset-0 w-screen h-screen bg-black overflow-hidden m-0 p-0 select-none">
      <iframe
        src={CANVA_EMBED_URL}
        className="w-full h-full border-0 block"
        allow="autoplay; fullscreen; accelerometer; gyroscope; picture-in-picture"
        allowFullScreen
        title="Wedding Presentation"
      />

    </main>
  );
}
