import { useState, FormEvent, useEffect } from 'react';
import { X, Wallet, ShieldCheck, History, Calendar, Plus } from 'lucide-react';
import { IuranKK } from '../types';

interface ModalBayarIuranProps {
  isOpen: boolean;
  onClose: () => void;
  iuranKKList: IuranKK[];
  onPayIuran: (kkId: number, amount: number) => void;
  onAddNewKK: (namaKK: string, rt: string) => void;
  initialKkId?: number | '';
}

export default function ModalBayarIuran({
  isOpen,
  onClose,
  iuranKKList,
  onPayIuran,
  onAddNewKK,
  initialKkId = '',
}: ModalBayarIuranProps) {
  const [selectedKkId, setSelectedKkId] = useState<number | ''>(initialKkId);
  const [amount, setAmount] = useState('');
  const [rtFilter, setRtFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedKkId(initialKkId);
    }
  }, [isOpen, initialKkId]);
  
  // States for adding a new KK directly from here
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newNamaKK, setNewNamaKK] = useState('');
  const [newRT, setNewRT] = useState('RT 01');

  if (!isOpen) return null;

  const selectedKK = iuranKKList.find(item => item.id === selectedKkId);
  const remaining = selectedKK ? Math.max(0, selectedKK.target - selectedKK.terbayar) : 0;

  const filteredKKs = iuranKKList.filter(item => {
    const matchSearch = item.nama_kk.toLowerCase().includes(search.toLowerCase());
    const matchRt = rtFilter === 'all' || item.rt === rtFilter;
    return matchSearch && matchRt;
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedKkId) {
      alert('Mohon pilih Kepala Keluarga!');
      return;
    }
    const payVal = Number(amount);
    if (!payVal || payVal <= 0) {
      alert('Mohon masukkan jumlah pembayaran yang valid!');
      return;
    }
    if (payVal > remaining) {
      if (!confirm(`Jumlah pembayaran (Rp ${payVal.toLocaleString('id-ID')}) melebihi sisa kekurangan (Rp ${remaining.toLocaleString('id-ID')}). Apakah Anda yakin ingin mendonasikan lebih?`)) {
        return;
      }
    }

    onPayIuran(Number(selectedKkId), payVal);
    // Reset
    setAmount('');
    setSelectedKkId('');
    onClose();
  };

  const handleCreateKK = (e: FormEvent) => {
    e.preventDefault();
    if (!newNamaKK.trim()) {
      alert('Mohon isi nama Kepala Keluarga!');
      return;
    }
    onAddNewKK(newNamaKK, newRT);
    setNewNamaKK('');
    setIsAddingNew(false);
    alert(`Kepala Keluarga "${newNamaKK}" berhasil ditambahkan!`);
  };

  const formatRupiah = (num: number) => {
    return 'Rp ' + num.toLocaleString('id-ID');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-xl border border-gray-100 flex flex-col md:flex-row h-[90vh] md:h-auto max-h-[640px]">
        
        {/* LEFT COLUMN: KK SEARCH & SELECT */}
        <div className="flex-1 p-5 border-b md:border-b-0 md:border-r border-gray-100 flex flex-col min-h-0 bg-gray-50/50">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="font-display font-black text-gray-800 text-xs uppercase tracking-wider">Cari &amp; Pilih KK</h3>
            <button 
              onClick={() => setIsAddingNew(!isAddingNew)}
              className="text-[10px] bg-red-50 text-red-600 hover:bg-red-100 px-2 py-1 rounded-lg font-bold uppercase tracking-wider border border-red-100/50 flex items-center gap-1 cursor-pointer transition-all"
            >
              <Plus size={12} />
              {isAddingNew ? 'Batal' : 'Tambah KK'}
            </button>
          </div>

          {isAddingNew ? (
            <form onSubmit={handleCreateKK} className="bg-white p-4 rounded-xl border border-red-100 space-y-3 shadow-3xs mb-3 animate-fade-in">
              <h4 className="text-xs font-bold text-red-600 uppercase tracking-wider">Tambah KK Baru</h4>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Nama Kepala Keluarga</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Keluarga Pak Ridho"
                  value={newNamaKK}
                  onChange={e => setNewNamaKK(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">RT Wilayah</label>
                <select
                  value={newRT}
                  onChange={e => setNewRT(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white"
                >
                  <option value="RT 01">RT 01</option>
                  <option value="RT 02">RT 02</option>
                  <option value="RT 03">RT 03</option>
                  <option value="RT 04">RT 04</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition-all"
              >
                Simpan KK
              </button>
            </form>
          ) : (
            <div className="space-y-2 mb-3">
              <input
                type="text"
                placeholder="Cari nama KK..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-red-500"
              />
              <div className="grid grid-cols-5 gap-1">
                {['all', 'RT 01', 'RT 02', 'RT 03', 'RT 04'].map(rt => (
                  <button
                    key={rt}
                    type="button"
                    onClick={() => setRtFilter(rt)}
                    className={`py-1 text-[9px] font-bold rounded-lg uppercase tracking-wider border transition-all cursor-pointer ${rtFilter === rt ? 'bg-red-50 border-red-500 text-red-600' : 'bg-white border-gray-150 text-gray-500 hover:bg-gray-50'}`}
                  >
                    {rt === 'all' ? 'Semua' : rt}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto space-y-1.5 max-h-[300px] md:max-h-none pr-1">
            {filteredKKs.map(item => {
              const remains = Math.max(0, item.target - item.terbayar);
              const isSelected = selectedKkId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => { setSelectedKkId(item.id); setIsAddingNew(false); }}
                  className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected 
                      ? 'bg-red-50/60 border-red-500 shadow-2xs' 
                      : 'bg-white border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div>
                    <h4 className="font-bold text-xs text-gray-800 line-clamp-1">{item.nama_kk}</h4>
                    <p className="text-[9px] text-gray-400 mt-0.5 font-semibold uppercase tracking-wider">{item.rt} &bull; Sisa: {formatRupiah(remains)}</p>
                  </div>
                  <div>
                    <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                      item.status === 'Lunas' 
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                        : item.status === 'Mencicil' 
                          ? 'bg-amber-50 text-amber-600 border border-amber-100' 
                          : 'bg-gray-50 text-gray-400 border border-gray-150'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: ACTION & HISTORY */}
        <div className="flex-1 p-5 flex flex-col justify-between min-h-0 bg-white">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3.5">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-red-50 text-red-600 rounded-lg">
                <Wallet size={16} />
              </div>
              <h3 className="font-display font-black text-gray-800 text-xs uppercase tracking-wider">Form Iuran Angsuran</h3>
            </div>
            <button onClick={onClose} className="hover:bg-gray-100 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 transition-all cursor-pointer">
              <X size={18} />
            </button>
          </div>

          {selectedKK ? (
            <div className="flex-1 flex flex-col justify-between min-h-0 space-y-4">
              {/* KK Summary Details */}
              <div className="bg-gray-50/50 border border-gray-100 p-3.5 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Detail Keluarga</span>
                  <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded font-bold uppercase tracking-wider">{selectedKK.rt}</span>
                </div>
                <h4 className="font-display font-black text-gray-800 text-sm">{selectedKK.nama_kk}</h4>
                
                <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-gray-100">
                  <div className="bg-white p-1.5 rounded-lg border border-gray-100">
                    <span className="block text-[8px] text-gray-400 font-bold uppercase tracking-wider">Target Wajib</span>
                    <span className="text-[10px] font-bold font-mono text-gray-700">{formatRupiah(selectedKK.target)}</span>
                  </div>
                  <div className="bg-white p-1.5 rounded-lg border border-gray-100">
                    <span className="block text-[8px] text-gray-400 font-bold uppercase tracking-wider">Telah Dibayar</span>
                    <span className="text-[10px] font-bold font-mono text-emerald-600">{formatRupiah(selectedKK.terbayar)}</span>
                  </div>
                  <div className="bg-white p-1.5 rounded-lg border border-gray-100">
                    <span className="block text-[8px] text-gray-400 font-bold uppercase tracking-wider">Kekurangan</span>
                    <span className="text-[10px] font-bold font-mono text-red-600">{formatRupiah(remaining)}</span>
                  </div>
                </div>
              </div>

              {/* Installment History list */}
              <div className="flex-1 min-h-0 flex flex-col space-y-2">
                <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <History size={11} />
                  <span>Riwayat Cicilan Berangsur</span>
                </div>
                <div className="flex-1 overflow-y-auto bg-gray-50/20 border border-gray-100 rounded-xl p-2 space-y-1.5 max-h-[110px]">
                  {selectedKK.riwayat.length === 0 ? (
                    <div className="text-center py-4 text-[10px] text-gray-400 italic font-medium">Belum ada riwayat pembayaran.</div>
                  ) : (
                    selectedKK.riwayat.map((hist, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-gray-100 text-xs">
                        <span className="text-[9px] text-gray-400 font-mono flex items-center gap-1">
                          <Calendar size={10} />
                          {hist.tanggal}
                        </span>
                        <span className="font-bold font-mono text-emerald-600">+{formatRupiah(hist.jumlah)}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Form Input */}
              <form onSubmit={handleSubmit} className="space-y-3">
                {remaining > 0 ? (
                  <>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Jumlah Bayar Angsuran (Rupiah)</label>
                      <input
                        type="number"
                        required
                        max={remaining + 100000}
                        placeholder={`Masukkan nominal, sisa: ${remaining}`}
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-red-500 font-mono font-bold"
                      />
                    </div>
                    {/* Presets */}
                    <div className="grid grid-cols-4 gap-1.5">
                      {[10000, 20000, 25000, remaining].map((p, idx) => {
                        if (p <= 0 || p > remaining) return null;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setAmount(String(p))}
                            className="py-1 bg-gray-50 hover:bg-gray-100 rounded-lg text-[9px] font-bold border border-gray-150 text-gray-600 transition-all cursor-pointer"
                          >
                            {p === remaining ? 'Lunas' : formatRupiah(p)}
                          </button>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl text-center flex items-center justify-center gap-1.5 text-xs font-semibold">
                    <ShieldCheck size={16} />
                    Iuran KK Sudah Lunas Sepenuhnya!
                  </div>
                )}

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-50">
                  <button
                    type="submit"
                    disabled={remaining <= 0}
                    className="w-full py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                  >
                    Simpan &amp; Hubungkan Buku Kas
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-gray-400 space-y-2">
              <Wallet size={32} className="text-gray-300 animate-bounce" />
              <p className="text-xs font-medium max-w-xs">Silakan pilih salah satu Kepala Keluarga di samping kiri untuk mengelola iuran angsuran.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
