import { X, Printer, Landmark, FileText } from 'lucide-react';
import { LaporanIuranMingguan } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface ModalExportPdfLaporanProps {
  isOpen: boolean;
  onClose: () => void;
  report: LaporanIuranMingguan | null;
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

export default function ModalExportPdfLaporan({
  isOpen,
  onClose,
  report,
}: ModalExportPdfLaporanProps) {
  if (!report) return null;

  const handlePrint = () => {
    // Wait slightly to ensure rendering, then print
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const formattedTotal = report.total_jumlah.toLocaleString('id-ID');

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-start overflow-y-auto p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm print:bg-white print:p-0 print:overflow-visible">
          {/* Backdrop (hidden during print) */}
          <div className="fixed inset-0 pointer-events-none print:hidden" />

          {/* Sticky Header Toolbar - Hidden during printing */}
          <motion.div 
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 flex items-center justify-between px-5 py-4 mb-6 shrink-0 print:hidden z-10"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-red-50 text-red-600">
                <FileText size={18} />
              </div>
              <div>
                <h3 className="font-display font-black text-gray-800 text-sm uppercase tracking-wider">
                  Cetak / Ekspor PDF A4
                </h3>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mt-0.5">
                  Pratinjau Lembar Laporan Pertanggungjawaban
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer hover:shadow-md hover:shadow-red-100"
              >
                <Printer size={14} />
                Cetak / PDF (A4)
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2.5 bg-gray-50 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
                title="Tutup Pratinjau"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>

          {/* Dynamic scoped print style to ensure perfect printable A4 preview and no clashes */}
          <style dangerouslySetInnerHTML={{ __html: `
            @media print {
              body * {
                visibility: hidden !important;
              }
              #printable-a4-area, #printable-a4-area * {
                visibility: visible !important;
              }
              #printable-a4-area {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                height: 100% !important;
                margin: 0 !important;
                padding: 1.5cm !important;
                background: white !important;
                color: black !important;
                box-shadow: none !important;
                border: none !important;
                overflow: visible !important;
                display: flex !important;
                flex-direction: column !important;
                justify-content: space-between !important;
              }
              .print-hidden-element {
                display: none !important;
              }
            }
          `}} />

          {/* A4 Sheet Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="w-full max-w-[210mm] mx-auto bg-transparent p-0 sm:p-4 mb-12 flex justify-center print:p-0 print:mb-0 z-10"
          >
            {/* Printable Section */}
            <div 
              id="printable-a4-area" 
              className="w-full sm:w-[210mm] sm:h-[297mm] bg-white p-8 sm:p-12 text-black shadow-2xl relative flex flex-col justify-between sm:overflow-hidden print:overflow-visible border border-gray-150 print:border-none print:shadow-none print:w-[210mm] print:h-[297mm]"
              style={{ boxSizing: 'border-box' }}
            >
              {/* WATERMARK INDONESIA MERDEKA */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                <span className="text-[80px] font-black uppercase text-red-600 rotate-45 tracking-widest">
                  HUT RI 81
                </span>
              </div>

              <div>
                {/* 1. KOP SURAT (LETTERHEAD) */}
                <div className="flex items-center gap-5 pb-3 border-b-4 border-double border-black relative">
                  <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs border border-red-700">
                    <Landmark size={24} className="stroke-[2.5]" />
                  </div>
                  <div className="flex-1 text-center pr-10">
                    <h2 className="font-display font-black text-xs sm:text-sm text-gray-950 uppercase tracking-wider leading-none">
                      PANITIA HARI BESAR NASIONAL (PHBN)
                    </h2>
                    <h1 className="font-display font-black text-base sm:text-lg text-red-600 uppercase tracking-widest mt-0.5 leading-none">
                      HUT REPUBLIK INDONESIA KE-81
                    </h1>
                    <p className="text-[9px] text-gray-600 font-semibold tracking-wider uppercase mt-1 leading-none">
                      RUKUN TETANGGA 002/003 - KELURAHAN KEDAUNG BARU
                    </p>
                    <p className="text-[7px] text-gray-400 font-semibold tracking-widest uppercase mt-0.5 leading-none">
                      Kecamatan Neglasari, Kota Tangerang
                    </p>
                  </div>
                </div>

                {/* 2. SURAT KETERANGAN / JUDUL LAPORAN */}
                <div className="text-center my-4">
                  <h3 className="font-display font-black text-xs uppercase tracking-widest text-gray-900 border-b border-gray-300 pb-1 inline-block px-4">
                    LAPORAN PERTANGGUNGJAWABAN IURAN MINGGUAN
                  </h3>
                  <p className="text-[8px] text-gray-400 font-mono font-bold uppercase tracking-widest mt-0.5">
                    NOMOR DOKUMEN: LP-IM/VIII/2026/REKAP-{report.id.toString().slice(-4)}
                  </p>
                </div>

                {/* 3. METADATA DOKUMEN */}
                <div className="grid grid-cols-2 gap-y-1.5 gap-x-4 bg-gray-50 border border-gray-200 rounded-xl p-3 text-[11px] mb-4">
                  <div>
                    <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest block leading-tight">Periode Laporan</span>
                    <strong className="text-gray-800 font-bold">{report.minggu_ke}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest block leading-tight">Tanggal Lapor</span>
                    <strong className="text-gray-800 font-mono">{report.tanggal_lapor}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest block leading-tight">Rentang Tanggal Kegiatan</span>
                    <strong className="text-gray-800 font-mono">{report.tanggal_mulai} s.d {report.tanggal_selesai}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest block leading-tight">Dilaporkan Oleh</span>
                    <strong className="text-gray-800 font-bold">{report.dilaporkan_oleh}</strong>
                  </div>
                </div>

                {/* 4. TOTAL REKAP & TERBILANG */}
                <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
                  <div className="bg-red-50/70 px-3.5 py-2 border-b border-gray-200 flex items-center justify-between">
                    <span className="text-[9px] text-red-800 font-black uppercase tracking-widest">
                      Jumlah Dana Penerimaan Kas Iuran
                    </span>
                    <span className="text-[9px] text-red-600 font-mono font-bold">STATUS: TERKUMPUL &amp; DISERAHKAN</span>
                  </div>
                  <div className="p-3.5 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wider">Rincian Nominal Kas:</h4>
                      <p className="text-xl font-mono font-black text-red-600 mt-0.5">Rp {formattedTotal}</p>
                    </div>
                    <div className="max-w-xs text-right">
                      <h4 className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wider">Terbilang (Sesuai Ejaan):</h4>
                      <p className="text-[10px] font-bold text-gray-700 italic mt-0.5 leading-snug">
                        "{formatTerbilang(report.total_jumlah)}"
                      </p>
                    </div>
                  </div>
                  <div className="px-3.5 py-1.5 bg-gray-50 border-t border-gray-150 text-[10px] text-gray-600">
                    <strong className="font-semibold text-gray-700">Keterangan Catatan:</strong> {report.keterangan}
                  </div>
                </div>

                {/* 5. DOCK FOTO BUKTI (DILAMPIRKAN) - Optimized height to prevent overflow */}
                {report.bukti_foto && (
                  <div className="border border-gray-200 rounded-xl p-3 bg-white flex flex-col items-center mb-2">
                    <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest mb-1.5 text-center block">
                      LAMPIRAN FISIK / BUKTI SERAH TERIMA &amp; PENYETORAN FOTO
                    </span>
                    <div className="w-full max-h-[60mm] flex items-center justify-center overflow-hidden rounded-lg border border-gray-100 bg-gray-50/50 p-1 shadow-3xs">
                      <img 
                        src={report.bukti_foto} 
                        alt="Bukti Serah Terima" 
                        className="max-h-[52mm] object-contain rounded-md"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="text-[8px] text-gray-400 font-mono font-bold uppercase tracking-widest mt-1 text-center">
                      Dokumen Lampiran Sah (Diambil Secara Digital)
                    </span>
                  </div>
                )}
              </div>

              {/* 6. SIGNATURE BLOCK (TANDA TANGAN) */}
              <div className="mt-8 pt-6 border-t border-dashed border-gray-200 grid grid-cols-2 gap-4 text-center text-xs shrink-0">
                <div>
                  <p className="text-gray-500 font-semibold mb-12">Dilaporkan Oleh,</p>
                  <div className="w-32 border-b border-gray-950 mx-auto"></div>
                  <p className="font-bold text-gray-800 mt-1.5">{report.dilaporkan_oleh.split('(')[0].trim()}</p>
                  <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider">Utusan RT / Bendahara Iuran</p>
                </div>
                <div>
                  <p className="text-gray-500 font-semibold mb-12">Mengetahui &amp; Menyetujui,</p>
                  <div className="w-32 border-b border-gray-950 mx-auto"></div>
                  <p className="font-bold text-gray-800 mt-1.5">Anto (Zhipo)</p>
                  <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider">Ketua Panitia HUT RI-81</p>
                </div>
              </div>

              {/* Legal Footnote UU ITE */}
              <div className="mt-6 pt-4 border-t border-gray-150 text-justify text-[9px] text-gray-400 leading-relaxed shrink-0">
                <strong>Catatan Hukum Elektronik:</strong> Berdasarkan Undang Undang ITE no. 11 Tahun 2008 yang mengatur Dokumen Elektronik dan informasi lain di dalamnya sebagai alat bukti yang sah dan dapat di pertanggung jawabkan.
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
