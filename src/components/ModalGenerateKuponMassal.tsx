import React, { useState } from 'react';
import { X, Printer, Search, Sparkles, Ticket, QrCode, Check } from 'lucide-react';
import { IuranKK, Peserta } from '../types';
import { getDoorprizeCode } from './ModalCetakKwitansiIuran';
import { motion } from 'motion/react';

interface ModalGenerateKuponMassalProps {
  isOpen: boolean;
  onClose: () => void;
  iuranKKList: IuranKK[];
  pesertas: Peserta[];
}

export default function ModalGenerateKuponMassal({
  isOpen,
  onClose,
  iuranKKList = [],
  pesertas = [],
}: ModalGenerateKuponMassalProps) {
  // Config States
  const [sourceType, setSourceType] = useState<'kk' | 'peserta'>('kk');
  const [rtFilter, setRtFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'lunas_only'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  // Generate a deterministic and unique doorprize code for Peserta
  const getPesertaDoorprizeCode = (id: number, rt: string): string => {
    const hash = (id * 17291 + 5449) % 9000 + 1000;
    const cleanRt = rt.replace(/\D/g, '').padStart(2, '0');
    return `RT-${cleanRt}-JS-${hash}`; // Prepend with RT-XX
  };

  // Process data based on source selection
  const getTickets = () => {
    if (sourceType === 'kk') {
      return iuranKKList
        .filter(kk => {
          const matchesRt = rtFilter === 'all' || kk.rt === rtFilter;
          const matchesPayment = paymentFilter === 'all' || kk.status === 'Lunas';
          const matchesSearch = kk.nama_kk.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                getDoorprizeCode(kk.id, kk.rt).toLowerCase().includes(searchQuery.toLowerCase());
          return matchesRt && matchesPayment && matchesSearch;
        })
        .map((kk, idx) => ({
          id: kk.id,
          name: kk.nama_kk,
          rt: kk.rt,
          code: getDoorprizeCode(kk.id, kk.rt),
          subtitle: 'KUPON KK WARGA',
          status: kk.status,
          index: idx + 1,
        }));
    } else {
      return pesertas
        .filter(p => {
          const matchesRt = rtFilter === 'all' || p.rt === rtFilter;
          const matchesSearch = p.nama_peserta.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                getPesertaDoorprizeCode(p.id, p.rt).toLowerCase().includes(searchQuery.toLowerCase());
          return matchesRt && matchesSearch;
        })
        .map((p, idx) => ({
          id: p.id,
          name: p.nama_peserta,
          rt: p.rt,
          code: getPesertaDoorprizeCode(p.id, p.rt),
          subtitle: 'KUPON PESERTA LOMBA',
          status: p.absensi ? 'Hadir Lapangan' : 'Terdaftar',
          index: idx + 1,
        }));
    }
  };

  const tickets = getTickets();

  // Chunk tickets array into pages of 20 elements for printing
  const ticketPages: any[][] = [];
  for (let i = 0; i < tickets.length; i += 20) {
    ticketPages.push(tickets.slice(i, i + 20));
  }

  // Print function
  const handlePrint = () => {
    window.print();
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div 
      id="modal-generate-kupon" 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md overflow-y-auto"
    >
      {/* Printable Style Sheet Block - Will handle screen vs print rendering and precise A4 grid division */}
      <style>{`
        /* Screen view: hide print-area */
        @media screen {
          #print-area {
            display: none !important;
          }
        }

        /* Print view: hide everything except print-area */
        @media print {
          /* Hide everything in root */
          body * {
            visibility: hidden;
            background: none !important;
          }
          
          /* Show print-area only */
          #print-area, #print-area * {
            visibility: visible !important;
          }

          /* Ensure the overlay container has transparent background & covers full viewport */
          #modal-generate-kupon {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            min-height: 100% !important;
            background: white !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
            z-index: 99999 !important;
          }

          #print-area {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important;
            background: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          /* 20 Coupons per A4 sheet layout grid */
          .print-page {
            page-break-after: always;
            page-break-inside: avoid;
            height: 297mm !important;
            width: 210mm !important;
            padding: 8mm 6mm 8mm 6mm !important;
            box-sizing: border-box !important;
            background: white !important;
            display: grid !important;
            grid-template-columns: repeat(2, 1fr) !important;
            grid-template-rows: repeat(10, 1fr) !important;
            gap: 2mm 3mm !important;
            overflow: hidden !important;
          }

          .print-page:last-child {
            page-break-after: avoid;
          }

          /* Micro-coupon design */
          .ticket-card-print {
            border: 1px dashed #dc2626 !important;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            display: flex !important;
            flex-direction: row !important;
            height: 26mm !important;
            max-height: 26mm !important;
            min-height: 26mm !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
          }

          .ticket-main {
            border-right: 1px dashed #cccccc !important;
            padding: 4px 6px !important;
            flex: 1 !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            min-width: 0 !important;
          }

          .ticket-stub {
            width: 58px !important;
            padding: 4px 2px !important;
            background: #fafafa !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            align-items: center !important;
            text-align: center !important;
          }

          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-5xl bg-white border border-gray-100 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] no-print overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-red-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 text-white rounded-2xl flex items-center justify-center shadow-md shadow-red-200">
              <Ticket size={20} className="animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base sm:text-lg flex items-center gap-2">
                Mass Generator E-Ticket &amp; Kupon Undian
                <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">
                  HUT RI ke-81
                </span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Cetak massal kupon doorprize &amp; tiket jalan sehat kolektif (Pas 20 kupon per lembar A4)
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Configurations Area */}
        <div className="p-4 bg-gray-50 border-b border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Sumber Data Toggle */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Sumber Data Warga</label>
            <div className="flex bg-gray-200/60 p-1 rounded-xl">
              <button
                onClick={() => { setSourceType('kk'); setPaymentFilter('all'); }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${sourceType === 'kk' ? 'bg-white text-red-600 shadow-3xs' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Kepala Keluarga (KK)
              </button>
              <button
                onClick={() => { setSourceType('peserta'); }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${sourceType === 'peserta' ? 'bg-white text-red-600 shadow-3xs' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Peserta Lomba
              </button>
            </div>
          </div>

          {/* RT Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Saring Berdasarkan RT</label>
            <select
              value={rtFilter}
              onChange={e => setRtFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-500"
            >
              <option value="all">Semua RT</option>
              <option value="RT 01">RT 01</option>
              <option value="RT 02">RT 02</option>
              <option value="RT 03">RT 03</option>
              <option value="RT 04">RT 04</option>
            </select>
          </div>

          {/* Status Pembayaran (Only for KK) */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Status Pembayaran Iuran</label>
            <select
              value={paymentFilter}
              onChange={e => setPaymentFilter(e.target.value as any)}
              disabled={sourceType === 'peserta'}
              className="w-full px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl disabled:bg-gray-100 disabled:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-red-500"
            >
              <option value="all">Semua Status (Lunas &amp; Belum)</option>
              <option value="lunas_only">Hanya yang Lunas (Prioritas Doorprize)</option>
            </select>
          </div>

          {/* Search Input */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Cari Nama / Kode</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari warga..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-4 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
        </div>

        {/* Quick Toolbar */}
        <div className="px-5 py-3.5 bg-red-50/40 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-red-500 animate-pulse" />
            <span className="text-xs text-gray-600 font-medium">
              Ditemukan <strong className="text-red-600 font-bold">{tickets.length}</strong> kupon ({ticketPages.length} lembar A4 siap cetak).
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              disabled={tickets.length === 0}
              className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-xs cursor-pointer transition-all active:scale-95"
            >
              <Printer size={14} />
              Cetak Massal (A4 Grid)
            </button>
          </div>
        </div>

        {/* Tickets Grid Display */}
        <div className="flex-1 overflow-y-auto p-5 bg-gray-50/50">
          {tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 space-y-3">
              <Ticket size={48} className="stroke-[1.2] text-gray-300 animate-bounce" />
              <div className="text-center">
                <p className="text-sm font-bold text-gray-600">Tidak Ada Data Kupon</p>
                <p className="text-xs text-gray-400 mt-1">Saring atau masukkan kueri pencarian yang berbeda.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {tickets.map((ticket) => (
                <div
                  key={`${sourceType}-${ticket.id}`}
                  className="bg-white border-2 border-dashed border-red-200 rounded-2xl flex hover:shadow-md transition-all duration-300 relative overflow-hidden group"
                >
                  {/* Left festive red sidebar banner */}
                  <div className="w-1.5 bg-gradient-to-b from-red-600 to-red-400 shrink-0"></div>

                  {/* Main Ticket Area */}
                  <div className="flex-1 p-3.5 flex flex-col justify-between space-y-3.5 min-w-0">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between flex-wrap gap-1.5">
                        <span className="text-[9px] bg-red-50 text-red-600 px-2 py-0.5 rounded-md font-extrabold uppercase tracking-widest border border-red-100/50">
                          {ticket.subtitle}
                        </span>
                        <span className="text-[10px] font-mono font-semibold text-gray-400">
                          No. #{String(ticket.index).padStart(3, '0')}
                        </span>
                      </div>

                      <h4 className="font-display font-extrabold text-sm sm:text-base text-gray-900 truncate uppercase tracking-tight">
                        {ticket.name}
                      </h4>

                      <div className="flex items-center gap-2.5 text-xs text-gray-500">
                        <span className="bg-gray-100 px-2 py-0.5 rounded font-bold">{ticket.rt}</span>
                        <span className="text-gray-300">•</span>
                        <span>Status: <strong className={ticket.status === 'Lunas' || ticket.status === 'Hadir Lapangan' ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>{ticket.status}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-end justify-between border-t border-gray-100 pt-2.5">
                      <div className="space-y-0.5">
                        <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider block">KODE UNDIAN DOORPRIZE</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs text-red-600 font-black bg-red-50/50 px-2 py-0.5 rounded border border-red-100/30">
                            {ticket.code}
                          </span>
                          <button
                            onClick={() => handleCopyCode(ticket.code)}
                            className="text-[10px] text-gray-400 hover:text-red-500 cursor-pointer"
                            title="Copy code"
                          >
                            {copiedCode === ticket.code ? (
                              <Check size={11} className="text-emerald-500 stroke-[3]" />
                            ) : (
                              <span className="text-[9px] font-bold hover:underline">Copy</span>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Barcode graphic simulation */}
                      <div className="flex flex-col items-end shrink-0 select-none">
                        <div className="flex items-baseline gap-0.5">
                          {[1, 3, 1, 2, 4, 1, 3, 2, 1, 3, 2, 1, 4, 2].map((w, i) => (
                            <div key={i} className="bg-gray-800" style={{ width: `${w}px`, height: '24px' }}></div>
                          ))}
                        </div>
                        <span className="text-[8px] font-mono text-gray-400 mt-1 tracking-widest">{ticket.code.replace(/[^a-zA-Z0-9]/g, '')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Perforated vertical separator line */}
                  <div className="relative flex flex-col justify-between items-center py-2.5">
                    <div className="w-4 h-4 bg-gray-50 rounded-full -mt-4.5 border border-red-100 border-t-transparent shadow-inner"></div>
                    <div className="flex-1 border-r-2 border-dotted border-gray-200"></div>
                    <div className="w-4 h-4 bg-gray-50 rounded-full -mb-4.5 border border-red-100 border-b-transparent shadow-inner"></div>
                  </div>

                  {/* Tear-off Stub (Struk Kupon) */}
                  <div className="w-24 sm:w-28 bg-slate-50 p-3 flex flex-col justify-between items-center text-center shrink-0">
                    <div className="space-y-1">
                      <QrCode size={20} className="text-gray-400 mx-auto" />
                      <span className="text-[8px] text-gray-400 uppercase font-black tracking-wider block">STRUK PANITIA</span>
                    </div>

                    <div className="space-y-1">
                      <span className="font-mono text-[10px] text-gray-900 font-extrabold bg-white border border-gray-150 px-1 rounded block truncate max-w-20">
                        {ticket.code}
                      </span>
                      <span className="text-[8px] text-gray-400 font-bold uppercase">{ticket.rt}</span>
                    </div>

                    <span className="text-[7px] text-gray-400 uppercase tracking-widest block leading-none font-bold">SOBEK DI SINI</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Footer */}
        <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gray-50">
          <p className="text-[10px] text-gray-500 max-w-md">
            💡 <strong>Saran Panitia:</strong> Desain ini otomatis membagi tepat <strong>20 kupon per halaman A4</strong>. Kode kupon terhubung langsung dengan pencatatan Kwitansi &amp; Sistem Undian Doorprize utama. Potong kupon di batas garis putus-putus.
          </p>
          <button
            onClick={onClose}
            className="w-full sm:w-auto bg-gray-800 hover:bg-gray-900 text-white text-xs font-bold px-5 py-2 rounded-xl cursor-pointer transition-all"
          >
            Selesai &amp; Tutup
          </button>
        </div>
      </motion.div>

      {/* =========================================================================
          PRINT-ONLY AREA
          ========================================================================= */}
      <div id="print-area">
        {ticketPages.map((pageTickets, pageIdx) => (
          <div key={pageIdx} className="print-page">
            {pageTickets.map((ticket) => (
              <div
                key={`print-${ticket.id}`}
                className="ticket-card-print flex flex-row bg-white text-black"
              >
                {/* Main Ticket Area */}
                <div className="ticket-main">
                  <div className="flex justify-between items-center leading-none">
                    <span className="text-[7px] font-extrabold bg-red-100 text-red-700 px-1 py-0.2 rounded uppercase">
                      {ticket.subtitle}
                    </span>
                    <span className="text-[7px] font-mono text-gray-400">
                      No. #{String(ticket.index).padStart(3, '0')}
                    </span>
                  </div>

                  <div className="my-0.5 min-w-0">
                    <h3 className="font-extrabold text-[9px] uppercase truncate text-gray-900 leading-tight">
                      {ticket.name}
                    </h3>
                    <div className="flex gap-1.5 text-[7px] text-gray-500 font-medium leading-none mt-0.5">
                      <span className="bg-gray-100 px-1 rounded font-bold text-gray-800">{ticket.rt}</span>
                      <span>•</span>
                      <span className="truncate">Status: {ticket.status}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-end border-t border-gray-100 pt-0.5 leading-none">
                    <div className="flex flex-col">
                      <span className="text-[5px] text-gray-400 font-bold uppercase tracking-wider">KUPON DOORPRIZE</span>
                      <span className="font-mono text-[8px] text-red-600 font-extrabold">{ticket.code}</span>
                    </div>

                    {/* Stylized barcode */}
                    <div className="flex flex-col items-end opacity-80 shrink-0">
                      <div className="flex items-baseline gap-[0.5px]">
                        {[1, 2, 1, 1, 2, 1, 2, 1].map((w, i) => (
                          <div key={i} className="bg-black" style={{ width: `${w}px`, height: '8px' }}></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Coupon Stub */}
                <div className="ticket-stub border-l border-dashed border-gray-200">
                  <span className="text-[6px] text-gray-400 font-black tracking-wider leading-none">STRUK</span>
                  
                  <div className="my-0.5 min-w-0 w-full text-center">
                    <span className="font-mono text-[8px] font-extrabold text-black block truncate leading-none">
                      {ticket.code}
                    </span>
                    <span className="text-[6px] text-gray-500 font-bold block mt-0.5 leading-none">{ticket.rt}</span>
                  </div>

                  <span className="text-[5px] text-gray-400 font-bold block uppercase border-t border-gray-200 pt-0.5 w-full leading-none scale-90">PANITIA</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
