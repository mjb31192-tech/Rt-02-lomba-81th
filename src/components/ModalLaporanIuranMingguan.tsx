import { useState, FormEvent, useEffect, ChangeEvent } from 'react';
import { X, Calendar, DollarSign, Trash2, CreditCard, Landmark } from 'lucide-react';
import { LaporanIuranMingguan } from '../types';

interface ModalLaporanIuranMingguanProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLaporan: (report: Omit<LaporanIuranMingguan, 'id' | 'tanggal_lapor' | 'dilaporkan_oleh'>) => void;
  reportToEdit?: LaporanIuranMingguan | null;
  onEditLaporan?: (id: number, report: Omit<LaporanIuranMingguan, 'id' | 'tanggal_lapor' | 'dilaporkan_oleh'>) => void;
}

const PILIHAN_MINGGU = [
  { value: 'Minggu I', label: 'Minggu I (20 Juni - 26 Juni)', mulai: '2026-06-20', selesai: '2026-06-26' },
  { value: 'Minggu II', label: 'Minggu II (27 Juni - 03 Juli)', mulai: '2026-06-27', selesai: '2026-07-03' },
  { value: 'Minggu III', label: 'Minggu III (04 Juli - 10 Juli)', mulai: '2026-07-04', selesai: '2026-07-10' },
  { value: 'Minggu IV', label: 'Minggu IV (11 Juli - 17 Juli)', mulai: '2026-07-11', selesai: '2026-07-17' },
  { value: 'Minggu V', label: 'Minggu V (18 Juli - 24 Juli)', mulai: '2026-07-18', selesai: '2026-07-24' },
  { value: 'Minggu VI', label: 'Minggu VI (25 Juli - 31 Juli)', mulai: '2026-07-25', selesai: '2026-07-31' },
  { value: 'Minggu VII', label: 'Minggu VII (01 Agustus - 08 Agustus)', mulai: '2026-08-01', selesai: '2026-08-08' },
];

export default function ModalLaporanIuranMingguan({
  isOpen,
  onClose,
  onAddLaporan,
  reportToEdit = null,
  onEditLaporan,
}: ModalLaporanIuranMingguanProps) {
  const [mingguKe, setMingguKe] = useState('Minggu I');
  const [tanggalMulai, setTanggalMulai] = useState('2026-06-20');
  const [tanggalSelesai, setTanggalSelesai] = useState('2026-06-26');
  const [totalJumlah, setTotalJumlah] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [buktiFoto, setBuktiFoto] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (reportToEdit) {
        setMingguKe(reportToEdit.minggu_ke);
        setTanggalMulai(reportToEdit.tanggal_mulai);
        setTanggalSelesai(reportToEdit.tanggal_selesai);
        setTotalJumlah(reportToEdit.total_jumlah.toString());
        setKeterangan(reportToEdit.keterangan || '');
        setBuktiFoto(reportToEdit.bukti_foto || '');
      } else {
        // Set defaults on open
        setMingguKe('Minggu I');
        setTanggalMulai('2026-06-20');
        setTanggalSelesai('2026-06-26');
        setTotalJumlah('');
        setKeterangan('');
        setBuktiFoto('');
      }
    }
  }, [isOpen, reportToEdit]);

  const handleMingguChange = (value: string) => {
    setMingguKe(value);
    const selected = PILIHAN_MINGGU.find(p => p.value === value);
    if (selected) {
      setTanggalMulai(selected.mulai);
      setTanggalSelesai(selected.selesai);
    }
  };

  if (!isOpen) return null;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran foto bukti iuran terlalu besar! Maksimal 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setBuktiFoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!totalJumlah || Number(totalJumlah) <= 0) {
      alert('Mohon masukkan total nominal iuran mingguan yang valid!');
      return;
    }

    if (!buktiFoto) {
      alert('Mohon unggah bukti photo penyerahan / penerimaan iuran mingguan!');
      return;
    }

    if (reportToEdit && onEditLaporan) {
      onEditLaporan(reportToEdit.id, {
        minggu_ke: mingguKe,
        tanggal_mulai: tanggalMulai,
        tanggal_selesai: tanggalSelesai,
        total_jumlah: Number(totalJumlah),
        keterangan: keterangan || `Laporan rekap iuran mingguan periode ${tanggalMulai} s.d ${tanggalSelesai}`,
        bukti_foto: buktiFoto,
      });
    } else {
      onAddLaporan({
        minggu_ke: mingguKe,
        tanggal_mulai: tanggalMulai,
        tanggal_selesai: tanggalSelesai,
        total_jumlah: Number(totalJumlah),
        keterangan: keterangan || `Laporan rekap iuran mingguan periode ${tanggalMulai} s.d ${tanggalSelesai}`,
        bukti_foto: buktiFoto,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl border border-gray-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <CreditCard size={16} />
            </div>
            <div>
              <h3 className="font-display font-black text-gray-800 text-sm uppercase tracking-wider">
                {reportToEdit ? 'Edit Laporan Iuran Mingguan' : 'Laporan Iuran Mingguan'}
              </h3>
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mt-0.5">
                {reportToEdit ? 'Ubah Data Rekap Kas Iuran Warga' : 'Upload Laporan Kas Iuran Warga'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-gray-100 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 transition-all cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* Minggu Ke */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Periode Minggu</label>
            <select
              value={mingguKe}
              onChange={e => handleMingguChange(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-red-500"
            >
              {PILIHAN_MINGGU.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          {/* Rentang Tanggal */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Tanggal Mulai</label>
              <div className="relative">
                <Calendar size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="date"
                  required
                  value={tanggalMulai}
                  onChange={e => setTanggalMulai(e.target.value)}
                  className="w-full pl-8.5 pr-3 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-red-500 font-mono"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Tanggal Selesai</label>
              <div className="relative">
                <Calendar size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="date"
                  required
                  value={tanggalSelesai}
                  onChange={e => setTanggalSelesai(e.target.value)}
                  className="w-full pl-8.5 pr-3 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-red-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Total Jumlah */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Total Uang Terkumpul (Rp)</label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-600 font-mono">Rp</div>
              <input
                type="number"
                required
                min={1}
                placeholder="0"
                value={totalJumlah}
                onChange={e => setTotalJumlah(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-red-500 font-mono font-bold text-emerald-600"
              />
            </div>
          </div>

          {/* Bukti Foto Laporan Iuran */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Foto Bukti Iuran / Kas Serah Terima (Wajib)</label>
            <div className="flex items-center gap-3">
              <label className="flex-1 flex flex-col items-center justify-center border border-dashed border-gray-200 rounded-xl p-4 hover:border-emerald-500/50 hover:bg-emerald-50/5 cursor-pointer transition-all">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <span className="text-xs font-bold text-gray-600">Pilih / Ambil Foto Bukti Laporan</span>
                <span className="text-[9px] text-gray-400 mt-0.5">Format JPG/PNG, Maks 2MB</span>
              </label>

              {buktiFoto && (
                <div className="relative w-16 h-16 rounded-xl border border-gray-200 overflow-hidden shrink-0 group">
                  <img src={buktiFoto} alt="Bukti Iuran" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <button
                    type="button"
                    onClick={() => setBuktiFoto('')}
                    className="absolute inset-0 bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="Hapus Foto"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Keterangan Deskripsi */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Keterangan / Catatan Rekap</label>
            <textarea
              rows={2}
              placeholder="Contoh: Iuran Minggu I terkumpul dari RT 01 s/d RT 04, diserahkan ke bendahara panitia."
              value={keterangan}
              onChange={e => setKeterangan(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-red-500 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              Simpan &amp; Lapor
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
