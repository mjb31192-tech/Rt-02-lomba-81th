import { useState, useEffect } from 'react';
import { Timer, Calendar } from 'lucide-react';

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const targetDate = new Date('2026-08-17T08:00:00').getTime();

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-linear-to-br from-red-600 via-red-700 to-red-800 text-white rounded-2xl p-6 md:p-8 shadow-lg shadow-red-200/50 relative overflow-hidden">
      {/* Decorative Background Flags Pattern or Subtle Ornaments */}
      <div className="absolute right-0 top-0 h-full w-1/3 opacity-10 pointer-events-none">
        <div className="w-full h-full border-r-[40px] border-b-[40px] border-white rotate-45 transform translate-x-12 -translate-y-8"></div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3.5 border border-white/10">
            <Calendar size={12} />
            HUT RI Ke-81 Tahun 2026
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-black tracking-tight leading-tight uppercase">
            Sistem Manajemen Kegiatan Lomba
          </h1>
          <p className="text-red-100/90 mt-2 text-sm md:text-base font-medium max-w-xl leading-relaxed">
            Portal panitia lapangan RT.002/RW.003 untuk koordinasi pendaftaran, pencatatan kas, absensi warga, dan penilaian real-time.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 bg-black/15 backdrop-blur-md p-4 rounded-xl border border-white/10 self-start lg:self-center">
          <div className="p-2 bg-white/10 rounded-lg text-white">
            <Timer className="animate-pulse" size={22} />
          </div>
          <div className="grid grid-cols-4 gap-3 text-center min-w-[200px] md:min-w-[240px]">
            <div>
              <div className="text-2xl font-bold font-mono tracking-tight leading-none">{String(timeLeft.days).padStart(2, '0')}</div>
              <div className="text-[9px] text-red-200 uppercase font-bold tracking-wider mt-1.5">Hari</div>
            </div>
            <div className="border-l border-white/20 pl-2">
              <div className="text-2xl font-bold font-mono tracking-tight leading-none">{String(timeLeft.hours).padStart(2, '0')}</div>
              <div className="text-[9px] text-red-200 uppercase font-bold tracking-wider mt-1.5">Jam</div>
            </div>
            <div className="border-l border-white/20 pl-2">
              <div className="text-2xl font-bold font-mono tracking-tight leading-none">{String(timeLeft.minutes).padStart(2, '0')}</div>
              <div className="text-[9px] text-red-200 uppercase font-bold tracking-wider mt-1.5">Menit</div>
            </div>
            <div className="border-l border-white/20 pl-2">
              <div className="text-2xl font-bold font-mono tracking-tight leading-none">{String(timeLeft.seconds).padStart(2, '0')}</div>
              <div className="text-[9px] text-red-200 uppercase font-bold tracking-wider mt-1.5">Detik</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

