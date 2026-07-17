'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { EASE, DUR } from '@/lib/easings';

const PETAL_DATA = Array.from({ length: 50 }, (_, i) => ({ x:(i*29+5)%100, delay:(i*0.17)%5, dur:4.5+(i%5)*0.4, drift:((i*23)%200)-100, w:10+(i%14), h:7+(i%9), initR:(i*17)%360 }));
const SNOW_DATA  = Array.from({ length: 65 }, (_, i) => ({ x:(i*19)%100, delay:(i*0.13)%6, dur:5+(i%6)*0.5, drift:((i*11)%80)-40, size:2+(i%5) }));
const FIREFLY_DATA = Array.from({ length: 28 }, (_, i) => ({ x:(i*37)%100, y:5+((i*9)%35), delay:(i*0.22)%4, dur:5.5+(i%5)*0.5, drift:((i*31)%120)-60, size:2+(i%3) }));
const LEAF_DATA  = Array.from({ length: 40 }, (_, i) => ({ x:(i*23)%100, delay:(i*0.19)%5, dur:5.5+(i%4)*0.6, drift:((i*19)%180)-90, w:14+(i%16), h:9+(i%11), initR:(i*29)%360 }));
const RAIN_DATA  = Array.from({ length: 90 }, (_, i) => ({ x:(i*13)%100, delay:(i*0.08)%6, dur:0.9+(i%6)*0.08, len:12+(i%22), op:0.12+(i%5)*0.05 }));

type WeatherId = 'off'|'petals'|'snow'|'fireflies'|'leaves'|'rain';

export default function WeatherOverlay({ active, type='fireflies' }: { active:boolean; type?:WeatherId }) {
  return (
    <AnimatePresence>
      {active && type !== 'off' && (
        <motion.div
          className="fixed inset-0 overflow-hidden pointer-events-none"
          style={{ zIndex: 150 }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
        >
          {type==='petals' && PETAL_DATA.map((d,i) => (
            <motion.div 
              key={i} 
              className="absolute pointer-events-none" 
              style={{ 
                left: `${d.x}%`, 
                width: `${d.w + 10}px`, 
                height: `${d.h + 10}px`, 
                background: 'linear-gradient(135deg, rgba(255, 160, 180, 0.9), rgba(255, 100, 130, 0.6))',
                borderRadius: '70% 0% 70% 0%',
                boxShadow: '0 0 12px rgba(255,100,130,0.4)',
              }} 
              initial={{ top: '-10vh', rotate: d.initR, opacity: 0 }}
              animate={{ 
                top: '110vh', 
                x: [0, d.drift, -d.drift, d.drift * 0.5],
                rotate: [d.initR, d.initR + 180, d.initR + 360],
                opacity: [0, 1, 0.8, 0]
              }}
              transition={{ 
                duration: d.dur * 1.5, 
                delay: d.delay, 
                repeat: Infinity, 
                ease: "linear" 
              }}
            />
          ))}
          {type==='snow' && SNOW_DATA.map((d,i) => (
            <div key={i} className="snowflake" style={{ left:`${d.x}%`, top:`-${d.size}px`, width:`${d.size}px`, height:`${d.size}px`, '--drift':`${d.drift}px`, '--dur':`${d.dur}s`, '--delay':`${d.delay}s` } as React.CSSProperties} />
          ))}
          {type==='fireflies' && FIREFLY_DATA.map((d,i) => (
            <motion.div key={i} className="firefly" style={{ left:`${d.x}%`, bottom:`${d.y}%`, width:`${d.size}px`, height:`${d.size}px` }}
              initial={{ opacity:0, y:40, scale:0.4 }}
              animate={{ opacity:[0,1,0.9,0.4,1,0], scale:[0.4,1.1,1.0,0.8,1.2,0.3], y:[-60,-200,-360,-500], x:[0,d.drift*0.5,d.drift] }}
              transition={{ duration:d.dur, delay:d.delay, repeat:Infinity, ease:'easeInOut' }}
            />
          ))}
          {type==='leaves' && LEAF_DATA.map((d,i) => (
            <div key={i} className="petal" style={{ left:`${d.x}%`, top:`-${d.h}px`, width:`${d.w}px`, height:`${d.h}px`, background:'linear-gradient(135deg,#C8A44A,#8B6800)', borderRadius:'70% 10% 70% 10%', transform:`rotate(${d.initR}deg)`, '--drift':`${d.drift}px`, '--dur':`${d.dur}s`, '--delay':`${d.delay}s` } as React.CSSProperties} />
          ))}
          {type==='rain' && RAIN_DATA.map((d,i) => (
            <div key={i} style={{ position:'absolute', left:`${d.x}%`, top:'-60px', width:'1px', height:`${d.len}px`, background:`rgba(200,220,255,${d.op})`, animation:`rainFall ${d.dur}s linear ${d.delay}s infinite` }} />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
