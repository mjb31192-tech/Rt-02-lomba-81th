import { useState, FormEvent, useEffect } from 'react';
import { X, Trophy, Sparkles, MessageSquare } from 'lucide-react';
import { PermintaanLomba, Lomba } from '../types';

interface ModalAddLombaProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLomba: (nama: string, pj: string, anggaran: number, kategori: string, dariPermintaanId?: number) => void;
  permintaanLombaList: PermintaanLomba[];
  lombaToEdit?: Lomba | null;
  onEditLomba?: (id: number, nama: string, pj: string, anggaran: number, kategori: string, status: Lomba['status']) => void;
}

export default function ModalAddLomba({
  isOpen,
  onClose,
  onAddLomba,
  permintaanLombaList,
  lombaToEdit,
  onEditLomba,
}: ModalAddLombaProps) {
  const [nama, setNama] = useState('');
  const [pj, setPj] = useState('');
  const [anggaran, setAnggaran] = useState('');
  const [kategori, setKategori] = useState('Umum');
  const [status, setStatus] = useState<Lomba['status']>('Belum Mulai');
  
  // Dynamic source: whether loading from a citizen request
  const [selectedReqId, setSelectedReqId] = useState<number | ''>('');

  useEffect(() => {
    if (lombaToEdit) {
      setNama(lombaToEdit.nama_lomba);
      setPj(lombaToEdit.pj);
      setAnggaran(String(lombaToEdit.anggaran));
      setKategori(lombaToEdit.kategori);
      setStatus(lombaToEdit.status);
      setSelectedReqId('');
    } else if (selectedReqId) {
      const req = permintaanLombaList.find(r => r.id === selectedReqId);
      if (req) {
        setNama(req.nama_lomba);
        setPj(req.pengusul);
        setAnggaran(String(req.estimasi_biaya));
        setKategori(req.kategori);
        setStatus('Belum Mulai');
      }
    } else {
      setNama('');
      setPj('');
      setAnggaran('');
      setKategori('Umum');
      setStatus('Belum Mulai');
    }
  }, [selectedReqId, permintaanLombaList, lombaToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!nama || !pj || !anggaran) {
      alert('Mohon lengkapi semua field!');
      return;
    }
    
    if (lombaToEdit && onEditLomba) {
      onEditLomba(lombaToEdit.id, nama, pj, Number(anggaran), kategori, status);
    } else {
      onAddLomba(nama, pj, Number(anggaran), kategori, selectedReqId ? Number(selectedReqId) : undefined);
    }
    
    // reset
    setNama('');
    setPj('');
    setAnggaran('');
    setKategori('Umum');
    setStatus('Belum Mulai');
    setSelectedReqId('');
    onClose();
  };

  const pendingRequests = permintaanLombaList.filter(r => r.status === 'Menunggu');

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl border border-gray-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-red-50 text-red-600 rounded-lg">
              <Trophy size={16} />
            </div>
            <div>
              <h3 className="font-display font-black text-gray-800 text-sm uppercase tracking-wider">Tambah Lomba Baru</h3>
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mt-0.5">Input Lomba &amp; Permintaan Warga</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-gray-100 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 transition-all cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* CITIZEN SUGGESTIONS PICKER */}
          {pendingRequests.length > 0 && (
            <div className="bg-red-50/50 border border-red-100 p-3.5 rounded-xl space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-red-600 uppercase tracking-wider">
                <MessageSquare size={14} />
                <span>Rekomendasi / Permintaan Warga</span>
              </div>
              <p className="text-[10px] text-gray-500 leading-normal">
                Pilih aspirasi warga di bawah untuk mengisi formulir pendaftaran lomba secara otomatis secara instan:
              </p>
              <select
                value={selectedReqId}
                onChange={e => setSelectedReqId(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 text-xs border border-red-200 rounded-lg focus:outline-hidden bg-white text-gray-700 font-medium cursor-pointer"
              >
                <option value="">-- Buat Lomba Mandiri (Formulir Kosong) --</option>
                {pendingRequests.map(req => (
                  <option key={req.id} value={req.id}>
                    [{req.rt}] {req.nama_lomba} - Diusulkan oleh {req.pengusul} ({req.jumlah_pendukung} Pendukung)
                  </option>
                ))}
              </select>
              {selectedReqId && (
                <div className="text-[9px] bg-red-100/50 text-red-700 px-2.5 py-1 rounded-md font-semibold inline-flex items-center gap-1 animate-pulse">
                  <Sparkles size={10} />
                  Formulir terisi otomatis dari usulan warga!
                </div>
              )}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Nama Kegiatan Lomba</label>
              <input
                type="text"
                required
                placeholder="Contoh: Balap Karung Helm Anak"
                value={nama}
                onChange={e => { setNama(e.target.value); if (selectedReqId) setSelectedReqId(''); }}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-red-500 bg-gray-50/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Penanggung Jawab (PJ) / Pengusul</label>
              <input
                type="text"
                required
                placeholder="Contoh: Budi Susanto"
                value={pj}
                onChange={e => { setPj(e.target.value); if (selectedReqId) setSelectedReqId(''); }}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-red-500 bg-gray-50/30"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Kategori Lomba</label>
                <select
                  value={kategori}
                  onChange={e => { setKategori(e.target.value); if (selectedReqId) setSelectedReqId(''); }}
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
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Anggaran Biaya (Rp)</label>
                <input
                  type="number"
                  required
                  placeholder="Contoh: 350000"
                  value={anggaran}
                  onChange={e => { setAnggaran(e.target.value); if (selectedReqId) setSelectedReqId(''); }}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-red-500 bg-gray-50/30 font-mono"
                />
              </div>
            </div>

            {lombaToEdit && (
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Status Pelaksanaan</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as Lomba['status'])}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-red-500 bg-white cursor-pointer"
                >
                  <option value="Belum Mulai">Belum Mulai</option>
                  <option value="Berjalan">Berjalan</option>
                  <option value="Selesai">Selesai</option>
                </select>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5 shrink-0">
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
              {lombaToEdit ? 'Simpan Perubahan Lomba' : selectedReqId ? 'Setujui & Buat Lomba' : 'Simpan Lomba Baru'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
