import { X, Printer, Landmark, FileText } from 'lucide-react';
import { LaporanIuranMingguan, IuranKK, Kas } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface ModalExportPdfLaporanProps {
  isOpen: boolean;
  onClose: () => void;
  report: LaporanIuranMingguan | null;
  iuranKKList?: IuranKK[];
  kasList?: Kas[];
}

// Indonesian "Terbilang" helper for absolute professional quality
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

// Short date format helper for tables (e.g., "21 Jun 26")
function formatShortDate(str: string): string {
  if (!str) return '-';
  const clean = str.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    const [y, m, d] = clean.split('-');
    return `${d}/${m}/${y.slice(-2)}`;
  }
  return clean
    .replace(/januari/i, 'Jan')
    .replace(/februari/i, 'Feb')
    .replace(/maret/i, 'Mar')
    .replace(/april/i, 'Apr')
    .replace(/mei/i, 'Mei')
    .replace(/juni/i, 'Jun')
    .replace(/juli/i, 'Jul')
    .replace(/agustus/i, 'Ags')
    .replace(/september/i, 'Sep')
    .replace(/oktober/i, 'Okt')
    .replace(/november/i, 'Nov')
    .replace(/desember/i, 'Des');
}

// Helper to parse various Indonesian / ISO date formats to Date object for filtering
function parseDateString(dateStr: string): Date | null {
  if (!dateStr) return null;
  const str = dateStr.trim();
  
  // Format YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  
  // Format Indonesian e.g. "26 Juli 2026"
  const monthMap: Record<string, number> = {
    januari: 0, jan: 0,
    februari: 1, feb: 1,
    maret: 2, mar: 2,
    april: 3, apr: 3,
    mei: 4,
    juni: 5, jun: 5,
    juli: 6, jul: 6,
    agustus: 7, ags: 7, agu: 7,
    september: 8, sep: 8,
    oktober: 9, okt: 9,
    november: 10, nov: 10,
    desember: 11, des: 11
  };
  const parts = str.split(/\s+/);
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const mStr = parts[1].toLowerCase();
    const year = parseInt(parts[2], 10);
    if (!isNaN(day) && !isNaN(year) && monthMap[mStr] !== undefined) {
      return new Date(year, monthMap[mStr], day);
    }
  }
  
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

