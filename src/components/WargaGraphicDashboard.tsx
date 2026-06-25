import React from 'react';
import { Landmark, TrendingUp, Users, Heart, Award, ArrowUpRight, ShieldCheck, Scale } from 'lucide-react';
import { IuranKK, Lomba } from '../types';

interface WargaGraphicDashboardProps {
  currentUser: {
    username: string;
    nama: string;
    jabatan: string;
    mewakili_kk?: string;
    sebagai_apa?: string;
    kk_id?: number;
  } | null;
  iuranKKList: IuranKK[];
  lombasList: Lomba[];
  onOpenCheckIuran: () => void;
  onOpenUsulkanLomba: () => void;
}

export default function WargaGraphicDashboard({
  currentUser,
  iuranKKList = [],
  lombasList = [],
  onOpenCheckIuran,
  onOpenUsulkanLomba,
}: WargaGraphicDashboardProps) {
  
  // Calculate stats
  const totalKK = iuranKKList.length;
  const lunasKK = iuranKKList.filter(k => k.status === 'Lunas').length;
  const mencicilKK = iuranKKList.filter(k => k.status === 'Mencicil').length;
  const belumBayarKK = iuranKKList.filter(k => k.status === 'Belum Bayar').length;
  
  const totalIuranTerkumpul = iuranKKList.reduce((acc, curr) => acc + curr.terbayar, 0);
  const totalIuranTarget = iuranKKList.reduce((acc, curr) => acc + curr.target, 0);
  const collectibilityPercent = totalIuranTarget > 0 ? Math.round((totalIuranTerkumpul / totalIuranTarget) * 100) : 0;
  
  const activeLombas = lombasList.filter(l => l.status === 'Berjalan').length;
  const completedLombas = lombasList.filter(l => l.status === 'Selesai').length;

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-red-950 text-white rounded-3xl p-5 md:p-6 shadow-xl border border-slate-800/80 relative overflow-hidden animate-fade-in">
      
      {/* Dynamic Background Graphics (Aesthetic "react.vue.js" look) */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none select-none"></div>
      <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-emerald-600/10 rounded-full blur-2xl pointer-events-none select-none"></div>

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-600/20 text-red-500 rounded-2xl flex items-center justify-center border border-red-500/30">
            <TrendingUp size={22} className="stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-black text-sm uppercase tracking-wider text-slate-100">
                Dashboard Interaktif Warga
              </h3>
              <span className="text-[9px] bg-red-600/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse">
                Reactive v3.5
              </span>
            </div>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mt-0.5">
              Portal Data Swadaya &amp; Partisipasi Kemerdekaan RT
            </p>
          </div>
        </div>

        {/* Quick check trigger */}
        {currentUser && currentUser.jabatan === 'Warga' && (
          <button
            onClick={onOpenCheckIuran}
            className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-red-900/30 cursor-pointer transition-all active:scale-95 border border-red-500/50"
          >
            <ShieldCheck size={14} />
            Cek Laporan Iuran Mewakili KK Saya &rarr;
          </button>
        )}
      </div>

      {/* Reactive Visual Charts / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 relative z-10">
        
        {/* Left Widget: Collectibility Progress Circle */}
        <div className="md:col-span-5 bg-slate-900/40 border border-slate-800/60 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-3">
            Kolektibilitas Iuran Warga
          </span>
          
          <div className="relative w-32 h-32 flex items-center justify-center">
            {/* SVG Progress Circle */}
            <svg className="w-full h-full rotate-270">
              <circle
                cx="64"
                cy="64"
                r="50"
                className="stroke-slate-800"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="64"
                cy="64"
                r="50"
                className="stroke-red-600 transition-all duration-1000"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray="314"
                strokeDashoffset={314 - (314 * collectibilityPercent) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-mono font-black text-white">{collectibilityPercent}%</span>
              <span className="text-[8px] text-slate-400 uppercase tracking-wider font-bold">TERKUMPUL</span>
            </div>
          </div>

          <div className="mt-4 space-y-1 w-full text-center">
            <p className="text-xs text-slate-300 font-medium">
              Terkumpul: <strong className="text-emerald-400">{formatRupiah(totalIuranTerkumpul)}</strong>
            </p>
            <p className="text-[10px] text-slate-400">
              Target Wilayah: {formatRupiah(totalIuranTarget)}
            </p>
          </div>
        </div>

        {/* Right Widget: Graphic Bar Breakdown & Quick Action */}
        <div className="md:col-span-7 flex flex-col justify-between gap-4">
          
          {/* Status Breakdown Bars */}
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-4 space-y-3.5">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
              Status Partisipasi Warga ({totalKK} KK)
            </span>
            
            <div className="space-y-2.5">
              {/* Lunas Bar */}
              <div>
                <div className="flex justify-between text-[10px] font-semibold mb-1">
                  <span className="text-slate-300 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    KK Lunas ({lunasKK} KK)
                  </span>
                  <span className="text-emerald-400 font-mono font-bold">
                    {totalKK > 0 ? Math.round((lunasKK / totalKK) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full" 
                    style={{ width: `${totalKK > 0 ? (lunasKK / totalKK) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Mencicil Bar */}
              <div>
                <div className="flex justify-between text-[10px] font-semibold mb-1">
                  <span className="text-slate-300 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    KK Mencicil ({mencicilKK} KK)
                  </span>
                  <span className="text-amber-400 font-mono font-bold">
                    {totalKK > 0 ? Math.round((mencicilKK / totalKK) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-amber-500 h-full rounded-full" 
                    style={{ width: `${totalKK > 0 ? (mencicilKK / totalKK) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Belum Bayar Bar */}
              <div>
                <div className="flex justify-between text-[10px] font-semibold mb-1">
                  <span className="text-slate-300 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    KK Belum Bayar ({belumBayarKK} KK)
                  </span>
                  <span className="text-red-400 font-mono font-bold">
                    {totalKK > 0 ? Math.round((belumBayarKK / totalKK) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-red-500 h-full rounded-full" 
                    style={{ width: `${totalKK > 0 ? (belumBayarKK / totalKK) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Button row for Citizens */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between hover:bg-slate-900/80 transition-all cursor-pointer group" onClick={onOpenUsulkanLomba}>
              <div>
                <h4 className="text-xs font-bold text-slate-100 group-hover:text-red-400 transition-colors">Usulkan Lomba</h4>
                <p className="text-[9px] text-slate-400 mt-0.5">Sumbangkan ide kreatif Anda</p>
              </div>
              <div className="p-1.5 bg-red-600/20 text-red-500 rounded-lg group-hover:bg-red-600 group-hover:text-white transition-all">
                <ArrowUpRight size={14} />
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between hover:bg-slate-900/80 transition-all">
              <div>
                <h4 className="text-xs font-bold text-slate-100">Status Panitia</h4>
                <p className="text-[9px] text-emerald-400 flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Sistem Aktif
                </p>
              </div>
              <div className="p-1.5 bg-emerald-600/20 text-emerald-500 rounded-lg">
                <Users size={14} />
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* UU ITE Footnote in Dashboard Graphic */}
      <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-start gap-1.5 text-[9px] text-slate-400 text-justify leading-relaxed relative z-10">
        <Scale size={11} className="text-slate-500 shrink-0 mt-0.5" />
        <span>
          <strong>Keamanan Dokumen Elektronik:</strong> Berdasarkan Undang Undang ITE no. 11 Tahun 2008 yang mengatur Dokumen Elektronik dan informasi lain di dalamnya sebagai alat bukti yang sah dan dapat di pertanggung jawabkan.
        </span>
      </div>

    </div>
  );
}
