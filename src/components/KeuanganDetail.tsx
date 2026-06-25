import { useState } from 'react';
import { Kas, IuranKK, Lomba } from '../types';
import { ArrowUpRight, ArrowDownRight, Search, Plus, Calendar, Landmark, Info, Users, CheckCircle2, AlertCircle, History, FileText, Printer, Download, Trash2, Edit } from 'lucide-react';

interface KeuanganDetailProps {
  kasList: Kas[];
  onOpenCatatKas: () => void;
  iuranKKList: IuranKK[];
  onOpenBayarIuran: () => void;
  onSelectKKAndPay: (kkId: number) => void;
  lombasList: Lomba[];
  onDeleteKas?: (id: number) => void;
  onEditKasClick?: (kas: Kas) => void;
  onDeleteKK?: (id: number) => void;
  isPengurus?: boolean;
}

export default function KeuanganDetail({
  kasList,
  onOpenCatatKas,
  iuranKKList,
  onOpenBayarIuran,
  onSelectKKAndPay,
  lombasList,
  onDeleteKas,
  onEditKasClick,
  onDeleteKK,
  isPengurus = false,
}: KeuanganDetailProps) {
  const [search, setSearch] = useState('');
  const [tipeFilter, setTipeFilter] = useState<string>('all');
  const [subTab, setSubTab] = useState<'jurnal' | 'iuran' | 'laporan'>('jurnal');
  const [rtFilter, setRtFilter] = useState('all');

  // Calculate general cash flow summary
  const totalMasuk = kasList.filter(k => k.tipe === 'pemasukan').reduce((acc, curr) => acc + curr.jumlah, 0);
  const totalKeluar = kasList.filter(k => k.tipe === 'pengeluaran').reduce((acc, curr) => acc + curr.jumlah, 0);
  const sisaKas = totalMasuk - totalKeluar;

  // Calculate KK contribution summary
  const totalKK = iuranKKList.length;
  const totalTargetIuran = totalKK * 50000;
  const totalIuranTerkumpul = iuranKKList.reduce((acc, curr) => acc + curr.terbayar, 0);
  const totalKekuranganIuran = Math.max(0, totalTargetIuran - totalIuranTerkumpul);
  
  const lunasCount = iuranKKList.filter(k => k.status === 'Lunas').length;
  const mencicilCount = iuranKKList.filter(k => k.status === 'Mencicil').length;
  const belumBayarCount = iuranKKList.filter(k => k.status === 'Belum Bayar').length;

  const filteredKas = kasList.filter(k => {
    const matchSearch = k.keterangan.toLowerCase().includes(search.toLowerCase()) || 
                        k.kategori.toLowerCase().includes(search.toLowerCase());
    const matchTipe = tipeFilter === 'all' || k.tipe === tipeFilter;
    return matchSearch && matchTipe;
  });

  const filteredKKs = iuranKKList.filter(k => {
    const matchSearch = k.nama_kk.toLowerCase().includes(search.toLowerCase());
    const matchRt = rtFilter === 'all' || k.rt === rtFilter;
    return matchSearch && matchRt;
  });

  const formatRupiah = (num: number) => {
    return 'Rp ' + num.toLocaleString('id-ID');
  };

  const downloadJurnalCSV = () => {
    const headers = ['ID', 'Tanggal', 'Tipe', 'Kategori', 'Keterangan', 'Jumlah (IDR)'];
    const rows = kasList.map(k => [
      k.id,
      k.tanggal,
      k.tipe.toUpperCase(),
      k.kategori,
      k.keterangan,
      k.jumlah
    ]);
    
    const csvContent = "\ufeff" + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Laporan_Jurnal_Keuangan_HUTRI81_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadPembelanjaanCSV = () => {
    const headers = ['Nama Lomba', 'Penanggung Jawab', 'Kategori', 'Anggaran Rencana (IDR)', 'Realisasi Pengeluaran (IDR)', 'Selisih (IDR)', 'Status'];
    const rows = lombasList.map(l => {
      const realisasi = kasList
        .filter(k => k.tipe === 'pengeluaran' && (k.lomba_id === l.id || k.keterangan.toLowerCase().includes(l.nama_lomba.toLowerCase()) || k.kategori.toLowerCase() === l.nama_lomba.toLowerCase()))
        .reduce((sum, curr) => sum + curr.jumlah, 0);
      const selisih = l.anggaran - realisasi;
      let status = 'Sesuai Anggaran';
      if (selisih > 0) status = 'Hemat';
      if (selisih < 0) status = 'Over-Budget';
      
      return [
        l.nama_lomba,
        l.pj,
        l.kategori,
        l.anggaran,
        realisasi,
        selisih,
        status
      ];
    });
    
    // Also add non-lomba expenses summary
    const nonLombaExpenses = kasList.filter(k => {
      if (k.tipe !== 'pengeluaran') return false;
      if (k.lomba_id) return false;
      const matchesLomba = lombasList.some(l => k.keterangan.toLowerCase().includes(l.nama_lomba.toLowerCase()) || k.kategori.toLowerCase() === l.nama_lomba.toLowerCase());
      return !matchesLomba;
    });
    
    const totalNonLomba = nonLombaExpenses.reduce((sum, curr) => sum + curr.jumlah, 0);
    rows.push([
      'Operasional & Perlengkapan Umum (Non-Lomba)',
      'Bendahara RT',
      'Operasional',
      totalNonLomba,
      totalNonLomba,
      0,
      'Direalisasikan'
    ]);

    const csvContent = "\ufeff" + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Laporan_Pembelanjaan_Kegiatan_HUTRI81_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Keuangan Cards Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Sisa Realisasi Kas RT</p>
            <h3 className="text-xl md:text-2xl font-display font-black text-gray-800 mt-1 font-mono">
              {formatRupiah(sisaKas)}
            </h3>
            <p className="text-[11px] text-gray-500 mt-1.5 flex items-center gap-1 font-medium">
              <Info size={12} className="text-gray-400" />
              Sisa saldo kas aktif saat ini
            </p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shadow-xs shadow-emerald-100">
            <Landmark size={22} />
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Dana Masuk</p>
            <h3 className="text-xl md:text-2xl font-display font-black text-emerald-600 mt-1 font-mono">
              {formatRupiah(totalMasuk)}
            </h3>
            <p className="text-[11px] text-emerald-600 mt-1.5 font-bold flex items-center gap-0.5">
              <ArrowUpRight size={13} />
              Termasuk iuran &amp; donasi
            </p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shadow-xs shadow-emerald-100">
            <ArrowUpRight size={22} />
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Dana Keluar</p>
            <h3 className="text-xl md:text-2xl font-display font-black text-red-500 mt-1 font-mono">
              {formatRupiah(totalKeluar)}
            </h3>
            <p className="text-[11px] text-red-500 mt-1.5 font-bold flex items-center gap-0.5">
              <ArrowDownRight size={13} />
              Realisasi belanja perlengkapan
            </p>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-xl shadow-xs shadow-red-100">
            <ArrowDownRight size={22} />
          </div>
        </div>
      </div>

      {/* Dynamic Sub-Tab Section */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Navigation tabs */}
        <div className="border-b border-gray-100 bg-gray-50/50 p-2 flex flex-col sm:flex-row justify-between gap-2">
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => { setSubTab('jurnal'); setSearch(''); }}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-2 ${subTab === 'jurnal' ? 'bg-white text-red-600 shadow-3xs' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Landmark size={14} />
              Buku Jurnal Umum
            </button>
            <button
              onClick={() => { setSubTab('iuran'); setSearch(''); }}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-2 ${subTab === 'iuran' ? 'bg-white text-red-600 shadow-3xs' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Users size={14} />
              Daftar Iuran KK (Target 50K)
            </button>
            <button
              onClick={() => { setSubTab('laporan'); setSearch(''); }}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-2 ${subTab === 'laporan' ? 'bg-white text-red-600 shadow-3xs' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <FileText size={14} />
              Cetak &amp; Ekspor LPJ
            </button>
          </div>

          <div className="flex items-center gap-2">
            {subTab === 'jurnal' && isPengurus && (
              <button
                onClick={onOpenCatatKas}
                className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs cursor-pointer transition-all active:scale-95"
              >
                <Plus size={14} />
                Catat Keuangan
              </button>
            )}
            {subTab === 'iuran' && isPengurus && (
              <button
                onClick={onOpenBayarIuran}
                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs cursor-pointer transition-all active:scale-95"
              >
                <Plus size={14} />
                Bayar Iuran KK
              </button>
            )}
            {subTab === 'laporan' && (
              <span className="text-[10px] bg-red-50 text-red-600 border border-red-100 font-bold px-2.5 py-1.5 rounded-lg uppercase tracking-wide">
                LPJ Akhir &amp; Kegiatan
              </span>
            )}
          </div>
        </div>

        {/* ----------------- SUB-TAB 1: JURNAL UMUM ----------------- */}
        {subTab === 'jurnal' && (
          <div>
            <div className="p-4 bg-white border-b border-gray-100 flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari keterangan belanja atau kategori kas..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div className="w-full md:w-48">
                <select
                  value={tipeFilter}
                  onChange={e => setTipeFilter(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-hidden bg-white text-gray-700"
                >
                  <option value="all">Semua Transaksi</option>
                  <option value="pemasukan">Uang Masuk (+)</option>
                  <option value="pengeluaran">Pengeluaran (-)</option>
                </select>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {filteredKas.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-xs font-medium">
                  Belum ada transaksi keuangan yang cocok dengan pencarian Anda.
                </div>
              ) : (
                filteredKas.map((k) => (
                  <div key={k.id} className="p-4 flex items-center justify-between gap-4 hover:bg-gray-50/50 transition-all animate-fade-in">
                    <div className="flex items-center gap-3.5">
                      <div className={`p-2.5 rounded-xl shrink-0 border ${k.tipe === 'pemasukan' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-600'}`}>
                        {k.tipe === 'pemasukan' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-gray-800 leading-normal">{k.keterangan}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-gray-400 font-bold px-2 py-0.5 bg-gray-100 rounded-md">
                            {k.kategori}
                          </span>
                          <span className="text-[10px] text-gray-400 flex items-center gap-1 font-medium font-mono">
                            <Calendar size={10} />
                            {k.tanggal}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className={`font-bold font-mono text-xs sm:text-sm ${k.tipe === 'pemasukan' ? 'text-emerald-600' : 'text-red-500'}`}>
                          {k.tipe === 'pemasukan' ? '+' : '-'}&nbsp;Rp&nbsp;{k.jumlah.toLocaleString('id-ID')}
                        </span>
                        <span className="block text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                          {k.tipe}
                        </span>
                      </div>

                      {isPengurus && onEditKasClick && (
                        <button
                          onClick={() => onEditKasClick(k)}
                          className="p-1.5 text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-all cursor-pointer active:scale-95 shrink-0"
                          title="Revisi / Edit Transaksi"
                        >
                          <Edit size={13} />
                        </button>
                      )}

                      {isPengurus && onDeleteKas && (
                        <button
                          onClick={() => onDeleteKas(k.id)}
                          className="p-1.5 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-all cursor-pointer active:scale-95 shrink-0"
                          title="Hapus Transaksi"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ----------------- SUB-TAB 2: MONITORING IURAN KK ----------------- */}
        {subTab === 'iuran' && (
          <div className="space-y-4">
            
            {/* Summary Iuran KK */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-4 bg-gray-50/50 border-b border-gray-100 text-center">
              <div className="bg-white border border-gray-100 p-3 rounded-xl shadow-3xs">
                <span className="block text-[8px] text-gray-400 font-bold uppercase tracking-widest">Total Terkumpul</span>
                <span className="font-display font-black text-xs sm:text-sm text-emerald-600 font-mono block mt-1">{formatRupiah(totalIuranTerkumpul)}</span>
                <span className="text-[9px] text-gray-400 font-semibold mt-0.5 block">dari target {formatRupiah(totalTargetIuran)}</span>
              </div>
              <div className="bg-white border border-gray-100 p-3 rounded-xl shadow-3xs">
                <span className="block text-[8px] text-gray-400 font-bold uppercase tracking-widest">Kekurangan</span>
                <span className="font-display font-black text-xs sm:text-sm text-red-500 font-mono block mt-1">{formatRupiah(totalKekuranganIuran)}</span>
                <span className="text-[9px] text-gray-400 font-semibold mt-0.5 block">yang belum tertagih</span>
              </div>
              <div className="bg-white border border-gray-100 p-3 rounded-xl shadow-3xs">
                <span className="block text-[8px] text-gray-400 font-bold uppercase tracking-widest">Status KK Lunas</span>
                <span className="font-display font-black text-xs sm:text-sm text-gray-800 block mt-1">{lunasCount} KK</span>
                <span className="text-[9px] text-emerald-600 font-bold mt-0.5 block">({Math.round((lunasCount/totalKK)*100)}% lunas)</span>
              </div>
              <div className="bg-white border border-gray-100 p-3 rounded-xl shadow-3xs">
                <span className="block text-[8px] text-gray-400 font-bold uppercase tracking-widest">Kolektabilitas</span>
                <span className="font-display font-black text-xs sm:text-sm text-blue-600 block mt-1">{mencicilCount} Mencicil</span>
                <span className="text-[9px] text-gray-400 font-semibold mt-0.5 block">{belumBayarCount} Belum Bayar</span>
              </div>
            </div>

            {/* Filter & Search for KK */}
            <div className="px-4 pb-2 flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari nama Kepala Keluarga (KK)..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div className="flex gap-1.5">
                {['all', 'RT 01', 'RT 02', 'RT 03', 'RT 04'].map(rt => (
                  <button
                    key={rt}
                    onClick={() => setRtFilter(rt)}
                    className={`px-3 py-2 text-[10px] font-bold rounded-lg border uppercase tracking-wider transition-all cursor-pointer ${rtFilter === rt ? 'bg-red-50 border-red-500 text-red-600' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                  >
                    {rt === 'all' ? 'Semua RT' : rt}
                  </button>
                ))}
              </div>
            </div>

            {/* KK Cards Grid */}
            <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredKKs.map(kk => {
                const percent = Math.min(100, Math.round((kk.terbayar / kk.target) * 100));
                const deficit = Math.max(0, kk.target - kk.terbayar);
                return (
                  <div key={kk.id} className="bg-white border border-gray-150 rounded-xl p-3.5 shadow-3xs flex flex-col justify-between space-y-3 hover:border-gray-300 transition-all animate-fade-in">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[9px] bg-red-50 border border-red-100/50 text-red-600 font-bold uppercase tracking-wider px-1.5 py-0.5 rounded">
                          {kk.rt}
                        </span>
                        <h4 className="font-bold text-xs text-gray-800 mt-2 font-display">{kk.nama_kk}</h4>
                      </div>
                      
                      <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                        kk.status === 'Lunas' 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                          : kk.status === 'Mencicil' 
                            ? 'bg-amber-50 text-amber-600 border border-amber-100' 
                            : 'bg-gray-50 text-gray-400 border border-gray-150'
                      }`}>
                        {kk.status}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono">
                        <span>{formatRupiah(kk.terbayar)} / 50K</span>
                        <span className="font-bold">{percent}%</span>
                      </div>
                      <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${kk.status === 'Lunas' ? 'bg-emerald-500' : 'bg-amber-500'}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-100/70 flex items-center justify-between gap-1.5 text-xs text-gray-400">
                      <span className="text-[9px] flex items-center gap-0.5 font-medium">
                        {kk.status === 'Lunas' ? (
                          <CheckCircle2 size={11} className="text-emerald-500" />
                        ) : (
                          <AlertCircle size={11} className="text-amber-500" />
                        )}
                        {kk.status === 'Lunas' ? 'Lunas Sepenuhnya' : `Sisa: ${formatRupiah(deficit)}`}
                      </span>

                      <div className="flex items-center gap-1">
                        {isPengurus && (
                          <button
                            onClick={() => onSelectKKAndPay(kk.id)}
                            className={`text-[9px] font-bold px-2 py-1 rounded-md transition-all cursor-pointer border ${kk.status === 'Lunas' ? 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed' : 'bg-red-50 text-red-600 hover:bg-red-100/80 border-red-100'}`}
                            disabled={kk.status === 'Lunas'}
                          >
                            {kk.status === 'Belum Bayar' ? 'Mulai Bayar' : kk.status === 'Mencicil' ? 'Cicil Lagi' : 'Selesai'}
                          </button>
                        )}

                        {isPengurus && onDeleteKK && (
                          <button
                            onClick={() => onDeleteKK(kk.id)}
                            className="p-1 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-md transition-all cursor-pointer"
                            title="Hapus KK"
                          >
                            <Trash2 size={11} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredKKs.length === 0 && (
                <div className="col-span-full py-8 text-center text-gray-400 text-xs font-medium">
                  Belum ada Kepala Keluarga yang terdaftar untuk filter ini.
                </div>
              )}
            </div>
          </div>
        )}
        {subTab === 'laporan' && (
          <div className="p-6 space-y-6">
            {/* Dynamic style rule to make sure window.print() ONLY prints the LPJ preview */}
            <style dangerouslySetInnerHTML={{ __html: `
              @media print {
                body * {
                  visibility: hidden !important;
                }
                #printable-lpj, #printable-lpj * {
                  visibility: visible !important;
                }
                #printable-lpj {
                  position: absolute !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: 100% !important;
                  margin: 0 !important;
                  padding: 24px !important;
                  background: white !important;
                  color: black !important;
                  font-family: 'Times New Roman', Times, serif !important;
                }
                /* Hide screen-only indicators on print */
                .print-hidden-element {
                  display: none !important;
                }
              }
            `}} />

            {/* Actions Panel */}
            <div className="bg-red-50/50 border border-red-100 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-extrabold text-red-600 uppercase tracking-widest flex items-center gap-1.5">
                  <FileText size={14} />
                  Pusat Ekspor &amp; Cetak LPJ Kemerdekaan
                </h4>
                <p className="text-[11px] text-gray-500 mt-1">
                  Ekspor jurnal umum kas atau cetak Laporan Pertanggungjawaban (LPJ) resmi berformat kertas surat panitia.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
                <button
                  onClick={downloadJurnalCSV}
                  className="inline-flex items-center gap-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold px-3 py-2 rounded-xl shadow-3xs cursor-pointer transition-all active:scale-95"
                >
                  <Download size={13} className="text-gray-400" />
                  Unduh Jurnal (CSV)
                </button>
                <button
                  onClick={downloadPembelanjaanCSV}
                  className="inline-flex items-center gap-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold px-3 py-2 rounded-xl shadow-3xs cursor-pointer transition-all active:scale-95"
                >
                  <Download size={13} className="text-gray-400" />
                  Unduh Belanja Kegiatan (CSV)
                </button>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs cursor-pointer transition-all active:scale-95"
                >
                  <Printer size={13} />
                  Cetak LPJ / Simpan PDF
                </button>
              </div>
            </div>

            {/* Interactive LPJ Live Sheet Preview (styled like real paper) */}
            <div className="border border-gray-200 bg-gray-50 p-4 md:p-8 rounded-2xl flex justify-center overflow-x-auto">
              <div 
                id="printable-lpj" 
                className="bg-white text-gray-900 w-full max-w-[800px] p-6 sm:p-10 md:p-12 shadow-md border border-gray-150 rounded-xs font-serif leading-relaxed text-xs sm:text-sm"
              >
                {/* 1. Official Letterhead / Kop Surat */}
                <div className="text-center border-b-4 border-double border-gray-900 pb-4 mb-6">
                  <h1 className="text-base sm:text-lg font-extrabold uppercase tracking-wide font-sans text-gray-950">
                    PANITIA PELAKSANA PERINGATAN HUT RI KE-81
                  </h1>
                  <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wide text-gray-800 mt-0.5">
                    WILAYAH RT 02 RW 03 KELURAHAN KEDAUNG BARU
                  </h2>
                  <p className="text-[10px] text-gray-500 italic mt-1 font-sans">
                    Sekretariat: Gedung Serbaguna RT 02, Kelurahan Kedaung Baru, Tangerang, 15124
                  </p>
                </div>

                {/* 2. Title */}
                <div className="text-center mb-6">
                  <h3 className="text-sm sm:text-base font-black uppercase text-gray-950 underline decoration-1">
                    LAPORAN PERTANGGUNGJAWABAN (LPJ) KEUANGAN &amp; KEGIATAN PEMBELANJAAN
                  </h3>
                  <p className="text-[10px] text-gray-500 mt-1 font-sans font-medium">
                    Nomor Dokumen: 031/LPJ-PAN-HUT81/RT02/RW03/VIII/2026
                  </p>
                </div>

                {/* Opening Intro */}
                <div className="mb-6 font-serif text-gray-800 text-justify">
                  <p>
                    Dengan hormat, sehubungan dengan selesainya seluruh rangkaian kegiatan perayaan peringatan Hari Ulang Tahun Proklamasi Kemerdekaan Republik Indonesia Ke-81 tahun 2026 di lingkungan RT 02 RW 03, kami selaku Panitia Pelaksana menyampaikan laporan pertanggungjawaban realisasi kas keuangan dan perincian kegiatan belanja kepanitiaan sebagai berikut:
                  </p>
                </div>

                {/* 3. Section I: Financial Summary Table */}
                <div className="mb-6">
                  <h4 className="font-bold text-gray-950 uppercase border-b border-gray-300 pb-1 mb-2 font-sans text-xs">
                    I. RINGKASAN REKAPITULASI KAS KEMERDEKAAN
                  </h4>
                  <table className="w-full border-collapse border border-gray-300 text-left font-sans text-[11px]">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 p-2 text-gray-800">Uraian Kas Utama</th>
                        <th className="border border-gray-300 p-2 text-right text-gray-800 w-44">Jumlah Nominal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="border border-gray-300 p-2 font-medium">1. Total Penerimaan / Uang Masuk</td>
                        <td className="border border-gray-300 p-2 text-right font-mono font-semibold text-emerald-600">{formatRupiah(totalMasuk)}</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-2 font-medium">2. Total Realisasi Pengeluaran / Uang Keluar</td>
                        <td className="border border-gray-300 p-2 text-right font-mono font-semibold text-red-600">{formatRupiah(totalKeluar)}</td>
                      </tr>
                      <tr className="bg-gray-50 font-bold text-gray-900">
                        <td className="border border-gray-300 p-2">SISA SALDO KAS PANITIA (AKTIF)</td>
                        <td className="border border-gray-300 p-2 text-right font-mono">{formatRupiah(sisaKas)}</td>
                      </tr>
                    </tbody>
                  </table>
                  <p className="text-[9px] text-gray-500 mt-1.5 italic font-sans">
                    * Catatan: Dana pemasukan diperoleh dari akumulasi iuran wajib warga {formatRupiah(totalIuranTerkumpul)}, donatur, serta sponsorship yang sah.
                  </p>
                </div>

                {/* 4. Section II: Expenditure Activity Report (Lomba vs Realisasi) */}
                <div className="mb-6">
                  <h4 className="font-bold text-gray-950 uppercase border-b border-gray-300 pb-1 mb-2 font-sans text-xs">
                    II. PERINCIAN ANGGARAN &amp; REALISASI BELANJA KEGIATAN
                  </h4>
                  <table className="w-full border-collapse border border-gray-300 text-left font-sans text-[11px]">
                    <thead>
                      <tr className="bg-gray-100 text-gray-800">
                        <th className="border border-gray-300 p-2">Nama Kegiatan / Lomba</th>
                        <th className="border border-gray-300 p-2">PJ Kegiatan</th>
                        <th className="border border-gray-300 p-2 text-right">Rencana (A)</th>
                        <th className="border border-gray-300 p-2 text-right">Realisasi (B)</th>
                        <th className="border border-gray-300 p-2 text-right">Selisih (A-B)</th>
                        <th className="border border-gray-300 p-2 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {lombasList.map(l => {
                        const realisasi = kasList
                          .filter(k => k.tipe === 'pengeluaran' && (k.lomba_id === l.id || k.keterangan.toLowerCase().includes(l.nama_lomba.toLowerCase()) || k.kategori.toLowerCase() === l.nama_lomba.toLowerCase()))
                          .reduce((sum, curr) => sum + curr.jumlah, 0);
                        const selisih = l.anggaran - realisasi;
                        return (
                          <tr key={l.id}>
                            <td className="border border-gray-300 p-2 font-medium">{l.nama_lomba}</td>
                            <td className="border border-gray-300 p-2">{l.pj}</td>
                            <td className="border border-gray-300 p-2 text-right font-mono">{formatRupiah(l.anggaran)}</td>
                            <td className="border border-gray-300 p-2 text-right font-mono">{formatRupiah(realisasi)}</td>
                            <td className={`border border-gray-300 p-2 text-right font-mono font-medium ${selisih < 0 ? 'text-red-500' : 'text-gray-700'}`}>
                              {selisih < 0 ? '-' : ''}{formatRupiah(Math.abs(selisih))}
                            </td>
                            <td className="border border-gray-300 p-2 text-center">
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm ${selisih > 0 ? 'bg-emerald-50 text-emerald-600' : selisih === 0 ? 'bg-gray-50 text-gray-500' : 'bg-red-50 text-red-600'}`}>
                                {selisih > 0 ? 'Hemat' : selisih === 0 ? 'Sesuai' : 'Over'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                      {/* Operational general expenses non-lomba row */}
                      <tr>
                        <td className="border border-gray-300 p-2 font-medium">Ops &amp; Perlengkapan Umum (Non-Lomba)</td>
                        <td className="border border-gray-300 p-2">Bendahara</td>
                        <td className="border border-gray-300 p-2 text-right font-mono">-</td>
                        <td className="border border-gray-300 p-2 text-right font-mono">
                          {formatRupiah(kasList.filter(k => {
                            if (k.tipe !== 'pengeluaran') return false;
                            if (k.lomba_id) return false;
                            const matchesLomba = lombasList.some(l => k.keterangan.toLowerCase().includes(l.nama_lomba.toLowerCase()) || k.kategori.toLowerCase() === l.nama_lomba.toLowerCase());
                            return !matchesLomba;
                          }).reduce((sum, curr) => sum + curr.jumlah, 0))}
                        </td>
                        <td className="border border-gray-300 p-2 text-right font-mono">-</td>
                        <td className="border border-gray-300 p-2 text-center font-medium text-gray-400">Umum</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 5. Section III: Detailed Ledger of Transactions */}
                <div className="mb-8">
                  <h4 className="font-bold text-gray-950 uppercase border-b border-gray-300 pb-1 mb-2 font-sans text-xs">
                    III. HISTORI BUKU JURNAL KAS MASUK DAN KELUAR
                  </h4>
                  <table className="w-full border-collapse border border-gray-300 text-left font-sans text-[10px]">
                    <thead>
                      <tr className="bg-gray-100 text-gray-800">
                        <th className="border border-gray-300 p-1.5 w-16">Tanggal</th>
                        <th className="border border-gray-300 p-1.5 w-12 text-center">Tipe</th>
                        <th className="border border-gray-300 p-1.5 w-24">Kategori</th>
                        <th className="border border-gray-300 p-1.5">Keterangan / Deskripsi Transaksi</th>
                        <th className="border border-gray-300 p-1.5 text-right w-24">Jumlah (Nominal)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {kasList.map(k => (
                        <tr key={k.id}>
                          <td className="border border-gray-300 p-1.5 font-mono">{k.tanggal}</td>
                          <td className={`border border-gray-300 p-1.5 text-center font-bold ${k.tipe === 'pemasukan' ? 'text-emerald-600' : 'text-red-500'}`}>
                            {k.tipe === 'pemasukan' ? 'MASUK' : 'KELUAR'}
                          </td>
                          <td className="border border-gray-300 p-1.5">{k.kategori}</td>
                          <td className="border border-gray-300 p-1.5">{k.keterangan}</td>
                          <td className="border border-gray-300 p-1.5 text-right font-mono">{formatRupiah(k.jumlah)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 6. Signatures Section / Pengesahan */}
                <div className="mt-12 border-t pt-8 border-gray-200">
                  <div className="grid grid-cols-2 gap-y-12 gap-x-12 text-center text-gray-800 font-sans text-xs">
                    <div>
                      <p className="mb-16">Dibuat Oleh,<br /><span className="font-bold">Bendahara Pelaksana</span></p>
                      <p className="font-bold underline text-gray-950">Ayeh Patoni</p>
                      <p className="text-[10px] text-gray-500 font-mono">PAN-HUT81-BENDAHARA</p>
                    </div>
                    <div>
                      <p className="mb-16">Dibuat Oleh,<br /><span className="font-bold">Sekretaris Pelaksana</span></p>
                      <p className="font-bold underline text-gray-950">Ahmad Mujibur Rahman</p>
                      <p className="text-[10px] text-gray-500 font-mono">PAN-HUT81-SEKRETARIS</p>
                    </div>
                    <div>
                      <p className="mb-16">Mengetahui,<br /><span className="font-bold">Ketua Panitia Lapangan</span></p>
                      <p className="font-bold underline text-gray-950">Anto / Zhipo</p>
                      <p className="text-[10px] text-gray-500 font-mono">PAN-HUT81-KETUA</p>
                    </div>
                    <div>
                      <p className="mb-16">Menyetujui,<br /><span className="font-bold">Ketua RT.002 / RW.003</span></p>
                      <p className="font-bold underline text-gray-950">Sunardi</p>
                      <p className="text-[10px] text-gray-500 font-sans">Ketua RT.002</p>
                    </div>
                  </div>
                </div>

                {/* Print watermark */}
                <div className="hidden print:block text-center mt-12 text-[9px] text-gray-400 font-sans border-t pt-2 border-gray-200">
                  Sistem Informasi Panitia Lapangan HUT RI ke-81 &bull; Dicetak secara resmi via Aplikasi Web RT 02 RW 03 pada {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>

              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
