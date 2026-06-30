import React from 'react';
import { X, Printer, Landmark, Receipt, CheckCircle, AlertTriangle, Scale } from 'lucide-react';
import { IuranKK } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface ModalCetakKwitansiIuranProps {
  isOpen: boolean;
  onClose: () => void;
  kk: IuranKK | null;
}

// Indonesian "Terbilang" helper
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

export default function ModalCetakKwitansiIuran({
  isOpen,
  onClose,
  kk,
}: ModalCetakKwitansiIuranProps) {
  if (!kk) return null;

  const handlePrint = () => {
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const formattedTerbayar = kk.terbayar.toLocaleString('id-ID');
  const formattedTarget = kk.target.toLocaleString('id-ID');
  const deficit = Math.max(0, kk.target - kk.terbayar);
  const formattedDeficit = deficit.toLocaleString('id-ID');
  const isLunas = kk.status === 'Lunas';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-start overflow-y-auto p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm print:bg-white print:p-0 print:overflow-visible">
          {/* Sticky Toolbar for Print Control (Hidden during printing) */}
          <motion.div 
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 flex items-center justify-between px-5 py-4 mb-6 shrink-0 print:hidden z-10"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-red-50 text-red-600">
                <Receipt size={18} />
              </div>
              <div>
                <h3 className="font-display font-black text-gray-800 text-sm uppercase tracking-wider">
                  Cetak Bukti Iuran KK
                </h3>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mt-0.5">
                  Kwitansi Transaksi Pembayaran Resmi
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
                Cetak Bukti (A4)
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

          {/* Dynamic scoped print style specifically for this invoice receipt */}
          <style dangerouslySetInnerHTML={{ __html: `
            @media print {
              body * {
                visibility: hidden !important;
              }
              #printable-kwitansi-area, #printable-kwitansi-area * {
                visibility: visible !important;
              }
              #printable-kwitansi-area {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 1.5cm !important;
                background: white !important;
                color: black !important;
                box-shadow: none !important;
                border: none !important;
                overflow: visible !important;
              }
            }
          `}} />

          {/* Kwitansi A4 Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="w-full max-w-[210mm] mx-auto bg-transparent p-0 sm:p-4 mb-12 flex justify-center print:p-0 print:mb-0 z-10"
          >
            {/* Printable Kwitansi Card */}
            <div 
              id="printable-kwitansi-area" 
              className="w-full sm:w-[210mm] sm:h-[155mm] bg-white p-8 sm:p-10 text-black shadow-2xl relative flex flex-col justify-between sm:overflow-hidden print:overflow-visible border border-gray-150 print:border-none print:shadow-none print:w-[210mm]"
              style={{ boxSizing: 'border-box' }}
            >
              {/* WATERMARK STAMP */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                <span className="text-[70px] font-black uppercase text-red-600 rotate-12 tracking-widest">
                  BUKTI IURAN RESMI
                </span>
              </div>

              <div>
                {/* 1. KOP SURAT (LETTERHEAD) */}
                <div className="flex items-center gap-5 pb-3 border-b-4 border-double border-black relative">
                  <div className="w-11 h-11 bg-red-600 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs border border-red-700">
                    <Landmark size={20} className="stroke-[2.5]" />
                  </div>
                  <div className="flex-1 text-center pr-10">
                    <h2 className="font-display font-black text-xs text-gray-950 uppercase tracking-wider leading-none">
                      PANITIA HARI BESAR NASIONAL (PHBN)
                    </h2>
                    <h1 className="font-display font-black text-sm sm:text-base text-red-600 uppercase tracking-widest mt-0.5 leading-none">
                      HUT REPUBLIK INDONESIA KE-81
                    </h1>
                    <p className="text-[8px] text-gray-600 font-semibold tracking-wider uppercase mt-1 leading-none">
                      RUKUN TETANGGA 002/003 - KELURAHAN KEDAUNG BARU
                    </p>
                  </div>
                </div>

                {/* 2. JUDUL KWITANSI */}
                <div className="text-center my-4">
                  <h3 className="font-display font-black text-[11px] uppercase tracking-widest text-gray-900 border-b border-gray-300 pb-0.5 inline-block px-4">
                    KWITANSI RESMI BUKTI PEMBAYARAN IURAN WARGA
                  </h3>
                  <p className="text-[8px] text-gray-400 font-mono font-bold uppercase tracking-widest mt-0.5">
                    NOMOR TRANSKASI: KW-{kk.rt}-{kk.id.toString().slice(-4)}
                  </p>
                </div>

                {/* 3. INFORMASI TRANSKASI / DETAIL KK */}
                <div className="grid grid-cols-12 gap-4 mt-2">
                  <div className="col-span-8 space-y-2 border-r border-gray-150 pr-4">
                    <div className="grid grid-cols-3 text-xs leading-relaxed">
                      <span className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Telah Diterima Dari</span>
                      <span className="col-span-2 font-black text-gray-950 font-display">: {kk.nama_kk}</span>
                    </div>
                    <div className="grid grid-cols-3 text-xs leading-relaxed">
                      <span className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Rukun Tetangga (RT)</span>
                      <span className="col-span-2 font-bold text-gray-800">: RT {kk.rt}</span>
                    </div>
                    <div className="grid grid-cols-3 text-xs leading-relaxed">
                      <span className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Target Wajib Iuran</span>
                      <span className="col-span-2 font-bold text-gray-800 font-mono">: Rp {formattedTarget}</span>
                    </div>
                    <div className="grid grid-cols-3 text-xs leading-relaxed">
                      <span className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Total Terbayar</span>
                      <span className="col-span-2 font-black text-emerald-600 font-mono text-[13px]">: Rp {formattedTerbayar}</span>
                    </div>
                    <div className="grid grid-cols-3 text-xs leading-relaxed">
                      <span className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Terbilang Pembayaran</span>
                      <span className="col-span-2 font-bold text-gray-700 italic">: "{formatTerbilang(kk.terbayar)}"</span>
                    </div>
                  </div>

                  {/* Stamp status area */}
                  <div className="col-span-4 flex flex-col items-center justify-center bg-gray-50/50 border border-gray-150 rounded-xl p-3 relative overflow-hidden">
                    {isLunas ? (
                      <div className="flex flex-col items-center justify-center text-emerald-600 text-center select-none rotate-6">
                        <CheckCircle size={32} className="stroke-[2.5] text-emerald-500 mb-1" />
                        <span className="text-lg font-black tracking-widest border-4 border-emerald-500/80 rounded-lg px-2 py-0.5 leading-none uppercase select-none">
                          LUNAS
                        </span>
                        <span className="text-[7px] text-gray-400 font-semibold font-mono mt-1 uppercase">TERBAYAR PENUH</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-amber-600 text-center select-none -rotate-3">
                        <AlertTriangle size={32} className="stroke-[2.5] text-amber-500 mb-1" />
                        <span className="text-xs font-black tracking-wider border-4 border-amber-500/80 rounded-lg px-1.5 py-0.5 leading-none uppercase select-none">
                          BELUM LUNAS
                        </span>
                        <span className="text-[7px] text-red-500 font-bold font-mono mt-1 uppercase">SISA: Rp {formattedDeficit}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. DETAIL RIWAYAT SETORAN */}
                <div className="mt-4">
                  <h4 className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest mb-1.5">
                    Riwayat Angsuran / Rincian Setoran:
                  </h4>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full text-[10px] text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-150 text-gray-500 font-bold text-[8px] uppercase tracking-wider">
                          <th className="px-3 py-1.5 w-16 text-center">No Setoran</th>
                          <th className="px-3 py-1.5">Tanggal Transaksi</th>
                          <th className="px-3 py-1.5 text-right">Jumlah Setoran (IDR)</th>
                          <th className="px-3 py-1.5 text-center">Status Transaksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {kk.riwayat.map((item, idx) => (
                          <tr key={item.id || idx} className="border-b border-gray-100 last:border-b-0 font-medium text-gray-800">
                            <td className="px-3 py-1.5 text-center font-mono font-bold text-gray-500">{idx + 1}</td>
                            <td className="px-3 py-1.5 font-mono">{item.tanggal}</td>
                            <td className="px-3 py-1.5 text-right font-mono font-bold text-emerald-600">Rp {item.jumlah.toLocaleString('id-ID')}</td>
                            <td className="px-3 py-1.5 text-center">
                              <span className="inline-block px-2 py-0.5 text-[8px] font-bold uppercase rounded-sm bg-emerald-50 text-emerald-600 border border-emerald-100">
                                Berhasil
                              </span>
                            </td>
                          </tr>
                        ))}
                        {kk.riwayat.length === 0 && (
                          <tr>
                            <td colSpan={4} className="px-3 py-3 text-center text-gray-400 italic">
                              Belum ada transaksi setoran pembayaran iuran yang terekam.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* 5. BLOK TANDA TANGAN SERAH TERIMA */}
              <div className="mt-6 pt-4 border-t border-dashed border-gray-200 grid grid-cols-3 gap-4 text-center text-[10px] shrink-0">
                <div>
                  <p className="text-gray-500 font-semibold mb-10">Dilaporkan Oleh /<br/>Yang Menyerahkan,</p>
                  <div className="w-24 border-b border-gray-900 mx-auto"></div>
                  <p className="font-bold text-gray-800 mt-1">Ahmad Mujibur Rahman</p>
                  <p className="text-[8px] text-gray-400 font-semibold uppercase tracking-wider">Utusan RT / Bendahara Iuran</p>
                </div>
                <div>
                  <p className="text-gray-500 font-semibold mb-10">Diterima Oleh<br/>(Bendahara),</p>
                  <div className="w-24 border-b border-gray-900 mx-auto"></div>
                  <p className="font-bold text-gray-800 mt-1">Ayeh Patoni</p>
                  <p className="text-[8px] text-gray-400 font-semibold uppercase tracking-wider">Bendahara Panitia</p>
                </div>
                <div>
                  <p className="text-gray-500 font-semibold mb-10">Mengetahui &amp;<br/>Menyetujui,</p>
                  <div className="w-24 border-b border-gray-900 mx-auto"></div>
                  <p className="font-bold text-gray-800 mt-1">Anto (Zhipo)</p>
                  <p className="text-[8px] text-gray-400 font-semibold uppercase tracking-wider">Ketua Panitia HUT RI-81</p>
                </div>
              </div>

              {/* Legal Footnote UU ITE */}
              <div className="mt-4 pt-3 border-t border-gray-150 text-justify text-[8px] text-gray-400 leading-relaxed shrink-0 flex items-center gap-1.5 font-sans">
                <Scale size={10} className="text-gray-300 shrink-0" />
                <span>
                  <strong>Legal Notice UU ITE:</strong> Kwitansi digital ini diakui secara hukum sah berdasarkan UU No. 11 Th. 2008 tentang Informasi &amp; Transaksi Elektronik sebagai alat bukti pembayaran yang dapat dipertanggungjawabkan.
                </span>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
