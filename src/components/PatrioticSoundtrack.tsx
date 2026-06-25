import React, { useState, useRef, useEffect } from 'react';
import { Play, Square, Music, Volume2, VolumeX } from 'lucide-react';

export default function PatrioticSoundtrack() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const schedulerTimerRef = useRef<number | null>(null);

  // Simplified notes for "Hari Merdeka" (17 Agustus)
  // [note, duration_multiplier]
  // 1 = Quarter note, 0.5 = Eighth note, 2 = Half note, etc.
  const melody = [
    { note: 'G4', dur: 0.5 }, { note: 'G4', dur: 0.5 },
    { note: 'G4', dur: 0.5 }, { note: 'E4', dur: 0.5 }, { note: 'C4', dur: 1.0 },
    { note: 'E4', dur: 0.5 }, { note: 'E4', dur: 0.5 },
    { note: 'E4', dur: 0.5 }, { note: 'D4', dur: 0.5 }, { note: 'B3', dur: 1.0 },
    { note: 'D4', dur: 0.5 }, { note: 'D4', dur: 0.5 },
    { note: 'D4', dur: 0.5 }, { note: 'E4', dur: 0.5 }, { note: 'F4', dur: 1.0 },
    { note: 'E4', dur: 0.5 }, { note: 'D4', dur: 0.5 },
    { note: 'C4', dur: 2.0 },
    
    // Chorus part: "Merdeka!"
    { note: 'G4', dur: 1.0 }, { note: 'E4', dur: 1.0 }, { note: 'C5', dur: 2.0 },
    { note: 'A4', dur: 1.0 }, { note: 'F4', dur: 1.0 }, { note: 'D5', dur: 2.0 },
    { note: 'G4', dur: 0.5 }, { note: 'G4', dur: 0.5 }, { note: 'G4', dur: 0.5 }, { note: 'G4', dur: 0.5 },
    { note: 'A4', dur: 1.0 }, { note: 'G4', dur: 1.0 },
    { note: 'F4', dur: 0.5 }, { note: 'E4', dur: 0.5 }, { note: 'D4', dur: 0.5 }, { note: 'C4', dur: 0.5 },
    { note: 'G3', dur: 2.0 }
  ];

  const noteFreqs: { [key: string]: number } = {
    'G3': 196.00,
    'B3': 246.94,
    'C4': 261.63,
    'D4': 293.66,
    'E4': 329.63,
    'F4': 349.23,
    'G4': 392.00,
    'A4': 440.00,
    'C5': 523.25,
    'D5': 587.33
  };

  const playNote = (ctx: AudioContext, freq: number, start: number, duration: number) => {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'triangle'; // Smooth, friendly retro sound
    osc.frequency.setValueAtTime(freq, start);

    // ADSR Envelope
    gainNode.gain.setValueAtTime(0, start);
    gainNode.gain.linearRampToValueAtTime(volume, start + 0.05); // Attack
    gainNode.gain.setValueAtTime(volume, start + duration - 0.05); // Sustain
    gainNode.gain.exponentialRampToValueAtTime(0.0001, start + duration); // Release

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(start);
    osc.stop(start + duration);
  };

  const startPlaying = () => {
    if (isPlaying) return;

    // Initialize audio context
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) {
      alert('Fitur Audio tidak didukung di browser ini.');
      return;
    }

    const ctx = new AudioContextClass();
    audioCtxRef.current = ctx;
    setIsPlaying(true);

    const tempo = 125; // Beats per minute
    const beatDuration = 60 / tempo; // Duration of one quarter note in seconds

    let time = ctx.currentTime + 0.1;
    let noteIndex = 0;

    const scheduleNextNotes = () => {
      // Schedule notes 1.5 seconds in advance
      while (time < ctx.currentTime + 1.5 && isPlaying) {
        const item = melody[noteIndex];
        const freq = noteFreqs[item.note] || 440;
        const noteDur = item.dur * beatDuration;

        playNote(ctx, freq, time, noteDur - 0.05);

        time += noteDur;
        noteIndex = (noteIndex + 1) % melody.length; // Loop infinitely
      }

      if (isPlaying) {
        schedulerTimerRef.current = window.setTimeout(scheduleNextNotes, 500);
      }
    };

    scheduleNextNotes();
  };

  const stopPlaying = () => {
    if (!isPlaying) return;

    if (schedulerTimerRef.current) {
      clearTimeout(schedulerTimerRef.current);
      schedulerTimerRef.current = null;
    }

    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }

    setIsPlaying(false);
  };

  // Safe release on unmount
  useEffect(() => {
    return () => {
      if (schedulerTimerRef.current) {
        clearTimeout(schedulerTimerRef.current);
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  // Update volume in real-time if context exists
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(Number(e.target.value));
  };

  return (
    <div className="flex items-center gap-3 bg-red-50 hover:bg-red-100/70 border border-red-200/60 px-4 py-2.5 rounded-2xl shadow-3xs transition-all select-none">
      <div className="flex items-center gap-2">
        <Music size={14} className={`text-red-600 ${isPlaying ? 'animate-bounce' : ''}`} />
        <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider">
          {isPlaying ? 'Soundtrack: Merdeka 🇮🇩' : 'Soundtrack Kemerdekaan'}
        </span>
      </div>

      <div className="flex items-center gap-1.5 border-l border-red-200 pl-3">
        {isPlaying ? (
          <button
            onClick={stopPlaying}
            className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all cursor-pointer active:scale-95 flex items-center justify-center"
            title="Matikan Lagu"
          >
            <Square size={10} fill="white" />
          </button>
        ) : (
          <button
            onClick={startPlaying}
            className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all cursor-pointer active:scale-95 flex items-center justify-center"
            title="Putar Lagu"
          >
            <Play size={10} fill="white" />
          </button>
        )}

        <div className="flex items-center gap-1 ml-1.5">
          {volume === 0 ? <VolumeX size={12} className="text-red-500" /> : <Volume2 size={12} className="text-red-600" />}
          <input
            type="range"
            min="0"
            max="0.5"
            step="0.05"
            value={volume}
            onChange={handleVolumeChange}
            className="w-12 h-1 bg-red-200 rounded-lg appearance-none cursor-pointer accent-red-600"
            title="Volume"
          />
        </div>
      </div>
    </div>
  );
}