export default function ModalExportPdfLaporan({
  isOpen,
  onClose,
  report,
  iuranKKList = [],
  kasList = [],
}: ModalExportPdfLaporanProps) {
  if (!report) return null;

  const handlePrint = () => {
    // Wait slightly to ensure rendering, then print
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const formattedTotal = report.total_jumlah.toLocaleString('id-ID');

  // Parse start and end date of weekly report
  const startDate = parseDateString(report.tanggal_mulai);
  const endDate = parseDateString(report.tanggal_selesai);
  if (startDate) startDate.setHours(0, 0, 0, 0);
  if (endDate) endDate.setHours(23, 59, 59, 999);

  // Extract payments matching this weekly report period
  interface WeeklyPaymentItem {
    nama_kk: string;
    rt: string;
    tanggal: string;
    jumlah: number;
    status: string;
  }

  const weeklyPayments: WeeklyPaymentItem[] = [];

  // 1. Gather payments from iuranKKList riwayat
  iuranKKList.forEach(kk => {
    if (kk.riwayat && Array.isArray(kk.riwayat)) {
      kk.riwayat.forEach(r => {
        const rDate = parseDateString(r.tanggal);
        let isMatch = false;
        if (rDate && startDate && endDate) {
          isMatch = rDate >= startDate && rDate <= endDate;
        } else {
          isMatch = r.tanggal === report.tanggal_mulai || r.tanggal === report.tanggal_selesai;
        }
        if (isMatch) {
          weeklyPayments.push({
            nama_kk: kk.nama_kk,
            rt: kk.rt,
            tanggal: r.tanggal,
            jumlah: r.jumlah,
            status: kk.status,
          });
        }
      });
    }
  });

  // 2. Fallback check from kasList if riwayat was empty
  if (weeklyPayments.length === 0 && kasList && kasList.length > 0) {
    kasList.forEach(k => {
      if (k.tipe === 'pemasukan' && (k.kategori === 'Iuran Warga' || k.keterangan.includes('Iuran KK:'))) {
        const kDate = parseDateString(k.tanggal);
        let isMatch = false;
        if (kDate && startDate && endDate) {
          isMatch = kDate >= startDate && kDate <= endDate;
        } else {
          isMatch = k.tanggal === report.tanggal_mulai || k.tanggal === report.tanggal_selesai;
        }
        if (isMatch) {
          const matchName = k.keterangan.match(/Iuran KK:\s*([^(]+)(?:\(([^)]+)\))?/i);
          const nama = matchName ? matchName[1].trim() : k.keterangan;
          const rt = matchName && matchName[2] ? matchName[2].trim() : '-';
          weeklyPayments.push({
            nama_kk: nama,
            rt: rt,
            tanggal: k.tanggal,
            jumlah: k.jumlah,
            status: 'Lunas / Mencicil',
          });
        }
      }
    });
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="modal-export-pdf-root" className="fixed inset-0 z-50 flex flex-col justify-start overflow-y-auto p-2 sm:p-6 bg-slate-950/85 backdrop-blur-md print:bg-white print:p-0 print:m-0 print:overflow-visible print:static print:inset-auto print:block">
          {/* Backdrop (hidden during print) */}
          <div className="fixed inset-0 pointer-events-none print:hidden" />

          {/* Sticky Header Toolbar - Mobile Friendly & Hidden during printing */}
          <motion.div 
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 flex items-center justify-between px-3.5 py-3 sm:px-5 sm:py-4 mb-3 sm:mb-6 shrink-0 print:hidden z-10 gap-2"
          >
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="p-2 rounded-xl bg-red-50 text-red-600 shrink-0">
                <FileText size={18} />
              </div>
              <div className="min-w-0">
                <h3 className="font-display font-black text-gray-800 text-xs sm:text-sm uppercase tracking-wider truncate">
                  Cetak / Ekspor PDF A4
                </h3>
                <p className="text-[9px] sm:text-[10px] text-gray-400 font-semibold uppercase tracking-widest mt-0.5 truncate hidden sm:block">
                  Pratinjau Lembar Laporan Pertanggungjawaban
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer hover:shadow-md hover:shadow-red-100"
              >
                <Printer size={14} />
                <span className="hidden sm:inline">Cetak / PDF (A4)</span>
                <span className="sm:hidden">Cetak</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 sm:p-2.5 bg-gray-50 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
                title="Tutup Pratinjau"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>

          {/* Dynamic scoped print style to ensure perfect printable A4 preview and no clashes */}
          <style dangerouslySetInnerHTML={{ __html: `
            @media print {
              @page {
                size: A4 portrait;
                margin: 5mm 5mm;
              }

              html, body {
                background: #ffffff !important;
                color: #000000 !important;
                margin: 0 !important;
                padding: 0 !important;
                width: 100% !important;
                height: auto !important;
                min-height: 0 !important;
                max-height: none !important;
                overflow: visible !important;
              }

              /* Hide non-printable layout elements from document flow so they occupy 0px height */
              header, nav, footer, .no-print, [role="banner"], [role="navigation"] {
                display: none !important;
                height: 0 !important;
                width: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
                overflow: hidden !important;
              }

              /* Keep root and main container as visible transparent blocks during print */
              #root, main {
                display: block !important;
                position: static !important;
                margin: 0 !important;
                padding: 0 !important;
                width: 100% !important;
                height: auto !important;
                background: transparent !important;
                box-shadow: none !important;
                overflow: visible !important;
              }

              .print-hidden-element, .print\\:hidden, button, .pointer-events-none {
                display: none !important;
                height: 0 !important;
                width: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
                overflow: hidden !important;
              }

              #printable-lpj, #printable-kwitansi-area, #print-area {
                display: none !important;
                height: 0 !important;
                width: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
                overflow: hidden !important;
              }

              /* Reset parent containers */
              #root, #root > div, [role="dialog"], .backdrop-blur-sm, div[class*="fixed"] {
                position: static !important;
                inset: auto !important;
                transform: none !important;
                overflow: visible !important;
                height: auto !important;
                min-height: 0 !important;
                max-height: none !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                background: transparent !important;
                box-shadow: none !important;
                backdrop-filter: none !important;
              }

              #modal-export-pdf-root {
                display: block !important;
                position: static !important;
                width: 100% !important;
                height: auto !important;
                min-height: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
              }

              #printable-a4-area {
                display: block !important;
                visibility: visible !important;
                position: static !important;
                float: none !important;
                width: 100% !important;
                max-width: 100% !important;
                height: auto !important;
                min-height: 0 !important;
                max-height: none !important;
                margin: 0 !important;
                padding: 0 !important;
                background: #ffffff !important;
                color: #000000 !important;
                box-shadow: none !important;
                border: none !important;
                overflow: visible !important;
                page-break-after: avoid !important;
                break-after: avoid !important;
              }

              #printable-a4-area * {
                visibility: visible !important;
              }

              .print-2-col-grid {
                display: grid !important;
                grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                gap: 6px !important;
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

          {/* A4 Sheet Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="w-full max-w-[210mm] mx-auto bg-transparent p-0 sm:p-2 mb-6 sm:mb-12 flex justify-center print:p-0 print:m-0 print:w-full print:max-w-none print:block print:static z-10"
          >
            {/* Printable Section */}
            <div 
              id="printable-a4-area" 
              className="w-full sm:w-[210mm] min-h-0 sm:min-h-[297mm] print:min-h-0 print:h-auto bg-white p-3.5 sm:p-7 text-black shadow-2xl relative flex flex-col justify-between overflow-visible border border-gray-150 print:border-none print:shadow-none print:w-full print:h-auto print:p-0 print:block print:static"
              style={{ boxSizing: 'border-box' }}
            >
              {/* WATERMARK INDONESIA MERDEKA */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none print:hidden">
                <span className="text-[80px] font-black uppercase text-red-600 rotate-45 tracking-widest">
                  HUT RI 81
                </span>
              </div>

              <div>
                {/* 1. KOP SURAT (LETTERHEAD) */}
                <div className="flex items-center gap-4 pb-2.5 border-b-4 border-double border-black relative">
                  <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs border border-red-700">
                    <Landmark size={20} className="stroke-[2.5]" />
                  </div>
                  <div className="flex-1 text-center pr-8">
                    <h2 className="font-display font-black text-xs text-gray-950 uppercase tracking-wider leading-none">
                      PANITIA HARI BESAR NASIONAL (PHBN)
                    </h2>
                    <h1 className="font-display font-black text-sm sm:text-base text-red-600 uppercase tracking-widest mt-0.5 leading-none">
                      HUT REPUBLIK INDONESIA KE-81
                    </h1>
                    <p className="text-[8.5px] text-gray-600 font-semibold tracking-wider uppercase mt-1 leading-none">
                      RUKUN TETANGGA 002/003 - KELURAHAN KEDAUNG BARU
                    </p>
                    <p className="text-[7px] text-gray-400 font-semibold tracking-widest uppercase mt-0.5 leading-none">
                      Kecamatan Neglasari, Kota Tangerang
                    </p>
                  </div>
                </div>

                {/* 2. SURAT KETERANGAN / JUDUL LAPORAN */}
                <div className="text-center my-2.5">
                  <h3 className="font-display font-black text-xs uppercase tracking-widest text-gray-900 border-b border-gray-300 pb-0.5 inline-block px-3">
                    LAPORAN PERTANGGUNGJAWABAN IURAN MINGGUAN
                  </h3>
                  <p className="text-[7.5px] text-gray-400 font-mono font-bold uppercase tracking-widest mt-0.5">
                    NOMOR DOKUMEN: LP-IM/VIII/2026/REKAP-{report.id.toString().slice(-4)}
                  </p>
                </div>

                {/* 3. METADATA DOKUMEN */}
                <div className="grid grid-cols-2 gap-y-1 gap-x-3 bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-[10px] mb-2.5">
                  <div>
                    <span className="text-[8px] text-gray-400 font-extrabold uppercase tracking-widest block leading-tight">Periode Laporan</span>
                    <strong className="text-gray-800 font-bold">{report.minggu_ke}</strong>
                  </div>
                  <div>
                    <span className="text-[8px] text-gray-400 font-extrabold uppercase tracking-widest block leading-tight">Tanggal Lapor</span>
                    <strong className="text-gray-800 font-mono">{report.tanggal_lapor}</strong>
                  </div>
                  <div>
                    <span className="text-[8px] text-gray-400 font-extrabold uppercase tracking-widest block leading-tight">Rentang Tanggal Kegiatan</span>
                    <strong className="text-gray-800 font-mono">{report.tanggal_mulai} s.d {report.tanggal_selesai}</strong>
                  </div>
                  <div>
                    <span className="text-[8px] text-gray-400 font-extrabold uppercase tracking-widest block leading-tight">Dilaporkan Oleh</span>
                    <strong className="text-gray-800 font-bold">{report.dilaporkan_oleh}</strong>
                  </div>
                </div>

                {/* 4. TOTAL REKAP & TERBILANG */}
                <div className="border border-gray-200 rounded-lg overflow-hidden mb-2.5">
                  <div className="bg-red-50/70 px-3 py-1.5 border-b border-gray-200 flex items-center justify-between">
                    <span className="text-[8.5px] text-red-800 font-black uppercase tracking-widest">
                      Jumlah Dana Penerimaan Kas Iuran
                    </span>
                    <span className="text-[8px] text-red-600 font-mono font-bold">STATUS: TERKUMPUL &amp; DISERAHKAN</span>
                  </div>
                  <div className="p-2.5 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-[8px] text-gray-400 font-extrabold uppercase tracking-wider">Rincian Nominal Kas:</h4>
                      <p className="text-lg font-mono font-black text-red-600 leading-tight">Rp {formattedTotal}</p>
                    </div>
                    <div className="max-w-xs text-right">
                      <h4 className="text-[8px] text-gray-400 font-extrabold uppercase tracking-wider">Terbilang (Sesuai Ejaan):</h4>
                      <p className="text-[9.5px] font-bold text-gray-700 italic mt-0.5 leading-snug">
                        "{formatTerbilang(report.total_jumlah)}"
                      </p>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-gray-50 border-t border-gray-150 text-[9px] text-gray-600">
                    <strong className="font-semibold text-gray-700">Keterangan Catatan:</strong> {report.keterangan}
                  </div>
                </div>

                {/* 4.5. RINCIAN HASIL PENERIMAAN IURAN WARGA PERIODE MINGGUAN INI */}
                <div className="border border-gray-200 rounded-lg overflow-hidden mb-2.5 p-2.5 bg-white">
                  <div className="flex justify-between items-center pb-1.5 mb-2 border-b border-gray-200">
                    <span className="text-[9.5px] font-black uppercase text-gray-900 tracking-wider">
                      DAFTAR WARGA YANG MEMBAYAR IURAN PERIODE MINGGUAN ({report.tanggal_mulai} s.d {report.tanggal_selesai})
                    </span>
                    <span className="text-[8.5px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md">
                      {weeklyPayments.length} Transaksi Warga
                    </span>
                  </div>

                  {weeklyPayments.length > 0 ? (
                    weeklyPayments.length > 10 ? (
                      /* COMPACT 2-COLUMN TABLE GRID FOR > 10 TRANSACTIONS (PREVENTS OVERSHEET) */
                      <div className="space-y-1.5">
                        <div className="overflow-x-auto print:overflow-visible">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[8px] print:text-[8px] print-2-col-grid">
                            {/* Table 1 (Left Half) */}
                            <table className="w-full border-collapse border border-gray-200 text-left font-sans">
                              <thead>
                                <tr className="bg-gray-100 text-gray-800 font-bold">
                                  <th className="border border-gray-200 p-0.5 text-center w-5">No</th>
                                  <th className="border border-gray-200 p-0.5">Nama KK</th>
                                  <th className="border border-gray-200 p-0.5 text-center w-5">RT</th>
                                  <th className="border border-gray-200 p-0.5 text-center w-12">Tgl / Waktu</th>
                                  <th className="border border-gray-200 p-0.5 text-right w-12">Nominal</th>
                                  <th className="border border-gray-200 p-0.5 text-center w-8">Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {weeklyPayments.slice(0, Math.ceil(weeklyPayments.length / 2)).map((pm, idx) => (
                                  <tr key={idx} className="hover:bg-gray-50">
                                    <td className="border border-gray-200 p-0.5 text-center font-mono text-gray-500 text-[7px]">{idx + 1}</td>
                                    <td className="border border-gray-200 p-0.5 font-bold text-gray-900 truncate max-w-[70px] text-[7.5px]">{pm.nama_kk}</td>
                                    <td className="border border-gray-200 p-0.5 text-center text-[7px]">{pm.rt}</td>
                                    <td className="border border-gray-200 p-0.5 text-center font-mono text-[6.5px] text-gray-600 whitespace-nowrap">{formatShortDate(pm.tanggal)}</td>
                                    <td className="border border-gray-200 p-0.5 text-right font-mono font-bold text-emerald-700 text-[7.5px] whitespace-nowrap">
                                      Rp {pm.jumlah.toLocaleString('id-ID')}
                                    </td>
                                    <td className="border border-gray-200 p-0.5 text-center">
                                      <span className={`px-0.5 py-0.2 rounded-xs font-extrabold text-[5.5px] uppercase ${
                                        pm.status === 'Lunas' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                      }`}>
                                        {pm.status}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>

                            {/* Table 2 (Right Half) */}
                            <table className="w-full border-collapse border border-gray-200 text-left font-sans">
                              <thead>
                                <tr className="bg-gray-100 text-gray-800 font-bold">
                                  <th className="border border-gray-200 p-0.5 text-center w-5">No</th>
                                  <th className="border border-gray-200 p-0.5">Nama KK</th>
                                  <th className="border border-gray-200 p-0.5 text-center w-5">RT</th>
                                  <th className="border border-gray-200 p-0.5 text-center w-12">Tgl / Waktu</th>
                                  <th className="border border-gray-200 p-0.5 text-right w-12">Nominal</th>
                                  <th className="border border-gray-200 p-0.5 text-center w-8">Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {weeklyPayments.slice(Math.ceil(weeklyPayments.length / 2)).map((pm, idx) => {
                                  const realIdx = Math.ceil(weeklyPayments.length / 2) + idx;
                                  return (
                                    <tr key={realIdx} className="hover:bg-gray-50">
                                      <td className="border border-gray-200 p-0.5 text-center font-mono text-gray-500 text-[7px]">{realIdx + 1}</td>
                                      <td className="border border-gray-200 p-0.5 font-bold text-gray-900 truncate max-w-[70px] text-[7.5px]">{pm.nama_kk}</td>
                                      <td className="border border-gray-200 p-0.5 text-center text-[7px]">{pm.rt}</td>
                                      <td className="border border-gray-200 p-0.5 text-center font-mono text-[6.5px] text-gray-600 whitespace-nowrap">{formatShortDate(pm.tanggal)}</td>
                                      <td className="border border-gray-200 p-0.5 text-right font-mono font-bold text-emerald-700 text-[7.5px] whitespace-nowrap">
                                        Rp {pm.jumlah.toLocaleString('id-ID')}
                                      </td>
                                      <td className="border border-gray-200 p-0.5 text-center">
                                        <span className={`px-0.5 py-0.2 rounded-xs font-extrabold text-[5.5px] uppercase ${
                                          pm.status === 'Lunas' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                        }`}>
                                          {pm.status}
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Total Footer Banner */}
                        <div className="bg-gray-50 border border-gray-200 rounded-md p-1 flex justify-between items-center text-[8px] font-bold">
                          <span className="text-gray-700 uppercase tracking-wider">TOTAL DANA TERKUMPUL PERIODE INI ({weeklyPayments.length} KK):</span>
                          <span className="font-mono text-emerald-700 font-black text-[9px]">
                            Rp {weeklyPayments.reduce((acc, c) => acc + c.jumlah, 0).toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                    ) : (
                      /* SINGLE COLUMN TABLE FOR <= 10 TRANSACTIONS */
                      <div className="overflow-x-auto print:overflow-visible">
                        <table className="w-full border-collapse border border-gray-200 text-left font-sans text-[8.5px]">
                          <thead>
                            <tr className="bg-gray-100 text-gray-800">
                              <th className="border border-gray-200 p-1 text-center w-6">No</th>
                              <th className="border border-gray-200 p-1">Nama Kepala Keluarga (KK)</th>
                              <th className="border border-gray-200 p-1 text-center w-10">RT</th>
                              <th className="border border-gray-200 p-1 text-center w-24">Tanggal / Waktu Bayar</th>
                              <th className="border border-gray-200 p-1 text-right w-24">Nominal Bayar</th>
                              <th className="border border-gray-200 p-1 text-center w-20">Status KK</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {weeklyPayments.map((pm, idx) => (
                              <tr key={idx}>
                                <td className="border border-gray-200 p-1 text-center font-mono text-gray-500">{idx + 1}</td>
                                <td className="border border-gray-200 p-1 font-bold text-gray-900">{pm.nama_kk}</td>
                                <td className="border border-gray-200 p-1 text-center">{pm.rt}</td>
                                <td className="border border-gray-200 p-1 text-center font-mono">{formatShortDate(pm.tanggal)}</td>
                                <td className="border border-gray-200 p-1 text-right font-mono font-bold text-emerald-700">
                                  Rp {pm.jumlah.toLocaleString('id-ID')}
                                </td>
                                <td className="border border-gray-200 p-1 text-center">
                                  <span className={`px-1 py-0.2 rounded-xs font-extrabold text-[6.5px] uppercase tracking-wider ${
                                    pm.status === 'Lunas' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                  }`}>
                                    {pm.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="bg-gray-50 font-bold">
                              <td colSpan={4} className="border border-gray-200 p-1 text-right font-sans text-[8.5px]">
                                TOTAL DANA TERKUMPUL PERIODE INI:
                              </td>
                              <td className="border border-gray-200 p-1 text-right font-mono text-emerald-700 font-black text-[9px]">
                                Rp {weeklyPayments.reduce((acc, c) => acc + c.jumlah, 0).toLocaleString('id-ID')}
                              </td>
                              <td className="border border-gray-200 p-1"></td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    )
                  ) : (
                    <div className="py-2 text-center text-gray-400 italic text-[8.5px]">
                      Tidak ada catatan transaksi pembayaran iuran warga pada rentang tanggal periode laporan ini ({report.tanggal_mulai} s.d {report.tanggal_selesai}).
                    </div>
                  )}
                </div>

                {/* 5. DOCK FOTO BUKTI (DILAMPIRKAN) - Optimized height to prevent overflow */}
                {report.bukti_foto && (
                  <div className="border border-gray-200 rounded-lg p-2 bg-white flex flex-col items-center mb-2">
                    <span className="text-[8px] text-gray-400 font-extrabold uppercase tracking-widest mb-1 text-center block">
                      LAMPIRAN FISIK / BUKTI SERAH TERIMA &amp; PENYETORAN FOTO
                    </span>
                    <div className="w-full max-h-[36mm] print:max-h-[28mm] flex items-center justify-center overflow-hidden rounded-lg border border-gray-100 bg-gray-50/50 p-1">
                      <img 
                        src={report.bukti_foto} 
                        alt="Bukti Serah Terima" 
                        className="max-h-[32mm] print:max-h-[26mm] object-contain rounded-md"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="text-[7.5px] text-gray-400 font-mono font-bold uppercase tracking-widest mt-0.5 text-center">
                      Dokumen Lampiran Sah (Diambil Secara Digital)
                    </span>
                  </div>
                )}
              </div>

              {/* 6. SIGNATURE BLOCK (TANDA TANGAN) */}
              <div className="mt-4 pt-4 border-t border-dashed border-gray-200 grid grid-cols-3 gap-3 text-center text-[11px] shrink-0 signature-block">
                <div>
                  <p className="text-gray-500 font-semibold mb-8 text-[10px]">Dilaporkan Oleh /<br/>Yang Menyerahkan,</p>
                  <div className="w-20 border-b border-gray-950 mx-auto"></div>
                  <p className="font-bold text-gray-800 mt-1 text-[11px]">{report.dilaporkan_oleh.split('(')[0].trim()}</p>
                  <p className="text-[8px] text-gray-400 font-semibold uppercase tracking-wider">Utusan RT / Bendahara Iuran</p>
                </div>
                <div>
                  <p className="text-gray-500 font-semibold mb-8 text-[10px]">Diterima Oleh<br/>(Bendahara),</p>
                  <div className="w-20 border-b border-gray-950 mx-auto"></div>
                  <p className="font-bold text-gray-800 mt-1 text-[11px]">Ayeh Patoni</p>
                  <p className="text-[8px] text-gray-400 font-semibold uppercase tracking-wider">Bendahara Panitia</p>
                </div>
                <div>
                  <p className="text-gray-500 font-semibold mb-8 text-[10px]">Mengetahui &amp;<br/>Menyetujui,</p>
                  <div className="w-20 border-b border-gray-950 mx-auto"></div>
                  <p className="font-bold text-gray-800 mt-1 text-[11px]">Anto (Zhipo)</p>
                  <p className="text-[8px] text-gray-400 font-semibold uppercase tracking-wider">Ketua Panitia HUT RI-81</p>
                </div>
              </div>

              {/* Legal Footnote UU ITE */}
              <div className="mt-3 pt-2 border-t border-gray-150 text-justify text-[8px] text-gray-400 leading-tight shrink-0">
                <strong>Catatan Hukum Elektronik:</strong> Berdasarkan Undang Undang ITE no. 11 Tahun 2008 yang mengatur Dokumen Elektronik dan informasi lain di dalamnya sebagai alat bukti yang sah dan dapat di pertanggung jawabkan.
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
