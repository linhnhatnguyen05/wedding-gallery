'use client';
import { useEffect, useRef, useCallback } from 'react';

export function useAudio() {
  const ctxRef     = useRef<AudioContext | null>(null);
  const masterRef  = useRef<GainNode | null>(null);
  const isPlayingRef = useRef(false);
  const loopRef    = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ── init ─────────────────────────────── */
  const init = useCallback(() => {
    if (ctxRef.current) return;
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    ctxRef.current = new Ctx();
    masterRef.current = ctxRef.current.createGain();
    masterRef.current.gain.setValueAtTime(0, ctxRef.current.currentTime);
    masterRef.current.connect(ctxRef.current.destination);
  }, []);

  /* ── play a piano note ────────────────── */
  const note = useCallback((freq: number, t: number, dur: number, vol = 0.1) => {
    const ctx = ctxRef.current; const master = masterRef.current;
    if (!ctx || !master) return;

    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();

    // Warm piano timbre — triangle + light harmonics
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t);

    // Add warmth via 2nd harmonic
    const osc2  = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, t);
    gain2.gain.setValueAtTime(vol * 0.08, t);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + dur * 0.6);
    osc2.connect(gain2);
    gain2.connect(master);
    osc2.start(t); osc2.stop(t + dur + 0.1);

    // Piano envelope: quick attack, natural decay
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(vol, t + 0.015);
    gain.gain.exponentialRampToValueAtTime(vol * 0.65, t + 0.12);
    gain.gain.exponentialRampToValueAtTime(vol * 0.30, t + dur * 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    osc.connect(gain);
    gain.connect(master);
    osc.start(t); osc.stop(t + dur + 0.1);
  }, []);

  /* ── main melody — Pachelbel D‑Major ─── */
  const playMelody = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    const now = ctx.currentTime;

    // === Bass foundation ===
    const bass = [
      [146.83, 0, 2.8, 0.045],   // D2
      [220.00, 2.8, 2.8, 0.045], // A2
      [196.00, 5.6, 2.8, 0.045], // G2
      [246.94, 8.4, 2.8, 0.045], // B2
      [174.61, 11.2, 2.8, 0.04], // F2
      [220.00, 14.0, 2.8, 0.04], // A2
      [146.83, 16.8, 2.8, 0.04], // D2
      [220.00, 19.6, 2.8, 0.04], // A2
    ];
    bass.forEach(([f, t, d, v]) => note(f, now + t, d, v));

    // === Right-hand melody ===
    const mel = [
      [587.33, 0,    1.2, 0.10],  // D5
      [523.25, 1.2,  0.6, 0.08],  // C5
      [493.88, 1.8,  0.5, 0.08],  // B4
      [440.00, 2.3,  1.2, 0.09],  // A4
      [493.88, 3.5,  0.5, 0.08],  // B4
      [523.25, 4.0,  0.5, 0.08],  // C5
      [587.33, 4.5,  1.2, 0.10],  // D5
      [659.25, 5.7,  1.0, 0.10],  // E5
      [698.46, 6.7,  0.5, 0.08],  // F5
      [659.25, 7.2,  0.5, 0.07],  // E5
      [587.33, 7.7,  0.5, 0.09],  // D5
      [523.25, 8.2,  0.5, 0.07],  // C5
      [493.88, 8.7,  1.2, 0.09],  // B4
      [440.00, 9.9,  0.6, 0.07],  // A4
      [493.88, 10.5, 0.6, 0.08],  // B4
      [587.33, 11.1, 2.4, 0.11],  // D5 (held)
      // Second phrase
      [659.25, 13.5, 1.2, 0.10],  // E5
      [698.46, 14.7, 1.0, 0.09],  // F5
      [784.00, 15.7, 0.8, 0.10],  // G5
      [880.00, 16.5, 1.5, 0.09],  // A5
      [784.00, 18.0, 0.6, 0.08],  // G5
      [659.25, 18.6, 0.6, 0.08],  // E5
      [587.33, 19.2, 1.0, 0.09],  // D5
      [523.25, 20.2, 0.6, 0.08],  // C5
      [493.88, 20.8, 0.6, 0.07],  // B4
      [587.33, 21.4, 2.8, 0.11],  // D5 (resolve)
    ];
    mel.forEach(([f, t, d, v]) => note(f, now + t, d, v));

    // === Inner chord fill ===
    const fill = [
      [369.99, 0,    1.8, 0.035], // F#4
      [329.63, 2.8,  1.8, 0.035], // E4
      [293.66, 5.6,  1.8, 0.035], // D4
      [369.99, 8.4,  1.8, 0.03],  // F#4
    ];
    fill.forEach(([f, t, d, v]) => note(f, now + t, d, v));
  }, [note]);

  /* ── page turn sound ─────────────────── */
  const playPageTurn = useCallback(() => {
    const ctx = ctxRef.current; const master = masterRef.current;
    if (!ctx || !master) return;
    const now = ctx.currentTime;

    // White noise burst → paper swoosh
    const bufLen = Math.floor(ctx.sampleRate * 0.2);
    const buf    = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const data   = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufLen * 0.25));
    }
    const src  = ctx.createBufferSource();
    src.buffer = buf;

    const bpf  = ctx.createBiquadFilter();
    bpf.type   = 'bandpass';
    bpf.frequency.setValueAtTime(4200, now);
    bpf.frequency.exponentialRampToValueAtTime(800, now + 0.2);
    bpf.Q.value = 0.4;

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.28, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    src.connect(bpf); bpf.connect(g); g.connect(master);
    src.start(now);
  }, []);

  /* ── UI click tone ───────────────────── */
  const playClick = useCallback(() => {
    const ctx = ctxRef.current; const master = masterRef.current;
    if (!ctx || !master) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g   = ctx.createGain();
    osc.type  = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.06);
    g.gain.setValueAtTime(0.07, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(g); g.connect(master);
    osc.start(now); osc.stop(now + 0.1);
  }, []);

  /* ── intro chime (first load) ────────── */
  const playIntroChime = useCallback(() => {
    const ctx = ctxRef.current; const master = masterRef.current;
    if (!ctx || !master) return;
    const now = ctx.currentTime;
    [[659.25,0],[783.99,0.3],[987.77,0.6],[1174.66,0.9]].forEach(([f, t]) => {
      note(f, now + t, 1.8, 0.06);
    });
  }, [note]);

  /* ── start / stop / toggle ───────────── */
  const startMusic = useCallback(() => {
    init();
    const ctx = ctxRef.current; const master = masterRef.current;
    if (!ctx || !master) return;
    if (ctx.state === 'suspended') ctx.resume();
    isPlayingRef.current = true;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.linearRampToValueAtTime(1, ctx.currentTime + 2.5);
    playMelody();
    loopRef.current = setInterval(playMelody, 24000);
  }, [init, playMelody]);

  const stopMusic = useCallback(() => {
    const ctx = ctxRef.current; const master = masterRef.current;
    if (!ctx || !master) return;
    isPlayingRef.current = false;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.8);
    if (loopRef.current) clearInterval(loopRef.current);
  }, []);

  const toggleMusic = useCallback((): boolean => {
    if (!ctxRef.current) init();
    if (isPlayingRef.current) { stopMusic(); return false; }
    else { startMusic(); return true; }
  }, [init, startMusic, stopMusic]);

  /* ── cleanup ─────────────────────────── */
  useEffect(() => () => {
    if (loopRef.current) clearInterval(loopRef.current);
    ctxRef.current?.close();
  }, []);

  return { init, startMusic, stopMusic, toggleMusic, playPageTurn, playClick, playIntroChime, isPlayingRef };
}
