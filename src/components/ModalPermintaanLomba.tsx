import { useState, FormEvent } from 'react';
import { X, MessageSquare, Sparkles } from 'lucide-react';

interface ModalPermintaanLombaProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePermintaan: (nama: string, pengusul: string, rt: string, kategori: string, biaya: number) => void;
}

export default function ModalPermintaanLomba({
  isOpen,
  onClose,
  onCreatePermintaan,
}: ModalPermintaanLombaProps) {
  const [nama, setNama] = useState('');
  const [pengusul, setPengusul] = useState('');
  const [rt, setRt] = useState('RT 01');
  const [kategori, setKategori] = useState('Umum');
  const [biaya, setBiaya] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !pengusul.trim() || !biaya) {
      alert('Mohon lengkapi seluruh kolom usulan!');
      return;
    }
    onCreatePermintaan(nama, pengusul, rt, kategori, Number(biaya));
    
    // Reset
    setNama('');
    setPengusul('');
    setRt('RT 01');
    setKategori('Umum');
    setBiaya('');
    onClose();
    alert('Aspirasi/Usulan Lomba Anda berhasil dikirim ke Panitia RT!');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl border border-gray-100">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-red-50 text-red-600 rounded-lg">
              <MessageSquare size={16} />
            </div>
            <div>
              <h3 className="font-display font-black text-gray-800 text-sm uppercase tracking-wider">Usulkan Lomba Warga</h3>
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mt-0.5">Demokrasi Lapangan RT/RW</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-gray-100 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 transition-all cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="p-3 bg-red-50 text-red-700 border border-red-100 rounded-xl text-[11px] leading-relaxed flex gap-2">
            <Sparkles size={16} className="shrink-0 text-red-600 mt-0.5" />
            <span>Punya usul lomba seru untuk 17-an? Tulis di sini! Panitia lapangan akan meninjau dan meloloskannya jika mendapat banyak dukungan dari warga lain.</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Nama Usulan Lomba</label>
            <input
              type="text"
              required
              placeholder="Contoh: Panjat Pinang Ibu-ibu berdaster"
              value={nama}
              onChange={e => setNama(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-red-500 bg-gray-50/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Nama Pengusul</label>
              <input
                type="text"
                required
                placeholder="Contoh: Pak Bambang"
                value={pengusul}
                onChange={e => setPengusul(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-red-500 bg-gray-50/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Asal RT Pengusul</label>
              <select
                value={rt}
                onChange={e => setRt(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-red-500 bg-white cursor-pointer"
              >
                <option value="RT 01">RT 01</option>
                <option value="RT 02">RT 02</option>
                <option value="RT 03">RT 03</option>
                <option value="RT 04">RT 04</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Kategori Lomba</label>
              <select
                value={kategori}
                onChange={e => setKategori(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-red-500 bg-white cursor-pointer"
              >
                <option value="Anak-anak">Anak-anak</option>
                <option value="Dewasa">Dewasa</option>
                <option value="Ibu-ibu">Ibu-ibu</option>
                <option value="Bapak-bapak">Bapak-bapak</option>
                <option value="Umum">Umum</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Estimasi Biaya (Rp)</label>
              <input
                type="number"
                required
                placeholder="Misal: 200000"
                value={biaya}
                onChange={e => setBiaya(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-red-500 bg-gray-50/30 font-mono"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              Kirim Aspirasi Lomba
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
