import React from 'react';
import { Kas, Lomba } from '../types';
import { Flag, Star, Trophy, Wallet, Landmark, Award } from 'lucide-react';
import PatrioticSoundtrack from './PatrioticSoundtrack';

interface MerahPutihHeroProps {
  kasList: Kas[];
  lombasList: Lomba[];
}

export default function MerahPutihHero({ kasList, lombasList }: MerahPutihHeroProps) {
  // Calculate stats dynamically
  const totalMasuk = kasList.filter(k => k.tipe === 'pemasukan').reduce((acc, curr) => acc + curr.jumlah, 0);
  const totalKeluar = kasList.filter(k => k.tipe === 'pengeluaran').reduce((acc, curr) => acc + curr.jumlah, 0);
  const sisaKas = totalMasuk - totalKeluar;

  const activeLombas = lombasList.filter(l => l.status === 'Berjalan');
  const activeLombaNames = activeLombas.length > 0 
    ? activeLombas.map(l => l.nama_lomba).join(', ') 
    : 'Persiapan Lomba Selanjutnya';

  const upcomingLombas = lombasList.filter(l => l.status === 'Belum Mulai');
  const upcomingLombaNames = upcomingLombas.length > 0
    ? upcomingLombas.map(l => l.nama_lomba).join(', ')
    : 'Seluruh Lomba Telah Dimulai';

  // Format currency
  const formatRupiah = (num: number) => {
    return 'Rp ' + num.toLocaleString('id-ID');
  };

  return (
    <div className="space-y-4">
      {/* GLORIOUS BENDERA MERAH PUTIH FLYER */}
      <div className="relative overflow-hidden rounded-3xl border border-red-300 bg-linear-to-b from-red-600 to-red-700 p-6 sm:p-8 text-white shadow-lg shadow-red-100/50 animate-fade-in">
        
        {/* Background Decorative Ripples mimicking flag folds */}
        <div className="absolute inset-0 opacity-15 pointer-events-none mix-blend-overlay">
          <div className="absolute -top-12 -left-12 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-16 -right-16 w-80 h-80 bg-red-950 rounded-full blur-3xl"></div>
        </div>

        {/* Diagonal white accent at the bottom to represent the white portion of the Indonesian Flag */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-white/95 border-t border-gray-100/50 pointer-events-none flex items-end">
          <div className="w-full h-full bg-linear-to-b from-white/90 to-gray-50/50"></div>
        </div>

        {/* Content Layout */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 sm:pb-4">
          
          {/* Main Title / Branding Area */}
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20">
              <Star size={13} className="text-yellow-300 fill-yellow-300 animate-spin-slow" />
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-red-100">
                Peringatan Hari Kemerdekaan RI ke-81 &bull; Tahun 2026
              </span>
            </div>

            <div className="space-y-1">
              <h1 className="font-display font-black text-2xl sm:text-4xl uppercase tracking-tight leading-none drop-shadow-md text-white">
                Dirgahayu <br className="sm:hidden" />
                <span className="text-white">Republik Indonesia</span>
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-red-100/90 leading-relaxed max-w-lg">
                Sistem Informasi Panitia Lapangan HUT RI-81 Kelurahan Kedaung Baru. Mewujudkan lingkungan RT.002/RW.003 yang Guyub Rukun, Gotong Royong, dan Semangat Proklamasi.
              </p>
            </div>

            {/* Subtext info inside white banner */}
            <div className="pt-2 text-gray-800 text-[11px] sm:text-xs font-semibold font-sans flex items-center gap-2 flex-wrap">
              <span className="bg-red-600 text-white px-2.5 py-1 rounded-lg shadow-3xs uppercase tracking-wider text-[9px] font-bold">
                Tema 2026
              </span>
              <span className="text-gray-600 uppercase tracking-wider">
                &ldquo;Nusantara Baru, Indonesia Maju&rdquo;
              </span>
            </div>
          </div>

          {/* Soundtrack and Quick Action */}
          <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end gap-3 self-start md:self-center">
            {/* Soundtrack Player */}
            <PatrioticSoundtrack />
            
            <div className="text-[10px] text-gray-500 font-bold bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-gray-150 inline-flex items-center gap-1.5 shadow-3xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>LOKAL RT.002 &bull; TANGERANG</span>
            </div>
          </div>

        </div>
      </div>

      {/* SMOOTH MARQUEE RUNNING TEXT OF CASH STATUS & ONGOING CONTESTS */}
      <div className="relative overflow-hidden bg-white border border-red-200/80 rounded-2xl h-10 flex items-center shadow-3xs">
        <div className="absolute left-0 top-0 bottom-0 bg-red-600 text-white px-4 flex items-center z-10 font-display font-black text-xs uppercase tracking-wider shrink-0 shadow-md">
          <Flag size={12} className="mr-1.5 text-white animate-bounce" />
          <span>INFO TERKINI:</span>
        </div>

        <div className="flex-1 overflow-x-hidden relative h-full flex items-center">
          {/* Scrolling Marquee Container */}
          <div className="absolute whitespace-nowrap flex items-center gap-12 text-xs font-bold text-gray-700 animate-marquee select-none pl-[100%]">
            <span className="flex items-center gap-2">
              <Wallet size={14} className="text-red-600 shrink-0" />
              <span>TOTAL DANA KAS MASUK: <strong className="text-emerald-600 font-mono text-sm">{formatRupiah(totalMasuk)}</strong></span>
            </span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-2">
              <Landmark size={14} className="text-red-600 shrink-0" />
              <span>TOTAL PENGELUARAN REALISASI: <strong className="text-red-500 font-mono text-sm">{formatRupiah(totalKeluar)}</strong></span>
            </span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-2">
              <Award size={14} className="text-red-600 shrink-0" />
              <span>SISA SALDO AKTIF PANITIA: <strong className="text-blue-600 font-mono text-sm">{formatRupiah(sisaKas)}</strong></span>
            </span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-2">
              <Trophy size={14} className="text-red-600 shrink-0" />
              <span>LOMBA SEDANG BERLANGSUNG: <strong className="text-red-600 underline">{activeLombaNames}</strong></span>
            </span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-2">
              <Star size={14} className="text-red-600 shrink-0" />
              <span>LOMBA PERSIAPAN MULAI: <strong className="text-gray-700">{upcomingLombaNames}</strong></span>
            </span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-600 font-display font-black tracking-widest uppercase text-[10px] bg-red-50 px-2 py-1 rounded-md border border-red-100">
              MERDEKA! GUYUB RUKUN WARGA LINGKUNGAN RT.002/RW.003 KELURAHAN KEDAUNG BARU TANGERANG
            </span>
          </div>
        </div>
      </div>

      {/* Tailored CSS Injection for smooth marquee movement */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-100%, 0, 0); }
        }
        .animate-marquee {
          animation: marquee 32s linear infinite;
        }
        /* Slow spin for decorative icons */
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
      `}} />
    </div>
  );
}
