import { useState } from 'react';
import { Kas, IuranKK, Lomba, LaporanIuranMingguan } from '../types';
import ModalCetakKwitansiIuran from './ModalCetakKwitansiIuran';
import ModalGenerateKwitansiMassal from './ModalGenerateKwitansiMassal';
import { parseKeterangan, formatRupiah } from '../utils/formatters';
import { ArrowUpRight, ArrowDownRight, Search, Plus, Calendar, Clock, Landmark, Info, Users, CheckCircle2, AlertCircle, History, FileText, Printer, Download, Trash2, Edit, Eye, Camera, X, Scale, Building2, Factory, HandHeart, ChevronDown, ChevronUp, Layers, Table as TableIcon, Package } from 'lucide-react';

interface KeuanganDetailProps {
  kasList: Kas[];
  onOpenCatatKas: () => void;
  onOpenDonasiPerusahaan?: () => void;
  iuranKKList: IuranKK[];
  onOpenBayarIuran: () => void;
  onSelectKKAndPay: (kkId: number) => void;
  lombasList: Lomba[];
  onDeleteKas?: (id: number) => void;
  onEditKasClick?: (kas: Kas) => void;
  onDeleteKK?: (id: number) => void;
  isPengurus?: boolean;
  laporanMingguanList?: LaporanIuranMingguan[];
  onOpenLaporanMingguan?: () => void;
  onExportReportPdf?: (report: LaporanIuranMingguan) => void;
  onEditLaporanMingguan?: (report: LaporanIuranMingguan) => void;
  onDeleteLaporanMingguan?: (id: number) => void;
}

