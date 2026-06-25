import React, { useState, useRef, useEffect } from 'react';
import { Play, Square, Music, Volume2, VolumeX } from 'lucide-react';

export default function PatrioticSoundtrack() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const playingRef = useRef(false);
  const volumeRef = useRef(0.3);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const schedulerTimerRef = useRef<number | null>(null);

  // Simplified notes for "Indonesia Raya" (National Anthem of Indonesia)
  // [note, duration_multiplier]
  // 1 = Quarter note, 0.5 = Eighth note, 2 = Half note, etc.
  const melody = [
    // Verse 1: "Indonesia tanah airku, tanah tumpah darahku..."
    { note: 'G4', dur: 0.75 }, { note: 'A4', dur: 0.25 }, 
    { note: 'B4', dur: 1.0 }, { note: 'B4', dur: 0.5 }, { note: 'B4', dur: 0.5 }, 
    { note: 'C5', dur: 0.5 }, { note: 'B4', dur: 0.5 }, { note: 'A4', dur: 1.0 }, { note: 'A4', dur: 0.5 },
    { note: 'A4', dur: 0.5 }, { note: 'B4', dur: 0.5 }, { note: 'A4', dur: 0.5 }, { note: 'G4', dur: 1.5 },
    
    // Verse 2: "Di sanalah aku berdiri, jadi pandu ibuku..."
    { note: 'G4', dur: 0.75 }, { note: 'B4', dur: 0.25 }, 
    { note: 'D5', dur: 1.0 }, { note: 'D5', dur: 0.5 }, { note: 'D5', dur: 0.5 }, 
    { note: 'E5', dur: 0.5 }, { note: 'D5', dur: 0.5 }, { note: 'C5', dur: 1.0 }, { note: 'C5', dur: 0.5 },
    { note: 'C5', dur: 0.5 }, { note: 'D5', dur: 0.5 }, { note: 'C5', dur: 0.5 }, { note: 'B4', dur: 1.5 },

    // Chorus: "Indonesia Raya, Merdeka, Merdeka!"
    { note: 'G4', dur: 1.5 }, { note: 'G4', dur: 0.5 }, 
    { note: 'C5', dur: 1.0 }, { note: 'C5', dur: 0.5 }, { note: 'C5', dur: 0.5 }, 
    { note: 'E5', dur: 1.0 }, { note: 'E5', dur: 0.5 }, { note: 'E5', dur: 0.5 }, 
    { note: 'D5', dur: 1.5 }, { note: 'C5', dur: 0.5 }, { note: 'D5', dur: 2.0 },
    
    // "Tanahku, negeriku yang kucinta..."
    { note: 'D5', dur: 1.5 }, { note: 'D5', dur: 0.5 }, 
    { note: 'D5', dur: 0.5 }, { note: 'D5', dur: 0.5 }, { note: 'C5', dur: 0.5 }, { note: 'B4', dur: 0.5 }, 
    { note: 'C5', dur: 1.5 }, { note: 'D5', dur: 0.5 }, { note: 'E5', dur: 2.0 },

    // "Indonesia Raya, Merdeka, Merdeka!"
    { note: 'G4', dur: 1.5 }, { note: 'G4', dur: 0.5 }, 
    { note: 'C5', dur: 1.0 }, { note: 'C5', dur: 0.5 }, { note: 'C5', dur: 0.5 }, 
    { note: 'E5', dur: 1.0 }, { note: 'E5', dur: 0.5 }, { note: 'E5', dur: 0.5 }, 
    { note: 'D5', dur: 1.5 }, { note: 'C5', dur: 0.5 }, { note: 'D5', dur: 2.0 },

    // "Hiduplah Indonesia Raya!"
    { note: 'D5', dur: 1.5 }, { note: 'D5', dur: 0.5 }, 
    { note: 'F#5', dur: 1.0 }, { note: 'F#5', dur: 0.5 }, { note: 'F#5', dur: 0.5 }, 
    { note: 'G5', dur: 3.0 }
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
    'B4': 493.88,
    'C5': 523.25,
    'D5': 587.33,
    'E5': 659.25,
    'F5': 698.46,
    'F#5': 739.99,
    'G5': 783.99
  };

  const playNote = (ctx: AudioContext, freq: number, start: number, duration: number) => {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'triangle'; // Smooth, friendly retro sound
    osc.frequency.setValueAtTime(freq, start);

    // ADSR Envelope
    const currentVol = volumeRef.current;
    gainNode.gain.setValueAtTime(0, start);
    gainNode.gain.linearRampToValueAtTime(currentVol, start + 0.05); // Attack
    gainNode.gain.setValueAtTime(currentVol, start + duration - 0.05); // Sustain
    gainNode.gain.exponentialRampToValueAtTime(0.0001, start + duration); // Release

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(start);
    osc.stop(start + duration);
  };

  const startPlaying = () => {
    if (playingRef.current) return;

    // Initialize audio context
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) {
      alert('Fitur Audio tidak didukung di browser ini.');
      return;
    }

    const ctx = new AudioContextClass();
    audioCtxRef.current = ctx;
    playingRef.current = true;
    setIsPlaying(true);

    const tempo = 125; // Beats per minute
    const beatDuration = 60 / tempo; // Duration of one quarter note in seconds

    let time = ctx.currentTime + 0.1;
    let noteIndex = 0;

    const scheduleNextNotes = () => {
      if (!playingRef.current || !audioCtxRef.current) return;

      // Schedule notes 1.5 seconds in advance
      while (time < ctx.currentTime + 1.5 && playingRef.current) {
        const item = melody[noteIndex];
        const freq = noteFreqs[item.note] || 440;
        const noteDur = item.dur * beatDuration;

        playNote(ctx, freq, time, noteDur - 0.05);

        time += noteDur;
        noteIndex = (noteIndex + 1) % melody.length; // Loop infinitely
      }

      if (playingRef.current) {
        schedulerTimerRef.current = window.setTimeout(scheduleNextNotes, 500);
      }
    };

    scheduleNextNotes();
  };

  const stopPlaying = () => {
    if (!playingRef.current) return;

    playingRef.current = false;
    setIsPlaying(false);

    if (schedulerTimerRef.current) {
      clearTimeout(schedulerTimerRef.current);
      schedulerTimerRef.current = null;
    }

    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
  };

  // Safe release on unmount and autoplay setup
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!playingRef.current) {
        startPlaying();
      }
      cleanupListeners();
    };

    const cleanupListeners = () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
      document.removeEventListener('mousedown', handleFirstInteraction);
    };

    // 1. Try to play immediately
    startPlaying();

    // 2. Add event listeners in case the browser blocked immediate autoplay
    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);
    document.addEventListener('touchstart', handleFirstInteraction);
    document.addEventListener('mousedown', handleFirstInteraction);

    return () => {
      cleanupListeners();
      playingRef.current = false;
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
    const val = Number(e.target.value);
    setVolume(val);
    volumeRef.current = val;
  };

  return (
    <div className="flex items-center gap-3 bg-red-50 hover:bg-red-100/70 border border-red-200/60 px-4 py-2.5 rounded-2xl shadow-3xs transition-all select-none">
      <div className="flex items-center gap-2">
        <Music size={14} className={`text-red-600 ${isPlaying ? 'animate-bounce' : ''}`} />
        <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider">
          {isPlaying ? 'Lagu: Indonesia Raya 🇮🇩' : 'Lagu Indonesia Raya'}
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
