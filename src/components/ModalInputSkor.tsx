import { useState, FormEvent } from 'react';
import { Lomba } from '../types';
import { X, Medal } from 'lucide-react';

interface ModalInputSkorProps {
  isOpen: boolean;
  onClose: () => void;
  lombas: Lomba[];
  onInputSkor: (lombaId: number, j1: string, j2: string, j3: string) => void;
}

export default function ModalInputSkor({
  isOpen,
  onClose,
  lombas,
  onInputSkor,
}: ModalInputSkorProps) {
  const [lombaId, setLombaId] = useState('');
  const [juara1, setJuara1] = useState('');
  const [juara2, setJuara2] = useState('');
  const [juara3, setJuara3] = useState('');

  if (!isOpen) return null;

  const submitLombas = lombas.filter(l => l.status !== 'Selesai');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!lombaId || !juara1) {
      alert('Mohon pilih lomba dan isi Juara 1!');
      return;
    }
    onInputSkor(Number(lombaId), juara1, juara2, juara3);
    // reset
    setLombaId('');
    setJuara1('');
    setJuara2('');
    setJuara3('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <Medal size={16} />
            </div>
            <h3 className="font-display font-black text-gray-800 text-sm uppercase tracking-wider">Input Pemenang Lomba</h3>
          </div>
          <button onClick={onClose} className="hover:bg-gray-100 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 transition-all cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Pilih Perlombaan yang Selesai</label>
            <select
              required
              value={lombaId}
              onChange={e => setLombaId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white cursor-pointer"
            >
              <option value="">-- Pilih Lomba --</option>
              {submitLombas.length === 0 ? (
                <option disabled>Semua lomba sudah selesai</option>
              ) : (
                submitLombas.map(l => (
                  <option key={l.id} value={l.id}>{l.nama_lomba} ({l.kategori})</option>
                ))
              )}
            </select>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                Juara 1 (Emas)
              </label>
              <input
                type="text"
                required
                placeholder="Nama pemenang &amp; RT (Contoh: Hendra RT 01)"
                value={juara1}
                onChange={e => setJuara1(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-gray-50/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                Juara 2 (Perak)
              </label>
              <input
                type="text"
                placeholder="Nama pemenang &amp; RT (Opsional)"
                value={juara2}
                onChange={e => setJuara2(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-gray-50/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-700"></span>
                Juara 3 (Perunggu)
              </label>
              <input
                type="text"
                placeholder="Nama pemenang &amp; RT (Opsional)"
                value={juara3}
                onChange={e => setJuara3(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-gray-50/30"
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
              className="px-5 py-2.5 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              Simpan Pemenang
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
