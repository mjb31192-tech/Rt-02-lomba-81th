import { useState, FormEvent, useEffect, ChangeEvent } from 'react';
import { X, Landmark, Plus, Trash2, Info, AlertTriangle, Calendar } from 'lucide-react';
import { Lomba, Kas } from '../types';

interface ModalCatatKasProps {
  isOpen: boolean;
  onClose: () => void;
  onAddKas: (tipe: 'pemasukan' | 'pengeluaran', kategori: string, jumlah: number, keterangan: string, lombaId?: number, tanggal?: string, buktiFoto?: string) => void;
  onEditKas?: (id: number, tipe: 'pemasukan' | 'pengeluaran', kategori: string, jumlah: number, keterangan: string, lombaId?: number, tanggal?: string, buktiFoto?: string) => void;
  kasToEdit?: Kas | null;
  lombas: Lomba[];
}

interface ItemPengeluaran {
  id: string;
  nama: string;
  harga: number;
}

export default function ModalCatatKas({
  isOpen,
  onClose,
  onAddKas,
  onEditKas,
  kasToEdit = null,
  lombas,
}: ModalCatatKasProps) {
  const [tipe, setTipe] = useState<'pemasukan' | 'pengeluaran'>('pengeluaran');
  const [kategori, setKategori] = useState('Peralatan Lomba');
  const [keterangan, setKeterangan] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [buktiFoto, setBuktiFoto] = useState('');
  
  // Dynamic linking to a Lomba
  const [lombaIdLink, setLombaIdLink] = useState<number | ''>('');

  // Dynamic multiple items listing for "pengeluaran dinamis"
  const [items, setItems] = useState<ItemPengeluaran[]>([
    { id: '1', nama: '', harga: 0 }
  ]);
  
  // Flat amount for pemasukan, or fallback for pengeluaran
  const [jumlahManual, setJumlahManual] = useState('');

  const isEditing = !!kasToEdit;

  useEffect(() => {
    // Reset inputs when opened or type changed
    if (isOpen) {
      if (isEditing && kasToEdit) {
        setTipe(kasToEdit.tipe);
        setKategori(kasToEdit.kategori);
        setKeterangan(kasToEdit.keterangan);
        setJumlahManual(kasToEdit.jumlah.toString());
        setLombaIdLink(kasToEdit.lomba_id || '');
        setTanggal(kasToEdit.tanggal || new Date().toISOString().split('T')[0]);
        setBuktiFoto(kasToEdit.bukti_foto || '');
        setItems([]);
      } else {
        setTipe('pengeluaran');
        setKategori('Peralatan Lomba');
        setKeterangan('');
        setJumlahManual('');
        setLombaIdLink('');
        setTanggal(new Date().toISOString().split('T')[0]);
        setBuktiFoto('');
        setItems([{ id: '1', nama: '', harga: 0 }]);
      }
    }
  }, [isOpen, kasToEdit, isEditing]);

  // Set default category on type change (only in add mode)
  useEffect(() => {
    if (isOpen && !isEditing) {
      if (tipe === 'pemasukan') {
        setKategori('Iuran Warga');
      } else {
        setKategori('Peralatan Lomba');
      }
    }
  }, [tipe, isOpen, isEditing]);

  if (!isOpen) return null;

  const handleAddItemRow = () => {
    setItems(prev => [...prev, { id: (Date.now() + Math.random()).toString(), nama: '', harga: 0 }]);
  };

  const handleRemoveItemRow = (id: string) => {
    if (items.length === 1) {
      alert('Minimal harus ada 1 item pengeluaran!');
      return;
    }
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleUpdateItem = (id: string, field: 'nama' | 'harga', value: string | number) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran foto bukti terlalu besar! Maksimal 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setBuktiFoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Compute calculated dynamic sum for items if pengeluaran and not editing, otherwise use jumlahManual
  const computedTotal = (tipe === 'pengeluaran' && !isEditing && items.length > 0)
    ? items.reduce((acc, curr) => acc + (Number(curr.harga) || 0), 0)
    : Number(jumlahManual) || 0;

  const selectedLomba = lombas.find(l => l.id === Number(lombaIdLink));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    const finalTanggal = tanggal || new Date().toISOString().split('T')[0];

    if (isEditing && kasToEdit) {
      if (!jumlahManual || Number(jumlahManual) <= 0 || !keterangan) {
        alert('Mohon lengkapi nominal transaksi dan keterangan!');
        return;
      }
      onEditKas?.(kasToEdit.id, tipe, kategori, Number(jumlahManual), keterangan, lombaIdLink ? Number(lombaIdLink) : undefined, finalTanggal, buktiFoto);
    } else {
      if (tipe === 'pemasukan') {
        if (!jumlahManual || Number(jumlahManual) <= 0 || !keterangan) {
          alert('Mohon lengkapi nominal pemasukan dan keterangan!');
          return;
        }
        onAddKas('pemasukan', kategori, Number(jumlahManual), keterangan, undefined, finalTanggal, buktiFoto);
      } else {
        // Validating items
        const hasEmptyItem = items.some(item => !item.nama.trim() || item.harga <= 0);
        if (hasEmptyItem) {
          alert('Mohon lengkapi nama dan harga untuk semua baris pengeluaran!');
          return;
        }
        if (!keterangan) {
          alert('Mohon isi keterangan/deskripsi pengeluaran!');
          return;
        }

        // Generate formatted description compiling items
        const itemsString = items.map(it => `${it.nama} (Rp ${it.harga.toLocaleString('id-ID')})`).join(', ');
        const finalKeterangan = `${keterangan} [Rincian: ${itemsString}]`;

        onAddKas('pengeluaran', kategori, computedTotal, finalKeterangan, lombaIdLink ? Number(lombaIdLink) : undefined, finalTanggal, buktiFoto);
      }
    }

    // Reset fields
    setItems([{ id: '1', nama: '', harga: 0 }]);
    setJumlahManual('');
    setKeterangan('');
    setLombaIdLink('');
    setTanggal('');
    setBuktiFoto('');
    onClose();
  };

  const categories = tipe === 'pemasukan' 
    ? ['Iuran Warga', 'Sponsorship', 'Donatur Pribadi', 'Kas RT', 'Lain-lain']
    : ['Peralatan Lomba', 'Konsumsi', 'Hadiah Lomba', 'Sewa Sound & Tenda', 'Keamanan', 'Lain-lain'];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-xl overflow-hidden shadow-xl border border-gray-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-lg ${tipe === 'pemasukan' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
              <Landmark size={16} />
            </div>
            <div>
              <h3 className="font-display font-black text-gray-800 text-sm uppercase tracking-wider">
                {isEditing ? 'Revisi Transaksi Keuangan' : (tipe === 'pengeluaran' ? 'Catat Pengeluaran Dinamis' : 'Catat Kas Masuk')}
              </h3>
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mt-0.5">Anggaran HUT RI 81</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-gray-100 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 transition-all cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* Switch Tipe */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Jenis Transaksi</label>
            <div className="grid grid-cols-2 gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
              <button
                type="button"
                onClick={() => setTipe('pemasukan')}
                className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${tipe === 'pemasukan' ? 'bg-white text-emerald-600 shadow-3xs border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Uang Masuk (+)
              </button>
              <button
                type="button"
                onClick={() => setTipe('pengeluaran')}
                className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${tipe === 'pengeluaran' ? 'bg-white text-red-600 shadow-3xs border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Pengeluaran (-)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Kategori Transaksi</label>
              <select
                value={kategori}
                onChange={e => setKategori(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-red-500 bg-white cursor-pointer"
              >
                {categories.map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Link with active lomba */}
            {tipe === 'pengeluaran' && (
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Hubungkan ke Kegiatan Lomba (Opsional)</label>
                <select
                  value={lombaIdLink}
                  onChange={e => setLombaIdLink(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-red-500 bg-white cursor-pointer text-gray-700"
                >
                  <option value="">-- Tidak Dihubungkan --</option>
                  {lombas.map(l => (
                    <option key={l.id} value={l.id}>{l.nama_lomba} (Budget: Rp {l.anggaran.toLocaleString('id-ID')})</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* DYNAMIC ITEMIZED BILLS (ONLY FOR PENGELUARAN AND NOT EDITING) */}
          {tipe === 'pengeluaran' && !isEditing ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Detail Baris Pengeluaran</label>
                <button
                  type="button"
                  onClick={handleAddItemRow}
                  className="inline-flex items-center gap-1 text-[10px] bg-red-50 text-red-600 hover:bg-red-100/80 px-2 py-1 rounded-lg font-bold border border-red-100 transition-all cursor-pointer"
                >
                  <Plus size={11} />
                  Tambah Baris Item
                </button>
              </div>

              <div className="space-y-2 max-h-[180px] overflow-y-auto bg-gray-50/40 p-2.5 rounded-xl border border-gray-100">
                {items.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-2 animate-fade-in">
                    <span className="text-[10px] text-gray-400 font-mono w-4">{index + 1}.</span>
                    <input
                      type="text"
                      required
                      placeholder="Nama Barang (contoh: Tali Koor)"
                      value={item.nama}
                      onChange={e => handleUpdateItem(item.id, 'nama', e.target.value)}
                      className="flex-1 px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-hidden"
                    />
                    <input
                      type="number"
                      required
                      placeholder="Harga"
                      value={item.harga || ''}
                      onChange={e => handleUpdateItem(item.id, 'harga', Number(e.target.value))}
                      className="w-24 sm:w-32 px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-hidden text-right font-mono font-semibold text-red-600"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveItemRow(item.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 transition-all cursor-pointer rounded hover:bg-gray-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Jumlah Nominal Uang (Rp)</label>
              <input
                type="number"
                required
                placeholder="Misal: 50000"
                value={jumlahManual}
                onChange={e => setJumlahManual(e.target.value)}
                className={`w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-red-500 font-mono font-bold ${tipe === 'pemasukan' ? 'text-emerald-600' : 'text-red-600'}`}
              />
            </div>
          )}

          {/* Tanggal Transaksi */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Tanggal Transaksi</label>
            <div className="relative">
              <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="date"
                required
                value={tanggal}
                onChange={e => setTanggal(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-red-500 bg-white"
              />
            </div>
          </div>

          {/* Budget warning alert if exceeds Lomba Budget */}
          {tipe === 'pengeluaran' && selectedLomba && (
            <div className={`p-3 rounded-xl border flex items-start gap-2 text-xs font-medium ${computedTotal > selectedLomba.anggaran ? 'bg-red-50 border-red-200 text-red-700' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
              {computedTotal > selectedLomba.anggaran ? (
                <>
                  <AlertTriangle size={15} className="shrink-0 text-red-600 mt-0.5" />
                  <div>
                    <span className="font-bold">Over-Budget Terdeteksi!</span> Pengeluaran ini (Rp {computedTotal.toLocaleString('id-ID')}) melebihi pagu anggaran lomba "{selectedLomba.nama_lomba}" (Rp {selectedLomba.anggaran.toLocaleString('id-ID')}).
                  </div>
                </>
              ) : (
                <>
                  <Info size={15} className="shrink-0 text-blue-600 mt-0.5" />
                  <div>
                    Sisa Anggaran Terpilih: <strong className="font-bold">Rp {(selectedLomba.anggaran - computedTotal).toLocaleString('id-ID')}</strong> (Pagu: Rp {selectedLomba.anggaran.toLocaleString('id-ID')}).
                  </div>
                </>
              )}
            </div>
          )}

          {/* Keterangan Deskripsi */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Keterangan / Tujuan Transaksi</label>
            <textarea
              required
              rows={2}
              placeholder={tipe === 'pemasukan' ? "Contoh: Penerimaan donatur RT 03 dari Bp. Anto" : "Contoh: Belanja keperluan pembukaan & panggung panitia RT"}
              value={keterangan}
              onChange={e => setKeterangan(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-red-500 resize-none"
            />
          </div>

          {/* Bukti Transaksi (Foto/Kwitansi) */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Bukti Foto / Kwitansi (Opsional)</label>
            <div className="flex items-center gap-3">
              <label className="flex-1 flex flex-col items-center justify-center border border-dashed border-gray-200 rounded-xl p-4 hover:border-red-500/50 hover:bg-red-50/5 cursor-pointer transition-all">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <span className="text-xs font-bold text-gray-600">Pilih / Ambil Foto Bukti</span>
                <span className="text-[9px] text-gray-400 mt-0.5">Format JPG/PNG, Maks 2MB</span>
              </label>

              {buktiFoto && (
                <div className="relative w-16 h-16 rounded-xl border border-gray-200 overflow-hidden shrink-0 group">
                  <img src={buktiFoto} alt="Bukti Transaksi" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
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

          {/* Live total preview card */}
          <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total Terkalkulasi:</span>
            <span className={`font-display font-black text-base sm:text-lg font-mono ${tipe === 'pemasukan' ? 'text-emerald-600' : 'text-red-600'}`}>
              {tipe === 'pemasukan' ? '+' : '-'}&nbsp;Rp&nbsp;{computedTotal.toLocaleString('id-ID')}
            </span>
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
              className={`px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer ${tipe === 'pemasukan' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}
            >
              Simpan Transaksi
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
