'use client';

import { motion } from 'framer-motion';

export default function Guestbook() {
  return (
    <section className="relative w-full py-48 px-4 flex flex-col items-center">
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-2xl mx-auto p-12 bg-[#FAF7F0] shadow-2xl relative"
      >
        <div className="absolute inset-2 border border-black/10 pointer-events-none" />
        
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif text-[#1C1208] mb-4">Leave a Wish</h2>
          <p className="text-xs tracking-[0.2em] uppercase text-black/50">For the newlyweds</p>
        </div>

        <form className="flex flex-col gap-8 text-[#1C1208]" onSubmit={e => e.preventDefault()}>
          
          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono tracking-[0.2em] uppercase text-black/40">Your Name</label>
            <input 
              type="text" 
              className="w-full bg-transparent border-b border-black/20 pb-2 focus:outline-none focus:border-black/50 transition-colors placeholder:text-black/20 font-serif"
              placeholder="How should we call you?"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono tracking-[0.2em] uppercase text-black/40">Your Message</label>
            <textarea 
              rows={4}
              className="w-full bg-transparent border-b border-black/20 pb-2 focus:outline-none focus:border-black/50 transition-colors placeholder:text-black/20 font-serif resize-none"
              placeholder="Write your wishes here..."
            />
          </div>

          <button className="mt-4 w-full py-4 border border-[#C9A76A] text-[#C9A76A] hover:bg-[#C9A76A] hover:text-white transition-all tracking-[0.3em] text-xs font-mono uppercase">
            Send Message
          </button>

        </form>

      </motion.div>
      
    </section>
  );
}
