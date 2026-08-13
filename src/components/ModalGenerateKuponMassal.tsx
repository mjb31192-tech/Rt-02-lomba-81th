import React, { useState } from 'react';
import { X, Printer, Search, Sparkles, Ticket, QrCode, Check, ChevronDown } from 'lucide-react';
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
  const [isPreviewOpen, setIsPreviewOpen] = useState(true);

  if (!isOpen) return null;

  // Generate a deterministic and unique doorprize code for Peserta
  const getPesertaDoorprizeCode = (id: number, rt: string): string => {
    const cleanRt = rt.replace(/\D/g, '').padStart(2, '0');
    const num = String((id * 17 + 3) % 100).padStart(2, '0');
    return `RT-${cleanRt}-${num}`;
  };

  // Helper to split code into prefix (e.g., RT-02-) and suffix (e.g., 39)
  const getCodeParts = (code: string) => {
    const codeStr = code || '';
    let prefix = '';
    let suffix = '';
    if (codeStr.includes('-')) {
      const parts = codeStr.split('-');
      suffix = parts.pop() || '';
      prefix = parts.join('-') + '-';
    } else {
      if (codeStr.length > 2) {
        suffix = codeStr.slice(-2);
        prefix = codeStr.slice(0, -2);
      } else {
        suffix = codeStr;
        prefix = '';
      }
    }
    return { prefix, suffix };
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
          header, main, nav, footer, .no-print {
            display: none !important;
            height: 0 !important;
            overflow: hidden !important;
          }
          
          /* Show print-area only */
          #print-area, #print-area * {
            visibility: visible !important;
          }
          #printable-lpj,
          #printable-a4-area,
          #printable-kwitansi-area {
            display: none !important;
            height: 0 !important;
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
            border: 1.5px dashed #dc2626 !important;
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
            position: relative !important;
          }

          .ticket-main {
            padding: 3px 6px !important;
            flex: 1 !important;
            display: flex !important;
            flex-direction: row !important;
            justify-content: space-between !important;
            min-width: 0 !important;
            position: relative !important;
          }

          .ticket-stub {
            width: 58px !important;
            padding: 3px 2px !important;
            background: white !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            align-items: center !important;
            text-align: center !important;
            border-left: 1px dashed #cccccc !important;
          }

          .print-col-left {
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            flex: 1 !important;
            min-width: 0 !important;
            z-index: 10 !important;
          }

          .print-badge {
            background-color: #dc2626 !important;
            color: white !important;
            font-size: 5px !important;
            font-weight: 900 !important;
            padding: 1px 3px !important;
            border-radius: 1px !important;
            text-transform: uppercase !important;
            letter-spacing: 0.5px !important;
            width: fit-content !important;
            line-height: 1 !important;
          }

          .print-name {
            font-size: 9px !important;
            font-weight: 900 !important;
            color: black !important;
            text-transform: uppercase !important;
            letter-spacing: -0.2px !important;
            line-height: 1 !important;
            margin-top: 2px !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
          }

          .print-detail {
            font-size: 5.5px !important;
            font-weight: 700 !important;
            color: #4b5563 !important;
            line-height: 1 !important;
            margin-top: 1px !important;
            display: flex !important;
            align-items: center !important;
            gap: 2px !important;
          }

          .print-detail-dot {
            width: 2px !important;
            height: 2px !important;
            background-color: #dc2626 !important;
            border-radius: 50% !important;
            display: inline-block !important;
          }

          .print-status-lunas {
            color: #16a34a !important;
            font-weight: 800 !important;
          }

          .print-status-mencicil {
            color: #d97706 !important;
            font-weight: 800 !important;
          }

          .print-divider-line {
            border-top: 0.5px solid #e5e7eb !important;
            margin: 2px 0 !important;
            width: 100% !important;
          }

          .print-label-doorprize {
            font-size: 4.5px !important;
            font-weight: 800 !important;
            color: #9ca3af !important;
            text-transform: uppercase !important;
            letter-spacing: 0.3px !important;
            line-height: 1 !important;
          }

          .print-big-code {
            font-size: 13.5px !important;
            font-weight: 900 !important;
            color: #dc2626 !important;
            line-height: 1 !important;
            letter-spacing: -0.3px !important;
            margin-top: 1px !important;
            font-family: monospace !important;
          }

          /* 81 logo layout */
          .print-logo-col {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            width: 58px !important;
            border-left: 0.5px solid #f3f4f6 !important;
            padding-left: 3px !important;
            flex-shrink: 0 !important;
            z-index: 10 !important;
          }

          .print-logo-row {
            display: flex !important;
            flex-direction: row !important;
            align-items: center !important;
            gap: 2.5px !important;
          }

          .print-logo-svg {
            width: 17px !important;
            height: 17px !important;
            color: #dc2626 !important;
          }

          .print-logo-text {
            display: flex !important;
            flex-direction: column !important;
            font-size: 3.5px !important;
            font-weight: 900 !important;
            line-height: 0.95 !important;
            color: black !important;
            text-transform: uppercase !important;
            letter-spacing: -0.1px !important;
          }

          .print-logo-subtext {
            font-size: 3.2px !important;
            color: #dc2626 !important;
            font-weight: 800 !important;
            text-align: center !important;
            margin-top: 2.5px !important;
            line-height: 1.1 !important;
            width: 100% !important;
            white-space: nowrap !important;
          }

          /* Stub classes */
          .print-stub-badge {
            background-color: #dc2626 !important;
            color: white !important;
            font-size: 5px !important;
            font-weight: 900 !important;
            padding: 1px 4px !important;
            border-radius: 1px !important;
            text-transform: uppercase !important;
            letter-spacing: 0.5px !important;
            line-height: 1 !important;
          }

          .print-stub-code {
            font-size: 8px !important;
            font-weight: 900 !important;
            color: black !important;
            font-family: monospace !important;
            line-height: 1 !important;
            margin-top: 2px !important;
          }

          .print-stub-rt {
            font-size: 5px !important;
            font-weight: 700 !important;
            color: #4b5563 !important;
            line-height: 1 !important;
            margin-top: 1px !important;
          }

          .print-stub-line {
            width: 12px !important;
            border-top: 0.5px solid #dc2626 !important;
            margin: 2px auto !important;
          }

          .print-stub-footer {
            font-size: 4.5px !important;
            font-weight: 800 !important;
            color: #9ca3af !important;
            text-transform: uppercase !important;
            letter-spacing: 0.5px !important;
            line-height: 1 !important;
          }

          .print-flag-decor {
            position: absolute !important;
            bottom: 0 !important;
            left: 0 !important;
            width: 32px !important;
            height: 14px !important;
            opacity: 0.25 !important;
            pointer-events: none !important;
            z-index: 1 !important;
          }

          .print-skyline-decor {
            position: absolute !important;
            bottom: 0 !important;
            left: 15px !important;
            right: 15px !important;
            height: 6px !important;
            opacity: 0.08 !important;
            pointer-events: none !important;
            z-index: 1 !important;
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
        className="relative w-full max-w-5xl bg-white border border-gray-100 rounded-3xl shadow-2xl flex flex-col h-[90vh] md:h-auto max-h-[90vh] no-print overflow-hidden"
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
        <div className="p-3 bg-gray-50 border-b border-gray-150 grid grid-cols-2 md:grid-cols-4 gap-3">
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

        {/* Accordion Toggle Header (Dropdown Atas Bawah) - Fully Tap-Friendly on Mobile */}
        <div 
          onClick={() => setIsPreviewOpen(!isPreviewOpen)}
          className="bg-slate-50/80 hover:bg-slate-100/90 border-b border-gray-150 px-5 py-3.5 flex items-center justify-between no-print select-none cursor-pointer transition-all duration-200 active:bg-gray-200"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-gray-800">
                Preview Cetak Kupon
              </span>
              <span className="text-[10px] bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full font-black">
                {tickets.length} Kupon
              </span>
            </div>
            <p className="text-[10px] text-gray-500 font-medium">
              {isPreviewOpen ? 'Ketuk untuk menyembunyikan preview' : 'Ketuk untuk menampilkan kupon siap cetak'}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-[9px] text-gray-400 font-semibold italic hidden md:inline">
              *Menyembunyikan preview tidak mempengaruhi hasil cetakan A4
            </span>
            <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 shadow-3xs hover:text-red-600 hover:border-red-200 transition-all">
              <ChevronDown 
                size={16} 
                className={`transition-transform duration-300 ${isPreviewOpen ? 'rotate-180' : 'rotate-0'}`} 
              />
            </div>
          </div>
        </div>

        {/* Tickets Grid Display */}
        {isPreviewOpen ? (
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
                {tickets.map((ticket) => {
                  const { prefix: codePrefix, suffix: codeSuffix } = getCodeParts(ticket.code);
                  return (
                    <div
                      key={`${sourceType}-${ticket.id}`}
                      className="bg-white border-2 border-dashed border-red-500 rounded-2xl flex hover:shadow-md transition-all duration-300 relative overflow-hidden group"
                    >
                      {/* Merah Putih waving flag decoration in bottom-left */}
                      <div className="absolute bottom-0 left-0 w-24 h-12 pointer-events-none opacity-20 select-none overflow-hidden z-0">
                        <svg viewBox="0 0 100 50" className="w-full h-full text-red-600" preserveAspectRatio="none" fill="currentColor">
                          <path d="M0,25 Q25,15 50,25 T100,25 L100,50 L0,50 Z" />
                          <path d="M0,32 Q25,22 50,32 T100,32 L100,50 L0,50 Z" fill="white" />
                        </svg>
                      </div>

                      {/* Skyline silhouette decoration at the bottom of the card */}
                      <div className="absolute bottom-0 left-12 right-12 h-6 pointer-events-none opacity-10 select-none overflow-hidden z-0">
                        <svg viewBox="0 0 200 40" className="w-full h-full text-red-700" preserveAspectRatio="none" fill="currentColor">
                          <path d="M0,40 L10,40 L10,25 L15,25 L15,40 L25,40 L25,15 L32,15 L32,40 L40,40 L40,30 L45,30 L45,40 L55,40 L60,10 L65,10 L65,40 L75,40 L75,20 L82,20 L82,40 L90,40 L93,5 L97,5 L97,40 L110,40 L110,25 L115,25 L115,40 L125,40 L128,0 L132,0 L132,40 L140,40 L140,30 L145,30 L145,40 L155,40 L160,15 L165,15 L165,40 L180,40 L180,25 L185,25 L185,40 L200,40 Z" />
                        </svg>
                      </div>

                      {/* Main Ticket Area */}
                      <div className="flex-1 p-3.5 flex flex-row justify-between min-w-0 z-10">
                        {/* Left column: Name and Code */}
                        <div className="flex-1 flex flex-col justify-between min-w-0 pr-2">
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="bg-red-600 text-white font-extrabold text-[8px] sm:text-[9px] px-2 py-0.5 rounded-sm tracking-wider uppercase block w-fit shadow-3xs">
                                {ticket.subtitle}
                              </span>
                              <span className="text-[10px] font-mono font-bold text-gray-400">
                                #{String(ticket.index).padStart(3, '0')}
                              </span>
                            </div>

                            <h4 className="font-display font-black text-base sm:text-lg text-gray-950 uppercase tracking-tight leading-none mt-2 truncate">
                              {ticket.name}
                            </h4>

                            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-500 font-bold mt-1.5 flex-wrap">
                              <span>{ticket.rt}</span>
                              <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                              <span className={ticket.status === 'Lunas' || ticket.status === 'Hadir Lapangan' ? 'text-emerald-600 font-extrabold' : 'text-amber-600 font-extrabold'}>
                                {ticket.status}
                              </span>
                            </div>
                          </div>

                          <div className="border-t border-gray-200/80 my-2"></div>

                          <div>
                            <span className="text-[8px] text-gray-400 font-black uppercase tracking-wider block">KUPON DOORPRIZE</span>
                            <div className="flex items-baseline gap-[1px] mt-0.5 leading-none select-all">
                              {codePrefix && (
                                <span className="text-sm sm:text-base font-mono text-red-600/75 font-bold tracking-tight">
                                  {codePrefix}
                                </span>
                              )}
                              <span className="text-2xl sm:text-3xl font-mono text-red-600 font-black tracking-tighter leading-none">
                                {codeSuffix}
                              </span>
                              <button
                                onClick={() => handleCopyCode(ticket.code)}
                                className="text-[10px] text-gray-400 hover:text-red-500 cursor-pointer p-0.5 shrink-0 ml-2 self-center"
                                title="Copy code"
                              >
                                {copiedCode === ticket.code ? (
                                  <Check size={11} className="text-emerald-500 stroke-[3]" />
                                ) : (
                                  <span className="text-[9px] font-bold hover:underline bg-gray-150 px-1 py-0.5 rounded">Copy</span>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Right column: HUT 81 Independence Logo & Branding */}
                        <div className="flex flex-col items-center justify-center shrink-0 w-32 pl-3 border-l border-gray-150">
                          <div className="flex items-center gap-1.5">
                            {/* Independence 81st Logo */}
                            <svg viewBox="0 0 100 100" className="w-9 h-9 text-red-600 shrink-0" fill="none">
                              {/* Layer 1: Red Base */}
                              <g stroke="currentColor" strokeWidth="11" strokeLinecap="round" strokeLinejoin="miter">
                                <circle cx="32" cy="35" r="15" />
                                <circle cx="32" cy="63" r="21" />
                              </g>
                              <path d="M44,35 L65,18 L65,85" stroke="currentColor" strokeWidth="11" strokeLinecap="butt" strokeLinejoin="miter" />

                              {/* Layer 2: White Overlay */}
                              <g stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="miter">
                                <circle cx="32" cy="35" r="15" />
                                <circle cx="32" cy="63" r="21" />
                              </g>
                              <path d="M44,35 L65,18 L65,85" stroke="white" strokeWidth="4" strokeLinecap="butt" strokeLinejoin="miter" />

                              {/* Layer 3: Red Top Center Line for 8 (to make it a 3-stripe ribbon) */}
                              <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="miter">
                                <circle cx="32" cy="35" r="15" />
                                <circle cx="32" cy="63" r="21" />
                              </g>
                            </svg>
                            
                            <div className="flex flex-col text-[7px] font-sans font-black tracking-tight leading-none text-gray-950 uppercase shrink-0">
                              <span>Indonesia</span>
                              <span>Berdaulat</span>
                              <span>Adil Dan</span>
                              <span>Makmur</span>
                            </div>
                          </div>
                          
                          <div className="text-[6px] text-center text-red-600 font-black uppercase tracking-tight leading-none mt-2 w-full">
                            <div>17 AGUSTUS 1945 - 17 AGUSTUS 2026</div>
                            <div className="text-[5px] tracking-widest opacity-90 mt-0.5">DIRGAHAYU REPUBLIK INDONESIA</div>
                          </div>
                        </div>
                      </div>

                      {/* Perforated vertical separator line */}
                      <div className="relative flex flex-col justify-between items-center py-2.5 z-10 shrink-0">
                        <div className="w-3 h-3 bg-gray-150 rounded-full -mt-4 border border-red-100 border-t-transparent shadow-inner"></div>
                        <div className="flex-1 border-r-2 border-dotted border-gray-300"></div>
                        <div className="w-3 h-3 bg-gray-150 rounded-full -mb-4 border border-red-100 border-b-transparent shadow-inner"></div>
                      </div>

                      {/* Tear-off Stub (Struk Kupon) */}
                      <div className="w-24 sm:w-28 bg-white p-2.5 flex flex-col justify-between items-center text-center shrink-0 relative overflow-hidden z-10">
                        <span className="bg-red-600 text-white font-extrabold text-[8px] sm:text-[9px] px-3 py-0.5 rounded-xs tracking-wider uppercase block w-fit shadow-3xs">
                          STRUK
                        </span>

                        <div className="my-1.5 w-full">
                          <div className="flex items-baseline justify-center leading-none">
                            {codePrefix && (
                              <span className="font-mono text-[9px] text-gray-500 font-bold">{codePrefix}</span>
                            )}
                            <span className="font-mono text-sm sm:text-base text-gray-900 font-black leading-none">{codeSuffix}</span>
                          </div>
                          <span className="text-[8px] text-gray-500 font-bold block mt-1.5 uppercase">
                            {ticket.rt}
                          </span>
                        </div>

                        <div className="w-full">
                          <div className="w-10 border-t border-red-500 mx-auto mb-1"></div>
                          <span className="text-[8px] text-gray-400 font-black uppercase tracking-widest block leading-none">PANITIA</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 bg-gray-50/50 text-center text-gray-500 no-print select-none">
            <Ticket size={44} className="text-gray-300 mb-2 animate-bounce stroke-[1.2]" />
            <p className="text-xs font-bold text-gray-700">Preview Kupon Sedang Disembunyikan</p>
            <p className="text-[11px] text-gray-400 mt-1 max-w-sm">Klik tombol dropdown di atas ("Tampilkan Preview Kupon") untuk membuka daftar {tickets.length} kupon.</p>
          </div>
        )}

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
            {pageTickets.map((ticket) => {
              const { prefix: codePrefix, suffix: codeSuffix } = getCodeParts(ticket.code);
              return (
                <div
                  key={`print-${ticket.id}`}
                  className="ticket-card-print flex flex-row bg-white text-black"
                >
                  {/* Wavy flag and skyline decorations for printing */}
                  <div className="print-flag-decor">
                    <svg viewBox="0 0 100 50" className="w-full h-full text-red-600" preserveAspectRatio="none" fill="currentColor">
                      <path d="M0,25 Q25,15 50,25 T100,25 L100,50 L0,50 Z" />
                      <path d="M0,32 Q25,22 50,32 T100,32 L100,50 L0,50 Z" fill="white" />
                    </svg>
                  </div>

                  <div className="print-skyline-decor">
                    <svg viewBox="0 0 200 40" className="w-full h-full text-red-700" preserveAspectRatio="none" fill="currentColor">
                      <path d="M0,40 L10,40 L10,25 L15,25 L15,40 L25,40 L25,15 L32,15 L32,40 L40,40 L40,30 L45,30 L45,40 L55,40 L60,10 L65,10 L65,40 L75,40 L75,20 L82,20 L82,40 L90,40 L93,5 L97,5 L97,40 L110,40 L110,25 L115,25 L115,40 L125,40 L128,0 L132,0 L132,40 L140,40 L140,30 L145,30 L145,40 L155,40 L160,15 L165,15 L165,40 L180,40 L180,25 L185,25 L185,40 L200,40 Z" />
                    </svg>
                  </div>

                  {/* Main Ticket Area */}
                  <div className="ticket-main">
                    {/* Left Column */}
                    <div className="print-col-left">
                      <div>
                        <div className="flex justify-between items-center leading-none">
                          <span className="print-badge">
                            {ticket.subtitle}
                          </span>
                          <span className="text-[6px] font-mono text-gray-400 font-bold">
                            #{String(ticket.index).padStart(3, '0')}
                          </span>
                        </div>

                        <h3 className="print-name">
                          {ticket.name}
                        </h3>

                        <div className="print-detail">
                          <span>{ticket.rt}</span>
                          <span className="print-detail-dot"></span>
                          <span className={ticket.status === 'Lunas' || ticket.status === 'Hadir Lapangan' ? 'print-status-lunas' : 'print-status-mencicil'}>
                            {ticket.status}
                          </span>
                        </div>
                      </div>

                      <div className="print-divider-line"></div>

                      <div>
                        <span className="print-label-doorprize">KUPON DOORPRIZE</span>
                        <div className="flex items-baseline leading-none mt-0.5">
                          {codePrefix && (
                            <span className="font-mono font-bold text-[#dc2626]" style={{ fontSize: '8px', letterSpacing: '-0.1px', marginRight: '0.5px' }}>
                              {codePrefix}
                            </span>
                          )}
                          <span className="font-mono text-[20px] text-[#dc2626] font-black leading-none animate-pulse" style={{ letterSpacing: '-0.4px' }}>
                            {codeSuffix}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: HUT 81 Independence Logo & Slogan */}
                    <div className="print-logo-col">
                      <div className="print-logo-row">
                        <svg viewBox="0 0 100 100" className="print-logo-svg" fill="none">
                          {/* Layer 1: Red Base */}
                          <g stroke="currentColor" strokeWidth="11" strokeLinecap="round" strokeLinejoin="miter">
                            <circle cx="32" cy="35" r="15" />
                            <circle cx="32" cy="63" r="21" />
                          </g>
                          <path d="M44,35 L65,18 L65,85" stroke="currentColor" strokeWidth="11" strokeLinecap="butt" strokeLinejoin="miter" />

                          {/* Layer 2: White Overlay */}
                          <g stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="miter">
                            <circle cx="32" cy="35" r="15" />
                            <circle cx="32" cy="63" r="21" />
                          </g>
                          <path d="M44,35 L65,18 L65,85" stroke="white" strokeWidth="4" strokeLinecap="butt" strokeLinejoin="miter" />

                          {/* Layer 3: Red Top Center Line for 8 (to make it a 3-stripe ribbon) */}
                          <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="miter">
                            <circle cx="32" cy="35" r="15" />
                            <circle cx="32" cy="63" r="21" />
                          </g>
                        </svg>
                        
                        <div className="print-logo-text">
                          <span>Indonesia</span>
                          <span>Berdaulat</span>
                          <span>Adil Dan</span>
                          <span>Makmur</span>
                        </div>
                      </div>
                      
                      <div className="print-logo-subtext">
                        <div>17 AGUSTUS 1945 - 2026</div>
                        <div className="opacity-95" style={{ fontSize: '2.8px', letterSpacing: '0.1px' }}>DIRGAHAYU REPUBLIK INDONESIA</div>
                      </div>
                    </div>
                  </div>

                  {/* Coupon Stub */}
                  <div className="ticket-stub">
                    <span className="print-stub-badge">STRUK</span>
                    
                    <div className="w-full text-center">
                      <div className="flex items-baseline justify-center leading-none mt-1">
                        {codePrefix && (
                          <span className="font-mono text-[6px] text-gray-500 font-bold">{codePrefix}</span>
                        )}
                        <span className="font-mono text-[13px] font-black text-black leading-none">{codeSuffix}</span>
                      </div>
                      <span className="print-stub-rt">{ticket.rt}</span>
                    </div>

                    <div className="w-full">
                      <div className="print-stub-line"></div>
                      <span className="print-stub-footer">PANITIA</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
