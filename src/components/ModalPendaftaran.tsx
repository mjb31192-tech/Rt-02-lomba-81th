import { useState, FormEvent } from 'react';
import { Lomba } from '../types';
import { X, UserPlus } from 'lucide-react';

interface ModalPendaftaranProps {
  isOpen: boolean;
  onClose: () => void;
  lombas: Lomba[];
  onAddPeserta: (nama: string, telp: string, rt: string, lombaId: number) => void;
}

export default function ModalPendaftaran({
  isOpen,
  onClose,
  lombas,
  onAddPeserta,
}: ModalPendaftaranProps) {
  const [nama, setNama] = useState('');
  const [telp, setTelp] = useState('');
  const [rt, setRt] = useState('RT 01');
  const [lombaId, setLombaId] = useState<string>('');

  if (!isOpen) return null;

  const activeLombas = lombas.filter(l => l.status !== 'Selesai');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!nama || !telp || !lombaId) {
      alert('Mohon lengkapi semua field!');
      return;
    }
    onAddPeserta(nama, telp, rt, Number(lombaId));
    // reset
    setNama('');
    setTelp('');
    setLombaId('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-red-50 text-red-600 rounded-lg">
              <UserPlus size={16} />
            </div>
            <h3 className="font-display font-black text-gray-800 text-sm uppercase tracking-wider">Daftar Peserta Baru</h3>
          </div>
          <button onClick={onClose} className="hover:bg-gray-100 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 transition-all cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Nama Lengkap Warga</label>
            <input
              type="text"
              required
              placeholder="Contoh: Slamet Riyadi"
              value={nama}
              onChange={e => setNama(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-50/30"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Nomor Telepon / WA</label>
            <input
              type="tel"
              required
              placeholder="Contoh: 0812XXXXXXXX"
              value={telp}
              onChange={e => setTelp(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-50/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Wilayah RT</label>
              <select
                value={rt}
                onChange={e => setRt(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white cursor-pointer"
              >
                <option value="RT 01">RT 01</option>
                <option value="RT 02">RT 02</option>
                <option value="RT 03">RT 03</option>
                <option value="RT 04">RT 04</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Pilih Perlombaan</label>
              <select
                required
                value={lombaId}
                onChange={e => setLombaId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white cursor-pointer"
              >
                <option value="">-- Pilih Lomba --</option>
                {activeLombas.length === 0 ? (
                  <option disabled>Semua lomba sudah selesai</option>
                ) : (
                  activeLombas.map(l => (
                    <option key={l.id} value={l.id}>{l.nama_lomba} ({l.kategori})</option>
                  ))
                )}
              </select>
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
              Daftarkan Warga
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
