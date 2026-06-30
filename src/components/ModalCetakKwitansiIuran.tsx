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

// Generate a deterministic and unique doorprize coupon code for each family
export function getDoorprizeCode(kkId: number, rt: string): string {
  const hash = (kkId * 31337 + 7919) % 9000 + 1000;
  // Format RT: remove whitespace, non-alphanumeric, pad to 2 digits if numeric
  const cleanRt = rt.replace(/\D/g, '').padStart(2, '0');
  return `DP-${cleanRt}-${hash}`;
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
        <div className="fixed inset-0 z-50 flex flex-col justify-start overflow-y-auto p-4 sm:p-6 bg-slate-950/85 backdrop-blur-sm print:bg-white print:p-0 print:overflow-visible">
          {/* Sticky Toolbar for Print Control (Hidden during printing) */}
          <motion.div 
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="w-full max-w-[80mm] mx-auto bg-white rounded-xl shadow-xl border border-gray-100 flex items-center justify-between px-4 py-3 mb-4 shrink-0 print:hidden z-10"
          >
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-red-50 text-red-600">
                <Receipt size={16} />
              </div>
              <div>
                <h3 className="font-display font-black text-gray-800 text-xs uppercase tracking-wider">
                  Cetak Thermal
                </h3>
                <p className="text-[8px] text-gray-400 font-semibold uppercase tracking-widest">
                  Bluetooth Portable (58/80mm)
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1 bg-gray-900 hover:bg-black text-white text-[10px] font-bold px-3 py-2 rounded-lg transition-all active:scale-95 cursor-pointer shadow-xs"
              >
                <Printer size={12} />
                Cetak
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 bg-gray-50 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all cursor-pointer"
                title="Tutup Pratinjau"
              >
                <X size={14} />
              </button>
            </div>
          </motion.div>

          {/* Dynamic scoped print style specifically for 58/80mm thermal receipt printer rolls */}
          <style dangerouslySetInnerHTML={{ __html: `
            @media print {
              @page {
                size: 80mm auto;
                margin: 0 !important;
              }
              html, body {
                width: 80mm !important;
                background-color: #fff !important;
                color: #000 !important;
                margin: 0 !important;
                padding: 0 !important;
              }
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
                width: 80mm !important;
                max-width: 80mm !important;
                margin: 0 !important;
                padding: 4mm !important;
                background: white !important;
                color: black !important;
                box-shadow: none !important;
                border: none !important;
                overflow: visible !important;
                font-family: 'Courier New', Courier, monospace !important;
              }
            }
          `}} />

          {/* Thermal Receipt Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="w-full max-w-[80mm] mx-auto bg-transparent p-0 mb-12 flex justify-center print:p-0 print:mb-0 z-10"
          >
            {/* Printable Thermal Receipt Card */}
            <div 
              id="printable-kwitansi-area" 
              className="w-[80mm] bg-white p-5 text-black shadow-2xl relative flex flex-col font-mono text-[10px] leading-tight border border-gray-300 print:border-none print:shadow-none print:w-[80mm]"
              style={{ boxSizing: 'border-box' }}
            >
              
              {/* HEADER */}
              <div className="text-center font-bold">
                <p className="text-xs tracking-wider">PANITIA PHBN RT.002/003</p>
                <p className="text-[11px] font-black tracking-widest mt-0.5">HUT RI KE-81</p>
                <p className="text-[9px] font-normal leading-none text-gray-700 mt-1">KEL. KEDAUNG BARU</p>
                <p className="text-[8px] font-normal text-gray-500 mt-0.5">TANGERANG, BANTEN</p>
              </div>

              {/* DIVIDER */}
              <div className="text-center my-2 text-gray-400 select-none tracking-tighter">
                ================================
              </div>

              {/* TRANSACTION INFO */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>No. Resi:</span>
                  <span className="font-bold">KW-{kk.rt}-{kk.id.toString().slice(-4)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tanggal :</span>
                  <span>{new Date().toLocaleDateString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              {/* DIVIDER */}
              <div className="text-center my-2 text-gray-400 select-none tracking-tighter">
                --------------------------------
              </div>

              {/* WARGA DETAILS */}
              <div className="space-y-1">
                <div className="flex flex-col mb-1">
                  <span className="text-[9px] uppercase text-gray-500">Nama Kepala Keluarga:</span>
                  <span className="font-bold text-xs uppercase">{kk.nama_kk}</span>
                </div>
                <div className="flex justify-between">
                  <span>Rukun Tetangga:</span>
                  <span className="font-bold">RT {kk.rt}</span>
                </div>
                <div className="flex justify-between">
                  <span>Wajib Iuran :</span>
                  <span>Rp {formattedTarget}</span>
                </div>
                <div className="flex justify-between text-base font-black border-t border-dashed border-gray-300 pt-1 mt-1">
                  <span>TOTAL SETOR :</span>
                  <span>Rp {formattedTerbayar}</span>
                </div>
              </div>

              {/* DIVIDER */}
              <div className="text-center my-2 text-gray-400 select-none tracking-tighter">
                --------------------------------
              </div>

              {/* RIWAYAT SETORAN */}
              <div className="space-y-1 text-[9px]">
                <p className="font-bold uppercase text-[8px] tracking-wider text-gray-500">Rincian Angsuran Setoran:</p>
                {kk.riwayat.map((item, idx) => (
                  <div key={item.id || idx} className="flex justify-between pl-1">
                    <span>{idx + 1}. {item.tanggal}</span>
                    <span className="font-bold">Rp {item.jumlah.toLocaleString('id-ID')}</span>
                  </div>
                ))}
                {kk.riwayat.length === 0 && (
                  <p className="text-center italic text-gray-400">Belum ada transaksi</p>
                )}
              </div>

              {/* DIVIDER */}
              <div className="text-center my-2 text-gray-400 select-none tracking-tighter">
                ================================
              </div>

              {/* STATUS BOX */}
              <div className="my-2 p-1.5 border border-black rounded text-center text-[11px] font-black uppercase tracking-wider">
                {isLunas ? (
                  <div className="text-black">
                    *** STATUS: LUNAS ***
                  </div>
                ) : (
                  <div className="text-black">
                    * BELUM LUNAS (SISA: Rp {formattedDeficit}) *
                  </div>
                )}
              </div>

              {/* KUPON DOORPRIZE */}
              <div className="my-2.5 p-2 border-2 border-dashed border-black rounded text-center bg-gray-50/50 relative">
                <p className="text-[8px] font-extrabold uppercase tracking-widest text-gray-500 leading-none">
                  KUPON UNDIAN DOORPRIZE PHBN
                </p>
                <p className="text-[14px] font-black tracking-widest text-black mt-1 leading-none">
                  {getDoorprizeCode(kk.id, kk.rt)}
                </p>
                <p className="text-[7px] text-gray-400 uppercase tracking-wider mt-1 leading-none font-sans font-bold">
                  * Simpan struk ini untuk diundi pada puncak acara *
                </p>
              </div>

              {/* TERBILANG */}
              <p className="text-[8px] text-gray-600 italic text-center mb-4 px-1">
                "{formatTerbilang(kk.terbayar)}"
              </p>

              {/* VERTICAL STACKED SIGNATURES (PERFECT FOR THERMAL) */}
              <div className="space-y-4 text-[9px] text-center border-t border-dashed border-gray-300 pt-3">
                <div>
                  <p className="text-gray-500 font-bold uppercase text-[8px]">Yang Menyerahkan,</p>
                  <p className="font-bold text-black mt-4 border-b border-black w-2/3 mx-auto pb-0.5">Ahmad Mujibur Rahman</p>
                  <p className="text-[7px] text-gray-400 leading-none mt-0.5">UTUSAN RT / BENDAHARA IURAN</p>
                </div>
                <div>
                  <p className="text-gray-500 font-bold uppercase text-[8px]">Diterima Oleh (Bendahara),</p>
                  <p className="font-bold text-black mt-4 border-b border-black w-2/3 mx-auto pb-0.5">Ayeh Patoni</p>
                  <p className="text-[7px] text-gray-400 leading-none mt-0.5">BENDAHARA PANITIA PHBN</p>
                </div>
                <div>
                  <p className="text-gray-500 font-bold uppercase text-[8px]">Mengetahui &amp; Menyetujui,</p>
                  <p className="font-bold text-black mt-4 border-b border-black w-2/3 mx-auto pb-0.5">Anto (Zhipo)</p>
                  <p className="text-[7px] text-gray-400 leading-none mt-0.5">KETUA PANITIA HUT RI-81</p>
                </div>
              </div>

              {/* FOOTER */}
              <div className="text-center mt-6 pt-3 border-t border-dashed border-gray-300 text-[8px] text-gray-500 leading-tight space-y-1">
                <p className="font-bold">TERIMA KASIH ATAS PARTISIPASI ANDA</p>
                <p>Merdeka! HUT RI Ke-81</p>
                <p className="text-[6px] text-gray-400 font-sans leading-none pt-2">
                  Kwitansi ini sah menurut hukum &amp; diakui secara digital berdasarkan UU ITE No. 11/2008.
                </p>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
