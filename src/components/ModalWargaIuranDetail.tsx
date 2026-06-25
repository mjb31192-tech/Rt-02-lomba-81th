import React from 'react';
import { X, CheckCircle2, AlertTriangle, HelpCircle, Receipt, Clock, Scale } from 'lucide-react';
import { IuranKK } from '../types';

interface ModalWargaIuranDetailProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: {
    username: string;
    nama: string;
    jabatan: string;
    mewakili_kk?: string;
    sebagai_apa?: string;
    kk_id?: number;
  } | null;
  iuranKKList: IuranKK[];
}

export default function ModalWargaIuranDetail({
  isOpen,
  onClose,
  currentUser,
  iuranKKList,
}: ModalWargaIuranDetailProps) {
  if (!isOpen || !currentUser || currentUser.jabatan !== 'Warga') return null;

  // Find the represented KK details
  const representedKkId = currentUser.kk_id;
  const representedKkName = currentUser.mewakili_kk;
  
  // Find match either by ID or name
  const kkData = iuranKKList.find(
    (kk) => (representedKkId && kk.id === representedKkId) || (representedKkName && kk.nama_kk === representedKkName)
  );

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(num);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Lunas':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-xs font-bold shadow-xs">
            <CheckCircle2 size={13} className="text-emerald-500" />
            LUNAS (Selesai)
          </span>
        );
      case 'Mencicil':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-full text-xs font-bold shadow-xs">
            <Clock size={13} className="text-amber-500" />
            MENCICIL
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 border border-red-100 rounded-full text-xs font-bold shadow-xs">
            <AlertTriangle size={13} className="text-red-500" />
            BELUM BAYAR
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="relative max-w-lg w-full bg-slate-50 rounded-2xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-5 py-4 flex items-center justify-between text-white shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-white/10 rounded-lg">
              <Receipt size={18} />
            </div>
            <div>
              <h3 className="font-display font-black text-sm uppercase tracking-wider">
                Laporan Iuran Saya
              </h3>
              <p className="text-[10px] text-red-100 font-semibold uppercase tracking-widest mt-0.5">
                Representasi Kepala Keluarga (KK)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 text-white/80 hover:text-white rounded-lg transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4.5">
          
          {/* Welcome User Banner */}
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-3xs">
            <p className="text-xs text-gray-500 leading-relaxed">
              Halo <strong className="text-gray-800 font-bold">{currentUser.nama}</strong>, Anda saat ini masuk sebagai warga yang <span className="font-semibold text-red-600">mewakili Kepala Keluarga</span>:
            </p>
            <div className="mt-2.5 grid grid-cols-2 gap-3 bg-red-50/40 p-3 rounded-lg border border-red-100/50">
              <div>
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Mewakili Kepala KK</span>
                <strong className="text-xs text-gray-800 font-extrabold">{currentUser.mewakili_kk || 'Tidak Diketahui'}</strong>
              </div>
              <div>
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Hubungan Keluarga</span>
                <strong className="text-xs text-gray-800 font-extrabold">Sebagai {currentUser.sebagai_apa || 'Keluarga'}</strong>
              </div>
            </div>
          </div>

          {kkData ? (
            <>
              {/* Contribution Financial Card */}
              <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-3xs space-y-3.5">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                  <span className="text-xs font-bold text-gray-700">Status Pembayaran Iuran</span>
                  {getStatusBadge(kkData.status)}
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-gray-600 mb-1">
                    <span>Progres Terbayar: {formatRupiah(kkData.terbayar)}</span>
                    <span>Target: {formatRupiah(kkData.target)}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden border border-gray-200/50">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        kkData.status === 'Lunas' ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(100, (kkData.terbayar / kkData.target) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 italic">
                    * Target iuran wajib adalah {formatRupiah(kkData.target)} per Kepala Keluarga untuk perayaan HUT RI ke-81.
                  </p>
                </div>

                {/* Financial Math Box */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50/80 border border-gray-150 p-2.5 rounded-lg text-center">
                  <div>
                    <span className="text-[9px] text-gray-400 font-semibold block">Target</span>
                    <strong className="text-xs text-slate-700 font-bold font-mono">{formatRupiah(kkData.target)}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-400 font-semibold block">Telah Dibayar</span>
                    <strong className="text-xs text-emerald-600 font-bold font-mono">{formatRupiah(kkData.terbayar)}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-400 font-semibold block">Kekurangan</span>
                    <strong className={`text-xs font-bold font-mono ${kkData.target - kkData.terbayar > 0 ? 'text-red-500' : 'text-slate-400'}`}>
                      {formatRupiah(Math.max(0, kkData.target - kkData.terbayar))}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Payment History Section */}
              <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-3xs">
                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide border-b border-gray-100 pb-2 mb-2 flex items-center gap-1.5">
                  <Clock size={13} className="text-red-600" />
                  Riwayat Transaksi Pembayaran Anda
                </h4>

                {kkData.riwayat.length === 0 ? (
                  <div className="text-center py-4 text-xs text-gray-400 font-medium">
                    Belum ada riwayat transaksi pembayaran iuran yang tercatat untuk KK Anda.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {kkData.riwayat.map((item, idx) => (
                      <div 
                        key={item.id || idx} 
                        className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-150 text-xs hover:bg-gray-100 transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-[10px] font-bold">
                            ✓
                          </span>
                          <div>
                            <strong className="text-gray-700 block font-semibold">Setoran Ke-{idx + 1}</strong>
                            <span className="text-[10px] text-gray-400 font-mono">{item.tanggal}</span>
                          </div>
                        </div>
                        <strong className="text-emerald-600 font-bold font-mono">+{formatRupiah(item.jumlah)}</strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-center text-xs text-amber-800 shadow-3xs">
              <HelpCircle className="mx-auto text-amber-500 mb-2" size={24} />
              <strong>Kepala Keluarga Tidak Ditemukan</strong>
              <p className="mt-1 leading-relaxed text-amber-700">
                Data Kepala Keluarga <span className="font-bold">"{currentUser.mewakili_kk}"</span> belum terdaftar di sistem kepanitiaan. Silakan hubungi Panitia atau Bendahara RT untuk mendaftarkan Kepala Keluarga Anda agar data iuran dapat dikaitkan dengan benar.
              </p>
            </div>
          )}

          {/* UU ITE Legal Notice Panel */}
          <div className="bg-slate-100 border border-slate-200 rounded-xl p-3.5 text-justify text-[10px] text-slate-500 leading-relaxed shadow-3xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-700 mb-1 uppercase tracking-wider">
              <Scale size={12} className="text-slate-500 shrink-0" />
              <span>Pemberitahuan Hukum (UU ITE)</span>
            </div>
            "Berdasarkan Undang Undang ITE no. 11 Tahun 2008 yang mengatur Dokumen Elektronik dan informasi lain di dalamnya sebagai alat bukti yang sah dan dapat di pertanggung jawabkan"
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-white px-5 py-3.5 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-5 py-2 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
          >
            Selesai &amp; Mengerti
          </button>
        </div>

      </div>
    </div>
  );
}
