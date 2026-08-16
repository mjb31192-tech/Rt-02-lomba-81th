import React, { useState, useMemo } from 'react';
import { IuranKK } from '../types';
import { formatRupiah } from '../utils/formatters';
import { 
  X, Printer, CheckCircle2, Filter, Search, FileText, 
  Layers, CheckSquare, Square, RefreshCw, Landmark, 
  Building2, Users, Download, HelpCircle, Eye, EyeOff, Scissors
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ModalGenerateKwitansiMassalProps {
  isOpen: boolean;
  onClose: () => void;
  iuranKKList: IuranKK[];
}

// Indonesian Terbilang helper for receipts
function terbilang(nominal: number): string {
  const bil = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];
  let temp = "";
  if (nominal < 12) {
    temp = " " + bil[nominal];
  } else if (nominal < 20) {
    temp = terbilang(nominal - 10) + " Belas";
  } else if (nominal < 100) {
    temp = terbilang(Math.floor(nominal / 10)) + " Puluh" + terbilang(nominal % 10);
  } else if (nominal < 200) {
    temp = " Seratus" + terbilang(nominal - 100);
  } else if (nominal < 1000) {
    temp = terbilang(Math.floor(nominal / 100)) + " Ratus" + terbilang(nominal % 100);
  } else if (nominal < 2000) {
    temp = " Seribu" + terbilang(nominal - 1000);
  } else if (nominal < 1000000) {
    temp = terbilang(Math.floor(nominal / 1000)) + " Ribu" + terbilang(nominal % 1000);
  } else if (nominal < 1000000000) {
    temp = terbilang(Math.floor(nominal / 1000000)) + " Juta" + terbilang(nominal % 1000000);
  }
  return temp.trim();
}

function formatTerbilang(num: number): string {
  if (!num || num === 0) return "Nol Rupiah";
  return terbilang(num) + " Rupiah";
}

// Generate receipt number
function getReceiptNumber(kkId: number, rt: string): string {
  const cleanRt = (rt || '01').replace(/\D/g, '').padStart(2, '0');
  const cleanId = String(kkId).padStart(3, '0');
  return `KW-81/RT${cleanRt}/${cleanId}`;
}

