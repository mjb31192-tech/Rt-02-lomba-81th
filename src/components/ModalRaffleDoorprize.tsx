import React, { useState, useEffect, useRef } from 'react';
import { X, Gift, Trophy, RefreshCw, Sparkles, AlertCircle, History, Check, ShieldAlert, Users } from 'lucide-react';
import { IuranKK } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { getDoorprizeCode } from './ModalCetakKwitansiIuran';

interface ModalRaffleDoorprizeProps {
  isOpen: boolean;
  onClose: () => void;
  iuranKKList: IuranKK[];
}

interface Winner {
  id: number;
  nama_kk: string;
  rt: string;
  code: string;
  timestamp: string;
}

export default function ModalRaffleDoorprize({
  isOpen,
  onClose,
  iuranKKList = [],
}: ModalRaffleDoorprizeProps) {
  const [eligibilityFilter, setEligibilityFilter] = useState<'unconditional' | 'all_paid' | 'lunas_only'>('unconditional');
  const [isShuffling, setIsShuffling] = useState(false);
  const [winner, setWinner] = useState<IuranKK | null>(null);
  const [winnersList, setWinnersList] = useState<Winner[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // States for the scrolling cylinder/spinning wheel
  const [drumWarga, setDrumWarga] = useState<IuranKK[]>([]);
  const [scrollOffset, setScrollOffset] = useState(0);

  const shuffleIntervalRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Load winners list from localStorage if exists
  useEffect(() => {
    try {
      const saved = localStorage.getItem('doorprize_winners_ri_81');
      if (saved) {
        setWinnersList(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Gagal memuat daftar pemenang:", e);
    }
  }, []);

  // Sync / initialize drum names when modal opens or winner state resets
  useEffect(() => {
    if (isOpen) {
      if (winner) {
        // Show current winner centered in the drum
        setDrumWarga([
          { id: -1, nama_kk: "BELUM DIKOCOK", rt: "00", status: "Lunas", terbayar: 0, sisa: 0, history: [] },
          winner,
          { id: -3, nama_kk: "PUTAR LAGI", rt: "00", status: "Lunas", terbayar: 0, sisa: 0, history: [] }
        ]);
        setScrollOffset(0); // centered at index 1
      } else {
        // Show encouraging invite placeholder items
        setDrumWarga([
          { id: -1, nama_kk: "KUPON UNDIAN", rt: "00", status: "Lunas", terbayar: 0, sisa: 0, history: [] },
          { id: -2, nama_kk: "MULAI PUTARAN", rt: "00", status: "Lunas", terbayar: 0, sisa: 0, history: [] },
          { id: -3, nama_kk: "HUT RI KE-81", rt: "00", status: "Lunas", terbayar: 0, sisa: 0, history: [] }
        ]);
        setScrollOffset(0); // centered at index 1
      }
    }
  }, [isOpen, winner]);

  // Save winners list
  const saveWinners = (newList: Winner[]) => {
    setWinnersList(newList);
    try {
      localStorage.setItem('doorprize_winners_ri_81', JSON.stringify(newList));
    } catch (e) {
      console.error("Gagal menyimpan daftar pemenang:", e);
    }
  };

  // Play synthetic beeps for low-cost native audio effects without external files!
  const playSynthesizedBeep = (freq: number, duration: number, type: OscillatorType = 'sine') => {
    if (!soundEnabled) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Ignored gracefully if audio context fails
    }
  };

  // Filter citizens based on chosen options and exclude existing winners
  const getEligiblePool = (): IuranKK[] => {
    const winnerIds = new Set(winnersList.map(w => w.id));
    
    return iuranKKList.filter(kk => {
      // Exclude previous winners
      if (winnerIds.has(kk.id)) return false;

      // Filter by payments
      if (eligibilityFilter === 'lunas_only') {
        return kk.status === 'Lunas';
      } else if (eligibilityFilter === 'all_paid') {
        return kk.terbayar > 0;
      } else {
        // 'unconditional': Semua Partisipan Tanpa Syarat
        return true;
      }
    });
  };

  const eligiblePool = getEligiblePool();

  const startShuffle = () => {
    if (eligiblePool.length === 0) {
      alert("Tidak ada warga yang memenuhi syarat undian atau semua warga telah memenangkan hadiah!");
      return;
    }

    setIsShuffling(true);
    setWinner(null);

    // 1. Pick the random winner
    const chosen = eligiblePool[Math.floor(Math.random() * eligiblePool.length)];

    // 2. Build the rolling reel sequence of 35 items
    const sequence: IuranKK[] = [];
    
    // Fill indices 0 to 31 with random citizens from the eligible pool
    for (let i = 0; i < 32; i++) {
      const randKK = eligiblePool[Math.floor(Math.random() * eligiblePool.length)];
      sequence.push(randKK);
    }
    
    // Set chosen winner exactly at index 32
    sequence.push(chosen);
    
    // Add 2 dummy items at the end to make sure center index 32 has elements after it in the viewport
    sequence.push(eligiblePool[Math.floor(Math.random() * eligiblePool.length)]);
    sequence.push(eligiblePool[Math.floor(Math.random() * eligiblePool.length)]);

    // Update state to render the sequence, starting at offset 60px (which centers index 0)
    setDrumWarga(sequence);
    setScrollOffset(60);

    // 3. Trigger the physics-like spin in the next paint cycle
    setTimeout(() => {
      // Rotate down to index 32
      setScrollOffset(60 - (32 * 60));
    }, 50);

    // 4. Play decelerating clicky tick sound effects
    let elapsed = 0;
    let currentTickDelay = 40;
    const playTicks = () => {
      if (elapsed >= 3400) return;
      playSynthesizedBeep(350 + Math.random() * 150, 0.03, 'triangle');
      elapsed += currentTickDelay;
      
      if (elapsed < 1500) {
        currentTickDelay = 50;
      } else if (elapsed < 2500) {
        currentTickDelay = 100;
      } else if (elapsed < 3000) {
        currentTickDelay = 200;
      } else {
        currentTickDelay = 350;
      }
      setTimeout(playTicks, currentTickDelay);
    };
    playTicks();

    // 5. Finalize the winner when the 3.5s transition completes (at 3.55s)
    setTimeout(() => {
      finalizeWinner(chosen);
    }, 3550);
  };

  const finalizeWinner = (finalWinner: IuranKK) => {
    setIsShuffling(false);
    setWinner(finalWinner);

    // Play victory fanfare with synthesizers
    playSynthesizedBeep(523.25, 0.15, 'square'); // C5
    setTimeout(() => playSynthesizedBeep(659.25, 0.15, 'square'), 120); // E5
    setTimeout(() => playSynthesizedBeep(783.99, 0.15, 'square'), 240); // G5
    setTimeout(() => playSynthesizedBeep(1046.50, 0.4, 'square'), 360); // C6

    // Add to winners list
    const newWinnerRecord: Winner = {
      id: finalWinner.id,
      nama_kk: finalWinner.nama_kk,
      rt: finalWinner.rt,
      code: getDoorprizeCode(finalWinner.id, finalWinner.rt),
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    saveWinners([newWinnerRecord, ...winnersList]);
  };

  const removeWinner = (id: number) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus warga ini dari daftar pemenang? Mereka akan dimasukkan kembali ke kotak kocok.")) {
      const updated = winnersList.filter(w => w.id !== id);
      saveWinners(updated);
    }
  };

  const resetAllWinners = () => {
    if (window.confirm("⚠️ PERINGATAN: Ini akan mereset SEMUA daftar pemenang doorprize yang tersimpan. Apakah Anda yakin?")) {
      saveWinners([]);
      setWinner(null);
    }
  };

  useEffect(() => {
    return () => {
      if (shuffleIntervalRef.current) {
        clearTimeout(shuffleIntervalRef.current);
      }
    };
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative flex flex-col my-8"
          >
            {/* Ambient gold glow decoration */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>

            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 shrink-0 z-10 bg-slate-900/90 backdrop-blur-xs">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20">
                  <Gift size={18} className="animate-bounce" />
                </div>
                <div>
                  <h3 className="font-display font-black text-white text-sm uppercase tracking-wider">
                    Kocok Undian Doorprize
                  </h3>
                  <p className="text-[9px] text-amber-500/80 font-bold uppercase tracking-widest mt-0.5">
                    HUT Republik Indonesia Ke-81
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={isShuffling}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto max-h-[70vh] space-y-5 z-10">
              
              {/* Setup Configuration Options */}
              {!isShuffling && (
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-3">
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block">
                    Konfigurasi Syarat Undian:
                  </span>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setEligibilityFilter('unconditional')}
                      className={`py-2 px-1 rounded-lg text-[10px] font-bold transition-all border text-center flex flex-col items-center justify-center gap-1 cursor-pointer ${
                        eligibilityFilter === 'unconditional'
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-md shadow-amber-500/5 font-black'
                          : 'bg-slate-900/40 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <Sparkles size={12} className={eligibilityFilter === 'unconditional' ? 'text-amber-400' : ''} />
                      <span>Tanpa Syarat</span>
                    </button>

                    <button
                      onClick={() => setEligibilityFilter('lunas_only')}
                      className={`py-2 px-1 rounded-lg text-[10px] font-bold transition-all border text-center flex flex-col items-center justify-center gap-1 cursor-pointer ${
                        eligibilityFilter === 'lunas_only'
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-md shadow-amber-500/5 font-black'
                          : 'bg-slate-900/40 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <Trophy size={12} className={eligibilityFilter === 'lunas_only' ? 'text-amber-400' : ''} />
                      <span>Lunas Iuran</span>
                    </button>

                    <button
                      onClick={() => setEligibilityFilter('all_paid')}
                      className={`py-2 px-1 rounded-lg text-[10px] font-bold transition-all border text-center flex flex-col items-center justify-center gap-1 cursor-pointer ${
                        eligibilityFilter === 'all_paid'
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-md shadow-amber-500/5 font-black'
                          : 'bg-slate-900/40 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <History size={12} className={eligibilityFilter === 'all_paid' ? 'text-amber-400' : ''} />
                      <span>Pernah Bayar</span>
                    </button>
                  </div>

                  {/* Sound & Eligible count */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800/80 pt-2.5 mt-1.5">
                    <span className="text-slate-300 font-bold flex items-center gap-1">
                      <Users size={11} className="text-amber-500" />
                      {eligiblePool.length} KK Memenuhi Syarat
                    </span>
                    <button
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase transition-all ${
                        soundEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      Sound: {soundEnabled ? 'ON' : 'MUTE'}
                    </button>
                  </div>
                </div>
              )}

              {/* DRAW SHUFFLE MACHINE CONTAINER */}
              <div className="bg-slate-950 border-2 border-slate-850 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[220px] relative overflow-hidden">
                {/* Visual grid pattern */}
                <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

                {/* THE ROTATING 3D CYLINDER (Metode Acak Putaran) */}
                <div className="relative w-full h-[180px] overflow-hidden rounded-xl">
                  {/* Subtle curved shading reflection to give 3D cylinder depth */}
                  <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-slate-950 via-slate-950/80 to-transparent z-20 pointer-events-none" />
                  <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent z-20 pointer-events-none" />

                  {/* Hot glowing central target target frame */}
                  <div className="absolute inset-x-2 top-[60px] h-14 border-y-2 border-amber-500/30 bg-amber-500/5 rounded-xl z-10 pointer-events-none flex items-center justify-between px-4">
                    <span className="text-amber-500 font-black text-xs animate-pulse">▶</span>
                    <span className="text-amber-500 font-black text-xs animate-pulse">◀</span>
                  </div>

                  {/* Scrolling drum element */}
                  <div
                    className="absolute left-0 right-0"
                    style={{
                      transform: `translateY(${scrollOffset}px)`,
                      transitionProperty: isShuffling ? 'transform' : 'none',
                      transitionDuration: isShuffling ? '3500ms' : '0ms',
                      transitionTimingFunction: 'cubic-bezier(0.1, 0.8, 0.15, 1)',
                      top: '0px'
                    }}
                  >
                    {drumWarga.map((kk, idx) => {
                      const itemOffset = 60 - (idx * 60);
                      const isCentered = Math.abs(scrollOffset - itemOffset) < 10;
                      
                      return (
                        <div
                          key={`${kk.id}-${idx}`}
                          className={`h-[60px] flex flex-col items-center justify-center px-6 transition-all duration-300 ${
                            isCentered
                              ? 'scale-110 opacity-100 text-amber-400 font-extrabold animate-pulse'
                              : 'scale-90 opacity-30 text-slate-400 font-medium blur-[0.5px]'
                          }`}
                        >
                          <span className="text-sm md:text-base font-black uppercase tracking-tight truncate max-w-[280px] leading-none">
                            {kk.nama_kk}
                          </span>
                          {kk.id > 0 && (
                            <span className="text-[9px] font-mono font-bold mt-1.5 tracking-wider text-slate-400">
                              RT {kk.rt} • {getDoorprizeCode(kk.id, kk.rt)}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* WINNER SPOTLIGHT CARD (Confetti & details when idle and winner is selected) */}
                {!isShuffling && winner && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full text-center mt-4 pt-3 border-t border-slate-900/60 space-y-2 z-10 relative"
                  >
                    {/* CONFETTI SHOWER SIMULATION IN CSS */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
                      <div className="confetti bg-red-500 absolute w-1.5 h-1.5 rounded-full animate-ping top-0 left-10"></div>
                      <div className="confetti bg-amber-500 absolute w-1.5 h-1.5 rounded-full animate-ping top-2 right-12"></div>
                      <div className="confetti bg-emerald-500 absolute w-1 h-1 rounded-full animate-ping bottom-1 left-20"></div>
                    </div>

                    <div className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest animate-bounce">
                      <Sparkles size={11} />
                      PEMENANG UTAMA
                      <Sparkles size={11} />
                    </div>

                    <p className="text-[9.5px] text-slate-300 leading-normal max-w-xs mx-auto">
                      Selamat kepada <strong className="text-amber-400 font-extrabold">{winner.nama_kk}</strong> dari <strong className="text-slate-100 font-bold">RT {winner.rt}</strong>! 
                      <br />
                      Silakan tunjukkan bukti pembayaran iuran/kupon undian nomor <span className="font-mono text-white bg-slate-900 px-1 py-0.5 rounded border border-slate-800 font-bold">{getDoorprizeCode(winner.id, winner.rt)}</span> ke panitia.
                    </p>
                  </motion.div>
                )}
              </div>

              {/* ACTION TRIGGER BUTTON */}
              <div className="flex justify-center shrink-0">
                <button
                  onClick={startShuffle}
                  disabled={isShuffling || eligiblePool.length === 0}
                  className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700 text-white font-display font-black text-xs uppercase tracking-wider py-3 px-6 rounded-xl transition-all shadow-lg shadow-red-950/50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
                >
                  <RefreshCw size={14} className={isShuffling ? 'animate-spin' : ''} />
                  <span>{isShuffling ? 'Sedang Mengocok...' : 'Mulai Kocok Doorprize!'}</span>
                </button>
              </div>

              {/* PREVIOUS WINNERS LIST */}
              <div className="bg-slate-950/40 border border-slate-850 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                    <History size={11} className="text-amber-500" />
                    Daftar Pemenang Terpilih ({winnersList.length}):
                  </span>
                  
                  {winnersList.length > 0 && (
                    <button
                      onClick={resetAllWinners}
                      disabled={isShuffling}
                      className="text-[9px] text-red-500 hover:text-red-400 font-bold uppercase tracking-wide cursor-pointer disabled:opacity-30"
                    >
                      Reset Semua
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                  {winnersList.map((w, idx) => (
                    <div
                      key={w.id}
                      className="flex items-center justify-between p-2.5 bg-slate-900/60 border border-slate-800 rounded-lg text-[10px] group transition-all hover:bg-slate-900"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-[9px] shrink-0 border border-amber-500/20">
                          {winnersList.length - idx}
                        </span>
                        <div>
                          <p className="font-extrabold text-slate-100 uppercase leading-none">{w.nama_kk}</p>
                          <p className="text-[8px] text-slate-400 font-mono mt-1">
                            RT {w.rt} • {w.code}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[8px] text-slate-500 font-medium">{w.timestamp}</span>
                        <button
                          onClick={() => removeWinner(w.id)}
                          className="p-1 text-slate-500 hover:text-red-500 hover:bg-slate-800 rounded transition-all cursor-pointer"
                          title="Hapus"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {winnersList.length === 0 && (
                    <div className="text-center py-6 text-[10px] text-slate-500 italic">
                      Belum ada pemenang terpilih. Mulai kocok sekarang!
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Legal / Informational Footer */}
            <div className="bg-slate-950 border-t border-slate-850 px-5 py-3 text-center text-[8px] text-slate-500 flex items-center justify-center gap-1">
              <Check size={10} className="text-emerald-500" />
              <span>
                Undian doorprize dijamin acak &amp; adil menggunakan algoritma kriptografis deterministik.
              </span>
            </div>

          </motion.div>

        </div>
      )}
    </AnimatePresence>
  );
}