export default function KeuanganDetail({
  kasList,
  onOpenCatatKas,
  onOpenDonasiPerusahaan,
  iuranKKList,
  onOpenBayarIuran,
  onSelectKKAndPay,
  lombasList,
  onDeleteKas,
  onEditKasClick,
  onDeleteKK,
  isPengurus = false,
  laporanMingguanList = [],
  onOpenLaporanMingguan,
  onExportReportPdf,
  onEditLaporanMingguan,
  onDeleteLaporanMingguan,
}: KeuanganDetailProps) {
  const [search, setSearch] = useState('');
  const [tipeFilter, setTipeFilter] = useState<string>('all');
  const [subTab, setSubTab] = useState<'jurnal' | 'iuran' | 'laporan'>('jurnal');
  const [rtFilter, setRtFilter] = useState('all');
  const [selectedProofPhoto, setSelectedProofPhoto] = useState<string | null>(null);
  const [selectedReceiptKK, setSelectedReceiptKK] = useState<IuranKK | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isMassalReceiptOpen, setIsMassalReceiptOpen] = useState(false);
  const [expandedTransactions, setExpandedTransactions] = useState<Record<number, boolean>>({});
  const [jurnalViewMode, setJurnalViewMode] = useState<'cards' | 'table'>('cards');

  const toggleExpand = (id: number) => {
    setExpandedTransactions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Calculate KK contribution summary
  const totalKK = iuranKKList.length;
  const totalTargetIuran = totalKK * 50000;
  const totalIuranTerkumpul = iuranKKList.reduce((acc, curr) => acc + curr.terbayar, 0);
  const totalKekuranganIuran = Math.max(0, totalTargetIuran - totalIuranTerkumpul);
  
  const lunasCount = iuranKKList.filter(k => k.status === 'Lunas').length;
  const mencicilCount = iuranKKList.filter(k => k.status === 'Mencicil').length;
  const belumBayarCount = iuranKKList.filter(k => k.status === 'Belum Bayar').length;

  // Calculate general cash flow summary
  const standardPemasukan = kasList
    .filter(k => k.tipe === 'pemasukan' && !k.keterangan.includes('Iuran KK:'))
    .reduce((acc, curr) => acc + curr.jumlah, 0);
  const totalMasuk = standardPemasukan + totalIuranTerkumpul;
  const totalKeluar = kasList.filter(k => k.tipe === 'pengeluaran').reduce((acc, curr) => acc + curr.jumlah, 0);
  const sisaKas = totalMasuk - totalKeluar;

  const totalDonasiPerusahaan = kasList
    .filter(k => k.tipe === 'pemasukan' && (
      k.kategori.toLowerCase().includes('perusahaan') ||
      k.kategori.toLowerCase().includes('pabrik') ||
      k.kategori.toLowerCase().includes('csr') ||
      k.kategori.toLowerCase().includes('sponsorship') ||
      !!k.donatur_info?.nama_perusahaan
    ))
    .reduce((sum, curr) => sum + curr.jumlah, 0);

  const totalPemasukanLainnya = Math.max(0, totalMasuk - totalIuranTerkumpul - totalDonasiPerusahaan);

  const filteredKas = kasList.filter(k => {
    const matchSearch = k.keterangan.toLowerCase().includes(search.toLowerCase()) || 
                        k.kategori.toLowerCase().includes(search.toLowerCase()) ||
                        (k.donatur_info?.nama_perusahaan || '').toLowerCase().includes(search.toLowerCase()) ||
                        (k.jam || '').includes(search);
    let matchTipe = true;
    if (tipeFilter === 'pemasukan') matchTipe = k.tipe === 'pemasukan';
    else if (tipeFilter === 'pengeluaran') matchTipe = k.tipe === 'pengeluaran';
    else if (tipeFilter === 'donasi_perusahaan') {
      matchTipe = k.kategori.toLowerCase().includes('perusahaan') ||
                  k.kategori.toLowerCase().includes('pabrik') ||
                  k.kategori.toLowerCase().includes('csr') ||
                  !!k.donatur_info?.nama_perusahaan;
    } else if (tipeFilter === 'iuran_warga') {
      matchTipe = k.kategori.toLowerCase().includes('iuran') || k.keterangan.toLowerCase().includes('iuran kk:');
    }
    return matchSearch && matchTipe;
  });

  // Filter out individual citizen iuran entries from kasList for Section III of LPJ Akhir
  // and replace them with the weekly financial report summaries (rekap)
  const nonIuranKas = kasList.filter(k => 
    !(k.kategori.toLowerCase() === 'iuran warga' || k.keterangan.toLowerCase().includes('iuran kk:'))
  );

  const rekapMingguanKas: Kas[] = (laporanMingguanList || []).map((rep, idx) => ({
    id: 99000 + (typeof rep.id === 'number' ? rep.id : idx + 1),
    tanggal: rep.tanggal_lapor || rep.tanggal_selesai,
    tipe: 'pemasukan' as const,
    kategori: 'Iuran Warga (Rekap)',
    keterangan: `Rekapitulasi Penarikan Iuran Warga - ${rep.minggu_ke} (${rep.tanggal_mulai} s.d ${rep.tanggal_selesai})`,
    jumlah: rep.total_jumlah,
  }));

  const totalIuranFromKas = kasList
    .filter(k => k.kategori.toLowerCase() === 'iuran warga' || k.keterangan.toLowerCase().includes('iuran kk:'))
    .reduce((sum, curr) => sum + curr.jumlah, 0);

  const fallbackRekapKas: Kas[] = (rekapMingguanKas.length === 0 && totalIuranFromKas > 0) ? [{
    id: 99999,
    tanggal: kasList.find(k => k.kategori.toLowerCase() === 'iuran warga' || k.keterangan.toLowerCase().includes('iuran kk:'))?.tanggal || new Date().toISOString().split('T')[0],
    tipe: 'pemasukan' as const,
    kategori: 'Iuran Warga (Rekap)',
    keterangan: 'Total Rekapitulasi Penerimaan Iuran Warga (Akumulasi)',
    jumlah: totalIuranFromKas,
  }] : [];

  const lpjLedgerKasList = [
    ...nonIuranKas,
    ...(rekapMingguanKas.length > 0 ? rekapMingguanKas : fallbackRekapKas)
  ].sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());

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

          <div className="flex items-center gap-2 flex-wrap">
            {subTab === 'jurnal' && isPengurus && (
              <>
                {onOpenDonasiPerusahaan && (
                  <button
                    onClick={onOpenDonasiPerusahaan}
                    className="inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-xs cursor-pointer transition-all active:scale-95"
                    title="Catat Donasi dari Pabrik, Perusahaan, CSR, atau Pihak Tidak Terikat"
                  >
                    <Building2 size={14} />
                    + Donasi Pabrik / PT
                  </button>
                )}
                <button
                  onClick={onOpenCatatKas}
                  className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs cursor-pointer transition-all active:scale-95"
                >
                  <Plus size={14} />
                  Catat Keuangan
                </button>
              </>
            )}
            {subTab === 'iuran' && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsMassalReceiptOpen(true)}
                  className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs cursor-pointer transition-all active:scale-95"
                  title="Cetak massal kwitansi lunas dalam lembaran A4 hemat kertas"
                >
                  <Printer size={14} className="text-red-400" />
                  Cetak Massal Kwitansi (A4)
                </button>
                {isPengurus && (
                  <button
                    onClick={onOpenBayarIuran}
                    className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs cursor-pointer transition-all active:scale-95"
                  >
                    <Plus size={14} />
                    Bayar Iuran KK
                  </button>
                )}
              </div>
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
            <div className="p-4 bg-white border-b border-gray-100 flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="relative flex-1 w-full">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari keterangan belanja, barang, PT / Pabrik, PIC..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="w-full md:w-52">
                  <select
                    value={tipeFilter}
                    onChange={e => setTipeFilter(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-hidden text-gray-700 font-medium"
                  >
                    <option value="all">Semua Transaksi</option>
                    <option value="pemasukan">Uang Masuk / Debit (+)</option>
                    <option value="pengeluaran">Pengeluaran / Kredit (-)</option>
                    <option value="donasi_perusahaan">🏢 Donasi PT / Pabrik</option>
                    <option value="iuran_warga">👥 Iuran Warga</option>
                  </select>
                </div>

                {/* View Switcher Toggle */}
                <div className="flex bg-gray-100 p-1 rounded-xl shrink-0">
                  <button
                    type="button"
                    onClick={() => setJurnalViewMode('cards')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      jurnalViewMode === 'cards' ? 'bg-white text-red-600 shadow-3xs' : 'text-gray-500 hover:text-gray-700'
                    }`}
                    title="Tampilan Kartu Ringkas & Mobile-Friendly"
                  >
                    <Layers size={13} />
                    <span className="hidden sm:inline">Kartu</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setJurnalViewMode('table')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      jurnalViewMode === 'table' ? 'bg-white text-red-600 shadow-3xs' : 'text-gray-500 hover:text-gray-700'
                    }`}
                    title="Tampilan Tabel Lengkap Akuntansi"
                  >
                    <TableIcon size={13} />
                    <span className="hidden sm:inline">Tabel</span>
                  </button>
                </div>
              </div>
            </div>

            {filteredKas.length === 0 ? (
              <div className="p-12 text-center text-gray-400 font-medium text-xs">
                Belum ada transaksi keuangan yang cocok dengan pencarian Anda.
              </div>
            ) : jurnalViewMode === 'cards' ? (
              /* ================= 1. MODERN MOBILE-FRIENDLY CARDS VIEW ================= */
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3.5 bg-gray-50/40">
                {filteredKas.map((k) => {
                  const isCompany = k.kategori.toLowerCase().includes('perusahaan') ||
                                    k.kategori.toLowerCase().includes('pabrik') ||
                                    k.kategori.toLowerCase().includes('csr') ||
                                    !!k.donatur_info?.nama_perusahaan;
                  const parsed = parseKeterangan(k.keterangan);
                  const isExpanded = !!expandedTransactions[k.id];

                  return (
                    <div 
                      key={k.id}
                      className="bg-white border border-gray-150/90 rounded-2xl p-4 shadow-3xs hover:shadow-xs hover:border-gray-300 transition-all flex flex-col justify-between space-y-3"
                    >
                      {/* Top Bar: Date, Time, Category badge, In/Out Pill */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-700 bg-gray-100/90 px-2 py-0.5 rounded-md font-mono">
                            <Calendar size={11} className="text-gray-400" />
                            {k.tanggal}
                          </span>
                          {k.jam && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.5 rounded-md border border-blue-100/70">
                              <Clock size={10} className="text-blue-500" />
                              {k.jam} WIB
                            </span>
                          )}
                          {isCompany ? (
                            <span className="text-[10px] text-amber-800 font-bold px-2 py-0.5 bg-amber-50 border border-amber-200/80 rounded-md inline-flex items-center gap-1">
                              <Building2 size={11} className="text-amber-600" />
                              {k.kategori}
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-600 font-semibold px-2 py-0.5 bg-gray-50 border border-gray-200/60 rounded-md">
                              {k.kategori}
                            </span>
                          )}
                        </div>

                        {/* Debit/Kredit indicator tag */}
                        <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md font-sans tracking-wide shrink-0 ${
                          k.tipe === 'pemasukan' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {k.tipe === 'pemasukan' ? 'DEBIT (MASUK)' : 'KREDIT (KELUAR)'}
                        </span>
                      </div>

                      {/* Title & Item Breakdown */}
                      <div className="space-y-2">
                        <h4 className="font-bold text-gray-900 text-sm leading-snug">
                          {parsed.title}
                        </h4>

                        {/* Structured Donor Info if available */}
                        {k.donatur_info?.nama_perusahaan && (
                          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-2.5 text-xs text-amber-950 space-y-1">
                            <div className="flex items-center gap-1.5 font-bold">
                              <Factory size={13} className="text-amber-700 shrink-0" />
                              <span>Instansi / Pabrik: {k.donatur_info.nama_perusahaan}</span>
                            </div>
                            {k.donatur_info.sifat_donasi && (
                              <p className="text-[11px] text-amber-800">
                                Sifat: <span className="font-medium italic">{k.donatur_info.sifat_donasi}</span>
                              </p>
                            )}
                          </div>
                        )}

                        {/* Modern Expandable Rincian Items Badge */}
                        {parsed.hasRincian && (
                          <div className="mt-2 bg-slate-50 border border-slate-200/70 rounded-xl p-2.5 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-slate-700 inline-flex items-center gap-1.5">
                                <Package size={13} className="text-slate-500" />
                                {parsed.items.length} Rincian Barang Belanja
                              </span>
                              <button
                                type="button"
                                onClick={() => toggleExpand(k.id)}
                                className="text-[11px] font-bold text-red-600 hover:text-red-700 inline-flex items-center gap-1 cursor-pointer"
                              >
                                {isExpanded ? (
                                  <>Sembunyikan <ChevronUp size={13} /></>
                                ) : (
                                  <>Lihat Rincian <ChevronDown size={13} /></>
                                )}
                              </button>
                            </div>

                            {/* Collapsible item list */}
                            {isExpanded && (
                              <div className="pt-2 border-t border-slate-200/60 space-y-1.5 text-xs">
                                {parsed.items.map((it, idx) => (
                                  <div key={idx} className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-100 text-slate-800">
                                    <div className="min-w-0 pr-2">
                                      <p className="font-semibold text-gray-900 break-words leading-snug">• {it.name}</p>
                                      {it.qty > 1 && (
                                        <p className="text-[10px] text-gray-500 font-mono">
                                          {it.qty} item @ {formatRupiah(it.unitPrice)}
                                        </p>
                                      )}
                                    </div>
                                    <span className="font-mono font-bold text-gray-900 shrink-0 text-xs">
                                      {formatRupiah(it.total)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Bottom Row: Amount Highlight & Actions */}
                      <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
                        <div>
                          <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Nominal Transaksi:</span>
                          <span className={`text-base sm:text-lg font-mono font-black ${
                            k.tipe === 'pemasukan' ? 'text-emerald-600' : 'text-red-600'
                          }`}>
                            {k.tipe === 'pemasukan' ? '+' : '-'} {formatRupiah(k.jumlah)}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {k.bukti_foto && (
                            <button
                              type="button"
                              onClick={() => setSelectedProofPhoto(k.bukti_foto)}
                              className="inline-flex items-center gap-1 text-[11px] bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-bold px-2.5 py-1.5 rounded-xl transition-all cursor-pointer"
                              title="Lihat Bukti Foto"
                            >
                              <Camera size={13} />
                              <span className="hidden sm:inline">Foto</span>
                            </button>
                          )}

                          {isPengurus && (
                            <>
                              {onEditKasClick && (
                                <button
                                  type="button"
                                  onClick={() => onEditKasClick(k)}
                                  className="p-2 text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all cursor-pointer active:scale-95"
                                  title="Edit Transaksi"
                                >
                                  <Edit size={14} />
                                </button>
                              )}
                              {onDeleteKas && (
                                <button
                                  type="button"
                                  onClick={() => onDeleteKas(k.id)}
                                  className="p-2 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-all cursor-pointer active:scale-95"
                                  title="Hapus Transaksi"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* ================= 2. FULL ACCOUNTING TABLE VIEW ================= */
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[760px]">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] uppercase font-bold text-gray-500 tracking-wider">
                      <th className="p-3.5 w-36">Tanggal &amp; Waktu</th>
                      <th className="p-3.5 w-40">Kategori</th>
                      <th className="p-3.5">Keterangan Transaksi &amp; Entitas</th>
                      <th className="p-3.5 text-right text-emerald-700 w-40">Debit (Kas Masuk)</th>
                      <th className="p-3.5 text-right text-red-600 w-40">Kredit (Kas Keluar)</th>
                      <th className="p-3.5 text-center w-24">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs">
                    {filteredKas.map((k) => {
                      const isCompany = k.kategori.toLowerCase().includes('perusahaan') ||
                                        k.kategori.toLowerCase().includes('pabrik') ||
                                        k.kategori.toLowerCase().includes('csr') ||
                                        !!k.donatur_info?.nama_perusahaan;
                      const parsed = parseKeterangan(k.keterangan);
                      const isExpanded = !!expandedTransactions[k.id];

                      return (
                        <tr key={k.id} className="hover:bg-gray-50/60 transition-all">
                          <td className="p-3.5 font-mono text-gray-600 whitespace-nowrap align-top">
                            <div className="flex flex-col gap-1">
                              <span className="flex items-center gap-1.5 font-bold text-gray-800 text-[11px]">
                                <Calendar size={12} className="text-gray-400 shrink-0" />
                                {k.tanggal}
                              </span>
                              {k.jam && (
                                <span className="inline-flex items-center gap-1 text-[10px] text-blue-600 font-semibold bg-blue-50/80 px-1.5 py-0.5 rounded border border-blue-100 w-fit">
                                  <Clock size={10} className="text-blue-500 shrink-0" />
                                  {k.jam} WIB
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3.5 align-top">
                            {isCompany ? (
                              <span className="text-[10px] text-amber-800 font-bold px-2 py-0.5 bg-amber-50 border border-amber-200 rounded-md whitespace-nowrap inline-flex items-center gap-1">
                                <Building2 size={11} className="text-amber-600 shrink-0" />
                                {k.kategori}
                              </span>
                            ) : k.tipe === 'pemasukan' ? (
                              <span className="text-[10px] text-emerald-800 font-bold px-2 py-0.5 bg-emerald-50 border border-emerald-200 rounded-md whitespace-nowrap inline-flex items-center gap-1">
                                <Landmark size={11} className="text-emerald-600 shrink-0" />
                                {k.kategori}
                              </span>
                            ) : (
                              <span className="text-[10px] text-gray-700 font-bold px-2 py-0.5 bg-gray-100 border border-gray-200 rounded-md whitespace-nowrap inline-block">
                                {k.kategori}
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 align-top">
                            <div className="font-bold text-gray-800 leading-snug">{parsed.title}</div>

                            {/* Structured Company / Factory Donor Details */}
                            {k.donatur_info && (
                              <div className="mt-1.5 bg-amber-50/60 border border-amber-100/80 rounded-lg p-2 text-[11px] text-amber-900 space-y-0.5">
                                {k.donatur_info.nama_perusahaan && (
                                  <div className="flex items-center gap-1.5 font-bold">
                                    <Factory size={12} className="text-amber-700 shrink-0" />
                                    <span>Instansi / Pabrik: {k.donatur_info.nama_perusahaan}</span>
                                  </div>
                                )}
                                <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-amber-800">
                                  {k.donatur_info.sifat_donasi && <span>Sifat: <em>{k.donatur_info.sifat_donasi}</em></span>}
                                </div>
                              </div>
                            )}

                            {/* Structured Breakdown in Table */}
                            {parsed.hasRincian && (
                              <div className="mt-1.5">
                                <button
                                  type="button"
                                  onClick={() => toggleExpand(k.id)}
                                  className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-md transition-all cursor-pointer"
                                >
                                  <Package size={11} className="text-slate-500" />
                                  {parsed.items.length} Rincian Item Belanja
                                  {isExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                                </button>

                                {isExpanded && (
                                  <div className="mt-1.5 bg-gray-50 border border-gray-200 rounded-lg p-2 space-y-1 text-[11px]">
                                    {parsed.items.map((it, idx) => (
                                      <div key={idx} className="flex justify-between items-center text-gray-800 border-b border-gray-100 last:border-none pb-0.5">
                                        <span className="font-medium">• {it.name} {it.qty > 1 ? `(${it.qty}x)` : ''}</span>
                                        <span className="font-mono font-semibold text-gray-700">{formatRupiah(it.total)}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            {k.bukti_foto && (
                              <button
                                type="button"
                                onClick={() => setSelectedProofPhoto(k.bukti_foto)}
                                className="mt-1.5 inline-flex items-center gap-1 text-[9px] bg-blue-50 text-blue-600 border border-blue-100 font-bold px-2 py-0.5 rounded-md hover:bg-blue-100 transition-all cursor-pointer"
                              >
                                <Camera size={10} />
                                Lihat Bukti Foto
                              </button>
                            )}
                          </td>
                          <td className="p-3.5 text-right font-mono font-bold text-emerald-600 whitespace-nowrap align-top">
                            {k.tipe === 'pemasukan' ? (
                              <div className="flex flex-col items-end">
                                <span className="text-xs sm:text-sm text-emerald-600">+ {formatRupiah(k.jumlah)}</span>
                                <span className="text-[8px] bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded font-sans uppercase tracking-wider font-extrabold mt-0.5">
                                  DEBIT (MASUK)
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-300 font-normal">-</span>
                            )}
                          </td>
                          <td className="p-3.5 text-right font-mono font-bold text-red-500 whitespace-nowrap align-top">
                            {k.tipe === 'pengeluaran' ? (
                              <div className="flex flex-col items-end">
                                <span className="text-xs sm:text-sm text-red-500">- {formatRupiah(k.jumlah)}</span>
                                <span className="text-[8px] bg-red-50 text-red-700 px-1.5 py-0.2 rounded font-sans uppercase tracking-wider font-extrabold mt-0.5">
                                  KREDIT (KELUAR)
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-300 font-normal">-</span>
                            )}
                          </td>
                          <td className="p-3.5 text-center align-top">
                            {isPengurus ? (
                              <div className="flex items-center justify-center gap-1.5">
                                {onEditKasClick && (
                                  <button
                                    onClick={() => onEditKasClick(k)}
                                    className="p-1.5 text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-all cursor-pointer active:scale-95 shrink-0"
                                    title="Revisi / Edit Transaksi"
                                  >
                                    <Edit size={13} />
                                  </button>
                                )}

                                {onDeleteKas && (
                                  <button
                                    onClick={() => onDeleteKas(k.id)}
                                    className="p-1.5 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-all cursor-pointer active:scale-95 shrink-0"
                                    title="Hapus Transaksi"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-300 text-[10px]">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
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
            <div className="px-4 pb-2 flex flex-col md:flex-row gap-3 items-stretch md:items-center">
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

              <div className="flex items-center gap-1.5 flex-wrap">
                <div className="flex gap-1">
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

                <button
                  type="button"
                  onClick={() => setIsMassalReceiptOpen(true)}
                  className="inline-flex md:hidden items-center justify-center gap-1.5 bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-xs cursor-pointer w-full mt-1"
                >
                  <Printer size={14} className="text-red-400" />
                  Cetak Massal Kwitansi (A4)
                </button>
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
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedReceiptKK(kk);
                            setIsReceiptOpen(true);
                          }}
                          className="p-1 text-emerald-600 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-100 rounded-md transition-all cursor-pointer flex items-center gap-0.5 text-[9px] font-bold shadow-3xs"
                          title="Cetak Bukti Transaksi Iuran"
                        >
                          <Printer size={10} />
                          <span>Cetak</span>
                        </button>

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

            {/* ----------------- SECTION: LAPORAN MINGGUAN KAS IURAN ----------------- */}
            <div className="border-t border-gray-150 pt-5 px-4 pb-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 p-4 rounded-2xl border border-emerald-500/10">
                <div>
                  <h3 className="font-display font-black text-xs sm:text-sm text-emerald-800 uppercase tracking-wider flex items-center gap-2">
                    <History size={16} className="text-emerald-600 animate-pulse" />
                    Laporan Serah Terima Iuran Warga Perminggu
                  </h3>
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mt-0.5">
                    Arsip rekapitulasi penyetoran berkas &amp; uang iuran perminggu oleh pengurus RT
                  </p>
                </div>
                {isPengurus && onOpenLaporanMingguan && (
                  <button
                    onClick={onOpenLaporanMingguan}
                    className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-3 py-2 rounded-xl shadow-xs cursor-pointer transition-all active:scale-95 whitespace-nowrap"
                  >
                    <Camera size={12} />
                    Buat Laporan Mingguan
                  </button>
                )}
              </div>

              {laporanMingguanList.length === 0 ? (
                <div className="text-center py-8 bg-gray-50/50 border border-dashed border-gray-150 rounded-2xl text-gray-400 text-xs font-medium">
                  Belum ada laporan iuran mingguan yang dibuat. Klik tombol di atas untuk mengunggah laporan pertama.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {laporanMingguanList.map((rep) => (
                    <div key={rep.id} className="bg-white border border-gray-150 rounded-xl p-4 shadow-3xs hover:shadow-2xs transition-all flex gap-3.5 relative animate-fade-in">
                      {rep.bukti_foto && (
                        <div 
                          className="relative w-20 h-24 sm:w-24 sm:h-28 rounded-lg overflow-hidden border border-gray-200 group shrink-0 shadow-3xs cursor-zoom-in"
                          onClick={() => setSelectedProofPhoto(rep.bukti_foto)}
                        >
                          <img src={rep.bukti_foto} alt="Bukti Iuran" className="w-full h-full object-cover transition-transform group-hover:scale-105" referrerPolicy="no-referrer" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Eye size={16} className="text-white" />
                          </div>
                        </div>
                      )}
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                            <span className="text-[9px] bg-emerald-50 text-emerald-600 border border-emerald-100 font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded-md shrink-0">
                              {rep.minggu_ke}
                            </span>
                            <span className="text-[9px] text-gray-400 font-mono font-medium shrink-0">
                              {rep.tanggal_lapor}
                            </span>
                          </div>
                          <h4 className="font-bold text-gray-800 text-xs font-display mt-2 break-words">
                            Total: <span className="text-emerald-600 font-mono font-black text-sm">{formatRupiah(rep.total_jumlah)}</span>
                          </h4>
                          <p className="text-[10px] text-gray-400 font-semibold font-mono mt-1 leading-tight flex flex-wrap gap-x-1">
                            <span>Periode:</span>
                            <span className="break-all">{rep.tanggal_mulai} s/d {rep.tanggal_selesai}</span>
                          </p>
                          <p className="text-xs text-gray-600 mt-2 line-clamp-2 break-words">
                            {rep.keterangan}
                          </p>
                        </div>
                        <div className="pt-2 border-t border-gray-100 mt-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <span className="text-[9px] text-gray-400 font-medium leading-tight">
                            Dilaporkan oleh:<br className="sm:hidden" />
                            <strong className="text-gray-600 font-semibold ml-0.5 sm:ml-0">{rep.dilaporkan_oleh}</strong>
                          </span>
                          <div className="flex flex-wrap items-center gap-1 self-end sm:self-auto shrink-0">
                            {isPengurus ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => onEditLaporanMingguan?.(rep)}
                                  className="p-1.5 text-blue-600 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-all cursor-pointer active:scale-95 shadow-3xs"
                                  title="Edit Laporan Mingguan"
                                >
                                  <Edit size={11} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm(`Apakah Anda yakin ingin menghapus Laporan ${rep.minggu_ke}?`)) {
                                      onDeleteLaporanMingguan?.(rep.id);
                                    }
                                  }}
                                  className="p-1.5 text-red-600 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-all cursor-pointer active:scale-95 shadow-3xs"
                                  title="Hapus Laporan Mingguan"
                                >
                                  <Trash2 size={11} />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    alert("Akses Terbatas: Silakan login sebagai pengurus panitia terlebih dahulu (Gunakan tombol 'Login Pengurus' di kanan atas layar) untuk mengedit laporan.");
                                  }}
                                  className="p-1.5 text-gray-300 bg-gray-50 border border-gray-100 rounded-lg transition-all cursor-pointer"
                                  title="Login untuk Edit"
                                >
                                  <Edit size={11} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    alert("Akses Terbatas: Silakan login sebagai pengurus panitia terlebih dahulu (Gunakan tombol 'Login Pengurus' di kanan atas layar) untuk menghapus laporan.");
                                  }}
                                  className="p-1.5 text-gray-300 bg-gray-50 border border-gray-100 rounded-lg transition-all cursor-pointer"
                                  title="Login untuk Hapus"
                                >
                                  <Trash2 size={11} />
                                </button>
                              </>
                            )}
                            {onExportReportPdf && (
                              <button
                                type="button"
                                onClick={() => onExportReportPdf(rep)}
                                className="inline-flex items-center gap-1 text-[10px] bg-red-50 text-red-600 border border-red-100 font-bold px-2 py-1.5 rounded-lg hover:bg-red-100 transition-all cursor-pointer whitespace-nowrap active:scale-95 shadow-3xs"
                                title="Ekspor Laporan Mingguan ke PDF A4"
                              >
                                <Printer size={11} />
                                Cetak PDF
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* UU ITE Legal Notice at the bottom of the Weekly Report Tab */}
              <div className="mt-5 p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2 text-[11px] text-slate-500 leading-relaxed text-justify">
                <Scale size={14} className="text-slate-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Aturan Hukum Dokumen Elektronik (UU ITE):</strong> Berdasarkan Undang Undang ITE no. 11 Tahun 2008 yang mengatur Dokumen Elektronik dan informasi lain di dalamnya sebagai alat bukti yang sah dan dapat di pertanggung jawabkan.
                </span>
              </div>
            </div>
          </div>
        )}
        {subTab === 'laporan' && (
          <div className="p-6 space-y-6">
            {/* Dynamic style rule to make sure window.print() ONLY prints the LPJ preview */}
            <style dangerouslySetInnerHTML={{ __html: `
              @media print {
                @page {
                  size: A4 portrait;
                  margin: 8mm 8mm;
                }

                html, body {
                  background: #ffffff !important;
                  color: #000000 !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  width: 100% !important;
                  height: auto !important;
                  min-height: 0 !important;
                  overflow: visible !important;
                }

                #printable-a4-area, #printable-kwitansi-area, #print-area {
                  display: none !important;
                  height: 0 !important;
                  width: 0 !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  overflow: hidden !important;
                }

                #printable-lpj {
                  display: block !important;
                  visibility: visible !important;
                  position: static !important;
                  float: none !important;
                  width: 100% !important;
                  max-width: 100% !important;
                  height: auto !important;
                  min-height: 0 !important;
                  margin: 0 auto !important;
                  padding: 0 !important;
                  background: white !important;
                  color: black !important;
                  font-family: 'Times New Roman', Times, serif !important;
                  overflow: visible !important;
                  box-shadow: none !important;
                  border: none !important;
                }

                #printable-lpj * {
                  visibility: visible !important;
                }

                table {
                  width: 100% !important;
                  border-collapse: collapse !important;
                  page-break-inside: auto !important;
                }

                tr {
                  page-break-inside: avoid !important;
                  break-inside: avoid !important;
                }

                thead {
                  display: table-header-group !important;
                }

                tfoot {
                  display: table-footer-group !important;
                }

                .signature-block {
                  page-break-inside: avoid !important;
                  break-inside: avoid !important;
                }
              }
            ` }} />

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
                      <tr className="bg-emerald-50/50 font-semibold">
                        <td className="border border-gray-300 p-2 text-emerald-950">1. Total Penerimaan / Uang Masuk</td>
                        <td className="border border-gray-300 p-2 text-right font-mono font-bold text-emerald-700">{formatRupiah(totalMasuk)}</td>
                      </tr>
                      <tr className="text-[10px] text-gray-700 bg-white">
                        <td className="border border-gray-300 p-1.5 pl-6 font-normal">a. Akumulasi Iuran Warga (RT 01 s.d RT 05)</td>
                        <td className="border border-gray-300 p-1.5 text-right font-mono text-gray-800">{formatRupiah(totalIuranTerkumpul)}</td>
                      </tr>
                      <tr className="text-[10px] text-gray-700 bg-white">
                        <td className="border border-gray-300 p-1.5 pl-6 font-normal">b. Donasi Perusahaan / Pabrik / CSR (Pihak Tidak Terikat)</td>
                        <td className="border border-gray-300 p-1.5 text-right font-mono text-gray-800">{formatRupiah(totalDonasiPerusahaan)}</td>
                      </tr>
                      {totalPemasukanLainnya > 0 && (
                        <tr className="text-[10px] text-gray-700 bg-white">
                          <td className="border border-gray-300 p-1.5 pl-6 font-normal">c. Donatur Sukarela &amp; Pemasukan Kas Lainnya</td>
                          <td className="border border-gray-300 p-1.5 text-right font-mono text-gray-800">{formatRupiah(totalPemasukanLainnya)}</td>
                        </tr>
                      )}
                      <tr className="bg-red-50/40 font-semibold">
                        <td className="border border-gray-300 p-2 text-red-950">2. Total Realisasi Pengeluaran / Uang Keluar</td>
                        <td className="border border-gray-300 p-2 text-right font-mono font-bold text-red-600">{formatRupiah(totalKeluar)}</td>
                      </tr>
                      <tr className="bg-gray-100 font-bold text-gray-950">
                        <td className="border border-gray-300 p-2 text-sm">SISA SALDO KAS PANITIA (AKTIF)</td>
                        <td className="border border-gray-300 p-2 text-right font-mono text-sm">{formatRupiah(sisaKas)}</td>
                      </tr>
                    </tbody>
                  </table>
                  <p className="text-[9px] text-gray-500 mt-1.5 italic font-sans">
                    * Catatan: Seluruh dana pemasukan bersumber dari iuran wajib warga {formatRupiah(totalIuranTerkumpul)}, donasi perusahaan/pabrik (pihak tidak terikat), program CSR, serta sumbangan sukarela yang sah dan transparan.
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
                  <h4 className="font-bold text-gray-950 uppercase border-b border-gray-300 pb-1 mb-2 font-sans text-xs flex items-center justify-between">
                    <span>III. HISTORI BUKU JURNAL KAS MASUK DAN KELUAR</span>
                    <span className="text-[9px] font-mono text-gray-500 font-bold uppercase">(Kolom Rinci Waktu, Debit Kas Masuk &amp; Kredit Kas Keluar)</span>
                  </h4>
                  <div className="overflow-x-auto print:overflow-visible">
                    <table className="w-full border-collapse border border-gray-300 text-left font-sans text-[10px] min-w-[700px] print:min-w-0" style={{ tableLayout: 'fixed' }}>
                      <thead>
                        <tr className="bg-gray-100 text-gray-800">
                          <th className="border border-gray-300 p-1.5 whitespace-nowrap" style={{ width: '15%' }}>Tanggal &amp; Jam</th>
                          <th className="border border-gray-300 p-1.5 text-center" style={{ width: '8%' }}>Tipe</th>
                          <th className="border border-gray-300 p-1.5" style={{ width: '15%' }}>Kategori</th>
                          <th className="border border-gray-300 p-1.5" style={{ width: '38%' }}>Keterangan Transaksi &amp; Rincian</th>
                          <th className="border border-gray-300 p-1.5 text-right text-emerald-700" style={{ width: '12%' }}>Debit (Masuk)</th>
                          <th className="border border-gray-300 p-1.5 text-right text-red-600" style={{ width: '12%' }}>Kredit (Keluar)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {lpjLedgerKasList.map(k => {
                          const parsed = parseKeterangan(k.keterangan);
                          return (
                            <tr key={k.id}>
                              <td className="border border-gray-300 p-1.5 font-mono whitespace-nowrap align-top">
                                <span className="font-bold text-gray-900">{k.tanggal}</span>
                                {k.jam && <span className="block text-[9px] text-gray-600 font-semibold">{k.jam} WIB</span>}
                              </td>
                              <td className={`border border-gray-300 p-1.5 text-center font-bold align-top ${k.tipe === 'pemasukan' ? 'text-emerald-700' : 'text-red-600'}`}>
                                {k.tipe === 'pemasukan' ? 'MASUK' : 'KELUAR'}
                              </td>
                              <td className="border border-gray-300 p-1.5 font-medium align-top">{k.kategori}</td>
                              <td className="border border-gray-300 p-1.5 align-top">
                                <span className="font-bold text-gray-950 block">{parsed.title}</span>

                                {/* Donor Details if applicable */}
                                {k.donatur_info?.nama_perusahaan && (
                                  <span className="block text-[8.5px] text-amber-900 italic mt-0.5 font-medium">
                                    [Donatur: {k.donatur_info.nama_perusahaan} {k.donatur_info.sifat_donasi ? `| Sifat: ${k.donatur_info.sifat_donasi}` : ''}]
                                  </span>
                                )}

                                {/* Neat, compact breakdown box for LPJ print & preview */}
                                {parsed.hasRincian && (
                                  <div className="mt-1 bg-gray-50/90 border border-gray-200/90 p-1.5 rounded text-[8px] font-sans">
                                    <span className="font-bold text-gray-700 block uppercase tracking-wider text-[7px] mb-0.5">
                                      Rincian Item Pembelanjaan ({parsed.items.length} Item):
                                    </span>
                                    <div className="space-y-0.5">
                                      {parsed.items.map((it, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-gray-800 border-b border-gray-100 last:border-none pb-0.5">
                                          <span className="truncate pr-1 font-medium">• {it.name} {it.qty > 1 ? `(${it.qty} item)` : ''}</span>
                                          <span className="font-mono font-bold text-gray-700 shrink-0">{formatRupiah(it.total)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </td>
                              <td className="border border-gray-300 p-1.5 text-right font-mono font-bold text-emerald-700 align-top whitespace-nowrap">
                                {k.tipe === 'pemasukan' ? formatRupiah(k.jumlah) : '-'}
                              </td>
                              <td className="border border-gray-300 p-1.5 text-right font-mono font-bold text-red-600 align-top whitespace-nowrap">
                                {k.tipe === 'pengeluaran' ? formatRupiah(k.jumlah) : '-'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 6. Section IV: Detail Status & Update Terakhir Iuran Warga per KK */}
                <div className="mb-8">
                  <h4 className="font-bold text-gray-950 uppercase border-b border-gray-300 pb-1 mb-2 font-sans text-xs flex justify-between items-center">
                    <span>IV. RINCIAN HASIL UPDATE TERAKHIR IURAN WARGA (PER KEPALA KELUARGA)</span>
                    <span className="text-[10px] font-mono text-emerald-700 font-bold">Total Terkumpul: {formatRupiah(totalIuranTerkumpul)}</span>
                  </h4>

                  {/* Summary Ringkasan Iuran */}
                  <div className="grid grid-cols-4 gap-2 mb-3 text-[10px] font-sans">
                    <div className="p-2 bg-gray-50 border border-gray-200 rounded-xs text-center">
                      <span className="text-gray-500 text-[8px] block uppercase font-bold">Total KK Registered</span>
                      <strong className="text-gray-900 font-bold text-xs">{totalKK} KK</strong>
                    </div>
                    <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xs text-center">
                      <span className="text-emerald-700 text-[8px] block uppercase font-bold">Lunas (Rp 50rb)</span>
                      <strong className="text-emerald-700 font-bold text-xs">{lunasCount} KK</strong>
                    </div>
                    <div className="p-2 bg-amber-50 border border-amber-200 text-amber-900 rounded-xs text-center">
                      <span className="text-amber-700 text-[8px] block uppercase font-bold">Mencicil / Angsur</span>
                      <strong className="text-amber-700 font-bold text-xs">{mencicilCount} KK</strong>
                    </div>
                    <div className="p-2 bg-red-50 border border-red-200 text-red-900 rounded-xs text-center">
                      <span className="text-red-700 text-[8px] block uppercase font-bold">Belum Bayar</span>
                      <strong className="text-red-700 font-bold text-xs">{belumBayarCount} KK</strong>
                    </div>
                  </div>

                  <div className="overflow-x-auto print:overflow-visible">
                    <table className="w-full border-collapse border border-gray-300 text-left font-sans text-[10px] min-w-[650px] print:min-w-0">
                      <thead>
                        <tr className="bg-gray-100 text-gray-800">
                          <th className="border border-gray-300 p-1.5 w-7 text-center">No</th>
                          <th className="border border-gray-300 p-1.5">Nama Kepala Keluarga (KK)</th>
                          <th className="border border-gray-300 p-1.5 w-12 text-center">RT</th>
                          <th className="border border-gray-300 p-1.5 w-20 text-center">Status</th>
                          <th className="border border-gray-300 p-1.5 text-right w-20">Target</th>
                          <th className="border border-gray-300 p-1.5 text-right w-20">Terbayar</th>
                          <th className="border border-gray-300 p-1.5 text-right w-20">Sisa</th>
                          <th className="border border-gray-300 p-1.5 w-28">Update / Angsuran Terakhir</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {iuranKKList.map((kk, idx) => {
                          const sisa = Math.max(0, kk.target - kk.terbayar);
                          const lastPayment = kk.riwayat && kk.riwayat.length > 0 ? kk.riwayat[kk.riwayat.length - 1] : null;
                          return (
                            <tr key={kk.id}>
                              <td className="border border-gray-300 p-1.5 text-center font-mono text-gray-500">{idx + 1}</td>
                              <td className="border border-gray-300 p-1.5 font-bold text-gray-900">{kk.nama_kk}</td>
                              <td className="border border-gray-300 p-1.5 text-center font-medium">{kk.rt}</td>
                              <td className="border border-gray-300 p-1.5 text-center">
                                <span className={`px-1.5 py-0.5 rounded-xs font-bold text-[8px] uppercase tracking-wider ${
                                  kk.status === 'Lunas' ? 'bg-emerald-100 text-emerald-800' :
                                  kk.status === 'Mencicil' ? 'bg-amber-100 text-amber-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {kk.status}
                                </span>
                              </td>
                              <td className="border border-gray-300 p-1.5 text-right font-mono">{formatRupiah(kk.target)}</td>
                              <td className="border border-gray-300 p-1.5 text-right font-mono font-bold text-emerald-700">{formatRupiah(kk.terbayar)}</td>
                              <td className={`border border-gray-300 p-1.5 text-right font-mono ${sisa > 0 ? 'text-red-600 font-semibold' : 'text-gray-400'}`}>
                                {sisa > 0 ? formatRupiah(sisa) : 'Rp 0'}
                              </td>
                              <td className="border border-gray-300 p-1.5 font-mono text-[9px] text-gray-700">
                                {lastPayment ? (
                                  <div className="leading-tight">
                                    <span className="font-semibold text-gray-900 whitespace-nowrap">{lastPayment.tanggal}</span>
                                    <span className="text-emerald-700 ml-1 font-bold whitespace-nowrap">(+{formatRupiah(lastPayment.jumlah)})</span>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 italic">Belum bayar</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
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

        {selectedProofPhoto && (
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in cursor-zoom-out" 
            onClick={() => setSelectedProofPhoto(null)}
          >
            <div 
              className="relative max-w-3xl w-full bg-white p-2 rounded-2xl overflow-hidden shadow-2xl flex flex-col" 
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedProofPhoto(null)}
                className="absolute top-4 right-4 bg-black/60 text-white p-2 rounded-full hover:bg-black/80 transition-all cursor-pointer z-10"
                title="Tutup"
              >
                <X size={18} />
              </button>
              <img src={selectedProofPhoto} alt="Bukti Transaksi" className="max-h-[80vh] w-full object-contain rounded-xl" referrerPolicy="no-referrer" />
            </div>
          </div>
        )}

        <ModalCetakKwitansiIuran
          isOpen={isReceiptOpen}
          onClose={() => {
            setIsReceiptOpen(false);
            setSelectedReceiptKK(null);
          }}
          kk={selectedReceiptKK}
        />

        <ModalGenerateKwitansiMassal
          isOpen={isMassalReceiptOpen}
          onClose={() => setIsMassalReceiptOpen(false)}
          iuranKKList={iuranKKList}
        />

      </div>
    </div>
  );
}