export default function ModalGenerateKwitansiMassal({
  isOpen,
  onClose,
  iuranKKList,
}: ModalGenerateKwitansiMassalProps) {
  // Filters & layout configuration
  const [statusFilter, setStatusFilter] = useState<'lunas' | 'mencicil_lunas' | 'all'>('lunas');
  const [rtFilter, setRtFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [itemsPerPage, setItemsPerPage] = useState<4 | 3 | 6>(4); // Default 4 kwitansi per lembar A4 (Grid 2x2)
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(true);
  const [tanggalCetak, setTanggalCetak] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [namaBendahara, setNamaBendahara] = useState<string>('Bendahara Panitia');
  const [tampilkanStempel, setTampilkanStempel] = useState<boolean>(true);

  // Filter available KKs based on current filter state
  const availableKKs = useMemo(() => {
    return iuranKKList.filter(kk => {
      // Status filtering
      if (statusFilter === 'lunas' && kk.status !== 'Lunas') return false;
      if (statusFilter === 'mencicil_lunas' && kk.terbayar <= 0) return false;
      
      // RT filtering
      if (rtFilter !== 'all' && kk.rt !== rtFilter) return false;

      // Search filtering
      if (search) {
        const query = search.toLowerCase();
        const matchName = kk.nama_kk.toLowerCase().includes(query);
        const matchRt = kk.rt.toLowerCase().includes(query);
        if (!matchName && !matchRt) return false;
      }

      return true;
    });
  }, [iuranKKList, statusFilter, rtFilter, search]);

  // Initial selection when opening or changing filters: select all available matching KKs
  React.useEffect(() => {
    if (isOpen) {
      // Auto select available KKs
      const lunasIds = availableKKs.map(k => k.id);
      setSelectedIds(lunasIds);
    }
  }, [isOpen, statusFilter, rtFilter]);

  // Get list of currently selected KK objects
  const selectedKKs = useMemo(() => {
    return availableKKs.filter(kk => selectedIds.includes(kk.id));
  }, [availableKKs, selectedIds]);

  // Group selected receipts into pages (e.g., 4 or 3 or 6 per A4 sheet)
  const pages = useMemo(() => {
    const result: IuranKK[][] = [];
    for (let i = 0; i < selectedKKs.length; i += itemsPerPage) {
      result.push(selectedKKs.slice(i, i + itemsPerPage));
    }
    return result;
  }, [selectedKKs, itemsPerPage]);

  const handleToggleSelectAll = () => {
    if (selectedIds.length === availableKKs.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(availableKKs.map(k => k.id));
    }
  };

  const handleToggleKK = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handlePrint = () => {
    setTimeout(() => {
      window.print();
    }, 150);
  };

  if (!isOpen) return null;

  return (
    <div 
      id="modal-generate-kwitansi-massal" 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto"
    >
      {/* 
        ========================================================================
        ISOLATED CSS PRINT ENGINE FOR A4 MULTI-RECEIPT GENERATOR
        ========================================================================
      */}
      <style>{`
        /* Hide print area in screen view */
        @media screen {
          #print-area-kwitansi-massal {
            display: none !important;
          }
        }

        /* Print Mode: Hide UI, Render exact A4 pages with zero overflow */
        @media print {
          header, main, nav, footer, .no-print, #root > *:not(#modal-generate-kwitansi-massal) {
            display: none !important;
            height: 0 !important;
            overflow: hidden !important;
          }

          /* Reset viewport & background for crystal clean paper print */
          html, body {
            background: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: auto !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          #modal-generate-kwitansi-massal {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            backdrop-filter: none !important;
            overflow: visible !important;
            z-index: 9999 !important;
          }

          #modal-generate-kwitansi-massal > div:first-child {
            display: none !important;
          }

          #print-area-kwitansi-massal {
            display: block !important;
            visibility: visible !important;
            width: 100% !important;
            margin: 0 auto !important;
            padding: 0 !important;
          }

          /* A4 Sheet Dimensions */
          .a4-print-page {
            width: 210mm !important;
            min-height: 297mm !important;
            height: 297mm !important;
            margin: 0 auto !important;
            padding: 8mm !important;
            box-sizing: border-box !important;
            page-break-after: always !important;
            break-after: page !important;
            background: white !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            position: relative !important;
          }

          .a4-print-page:last-child {
            page-break-after: avoid !important;
            break-after: avoid !important;
          }

          @page {
            size: A4 portrait;
            margin: 0mm;
          }
        }
      `}</style>

      {/* MODAL DIALOG CONTAINER (SCREEN VIEW) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white border border-gray-200 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden text-gray-900 my-auto"
      >
        {/* Header Bar */}
        <div className="p-4 sm:p-5 bg-linear-to-r from-red-600 to-rose-700 text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/15 rounded-xl backdrop-blur-xs border border-white/20">
              <Printer size={22} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg tracking-tight">
                  Cetak Massal Kwitansi Iuran Warga (Format A4)
                </h3>
                <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/30 uppercase tracking-wider">
                  Fitur Panitia
                </span>
              </div>
              <p className="text-xs text-red-100 mt-0.5">
                Konversi beberapa kwitansi ke 1 lembar A4 hemat kertas, bergaris potong, dan mudah dibaca
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
            title="Tutup Modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Control Bar & Filters */}
        <div className="p-4 bg-gray-50 border-b border-gray-200 space-y-3 shrink-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {/* 1. Status Filter */}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Kriteria Status Iuran
              </label>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className="w-full text-xs font-semibold bg-white border border-gray-300 rounded-xl px-3 py-2 focus:ring-1 focus:ring-red-500 focus:outline-hidden"
              >
                <option value="lunas">✅ Hanya KK Lunas (100%)</option>
                <option value="mencicil_lunas">💰 Lunas &amp; Mencicil (Ada Setoran)</option>
                <option value="all">👥 Semua KK Terdaftar</option>
              </select>
            </div>

            {/* 2. RT Filter */}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Wilayah RT
              </label>
              <select
                value={rtFilter}
                onChange={e => setRtFilter(e.target.value)}
                className="w-full text-xs font-semibold bg-white border border-gray-300 rounded-xl px-3 py-2 focus:ring-1 focus:ring-red-500 focus:outline-hidden"
              >
                <option value="all">Semua Wilayah RT</option>
                <option value="RT 01">RT 01</option>
                <option value="RT 02">RT 02</option>
                <option value="RT 03">RT 03</option>
                <option value="RT 04">RT 04</option>
              </select>
            </div>

            {/* 3. Layout Per Lembar */}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Jumlah Kwitansi per A4
              </label>
              <select
                value={itemsPerPage}
                onChange={e => setItemsPerPage(Number(e.target.value) as any)}
                className="w-full text-xs font-bold bg-white border border-gray-300 rounded-xl px-3 py-2 focus:ring-1 focus:ring-red-500 focus:outline-hidden text-red-700"
              >
                <option value={4}>⭐ 4 Kwitansi / Lembar (Grid 2x2 - Ideal &amp; Jelas)</option>
                <option value={3}>📄 3 Kwitansi / Lembar (Format Slip 1 Kolom)</option>
                <option value={6}>⚡ 6 Kwitansi / Lembar (Grid 2x3 - Hemat Kertas)</option>
              </select>
            </div>

            {/* 4. Search Box */}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Cari Nama KK
              </label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Ketik nama KK..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full text-xs bg-white border border-gray-300 rounded-xl pl-8 pr-3 py-2 focus:ring-1 focus:ring-red-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Quick Selection Bar & Customization Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-200/80 text-xs">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleToggleSelectAll}
                className="inline-flex items-center gap-1.5 font-bold text-gray-700 hover:text-red-600 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-3xs transition-all cursor-pointer"
              >
                {selectedIds.length === availableKKs.length && availableKKs.length > 0 ? (
                  <>
                    <CheckSquare size={15} className="text-red-600" />
                    <span>Batal Pilih Semua</span>
                  </>
                ) : (
                  <>
                    <Square size={15} className="text-gray-400" />
                    <span>Pilih Semua ({availableKKs.length} KK)</span>
                  </>
                )}
              </button>

              <span className="text-gray-500 font-medium">
                Terpilih: <strong className="text-red-600 font-black">{selectedKKs.length}</strong> kwitansi
                {selectedKKs.length > 0 && (
                  <span className="ml-1 text-slate-700 font-bold">
                    ({pages.length} lembar A4)
                  </span>
                )}
              </span>
            </div>

            {/* Custom Options */}
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-1.5 cursor-pointer text-gray-700 text-xs font-semibold">
                <input
                  type="checkbox"
                  checked={tampilkanStempel}
                  onChange={e => setTampilkanStempel(e.target.checked)}
                  className="rounded text-red-600 focus:ring-red-500"
                />
                <span>Cap Stempel Digital</span>
              </label>

              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-gray-500 font-bold">Tgl Cetak:</span>
                <input
                  type="date"
                  value={tanggalCetak}
                  onChange={e => setTanggalCetak(e.target.value)}
                  className="text-xs bg-white border border-gray-300 rounded-lg px-2 py-1 focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content: Live Interactive Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/70 space-y-6">
          {selectedKKs.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center max-w-md mx-auto shadow-xs">
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText size={24} />
              </div>
              <h4 className="font-bold text-gray-800 text-sm">Tidak Ada Kwitansi Terpilih</h4>
              <p className="text-xs text-gray-500 mt-1">
                Silakan sesuaikan kriteria status iuran atau centang nama KK warga yang ingin dicetak kwitansinya.
              </p>
            </div>
          ) : (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-700 font-bold">
                  <Layers size={16} className="text-red-600" />
                  <span>Pratinjau Lembar A4 ({pages.length} Halaman Siap Cetak)</span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">
                  Ukuran presisi A4 Portrait • Garis gunting otomatis
                </span>
              </div>

              {/* RENDER PAGES PREVIEW */}
              {pages.map((pageItems, pageIdx) => (
                <div 
                  key={pageIdx}
                  className="bg-white border-2 border-gray-300 rounded-xl shadow-md p-4 sm:p-6 space-y-4 relative"
                >
                  {/* Page Indicator Tag */}
                  <div className="flex items-center justify-between border-b border-gray-200 pb-2.5 text-xs">
                    <span className="font-bold text-gray-800 bg-gray-100 px-2.5 py-1 rounded-md">
                      📄 Halaman {pageIdx + 1} dari {pages.length} (Memuat {pageItems.length} Kwitansi)
                    </span>
                    <span className="text-[11px] text-gray-400 font-mono">
                      A4 Standard • 210 x 297 mm
                    </span>
                  </div>

                  {/* Kwitansi Grid depending on itemsPerPage */}
                  <div className={`grid gap-4 ${
                    itemsPerPage === 4 ? 'grid-cols-1 md:grid-cols-2' :
                    itemsPerPage === 3 ? 'grid-cols-1' :
                    'grid-cols-1 md:grid-cols-2'
                  }`}>
                    {pageItems.map((kk) => {
                      const receiptNo = getReceiptNumber(kk.id, kk.rt);
                      const isLunas = kk.status === 'Lunas';
                      return (
                        <div 
                          key={kk.id}
                          className="border border-gray-400 rounded-lg p-3 bg-white relative text-gray-900 shadow-2xs hover:border-red-400 transition-all flex flex-col justify-between"
                          style={{ minHeight: itemsPerPage === 3 ? '180px' : '230px' }}
                        >
                          {/* Top KOP */}
                          <div>
                            <div className="flex items-center justify-between border-b border-gray-300 pb-1.5">
                              <div className="flex items-center gap-1.5">
                                <div className="w-5 h-3.5 bg-red-600 rounded-xs border border-gray-400 flex flex-col overflow-hidden">
                                  <div className="h-1/2 bg-red-600" />
                                  <div className="h-1/2 bg-white" />
                                </div>
                                <div>
                                  <span className="text-[9px] font-black uppercase tracking-wider text-gray-900 block leading-tight">
                                    PANITIA HUT KE-81 RI • RT.002/RW.003
                                  </span>
                                  <span className="text-[7.5px] text-gray-500 block leading-none">
                                    BUKTI TANDA TERIMA IURAN RESMI
                                  </span>
                                </div>
                              </div>

                              <div className="text-right font-mono">
                                <span className="text-[8px] text-gray-500 font-bold block">NO. KWITANSI</span>
                                <span className="text-[9px] font-black text-red-700 block">{receiptNo}</span>
                              </div>
                            </div>

                            {/* Receipt Body */}
                            <div className="mt-2 space-y-1.5 text-[10px]">
                              <div className="flex justify-between items-baseline border-b border-gray-100 pb-1">
                                <span className="text-gray-500 text-[9px] w-28 shrink-0">Telah Terima Dari :</span>
                                <span className="font-bold text-gray-950 text-[11px] truncate">{kk.nama_kk}</span>
                              </div>

                              <div className="flex justify-between items-baseline border-b border-gray-100 pb-1">
                                <span className="text-gray-500 text-[9px] w-28 shrink-0">Wilayah Warga :</span>
                                <span className="font-bold text-gray-800 bg-gray-100 px-1.5 py-0.2 rounded text-[9px]">
                                  {kk.rt} / RW 003
                                </span>
                              </div>

                              <div className="flex justify-between items-baseline border-b border-gray-100 pb-1">
                                <span className="text-gray-500 text-[9px] w-28 shrink-0">Untuk Keperluan :</span>
                                <span className="font-semibold text-gray-800 text-[9.5px]">
                                  Iuran Peringatan PHBN HUT RI Ke-81
                                </span>
                              </div>

                              {/* Highlight Amount Box */}
                              <div className="my-1.5 p-2 bg-emerald-50/80 border border-emerald-300 rounded-md flex items-center justify-between">
                                <div>
                                  <span className="text-[8px] font-bold text-emerald-800 uppercase block tracking-wider">
                                    Jumlah Terbayar (Sah):
                                  </span>
                                  <span className="text-sm font-black font-mono text-emerald-900">
                                    {formatRupiah(kk.terbayar)}
                                  </span>
                                </div>
                                <span className={`text-[8.5px] font-black uppercase px-2 py-0.5 rounded border ${
                                  isLunas 
                                    ? 'bg-emerald-600 text-white border-emerald-700' 
                                    : 'bg-amber-100 text-amber-900 border-amber-300'
                                }`}>
                                  {kk.status}
                                </span>
                              </div>

                              {/* Terbilang */}
                              <div className="text-[8px] italic text-gray-600 bg-gray-50 p-1 rounded border border-gray-150">
                                Terbilang: <span className="font-semibold text-gray-800">"{formatTerbilang(kk.terbayar)}"</span>
                              </div>
                            </div>
                          </div>

                          {/* Signatures & Stamp */}
                          <div className="mt-3 pt-2 border-t border-gray-200 flex items-end justify-between relative text-[8.5px]">
                            {/* Warga */}
                            <div className="text-center w-24">
                              <span className="text-gray-400 block text-[7.5px]">Warga / Pembayar</span>
                              <div className="h-6" />
                              <span className="font-bold text-gray-900 block border-t border-gray-400 pt-0.5 truncate">
                                {kk.nama_kk}
                              </span>
                            </div>

                            {/* Digital Stamp if enabled */}
                            {tampilkanStempel && (
                              <div className="absolute left-1/2 -translate-x-1/2 bottom-0 pointer-events-none opacity-85">
                                <div className="border border-red-600 text-red-600 rounded px-1.5 py-0.5 text-[7px] font-black uppercase tracking-widest text-center rotate-[-6deg] bg-white/70 backdrop-blur-2xs shadow-3xs">
                                  ★ LUNAS ★<br />
                                  PANITIA PHBN 81
                                </div>
                              </div>
                            )}

                            {/* Panitia / Bendahara */}
                            <div className="text-center w-28">
                              <span className="text-gray-500 block text-[7.5px] whitespace-nowrap">
                                Sidoarjo, {tanggalCetak}
                              </span>
                              <div className="h-6 flex items-center justify-center">
                                <span className="text-[7.5px] font-mono text-gray-400 italic">(Tanda Tangan)</span>
                              </div>
                              <span className="font-bold text-gray-900 block border-t border-gray-400 pt-0.5">
                                {namaBendahara}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Cut Lines Helper Guide */}
                  <div className="pt-2 border-t border-dashed border-gray-300 flex items-center justify-center gap-1 text-[9px] text-gray-400 font-mono">
                    <Scissors size={12} className="text-gray-400" />
                    <span>Garis Potong Lembaran Kwitansi A4</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-gray-600 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>
              Siap cetak ke printer fisik atau simpan sebagai <strong>PDF A4 High Resolution</strong>.
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handlePrint}
              disabled={selectedKKs.length === 0}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              <Printer size={16} />
              <span>Cetak {selectedKKs.length} Kwitansi ({pages.length} Lembar A4)</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* 
        ========================================================================
        PRINT AREA FOR BROWSER PRINT ENGINE (A4 SHEETS ONLY)
        ========================================================================
      */}
      <div id="print-area-kwitansi-massal">
        {pages.map((pageItems, pageIdx) => (
          <div key={pageIdx} className="a4-print-page">
            {/* Sheet Header (Lightweight) */}
            <div className="flex items-center justify-between border-b border-gray-300 pb-1 mb-2 text-[8px] text-gray-500 font-mono">
              <span>LEMBAR KWITANSI IURAN WARGA RT.002 / RW.003 • HUT KE-81 RI</span>
              <span>HALAMAN {pageIdx + 1} DARI {pages.length}</span>
            </div>

            {/* Main Layout depending on itemsPerPage */}
            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: itemsPerPage === 3 ? '1fr' : '1fr 1fr',
                gridTemplateRows: itemsPerPage === 4 ? '1fr 1fr' : itemsPerPage === 3 ? '1fr 1fr 1fr' : '1fr 1fr 1fr',
                gap: '5mm',
                flex: 1,
                alignContent: 'stretch'
              }}
            >
              {pageItems.map((kk) => {
                const receiptNo = getReceiptNumber(kk.id, kk.rt);
                const isLunas = kk.status === 'Lunas';
                return (
                  <div 
                    key={kk.id}
                    style={{
                      border: '1.2px solid #334155',
                      borderRadius: '6px',
                      padding: '4mm',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      backgroundColor: '#ffffff',
                      position: 'relative',
                      boxSizing: 'border-box'
                    }}
                  >
                    {/* Header KOP Slip */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #94a3b8', paddingBottom: '2mm' }}>
                        <div>
                          <div style={{ fontSize: '9pt', fontWeight: '900', color: '#0f172a', letterSpacing: '0.5px' }}>
                            PANITIA PERINGATAN HUT KE-81 RI
                          </div>
                          <div style={{ fontSize: '7.5pt', color: '#475569', fontWeight: '600' }}>
                            RUKUN TETANGGA 002 / RUKUN WARGA 003 • GUYUB MERDEKA
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '6.5pt', color: '#64748b', fontWeight: 'bold' }}>NO. KWITANSI</div>
                          <div style={{ fontSize: '8.5pt', fontWeight: '900', color: '#b91c1c', fontFamily: 'monospace' }}>{receiptNo}</div>
                        </div>
                      </div>

                      {/* Content Fields */}
                      <div style={{ marginTop: '2.5mm', fontSize: '8.5pt', lineHeight: '1.35', color: '#1e293b' }}>
                        <div style={{ display: 'flex', borderBottom: '0.5px solid #e2e8f0', padding: '1mm 0' }}>
                          <div style={{ width: '30mm', color: '#64748b', fontSize: '8pt' }}>Telah Terima Dari</div>
                          <div style={{ width: '3mm' }}>:</div>
                          <div style={{ flex: 1, fontWeight: '800', color: '#0f172a', fontSize: '9pt' }}>{kk.nama_kk}</div>
                        </div>

                        <div style={{ display: 'flex', borderBottom: '0.5px solid #e2e8f0', padding: '1mm 0' }}>
                          <div style={{ width: '30mm', color: '#64748b', fontSize: '8pt' }}>Wilayah RT</div>
                          <div style={{ width: '3mm' }}>:</div>
                          <div style={{ flex: 1, fontWeight: '700' }}>{kk.rt} / RW 003</div>
                        </div>

                        <div style={{ display: 'flex', borderBottom: '0.5px solid #e2e8f0', padding: '1mm 0' }}>
                          <div style={{ width: '30mm', color: '#64748b', fontSize: '8pt' }}>Untuk Pembayaran</div>
                          <div style={{ width: '3mm' }}>:</div>
                          <div style={{ flex: 1, fontWeight: '600' }}>Iuran Warga Partisipasi HUT RI Ke-81</div>
                        </div>

                        {/* Nominal Highlight Box */}
                        <div style={{
                          marginTop: '2mm',
                          marginBottom: '2mm',
                          padding: '2mm 3mm',
                          backgroundColor: '#f0fdf4',
                          border: '1px solid #86efac',
                          borderRadius: '4px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            <div style={{ fontSize: '6.5pt', fontWeight: 'bold', color: '#166534', textTransform: 'uppercase' }}>
                              Jumlah Uang Diterima:
                            </div>
                            <div style={{ fontSize: '12pt', fontWeight: '900', color: '#14532d', fontFamily: 'monospace' }}>
                              {formatRupiah(kk.terbayar)}
                            </div>
                          </div>
                          <div style={{
                            fontSize: '8pt',
                            fontWeight: '900',
                            padding: '1mm 2.5mm',
                            backgroundColor: isLunas ? '#15803d' : '#d97706',
                            color: '#ffffff',
                            borderRadius: '3px',
                            textTransform: 'uppercase'
                          }}>
                            {kk.status}
                          </div>
                        </div>

                        {/* Terbilang */}
                        <div style={{ fontSize: '7.5pt', fontStyle: 'italic', color: '#475569', backgroundColor: '#f8fafc', padding: '1mm 2mm', borderRadius: '3px', border: '0.5px solid #cbd5e1' }}>
                          Terbilang: <strong>"{formatTerbilang(kk.terbayar)}"</strong>
                        </div>
                      </div>
                    </div>

                    {/* Signatures & Stamp */}
                    <div style={{
                      marginTop: '3mm',
                      paddingTop: '2mm',
                      borderTop: '0.8px solid #cbd5e1',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-end',
                      fontSize: '7.5pt',
                      position: 'relative'
                    }}>
                      <div style={{ textAlign: 'center', width: '28mm' }}>
                        <div style={{ color: '#64748b', fontSize: '7pt' }}>Warga / Pembayar</div>
                        <div style={{ height: '8mm' }} />
                        <div style={{ fontWeight: '800', borderTop: '0.8px solid #334155', paddingTop: '0.5mm' }}>
                          {kk.nama_kk}
                        </div>
                      </div>

                      {/* Stempel Digital */}
                      {tampilkanStempel && (
                        <div style={{
                          position: 'absolute',
                          left: '50%',
                          transform: 'translateX(-50%) rotate(-6deg)',
                          bottom: '1mm',
                          border: '1.5px solid #dc2626',
                          color: '#dc2626',
                          padding: '1mm 2.5mm',
                          borderRadius: '4px',
                          fontSize: '6.5pt',
                          fontWeight: '900',
                          textAlign: 'center',
                          backgroundColor: 'rgba(255, 255, 255, 0.85)',
                          letterSpacing: '0.5px'
                        }}>
                          ★ LUNAS TERVERIFIKASI ★<br />
                          PANITIA PHBN RT.002
                        </div>
                      )}

                      <div style={{ textAlign: 'center', width: '32mm' }}>
                        <div style={{ color: '#475569', fontSize: '7pt' }}>Sidoarjo, {tanggalCetak}</div>
                        <div style={{ height: '8mm' }} />
                        <div style={{ fontWeight: '800', borderTop: '0.8px solid #334155', paddingTop: '0.5mm' }}>
                          {namaBendahara}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cut Line Indicator */}
            <div style={{
              marginTop: '2mm',
              paddingTop: '1.5mm',
              borderTop: '1px dashed #94a3b8',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: '7.5pt',
              color: '#64748b',
              fontFamily: 'monospace'
            }}>
              ✂ POTONG LEMBARAN KWITANSI DI ATAS GARIS INI
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
