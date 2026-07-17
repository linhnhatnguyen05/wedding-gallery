'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { EASE, DUR } from '@/lib/easings';
import { COUPLE_NAMES } from '@/lib/photos';

const STARS = Array.from({length:130},(_,i) => ({ l:(i*33+7)%100, t:(i*47+11)%100, sz:0.8+(i%3)*0.6, dur:1.4+(i%4)*0.5, del:(i%6)*0.7 }));
const FIREFLIES = Array.from({length:28},(_,i) => ({ l:(i*37+13)%100, t:(i*53+7)%100, dur:2+(i%3)*0.8, del:(i%5)*0.7, dX:((i*19)%60)-30 }));

interface ThankYouScreenProps { visible: boolean; onRestart: () => void; }

export default function ThankYouScreen({ visible, onRestart }: ThankYouScreenProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="thankyou-screen"
          initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
          transition={{ duration: DUR.cinematic, ease: EASE.cinema }}
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {STARS.map((s,i) => (
              <div key={i} className="absolute rounded-full bg-white"
                style={{ left:`${s.l}%`, top:`${s.t}%`, width:`${s.sz}px`, height:`${s.sz}px`, animation:`twinkle ${s.dur}s ease-in-out ${s.del}s infinite` }}
              />
            ))}
          </div>
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {FIREFLIES.map((f,i) => (
              <motion.div key={i} className="firefly absolute" style={{ left:`${f.l}%`, top:`${f.t}%`, width:3, height:3 }}
                animate={{ opacity:[0,0.9,0.9,0], y:[-20,-80,-150], x:[0,f.dX] }}
                transition={{ duration:f.dur, delay:f.del, repeat:Infinity, ease:'easeInOut' }}
              />
            ))}
          </div>
          <motion.div className="absolute" style={{ width:'500px', height:'500px', borderRadius:'50%', background:'radial-gradient(circle,rgba(201,167,106,0.13) 0%,transparent 70%)', filter:'blur(50px)' }}
            animate={{ scale:[1,1.18,1], opacity:[0.5,0.85,0.5] }}
            transition={{ duration:4, repeat:Infinity, ease:'easeInOut' }}
          />
          <div className="relative z-10 flex flex-col items-center text-center gap-8 px-8 max-w-2xl">
            <motion.div initial={{ opacity:0, scale:0.2, rotate:-180 }} animate={{ opacity:1, scale:1, rotate:0 }}
              transition={{ duration:1.6, delay:0.5, ease: EASE.elastic }}
              className="relative" style={{ width:130, height:90 }}
            >
              <motion.div animate={{ rotate:360 }} transition={{ duration:22, repeat:Infinity, ease:'linear' }}
                style={{ position:'absolute', left:0, top:0, width:90, height:90, borderRadius:'50%', border:'4px solid #C9A76A', boxShadow:'0 0 24px rgba(201,167,106,0.45)' }}
              />
              <motion.div animate={{ rotate:-360 }} transition={{ duration:22, repeat:Infinity, ease:'linear' }}
                style={{ position:'absolute', left:44, top:0, width:90, height:90, borderRadius:'50%', border:'4px solid #E8D090', boxShadow:'0 0 24px rgba(232,208,144,0.4)' }}
              />
            </motion.div>
            <motion.div initial={{ opacity:0, y:50 }} animate={{ opacity:1, y:0 }} transition={{ duration:1.8, delay:1.2, ease: EASE.outExpo }}>
              <div className="shimmer font-sans text-[0.65rem] tracking-[0.55em] uppercase mb-3">With Love &amp; Gratitude</div>
              <div className="font-display font-light leading-none" style={{ fontSize:'clamp(4.5rem,14vw,10rem)', color:'#F8F4EE', textShadow:'0 0 60px rgba(201,167,106,0.25)' }}>Thank</div>
              <div className="font-display italic leading-none" style={{ fontSize:'clamp(4.5rem,14vw,10rem)', background:'linear-gradient(135deg,#B08D57 0%,#E7D2A5 45%,#C9A76A 70%,#F0E0B0 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>You</div>
            </motion.div>
            <motion.div initial={{ opacity:0, scaleX:0 }} animate={{ opacity:1, scaleX:1 }} transition={{ duration:1.2, delay:2 }} className="luxury-divider w-48">
              <span className="text-xs text-[rgba(201,167,106,0.5)]">✦</span>
            </motion.div>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:1, delay:2.2 }} className="flex flex-col items-center gap-1">
              <p className="font-serif text-3xl md:text-4xl font-light text-[rgba(248,244,238,0.9)] tracking-[0.15em]">{COUPLE_NAMES.combined}</p>
              <p className="text-label text-[rgba(201,167,106,0.45)] tracking-[0.45em]">{COUPLE_NAMES.date}</p>
            </motion.div>
            <motion.p initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:1, delay:2.8 }}
              className="font-serif italic text-base md:text-lg text-[rgba(248,244,238,0.45)] leading-relaxed max-w-md"
            >
              &ldquo;For it was not into my ear you whispered, but into my heart.&rdquo;
            </motion.p>
            <motion.button className="btn-luxury mt-2" onClick={onRestart}
              initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:1, delay:3.8 }}
              whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }} style={{  }}
            >
              <span>↺</span><span>Revisit Our Story</span>
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

