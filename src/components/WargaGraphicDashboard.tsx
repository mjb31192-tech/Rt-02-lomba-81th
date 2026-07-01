import React, { useState } from 'react';
import { 
  Landmark, 
  TrendingUp, 
  Users, 
  Heart, 
  Award, 
  ArrowUpRight, 
  ShieldCheck, 
  Scale, 
  Gift, 
  BarChart3, 
  Calculator, 
  Calendar, 
  Sparkles, 
  Trophy, 
  TrendingDown, 
  Percent, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  HelpCircle 
} from 'lucide-react';
import { IuranKK, Lomba, Peserta, Kas } from '../types';

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
  kasList: Kas[];
  pesertasList: Peserta[];
  onOpenCheckIuran: () => void;
  onOpenUsulkanLomba: () => void;
  onOpenRaffle: () => void;
}

export default function WargaGraphicDashboard({
  currentUser,
  iuranKKList = [],
  lombasList = [],
  kasList = [],
  pesertasList = [],
  onOpenCheckIuran,
  onOpenUsulkanLomba,
  onOpenRaffle,
}: WargaGraphicDashboardProps) {
  
  // 1. Tab State
  const [activeSubTab, setActiveSubTab] = useState<'swadaya' | 'anggaran' | 'kegiatan'>('swadaya');
  
  // 2. Interactive Calculator State
  const [simulasiSponsor, setSimulasiSponsor] = useState<number>(0);
  const [simulasiBiaya, setSimulasiBiaya] = useState<number>(0);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  
  // 3. Expandable Lomba State (which lomba has its participants listing expanded)
  const [expandedLombaId, setExpandedLombaId] = useState<number | null>(null);

  // --- CORE CALCULATIONS & STATS ---
  
  // KK Iuran calculations
  const totalKK = iuranKKList.length;
  const lunasKK = iuranKKList.filter(k => k.status === 'Lunas').length;
  const mencicilKK = iuranKKList.filter(k => k.status === 'Mencicil').length;
  const belumBayarKK = iuranKKList.filter(k => k.status === 'Belum Bayar').length;
  
  const totalIuranTerkumpul = iuranKKList.reduce((acc, curr) => acc + curr.terbayar, 0);
  const totalIuranTarget = iuranKKList.reduce((acc, curr) => acc + curr.target, 0);
  const collectibilityPercent = totalIuranTarget > 0 ? Math.round((totalIuranTerkumpul / totalIuranTarget) * 100) : 0;

  // Budget calculations
  const totalKasPemasukanLain = kasList
    .filter(k => k.tipe === 'pemasukan' && !k.keterangan.includes('Iuran KK:'))
    .reduce((acc, curr) => acc + curr.jumlah, 0);
    
  const totalPemasukanSeluruhnya = totalIuranTerkumpul + totalKasPemasukanLain;
  
  const totalKasPengeluaran = kasList
    .filter(k => k.tipe === 'pengeluaran')
    .reduce((acc, curr) => acc + curr.jumlah, 0);
    
  const totalAnggaranLombaAllocated = lombasList.reduce((acc, curr) => acc + curr.anggaran, 0);
  
  // Net cash flow balance
  const sisaKasRiil = totalPemasukanSeluruhnya - totalKasPengeluaran;
  
  // Target total budget HUT (Benchmark)
  const targetBudgetHUT = 15000000; // Rp 15.000.000 target
  const pencapaianTargetBudgetPercent = Math.round((totalPemasukanSeluruhnya / targetBudgetHUT) * 100);

  // Participant calculations
  const totalPesertaRegistrations = pesertasList.length;
  const totalHadirLapangan = pesertasList.filter(p => p.absensi).length;
  const absensiKehadiranPercent = totalPesertaRegistrations > 0 ? Math.round((totalHadirLapangan / totalPesertaRegistrations) * 100) : 0;
  
  // Find most popular competition
  const lombaParticipantCounts = lombasList.map(l => {
    const count = pesertasList.filter(p => p.lomba_id === l.id).length;
    return { id: l.id, nama: l.nama_lomba, count };
  });
  
  const sortedLombasByPopularity = [...lombaParticipantCounts].sort((a, b) => b.count - a.count);
  const mostPopularLomba = sortedLombasByPopularity[0] || { nama: 'Belum ada', count: 0 };

  // Helper formatting rupiah
  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(num);
  };

  // Projected Balance with Simulation
  const projectedBalance = sisaKasRiil + simulasiSponsor - simulasiBiaya;
  const projectedInflow = totalPemasukanSeluruhnya + simulasiSponsor;
  const projectedOutflow = totalKasPengeluaran + simulasiBiaya;
  const projectedPercentOfTarget = Math.round((projectedInflow / targetBudgetHUT) * 100);

  return (
    <div id="warga-graphic-dashboard" className="bg-gradient-to-br from-slate-900 via-slate-950 to-red-950 text-white rounded-3xl p-4 sm:p-5 md:p-6 shadow-xl border border-slate-800/80 relative overflow-hidden animate-fade-in">
      
      {/* Dynamic Background Graphics (Sleek High-End UI Feel) */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none select-none"></div>
      <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none select-none"></div>

      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4 mb-4 sm:pb-5 sm:mb-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-600/20 text-red-500 rounded-2xl flex items-center justify-center border border-red-500/30">
            <BarChart3 size={22} className="stroke-[2.5]" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              <h3 className="font-display font-black text-sm sm:text-base uppercase tracking-wider text-slate-100">
                Dashboard Publik &amp; Grafik Kemerdekaan
              </h3>
              <span className="text-[9px] bg-red-600/20 text-red-400 border border-red-500/30 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0">
                React.js Active
              </span>
            </div>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mt-0.5">
              Swadaya Warga RT.002/RW.003 &bull; Transparansi Keuangan &amp; Lomba
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

      {/* SUB-TAB NAV BAR (Sleek Glassmorphic Pill) */}
      <div className="flex bg-slate-900/60 p-1 sm:p-1.5 rounded-2xl border border-slate-800/80 mb-5 sm:mb-6 gap-0.5 sm:gap-1 relative z-10">
        <button
          onClick={() => setActiveSubTab('swadaya')}
          className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2 px-1 sm:py-2.5 sm:px-3 rounded-xl text-[10.5px] sm:text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'swadaya'
              ? 'bg-red-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Users size={13} className="shrink-0" />
          <span className="hidden sm:inline">Partisipasi &amp; Iuran</span>
          <span className="inline sm:hidden">Partisipasi</span>
        </button>
        <button
          onClick={() => setActiveSubTab('anggaran')}
          className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2 px-1 sm:py-2.5 sm:px-3 rounded-xl text-[10.5px] sm:text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'anggaran'
              ? 'bg-red-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Calculator size={13} className="shrink-0" />
          <span className="hidden sm:inline">Grafik &amp; Anggaran</span>
          <span className="inline sm:hidden">Anggaran</span>
        </button>
        <button
          onClick={() => setActiveSubTab('kegiatan')}
          className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2 px-1 sm:py-2.5 sm:px-3 rounded-xl text-[10.5px] sm:text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'kegiatan'
              ? 'bg-red-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Calendar size={13} className="shrink-0" />
          <span className="hidden sm:inline">Kegiatan &amp; Partisipan</span>
          <span className="inline sm:hidden">Kegiatan</span>
        </button>
      </div>

      {/* --- CONTENT CONDITIONAL RENDERING --- */}
      <div className="relative z-10">
        
        {/* TAB 1: SWADAYA & PARTISIPASI (Existing upgraded view) */}
        {activeSubTab === 'swadaya' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left Widget: Collectibility Progress Circle */}
              <div className="md:col-span-5 bg-slate-950/50 border border-slate-800/60 rounded-2xl p-5 flex flex-col items-center justify-center text-center relative group">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mb-4 flex items-center gap-1">
                  Kolektibilitas Iuran Swadaya Warga
                </span>
                
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg className="w-full h-full rotate-270">
                    <circle
                      cx="72"
                      cy="72"
                      r="58"
                      className="stroke-slate-800/80"
                      strokeWidth="11"
                      fill="transparent"
                    />
                    <circle
                      cx="72"
                      cy="72"
                      r="58"
                      className="stroke-red-600 transition-all duration-1000"
                      strokeWidth="11"
                      fill="transparent"
                      strokeDasharray="364.4"
                      strokeDashoffset={364.4 - (364.4 * collectibilityPercent) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-3xl font-mono font-black text-white">{collectibilityPercent}%</span>
                    <span className="text-[8px] text-slate-400 uppercase tracking-widest font-bold">TERKUMPUL</span>
                  </div>
                </div>

                <div className="mt-5 space-y-1.5 w-full text-center">
                  <div className="bg-slate-900/60 py-2 px-3 rounded-xl border border-slate-800/50 flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-semibold">Dana Masuk:</span>
                    <strong className="text-emerald-400 font-mono">{formatRupiah(totalIuranTerkumpul)}</strong>
                  </div>
                  <div className="bg-slate-900/40 py-2 px-3 rounded-xl flex justify-between items-center text-xs">
                    <span className="text-slate-400">Target Kolektif:</span>
                    <span className="text-slate-300 font-mono">{formatRupiah(totalIuranTarget)}</span>
                  </div>
                </div>
              </div>

              {/* Right Widget: Graphic Bar Breakdown & Quick Action */}
              <div className="md:col-span-7 flex flex-col justify-between gap-5">
                <div className="bg-slate-950/50 border border-slate-800/60 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">
                      Status Kelancaran Kas Per Kepala Keluarga
                    </span>
                    <span className="text-xs font-bold text-slate-200 bg-slate-850 px-2.5 py-0.5 rounded-lg">
                      {totalKK} KK Terdaftar
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Lunas Bar */}
                    <div className="group/bar">
                      <div className="flex justify-between text-xs font-semibold mb-1.5">
                        <span className="text-slate-300 flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
                          KK Lunas (Swadaya Penuh)
                        </span>
                        <span className="text-emerald-400 font-mono font-bold">
                          {lunasKK} KK &bull; {totalKK > 0 ? Math.round((lunasKK / totalKK) * 100) : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden p-[1px]">
                        <div 
                          className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full rounded-full transition-all duration-1000" 
                          style={{ width: `${totalKK > 0 ? (lunasKK / totalKK) * 100 : 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Mencicil Bar */}
                    <div className="group/bar">
                      <div className="flex justify-between text-xs font-semibold mb-1.5">
                        <span className="text-slate-300 flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50"></span>
                          KK Mencicil (Berkala)
                        </span>
                        <span className="text-amber-400 font-mono font-bold">
                          {mencicilKK} KK &bull; {totalKK > 0 ? Math.round((mencicilKK / totalKK) * 100) : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden p-[1px]">
                        <div 
                          className="bg-gradient-to-r from-amber-600 to-amber-400 h-full rounded-full transition-all duration-1000" 
                          style={{ width: `${totalKK > 0 ? (mencicilKK / totalKK) * 100 : 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Belum Bayar Bar */}
                    <div className="group/bar">
                      <div className="flex justify-between text-xs font-semibold mb-1.5">
                        <span className="text-slate-300 flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm shadow-red-500/50"></span>
                          KK Belum Melunasi
                        </span>
                        <span className="text-red-400 font-mono font-bold">
                          {belumBayarKK} KK &bull; {totalKK > 0 ? Math.round((belumBayarKK / totalKK) * 100) : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden p-[1px]">
                        <div 
                          className="bg-gradient-to-r from-red-600 to-red-400 h-full rounded-full transition-all duration-1000" 
                          style={{ width: `${totalKK > 0 ? (belumBayarKK / totalKK) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions buttons for Citizens */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div 
                    onClick={onOpenUsulkanLomba}
                    className="bg-slate-950/40 hover:bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between hover:border-red-500/40 transition-all cursor-pointer group active:scale-98"
                  >
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-100 group-hover:text-red-400 transition-colors uppercase tracking-wider">Usulkan Lomba Baru</h4>
                      <p className="text-[10px] text-slate-400">Sumbangkan aspirasi &amp; ide kreatif Anda</p>
                    </div>
                    <div className="p-2.5 bg-red-600/20 text-red-500 rounded-xl group-hover:bg-red-600 group-hover:text-white transition-all shadow-md">
                      <ArrowUpRight size={16} />
                    </div>
                  </div>

                  <button
                    onClick={onOpenRaffle}
                    className="bg-slate-950/40 hover:bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between hover:border-amber-500/40 transition-all cursor-pointer group text-left active:scale-98"
                  >
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-100 group-hover:text-amber-400 transition-colors uppercase tracking-wider">Undian Doorprize</h4>
                      <p className="text-[10px] text-slate-400">Kocok kupon doorprize warga terverifikasi</p>
                    </div>
                    <div className="p-2.5 bg-amber-600/20 text-amber-500 rounded-xl group-hover:bg-amber-500 group-hover:text-white transition-all shadow-md">
                      <Gift size={16} />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: GRAFIK & KALKULASI ANGGARAN (New dynamic calculators & visual charts) */}
        {activeSubTab === 'anggaran' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* INFLOW / OUTFLOW BOOKKEEPING SUMMARY */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              
              {/* Box Pemasukan */}
              <div className="bg-slate-950/50 border border-slate-800/60 rounded-2xl p-4.5 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 bg-emerald-500 h-full"></div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Total Pemasukan Anggaran</span>
                  <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
                    <TrendingUp size={14} />
                  </div>
                </div>
                <h4 className="text-xl font-mono font-bold text-emerald-400">{formatRupiah(totalPemasukanSeluruhnya)}</h4>
                <div className="mt-3.5 space-y-1.5 border-t border-slate-900 pt-2.5 text-[11px] text-slate-400">
                  <div className="flex justify-between">
                    <span>Swadaya KK (Terkumpul):</span>
                    <span className="font-mono text-slate-300">{formatRupiah(totalIuranTerkumpul)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kas RT &amp; Sponsorship:</span>
                    <span className="font-mono text-slate-300">{formatRupiah(totalKasPemasukanLain)}</span>
                  </div>
                </div>
              </div>

              {/* Box Pengeluaran */}
              <div className="bg-slate-950/50 border border-slate-800/60 rounded-2xl p-4.5 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 bg-red-500 h-full"></div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Total Pengeluaran Kas Realisasi</span>
                  <div className="p-1.5 bg-red-500/10 text-red-400 rounded-lg">
                    <TrendingDown size={14} />
                  </div>
                </div>
                <h4 className="text-xl font-mono font-bold text-red-400">{formatRupiah(totalKasPengeluaran)}</h4>
                <div className="mt-3.5 space-y-1.5 border-t border-slate-900 pt-2.5 text-[11px] text-slate-400">
                  <div className="flex justify-between">
                    <span>Alokasi Hadiah Perlombaan:</span>
                    <span className="font-mono text-slate-300">{formatRupiah(totalAnggaranLombaAllocated)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Beban Operasional &amp; Konsumsi:</span>
                    <span className="font-mono text-slate-300">{formatRupiah(Math.max(0, totalKasPengeluaran - totalAnggaranLombaAllocated))}</span>
                  </div>
                </div>
              </div>

              {/* Box Sisa Saldo */}
              <div className="bg-slate-950/50 border border-slate-800/60 rounded-2xl p-4.5 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 bg-blue-500 h-full"></div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Sisa Saldo Kas Bersih RT</span>
                  <div className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg">
                    <Landmark size={14} />
                  </div>
                </div>
                <h4 className={`text-xl font-mono font-bold ${sisaKasRiil >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                  {formatRupiah(sisaKasRiil)}
                </h4>
                <div className="mt-3.5 space-y-1.5 border-t border-slate-900 pt-2.5 text-[11px] text-slate-400">
                  <div className="flex justify-between">
                    <span>Kesehatan Keuangan:</span>
                    <span className={`font-bold ${sisaKasRiil > 1000000 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {sisaKasRiil > 1000000 ? 'Sangat Sehat' : 'Seimbang / Butuh Sponsorship'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Target Target Kemerdekaan:</span>
                    <span className="font-mono text-slate-300">{pencapaianTargetBudgetPercent}% Tercapai</span>
                  </div>
                </div>
              </div>

            </div>

            {/* INTERACTIVE SVG BUDGET GRAPHICS */}
            <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Grafik Anggaran Swadaya &amp; Alokasi (Interactive Chart)
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Sentuh atau arahkan kursor ke grafik untuk penjelasan detail</p>
                </div>
                <span className="text-[10px] bg-slate-900 px-3 py-1 rounded-full text-slate-400 font-mono font-semibold border border-slate-800">
                  Target HUT-RI: {formatRupiah(targetBudgetHUT)}
                </span>
              </div>

              {/* Beautiful SVG bar charts custom styled in React.js */}
              <div className="space-y-5">
                
                {/* Bar 1: Target Anggaran */}
                <div 
                  className="relative space-y-1.5 cursor-pointer"
                  onMouseEnter={() => setActiveTooltip('target')}
                  onMouseLeave={() => setActiveTooltip(null)}
                >
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                      1. Target Anggaran Ideal HUT-RI 81
                    </span>
                    <span className="font-mono text-slate-400">{formatRupiah(targetBudgetHUT)} (100%)</span>
                  </div>
                  <div className="w-full bg-slate-900/80 h-7 rounded-lg overflow-hidden p-[2px] border border-slate-800/80 transition-all hover:border-slate-600 relative">
                    <div className="bg-gradient-to-r from-slate-700 to-slate-500 h-full rounded-md" style={{ width: '100%' }}></div>
                    <span className="absolute inset-y-0 left-3 flex items-center text-[10px] font-bold text-slate-300">Target Belanja Lapangan</span>
                  </div>
                </div>

                {/* Bar 2: Dana Terkumpul */}
                <div 
                  className="relative space-y-1.5 cursor-pointer"
                  onMouseEnter={() => setActiveTooltip('masuk')}
                  onMouseLeave={() => setActiveTooltip(null)}
                >
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/50"></span>
                      2. Realisasi Kas Masuk (Swadaya + Sponsor)
                    </span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {formatRupiah(totalPemasukanSeluruhnya)} ({pencapaianTargetBudgetPercent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-900/80 h-7 rounded-lg overflow-hidden p-[2px] border border-slate-800/80 transition-all hover:border-slate-600 relative">
                    <div 
                      className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full rounded-md transition-all duration-700 shadow-lg shadow-emerald-500/10" 
                      style={{ width: `${Math.min(pencapaianTargetBudgetPercent, 100)}%` }}
                    ></div>
                    <span className="absolute inset-y-0 left-3 flex items-center text-[10px] font-bold text-white drop-shadow-xs">Kas Masuk Lapangan</span>
                  </div>
                </div>

                {/* Bar 3: Dana Keluar / Realisasi Belanja */}
                <div 
                  className="relative space-y-1.5 cursor-pointer"
                  onMouseEnter={() => setActiveTooltip('keluar')}
                  onMouseLeave={() => setActiveTooltip(null)}
                >
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-xs shadow-red-500/50"></span>
                      3. Realisasi Pengeluaran Kas (Belanja &amp; Hadiah)
                    </span>
                    <span className="font-mono text-red-400 font-bold">
                      {formatRupiah(totalKasPengeluaran)} ({totalPemasukanSeluruhnya > 0 ? Math.round((totalKasPengeluaran / totalPemasukanSeluruhnya) * 100) : 0}% Penggunaan)
                    </span>
                  </div>
                  <div className="w-full bg-slate-900/80 h-7 rounded-lg overflow-hidden p-[2px] border border-slate-800/80 transition-all hover:border-slate-600 relative">
                    <div 
                      className="bg-gradient-to-r from-red-600 to-red-400 h-full rounded-md transition-all duration-700 shadow-lg shadow-red-500/10" 
                      style={{ width: `${totalPemasukanSeluruhnya > 0 ? Math.min((totalKasPengeluaran / totalPemasukanSeluruhnya) * 100, 100) : 0}%` }}
                    ></div>
                    <span className="absolute inset-y-0 left-3 flex items-center text-[10px] font-bold text-white drop-shadow-xs">Belanja Terealisasi</span>
                  </div>
                </div>

                {/* Bar 4: Alokasi Hadiah Lomba */}
                <div 
                  className="relative space-y-1.5 cursor-pointer"
                  onMouseEnter={() => setActiveTooltip('hadiah')}
                  onMouseLeave={() => setActiveTooltip(null)}
                >
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs shadow-amber-500/50"></span>
                      4. Anggaran Prize Pool Kemerdekaan (Alokasi Lomba)
                    </span>
                    <span className="font-mono text-amber-400 font-bold">
                      {formatRupiah(totalAnggaranLombaAllocated)} ({totalKasPengeluaran > 0 ? Math.round((totalAnggaranLombaAllocated / totalKasPengeluaran) * 100) : 0}% Beban Belanja)
                    </span>
                  </div>
                  <div className="w-full bg-slate-900/80 h-7 rounded-lg overflow-hidden p-[2px] border border-slate-800/80 transition-all hover:border-slate-600 relative">
                    <div 
                      className="bg-gradient-to-r from-amber-600 to-amber-400 h-full rounded-md transition-all duration-700 shadow-lg shadow-amber-500/10" 
                      style={{ width: `${totalKasPengeluaran > 0 ? Math.min((totalAnggaranLombaAllocated / totalKasPengeluaran) * 100, 100) : 0}%` }}
                    ></div>
                    <span className="absolute inset-y-0 left-3 flex items-center text-[10px] font-bold text-white drop-shadow-xs">Alokasi Prize Pool Lomba</span>
                  </div>
                </div>

              </div>

              {/* Dynamic Interactive Tooltip Box */}
              <div className="mt-4 bg-slate-900/80 border border-slate-800 p-3 rounded-xl min-h-16 flex items-center gap-3 animate-fade-in transition-all">
                <HelpCircle size={20} className="text-red-500 shrink-0" />
                <div className="text-xs">
                  {!activeTooltip && (
                    <p className="text-slate-400 italic">Letakkan kursor atau klik salah satu bar grafik di atas untuk mendapatkan informasi analitik keuangan.</p>
                  )}
                  {activeTooltip === 'target' && (
                    <p className="text-slate-200">
                      <strong>Target Anggaran Ideal (Rp 15.000.000):</strong> Rencana target total pendanaan HUT-RI ke-81 RT.002 untuk menyelenggarakan perlombaan meriah, penyediaan piala, panggung kemerdekaan, dan konsumsi pesta rakyat warga.
                    </p>
                  )}
                  {activeTooltip === 'masuk' && (
                    <p className="text-slate-200">
                      <strong>Realisasi Kas Masuk ({formatRupiah(totalPemasukanSeluruhnya)}):</strong> Dana riil yang telah sah masuk kas panitia. Berasal dari iuran wajib dan sukarela KK warga senilai <span className="text-emerald-400 font-semibold">{formatRupiah(totalIuranTerkumpul)}</span> ditambah dana kas internal RT, sumbangan donatur, serta sponsorship senilai <span className="text-emerald-400 font-semibold">{formatRupiah(totalKasPemasukanLain)}</span>.
                    </p>
                  )}
                  {activeTooltip === 'keluar' && (
                    <p className="text-slate-200">
                      <strong>Realisasi Pengeluaran ({formatRupiah(totalKasPengeluaran)}):</strong> Total pengeluaran kas yang telah dikeluarkan oleh bendahara untuk belanja kepanitiaan, seperti pembelian hadiah lomba, konsumsi rapat, sewa sound system, dekorasi bendera, dan panggung hiburan.
                    </p>
                  )}
                  {activeTooltip === 'hadiah' && (
                    <p className="text-slate-200">
                      <strong>Prize Pool Lomba ({formatRupiah(totalAnggaranLombaAllocated)}):</strong> Alokasi anggaran hadiah pembinaan kemerdekaan RT untuk para juara 1, 2, dan 3 di seluruh kategori lomba (Anak-anak, Bapak-bapak, Ibu-ibu, Umum). Merupakan prioritas belanja panitia demi menjaga sportivitas dan semangat warga!
                    </p>
                  )}
                </div>
              </div>

            </div>

            {/* DYNAMIC REACTIVE CALCULATOR / SIMULATOR (Kalkulasi Anggaran Swadaya) */}
            <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-5 relative">
              <div className="flex items-center gap-2 mb-4">
                <Calculator className="text-red-500" size={18} />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Kalkulator Simulasi Pendanaan &amp; Anggaran Tambahan
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                {/* Input Slider 1: Sponsor Baru */}
                <div className="space-y-2 bg-slate-900/50 p-4 rounded-xl border border-slate-800/40">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-semibold">Simulasi Tambahan Sponsor (Rp):</span>
                    <strong className="text-emerald-400 font-mono text-sm">{formatRupiah(simulasiSponsor)}</strong>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="5000000" 
                    step="100000"
                    value={simulasiSponsor} 
                    onChange={(e) => setSimulasiSponsor(Number(e.target.value))}
                    className="w-full accent-red-600 cursor-pointer"
                  />
                  <div className="flex gap-1">
                    <button 
                      onClick={() => setSimulasiSponsor(prev => Math.min(prev + 200000, 5000000))}
                      className="text-[10px] bg-slate-800 text-slate-300 px-2 py-1 rounded-md hover:bg-slate-700 font-bold"
                    >
                      +200k
                    </button>
                    <button 
                      onClick={() => setSimulasiSponsor(prev => Math.min(prev + 500000, 5000000))}
                      className="text-[10px] bg-slate-800 text-slate-300 px-2 py-1 rounded-md hover:bg-slate-700 font-bold"
                    >
                      +500k
                    </button>
                    <button 
                      onClick={() => setSimulasiSponsor(0)}
                      className="text-[10px] bg-slate-950 hover:bg-slate-800 text-red-400 px-2.5 py-1 rounded-md font-bold"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                {/* Input Slider 2: Belanja Tambahan */}
                <div className="space-y-2 bg-slate-900/50 p-4 rounded-xl border border-slate-800/40">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-semibold">Simulasi Biaya Belanja Tambahan (Rp):</span>
                    <strong className="text-red-400 font-mono text-sm">{formatRupiah(simulasiBiaya)}</strong>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="5000000" 
                    step="100000"
                    value={simulasiBiaya} 
                    onChange={(e) => setSimulasiBiaya(Number(e.target.value))}
                    className="w-full accent-red-600 cursor-pointer"
                  />
                  <div className="flex gap-1">
                    <button 
                      onClick={() => setSimulasiBiaya(prev => Math.min(prev + 200000, 5000000))}
                      className="text-[10px] bg-slate-800 text-slate-300 px-2 py-1 rounded-md hover:bg-slate-700 font-bold"
                    >
                      +200k
                    </button>
                    <button 
                      onClick={() => setSimulasiBiaya(prev => Math.min(prev + 500000, 5000000))}
                      className="text-[10px] bg-slate-800 text-slate-300 px-2 py-1 rounded-md hover:bg-slate-700 font-bold"
                    >
                      +500k
                    </button>
                    <button 
                      onClick={() => setSimulasiBiaya(0)}
                      className="text-[10px] bg-slate-950 hover:bg-slate-800 text-red-400 px-2.5 py-1 rounded-md font-bold"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              {/* Projected Output Card */}
              <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center md:text-left">
                  <div className="flex items-center gap-1.5 justify-center md:justify-start">
                    <Sparkles size={14} className="text-amber-500 animate-pulse" />
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Hasil Proyeksi Kas Baru</span>
                  </div>
                  <div className="flex items-baseline gap-2 justify-center md:justify-start">
                    <span className="text-slate-400 text-xs">Sisa Saldo Kas Terproyeksi:</span>
                    <strong className={`text-xl font-mono ${projectedBalance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {formatRupiah(projectedBalance)}
                    </strong>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Proyeksi total masuk: {formatRupiah(projectedInflow)} &bull; Proyeksi total keluar: {formatRupiah(projectedOutflow)}
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center bg-slate-950 border border-slate-850 px-4 py-3 rounded-xl min-w-36 shrink-0">
                  <span className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">Rasio Target HUT</span>
                  <span className="text-lg font-mono font-black text-amber-400 mt-1">{projectedPercentOfTarget}%</span>
                  <span className="text-[8px] text-slate-500 uppercase font-bold tracking-wider mt-0.5">TERCAPAI</span>
                </div>
              </div>

              {/* Recommendation Analysis */}
              <div className="mt-3.5 flex items-start gap-2 text-[10px] text-slate-400 leading-relaxed bg-slate-950/20 p-2.5 rounded-lg border border-slate-850">
                <HelpCircle size={12} className="text-slate-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Rekomendasi Analis Kas:</strong> 
                  {projectedBalance < 0 ? (
                    <span className="text-red-400 font-medium"> PERINGATAN: Defisit sebesar {formatRupiah(Math.abs(projectedBalance))}. Segera kurangi simulasi belanja tambahan atau carilah donatur/sponsorship tambahan sebesar minimal {formatRupiah(Math.abs(projectedBalance))} agar arus kas lapangan tidak tekor!</span>
                  ) : projectedBalance < 1000000 ? (
                    <span className="text-amber-400 font-medium"> Kas dalam keadaan mepet ({formatRupiah(projectedBalance)}). Anda direkomendasikan untuk menahan pengeluaran tak terduga dan fokus menagih iuran wajib KK yang masih tertinggal.</span>
                  ) : (
                    <span className="text-emerald-400 font-medium"> Keadaan kas sangat aman dan surplus sebesar {formatRupiah(projectedBalance)}. Panitia dapat memanfaatkan kelebihan dana ini untuk menambahkan hadiah hiburan, doorprize menarik, atau subsidi konsumsi bagi warga penonton lapangan.</span>
                  )}
                </span>
              </div>

            </div>

          </div>
        )}

        {/* TAB 3: KEGIATAN & PARTISIPAN LOMBA (Participant stats and active lomba catalog) */}
        {activeSubTab === 'kegiatan' && (
          <div className="space-y-4 sm:space-y-6 animate-fade-in">
            
            {/* PARTICIPANT STATS GRID */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              
              <div className="bg-slate-950/50 border border-slate-800/60 rounded-2xl p-3 sm:p-4 text-center">
                <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">Registrasi Partisipan</span>
                <h4 className="text-2xl font-display font-black text-white mt-1.5 font-mono">{totalPesertaRegistrations}</h4>
                <p className="text-[10px] text-slate-500 mt-1">pendaftar terverifikasi</p>
              </div>

              <div className="bg-slate-950/50 border border-slate-800/60 rounded-2xl p-3 sm:p-4 text-center">
                <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">Tingkat Kehadiran</span>
                <h4 className="text-2xl font-display font-black text-indigo-400 mt-1.5 font-mono">{absensiKehadiranPercent}%</h4>
                <div className="w-16 bg-slate-800 h-1 rounded-full mx-auto mt-2 overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${absensiKehadiranPercent}%` }} />
                </div>
              </div>

              <div className="bg-slate-950/50 border border-slate-800/60 rounded-2xl p-3 sm:p-4 text-center">
                <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">Lomba Terpopuler</span>
                <h4 className="text-xs font-bold text-amber-400 mt-2 truncate px-1" title={mostPopularLomba.nama}>
                  {mostPopularLomba.nama}
                </h4>
                <p className="text-[10px] text-slate-500 mt-1">({mostPopularLomba.count} pendaftar)</p>
              </div>

              <div className="bg-slate-950/50 border border-slate-800/60 rounded-2xl p-3 sm:p-4 text-center">
                <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">Lomba Berjalan</span>
                <h4 className="text-2xl font-display font-black text-red-400 mt-1.5 font-mono">
                  {lombasList.filter(l => l.status === 'Berjalan').length} / {lombasList.length}
                </h4>
                <p className="text-[10px] text-slate-500 mt-1">perlombaan aktif lapangan</p>
              </div>

            </div>

            {/* INTERACTIVE LOMBA CATALOGUE WITH EXPANDABLE PARTICIPANTS LIST */}
            <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Katalog Perlombaan &amp; Daftar Partisipan Lapangan RT
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Klik lomba untuk melihat daftar nama warga yang berpartisipasi</p>
                </div>
                <span className="text-[10px] bg-red-600/25 border border-red-500/30 text-red-400 px-2.5 py-1 rounded-md font-bold uppercase shrink-0">
                  Data Terkini
                </span>
              </div>

              {/* Grid Layout of active and completed competitions */}
              {lombasList.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  Belum ada perlombaan yang didaftarkan.
                </div>
              ) : (
                <div className="space-y-3">
                  {lombasList.map(lomba => {
                    const registran = pesertasList.filter(p => p.lomba_id === lomba.id);
                    const isExpanded = expandedLombaId === lomba.id;
                    
                    // Capacity / popular ratio for progress bar
                    const popularityRatio = Math.min((registran.length / 15) * 100, 100);

                    return (
                      <div 
                        key={lomba.id}
                        className={`border rounded-xl transition-all ${
                          isExpanded 
                            ? 'bg-slate-900/50 border-red-500/40 shadow-md' 
                            : 'bg-slate-950/30 border-slate-850 hover:bg-slate-900/30 hover:border-slate-800'
                        }`}
                      >
                        {/* Lomba Header Info */}
                        <div 
                          onClick={() => setExpandedLombaId(isExpanded ? null : lomba.id)}
                          className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
                        >
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                lomba.kategori.includes('Anak') ? 'bg-blue-600/20 text-blue-400' :
                                lomba.kategori.includes('Ibu') ? 'bg-pink-600/20 text-pink-400' :
                                lomba.kategori.includes('Bapak') ? 'bg-amber-600/20 text-amber-400' :
                                'bg-purple-600/20 text-purple-400'
                              }`}>
                                {lomba.kategori}
                              </span>
                              <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                                lomba.status === 'Selesai' ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' :
                                lomba.status === 'Berjalan' ? 'bg-red-600/20 text-red-400 border border-red-500/30 animate-pulse' :
                                'bg-slate-800 text-slate-400'
                              }`}>
                                {lomba.status}
                              </span>
                            </div>
                            <h5 className="font-bold text-slate-100 text-sm">{lomba.nama_lomba}</h5>
                            <p className="text-[10px] text-slate-400">PJ: <strong className="text-slate-300 font-semibold">{lomba.pj}</strong></p>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 border-t sm:border-t-0 pt-2.5 sm:pt-0 border-slate-900">
                            <div className="text-right sm:text-right text-xs">
                              <p className="text-[9px] text-slate-500 uppercase tracking-wider">Anggaran Hadiah</p>
                              <strong className="text-amber-500 font-mono">{formatRupiah(lomba.anggaran)}</strong>
                            </div>

                            <div className="text-right text-xs">
                              <p className="text-[9px] text-slate-500 uppercase tracking-wider">Warga Terdaftar</p>
                              <strong className="text-slate-200 font-mono">{registran.length} Peserta</strong>
                            </div>

                            <div className="text-slate-400">
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </div>
                          </div>
                        </div>

                        {/* Expandable Section: list of participants */}
                        {isExpanded && (
                          <div className="border-t border-slate-900 p-3.5 sm:p-4 bg-slate-950/70 rounded-b-xl animate-fade-in space-y-3">
                            
                            {/* Popularity indicator bar */}
                            <div>
                              <div className="flex justify-between text-[9px] font-bold text-slate-400 mb-1">
                                <span>ANTUSIASME WARGA</span>
                                <span>{Math.round(popularityRatio)}%</span>
                              </div>
                              <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                                <div className="bg-red-600 h-full rounded-full" style={{ width: `${popularityRatio}%` }} />
                              </div>
                            </div>

                            {/* Participant names */}
                            <div className="space-y-1.5">
                              <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-2">Daftar Pendaftar Terverifikasi:</p>
                              {registran.length === 0 ? (
                                <p className="text-[11px] text-slate-500 italic">Belum ada warga yang mendaftar perlombaan ini. Jadilah pendaftar pertama!</p>
                              ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {registran.map((p, index) => (
                                    <div 
                                      key={p.id}
                                      className="flex items-center justify-between p-2.5 bg-slate-900/60 rounded-lg border border-slate-850 text-xs"
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className="text-slate-500 font-mono text-[10px]">{index + 1}.</span>
                                        <div>
                                          <p className="font-semibold text-slate-200">{p.nama_peserta}</p>
                                          <p className="text-[9px] text-slate-400">Mewakili RT: <strong>{p.rt}</strong></p>
                                        </div>
                                      </div>

                                      {/* Attendance Badge on the field */}
                                      <span className={`text-[9px] px-2 py-0.5 rounded-md font-bold uppercase ${
                                        p.absensi 
                                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                                          : 'bg-slate-800 text-slate-500'
                                      }`}>
                                        {p.absensi ? 'Hadir Lapangan' : 'Terdaftar'}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Prize Winners if available (Completed competition) */}
                            {lomba.status === 'Selesai' && (
                              <div className="mt-3.5 pt-3.5 border-t border-slate-900 space-y-2">
                                <div className="flex items-center gap-1.5 text-[10px] text-amber-400 font-extrabold uppercase tracking-wider">
                                  <Trophy size={12} />
                                  <span>Hasil Juara Kemerdekaan:</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                                  <div className="p-2 bg-yellow-500/10 border border-yellow-500/35 rounded-lg text-yellow-400">
                                    <p className="text-[8px] uppercase font-bold tracking-widest text-slate-400">Juara 1 🥇</p>
                                    <p className="font-semibold mt-0.5 truncate">{lomba.pemenang_1 || 'Kosong'}</p>
                                  </div>
                                  <div className="p-2 bg-slate-300/10 border border-slate-300/35 rounded-lg text-slate-300">
                                    <p className="text-[8px] uppercase font-bold tracking-widest text-slate-400">Juara 2 🥈</p>
                                    <p className="font-semibold mt-0.5 truncate">{lomba.pemenang_2 || 'Kosong'}</p>
                                  </div>
                                  <div className="p-2 bg-amber-700/10 border border-amber-700/35 rounded-lg text-amber-500">
                                    <p className="text-[8px] uppercase font-bold tracking-widest text-slate-400">Juara 3 🥉</p>
                                    <p className="font-semibold mt-0.5 truncate">{lomba.pemenang_3 || 'Kosong'}</p>
                                  </div>
                                </div>
                              </div>
                            )}

                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

            </div>

          </div>
        )}

      </div>

      {/* UU ITE Footnote in Dashboard Graphic */}
      <div className="mt-5 pt-3.5 border-t border-slate-800/60 flex items-start gap-1.5 text-[9px] text-slate-400 text-justify leading-relaxed relative z-10">
        <Scale size={11} className="text-slate-500 shrink-0 mt-0.5" />
        <span>
          <strong>Keamanan Dokumen Elektronik:</strong> Berdasarkan Undang Undang ITE no. 11 Tahun 2008 yang mengatur Dokumen Elektronik dan informasi lain di dalamnya sebagai alat bukti yang sah dan dapat di pertanggung jawabkan.
        </span>
      </div>

    </div>
  );
}
