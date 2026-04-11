import { motion } from "framer-motion";

const WishesSection = ({ data }) => {
  // 1. Filter data rsvp sahaja
  // 2. Sort mengikut tarikh terbaru (Descending)
  const sortedWishes = data
    .filter((item) => item.type === "rsvp")
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return (
    <motion.div
      key="wishes-canvas"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      /* 
         columns-2: Mencipta 2 lajur (masonry style)
         gap-4: Jarak antara lajur
         space-y-4: Jarak antara kad secara menegak
      */
      className="columns-2 gap-4 pt-4 px-2 space-y-4"
    >
      {sortedWishes.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.05 }}
          /* 
             break-inside-avoid: Elakkan kad terputus antara column
             inline-block + w-full: Memastikan kad duduk dalam container dengan betul
          */
          className="break-inside-avoid inline-block w-full 
                     relative p-6
                     bg-white/60 backdrop-blur-3xl 
                     border border-white/40 
                     rounded-[35px] 
                     shadow-[0_20px_40px_rgba(74,68,63,0.08)]
                     text-center"
        >
          <div className="relative flex flex-col items-center">
            
            {/* Header: Date */}
            <div className="mb-4 flex items-center justify-center w-full">
              <span className="text-[7px] font-black text-[#A39584] uppercase tracking-[0.3em]">
                {item.created_at
                  ? new Date(item.created_at).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                    })
                  : "10 APR"}
              </span>
            </div>

            {/* Message: Serif & Elegant */}
            <p className="text-[12px] text-[#4A443F] leading-relaxed font-serif italic mb-6 
                          break-words w-full overflow-hidden whitespace-pre-wrap">
              "{item.message}"
            </p>

            {/* Divider Kecil: mx-auto untuk center */}
            <div className="w-8 h-[1px] bg-[#A39584]/20 mb-3 mx-auto" />

            {/* Sender Info: Minimalist & Bold */}
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
  );
};

export default WishesSection;