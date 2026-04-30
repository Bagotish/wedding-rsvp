'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function GalleryPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/gallery')
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Galeri Foto</h1>
      
      {loading ? (
        <p>Memuatkan gambar...</p>
      ) : (
        <motion.div 
          className="grid grid-cols-3 gap-[2px] bg-[#D6C7B5]/10 rounded-2xl overflow-hidden"
        >
          {data.map((item: any) => (
            <motion.div 
              key={item.id} 
              className="relative aspect-square bg-[#F3EFE9] overflow-hidden group"
              whileHover={{ opacity: 0.9 }}
            >
              <Image 
                src={item.image_url} 
                alt={item.name} 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-110" 
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}