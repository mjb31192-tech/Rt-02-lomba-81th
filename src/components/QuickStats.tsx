import { Lomba, Peserta, Kas, IuranKK } from '../types';
import { Wallet, Trophy, Users, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react';

interface QuickStatsProps {
  lombas: Lomba[];
  pesertas: Peserta[];
  kas: Kas[];
  iuranKK?: IuranKK[];
}

export default function QuickStats({ lombas, pesertas, kas, iuranKK = [] }: QuickStatsProps) {
  // 1. Kas Calculations
  const totalIuranKK = iuranKK.reduce((acc, curr) => acc + curr.terbayar, 0);
  const standardMasuk = kas
    .filter(k => k.tipe === 'pemasukan' && !k.keterangan.includes('Iuran KK:'))
    .reduce((acc, curr) => acc + curr.jumlah, 0);
  const totalMasuk = standardMasuk + totalIuranKK;
  const totalKeluar = kas.filter(k => k.tipe === 'pengeluaran').reduce((acc, curr) => acc + curr.jumlah, 0);
  const sisaKas = totalMasuk - totalKeluar;
  const totalAnggaranLomba = lombas.reduce((acc, curr) => acc + curr.anggaran, 0);

  // 2. Lomba & Progress Calculations
  const totalLomba = lombas.length;
  const selesaiLomba = lombas.filter(l => l.status === 'Selesai').length;
  const berjalanLomba = lombas.filter(l => l.status === 'Berjalan').length;
  
  // Progress formula: Selesai counts 100%, Berjalan counts 50
  const progressPercent = totalLomba > 0 
    ? Math.round(((selesaiLomba * 100) + (berjalanLomba * 50)) / totalLomba) 
    : 0;

  // 3. Warga Calculations
  const totalPeserta = pesertas.length;
  const totalHadir = pesertas.filter(p => p.absensi).length;
  const absensiPercent = totalPeserta > 0 ? Math.round((totalHadir / totalPeserta) * 100) : 0;

  // Formatting helper
  const formatRupiah = (num: number) => {
    return 'Rp ' + num.toLocaleString('id-ID');
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* CARD 1: Keuangan Kas */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4.5 shadow-xs transition-all hover:shadow-sm hover:border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Saldo Kas RT</p>
            <h3 className="text-xl md:text-2xl font-display font-black text-gray-800 mt-1 font-sans tracking-tight">
              {formatRupiah(sisaKas)}
            </h3>
            <p className="text-[11px] text-gray-500 mt-2.5 flex items-center gap-1">
              <span className="inline-flex items-center gap-0.5 text-emerald-600 font-semibold bg-emerald-50/75 px-1.5 py-0.5 rounded text-[10px]">
                <TrendingUp size={11} />
                {formatRupiah(totalMasuk)}
              </span>
              <span>total masuk</span>
            </p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shadow-xs shadow-emerald-100">
            <Wallet size={22} />
          </div>
        </div>
      </div>

      {/* CARD 2: Total Lomba */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4.5 shadow-xs transition-all hover:shadow-sm hover:border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Total Lomba</p>
            <h3 className="text-xl md:text-2xl font-display font-black text-gray-800 mt-1 tracking-tight">
              {totalLomba} Kegiatan
            </h3>
            <p className="text-[11px] text-gray-500 mt-2.5 flex items-center gap-1.5">
              <span className="text-red-600 font-bold bg-red-50/75 px-1.5 py-0.5 rounded text-[10px]">{berjalanLomba} Berjalan</span>
              <span className="text-gray-300">&bull;</span>
              <span className="text-gray-500 text-[10px] font-medium">{selesaiLomba} Selesai</span>
            </p>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-xl shadow-xs shadow-red-100">
            <Trophy size={22} />
          </div>
        </div>
      </div>

      {/* CARD 3: Partisipasi Warga */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4.5 shadow-xs transition-all hover:shadow-sm hover:border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Total Peserta</p>
            <h3 className="text-xl md:text-2xl font-display font-black text-gray-800 mt-1 tracking-tight">
              {totalPeserta} Warga
            </h3>
            <p className="text-[11px] text-gray-500 mt-2.5 flex items-center gap-1">
              <span className="text-indigo-600 font-bold bg-indigo-50/75 px-1.5 py-0.5 rounded text-[10px]">{absensiPercent}% Absen</span>
              <span className="text-[10px] font-medium">({totalHadir} hadir lapangan)</span>
            </p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl shadow-xs shadow-indigo-100">
            <Users size={22} />
          </div>
        </div>
      </div>

      {/* CARD 4: Progress Kegiatan */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4.5 shadow-xs transition-all hover:shadow-sm hover:border-gray-200 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Progres Persiapan</p>
            <h3 className="text-xl md:text-2xl font-display font-black text-gray-800 mt-1 tracking-tight">
              {progressPercent}%
            </h3>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl shadow-xs shadow-amber-100">
            <CheckCircle2 size={22} />
          </div>
        </div>
        <div className="mt-2.5">
          <div className="w-full bg-gray-100 rounded-full h-1 overflow-hidden">
            <div 
              className="bg-red-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-1.5">
            <span className="text-[9px] text-gray-400 uppercase font-bold tracking-wider">Target: 17 Agustus</span>
            <span className="text-[9px] text-amber-600 font-bold flex items-center gap-0.5">
              <Sparkles size={9} />
              Ready
            </span>
          </div>
        </div>
      </div>
    </div>

  );
}
