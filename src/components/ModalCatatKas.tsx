import { useState, FormEvent, useEffect, ChangeEvent } from 'react';
import { X, Landmark, Plus, Trash2, Info, AlertTriangle, Calendar, Clock, ShieldAlert, Building2, Factory, HandHeart, Sparkles } from 'lucide-react';
import { Lomba, Kas } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface ModalCatatKasProps {
  isOpen: boolean;
  onClose: () => void;
  onAddKas: (tipe: 'pemasukan' | 'pengeluaran', kategori: string, jumlah: number, keterangan: string, lombaId?: number, tanggal?: string, buktiFoto?: string, jam?: string, donaturInfo?: any) => void;
  onEditKas?: (id: number, tipe: 'pemasukan' | 'pengeluaran', kategori: string, jumlah: number, keterangan: string, lombaId?: number, tanggal?: string, buktiFoto?: string, jam?: string, donaturInfo?: any) => void;
  kasToEdit?: Kas | null;
  lombas: Lomba[];
  kasList?: Kas[];
  initialTipe?: 'pemasukan' | 'pengeluaran';
  initialKategori?: string;
}

interface ItemPengeluaran {
  id: string;
  nama: string;
  qty: number;
  hargaSatuan: number;
  harga: number; // total = qty * hargaSatuan
}

export const KATEGORI_PEMASUKAN = [
  'Donasi Perusahaan / Pabrik (Pihak Tidak Terikat)',
  'Donasi CSR / Bantuan Perusahaan',
  'Sponsorship / Mitra Usaha',
  'Donatur Pribadi / Perorangan',
  'Iuran Warga',
  'Kas RT / Kas Lingkungan',
  'Lain-lain',
];

export const KATEGORI_PENGELUARAN = [
  'Peralatan Lomba',
  'Konsumsi',
  'Hadiah Lomba',
  'Sewa Sound & Tenda',
  'Keamanan',
  'Lain-lain',
];

export default function ModalCatatKas({
  isOpen,
  onClose,
  onAddKas,
  onEditKas,
  kasToEdit = null,
  lombas,
  kasList = [],
  initialTipe,
  initialKategori,
}: ModalCatatKasProps) {
  const [tipe, setTipe] = useState<'pemasukan' | 'pengeluaran'>(initialTipe || 'pengeluaran');
  const [kategori, setKategori] = useState<string>(initialKategori || 'Peralatan Lomba');
  const [keterangan, setKeterangan] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [jam, setJam] = useState('');
  const [buktiFoto, setBuktiFoto] = useState('');
  
  // Specific helper fields for Donasi Perusahaan / Pabrik / CSR
  const [namaPerusahaan, setNamaPerusahaan] = useState('');
  const [sifatDonasi, setSifatDonasi] = useState('Pihak Tidak Terikat (Sukarela / Murni)');
  const [useCompanyForm, setUseCompanyForm] = useState(false);

  // Dynamic linking to a Lomba
  const [lombaIdLink, setLombaIdLink] = useState<number | ''>('');

  // Dynamic multiple items listing for "pengeluaran dinamis"
  const [items, setItems] = useState<ItemPengeluaran[]>([
    { id: '1', nama: '', qty: 1, hargaSatuan: 0, harga: 0 }
  ]);
  
  // Flat amount for pemasukan, or fallback for pengeluaran
  const [jumlahManual, setJumlahManual] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [bypassDuplicate, setBypassDuplicate] = useState(false);
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);

  const isEditing = !!kasToEdit;

  useEffect(() => {
    // Reset inputs when opened or type changed
    if (isOpen) {
      setIsSubmitting(false);
      setFormError(null);
      setDuplicateWarning(null);
      setBypassDuplicate(false);
      setHasRestoredDraft(false);
      setNamaPerusahaan(kasToEdit?.donatur_info?.nama_perusahaan || '');
      setSifatDonasi(kasToEdit?.donatur_info?.sifat_donasi || 'Pihak Tidak Terikat (Sukarela / Murni)');

      const currentJamNow = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');

      if (isEditing && kasToEdit) {
        setTipe(kasToEdit.tipe);
        setKategori(kasToEdit.kategori);
        setKeterangan(kasToEdit.keterangan);
        setJumlahManual(kasToEdit.jumlah.toString());
        setLombaIdLink(kasToEdit.lomba_id || '');
        setTanggal(kasToEdit.tanggal || new Date().toISOString().split('T')[0]);
        setJam(kasToEdit.jam || currentJamNow);
        setBuktiFoto(kasToEdit.bukti_foto || '');
        setItems([]);
        setUseCompanyForm(
          !!kasToEdit.donatur_info?.nama_perusahaan ||
          kasToEdit.kategori.toLowerCase().includes('perusahaan') ||
          kasToEdit.kategori.toLowerCase().includes('pabrik') ||
          kasToEdit.kategori.toLowerCase().includes('csr')
        );
      } else {
        // Check for saved draft in localStorage
        const savedDraftStr = localStorage.getItem('hut81_draft_catat_kas');
        if (savedDraftStr) {
          try {
            const draft = JSON.parse(savedDraftStr);
            if (draft && (draft.keterangan || draft.jumlahManual || (draft.items && draft.items.some((i: any) => i.nama || i.harga > 0)))) {
              setTipe(draft.tipe || initialTipe || 'pengeluaran');
              setKategori(draft.kategori || initialKategori || 'Peralatan Lomba');
              setKeterangan(draft.keterangan || '');
              setJumlahManual(draft.jumlahManual || '');
              setLombaIdLink(draft.lombaIdLink || '');
              setTanggal(draft.tanggal || new Date().toISOString().split('T')[0]);
              setJam(draft.jam || currentJamNow);
              setNamaPerusahaan(draft.namaPerusahaan || '');
              setSifatDonasi(draft.sifatDonasi || 'Pihak Tidak Terikat (Sukarela / Murni)');
              if (draft.items && Array.isArray(draft.items) && draft.items.length > 0) {
                setItems(draft.items.map((it: any) => ({
                  id: it.id || (Date.now() + Math.random()).toString(),
                  nama: it.nama || '',
                  qty: Number(it.qty) > 0 ? Number(it.qty) : 1,
                  hargaSatuan: Number(it.hargaSatuan) >= 0 ? Number(it.hargaSatuan) : (Number(it.harga) || 0),
                  harga: Number(it.harga) || 0
                })));
              }
              setHasRestoredDraft(true);
              return;
            }
          } catch (e) {
            console.warn("Gagal memuat draft kas tersimpan:", e);
          }
        }

        const defaultT = initialTipe || 'pengeluaran';
        const defaultK = initialKategori || (defaultT === 'pemasukan' ? 'Donasi Perusahaan / Pabrik (Pihak Tidak Terikat)' : 'Peralatan Lomba');
        setTipe(defaultT);
        setKategori(defaultK);
        setKeterangan('');
        setJumlahManual('');
        setLombaIdLink('');
        setTanggal(new Date().toISOString().split('T')[0]);
        setJam(currentJamNow);
        setBuktiFoto('');
        setItems([{ id: '1', nama: '', qty: 1, hargaSatuan: 0, harga: 0 }]);
        setUseCompanyForm(
          defaultK.toLowerCase().includes('perusahaan') ||
          defaultK.toLowerCase().includes('pabrik') ||
          defaultK.toLowerCase().includes('csr')
        );
      }
    }
  }, [isOpen, kasToEdit, isEditing, initialTipe, initialKategori]);

  // Auto-save draft to localStorage whenever typing in add mode
  useEffect(() => {
    if (!isOpen || isEditing) return;

    const draftData = {
      tipe,
      kategori,
      keterangan,
      jumlahManual,
      lombaIdLink,
      tanggal,
      jam,
      namaPerusahaan,
      sifatDonasi,
      items
    };

    // Only save if there is actually some text typed
    const hasAnyContent = keterangan.trim() !== '' || jumlahManual !== '' || namaPerusahaan.trim() !== '' || items.some(i => i.nama.trim() !== '' || i.harga > 0);
    if (hasAnyContent) {
      localStorage.setItem('hut81_draft_catat_kas', JSON.stringify(draftData));
    }
  }, [isOpen, isEditing, tipe, kategori, keterangan, jumlahManual, lombaIdLink, tanggal, jam, namaPerusahaan, sifatDonasi, items]);

  // Set default category on type change (only in add mode)
  useEffect(() => {
    if (isOpen && !isEditing) {
      if (tipe === 'pemasukan') {
        if (!kategori || KATEGORI_PENGELUARAN.includes(kategori)) {
          setKategori(initialKategori || 'Donasi Perusahaan / Pabrik (Pihak Tidak Terikat)');
        }
      } else {
        if (!kategori || KATEGORI_PEMASUKAN.includes(kategori)) {
          setKategori('Peralatan Lomba');
        }
      }
    }
  }, [tipe, isOpen, isEditing, initialKategori]);

  const isCompanyDonationCategory = 
    kategori.toLowerCase().includes('perusahaan') ||
    kategori.toLowerCase().includes('pabrik') ||
    kategori.toLowerCase().includes('csr') ||
    kategori.toLowerCase().includes('sponsorship') ||
    kategori.toLowerCase().includes('pihak tidak terikat');

  // Auto-sync company fields to keterangan if user fills them
  const handleApplyCompanyToKeterangan = (companyName?: string, sifat?: string) => {
    const cName = companyName !== undefined ? companyName : namaPerusahaan;
    const cSifat = sifat !== undefined ? sifat : sifatDonasi;

    if (!cName.trim()) return;
    setKeterangan(`Donasi ${cSifat} dari ${cName.trim()}`);
  };

  const handleAddItemRow = () => {
    setItems(prev => [...prev, { id: (Date.now() + Math.random()).toString(), nama: '', qty: 1, hargaSatuan: 0, harga: 0 }]);
  };

  const handleRemoveItemRow = (id: string) => {
    if (items.length === 1) {
      alert('Minimal harus ada 1 item pengeluaran!');
      return;
    }
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleUpdateItem = (id: string, field: 'nama' | 'qty' | 'hargaSatuan' | 'harga', value: string | number) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'qty' || field === 'hargaSatuan') {
          const q = field === 'qty' ? (Number(value) > 0 ? Number(value) : 1) : (item.qty > 0 ? item.qty : 1);
          const hs = field === 'hargaSatuan' ? Math.max(0, Number(value) || 0) : (item.hargaSatuan || 0);
          updated.harga = q * hs;
        } else if (field === 'harga') {
          const totalVal = Math.max(0, Number(value) || 0);
          const q = item.qty > 0 ? item.qty : 1;
          updated.hargaSatuan = Math.round(totalVal / q);
        }
        return updated;
      }
      return item;
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('Ukuran foto bukti terlalu besar! Maksimal 10MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
            setBuktiFoto(compressedBase64);
          } else {
            setBuktiFoto(event.target?.result as string);
          }
        };
        img.src = event.target?.result as string;
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
    if (isSubmitting) return;
    setFormError(null);
    setDuplicateWarning(null);
    
    const finalTanggal = tanggal || new Date().toISOString().split('T')[0];
    const finalJumlah = isEditing ? Number(jumlahManual) : computedTotal;

    // Build the final keterangan to check duplicates accurately
    let finalKeterangan = keterangan.trim();
    if (!finalKeterangan && isCompanyDonationCategory && namaPerusahaan.trim()) {
      finalKeterangan = `Donasi ${sifatDonasi} dari ${namaPerusahaan.trim()}`;
    }

    if (!isEditing && tipe === 'pengeluaran') {
      const itemsString = items.map(it => {
        const q = it.qty > 0 ? it.qty : 1;
        const hs = it.hargaSatuan > 0 ? it.hargaSatuan : (it.harga / q);
        if (q > 1 && hs > 0) {
          return `${it.nama} (${q} item @Rp ${hs.toLocaleString('id-ID')} = Rp ${it.harga.toLocaleString('id-ID')})`;
        }
        return `${it.nama} (Rp ${it.harga.toLocaleString('id-ID')})`;
      }).join(', ');
      finalKeterangan = `${finalKeterangan} [Rincian: ${itemsString}]`;
    }

    // Check duplicate transaksi
    const isDuplicate = kasList.some(item => {
      if (isEditing && kasToEdit && item.id === kasToEdit.id) {
        return false;
      }
      const matchTipe = item.tipe === tipe;
      const matchKategori = item.kategori === kategori;
      const matchJumlah = item.jumlah === finalJumlah;
      const matchTanggal = item.tanggal === finalTanggal;

      const existingDesc = item.keterangan.trim().toLowerCase();
      const newDesc = finalKeterangan.trim().toLowerCase();
      const matchDesc = existingDesc === newDesc || existingDesc.includes(newDesc) || newDesc.includes(existingDesc);

      return matchTipe && matchKategori && matchJumlah && matchTanggal && matchDesc;
    });

    if (isDuplicate && !bypassDuplicate) {
      setDuplicateWarning(
        `Ditemukan kemungkinan transaksi duplikat! Transaksi serupa dengan nominal Rp ${finalJumlah.toLocaleString('id-ID')} pada tanggal ${finalTanggal} dengan kategori "${kategori}" sudah tercatat di sistem.`
      );
      return;
    }

    const finalJam = jam.trim() || new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
    const donaturPayload = (namaPerusahaan.trim()) ? {
      nama_perusahaan: namaPerusahaan.trim(),
      sifat_donasi: sifatDonasi || 'Pihak Tidak Terikat (Sukarela / Murni)',
    } : undefined;

    setIsSubmitting(true);

    if (isEditing && kasToEdit) {
      if (!jumlahManual || Number(jumlahManual) <= 0 || !finalKeterangan) {
        setFormError('Mohon lengkapi nominal transaksi dan keterangan!');
        setIsSubmitting(false);
        return;
      }
      onEditKas?.(kasToEdit.id, tipe, kategori, Number(jumlahManual), finalKeterangan, lombaIdLink ? Number(lombaIdLink) : undefined, finalTanggal, buktiFoto, finalJam, donaturPayload);
    } else {
      if (tipe === 'pemasukan') {
        if (!jumlahManual || Number(jumlahManual) <= 0 || !finalKeterangan) {
          setFormError('Mohon lengkapi nominal pemasukan dan keterangan donasi!');
          setIsSubmitting(false);
          return;
        }
        onAddKas('pemasukan', kategori, Number(jumlahManual), finalKeterangan, undefined, finalTanggal, buktiFoto, finalJam, donaturPayload);
      } else {
        // Validating items
        const hasEmptyItem = items.some(item => !item.nama.trim() || item.harga <= 0);
        if (hasEmptyItem) {
          setFormError('Mohon lengkapi nama barang, kuantitas (qty), dan harga untuk semua baris pengeluaran!');
          setIsSubmitting(false);
          return;
        }
        if (!finalKeterangan) {
          setFormError('Mohon isi keterangan/deskripsi pengeluaran!');
          setIsSubmitting(false);
          return;
        }

        onAddKas('pengeluaran', kategori, computedTotal, finalKeterangan, lombaIdLink ? Number(lombaIdLink) : undefined, finalTanggal, buktiFoto, finalJam, donaturPayload);
      }
    }

    // Clear auto-saved draft
    try {
      localStorage.removeItem('hut81_draft_catat_kas');
    } catch (e) {
      // ignore
    }

    // Reset fields
    setItems([{ id: '1', nama: '', qty: 1, hargaSatuan: 0, harga: 0 }]);
    setJumlahManual('');
    setKeterangan('');
    setNamaPerusahaan('');
    setLombaIdLink('');
    setTanggal('');
    setJam('');
    setBuktiFoto('');
    setBypassDuplicate(false);
    setHasRestoredDraft(false);
    onClose();
  };

  const categories = tipe === 'pemasukan' ? KATEGORI_PEMASUKAN : KATEGORI_PENGELUARAN;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative bg-white rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl border border-gray-100 z-10 flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${tipe === 'pemasukan' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                  {tipe === 'pemasukan' ? (
                    isCompanyDonationCategory ? <Building2 size={18} /> : <HandHeart size={18} />
                  ) : (
                    <Landmark size={18} />
                  )}
                </div>
                <div>
                  <h3 className="font-display font-black text-gray-800 text-sm uppercase tracking-wider">
                    {isEditing
                      ? 'Revisi Transaksi Keuangan'
                      : tipe === 'pengeluaran'
                      ? 'Catat Pengeluaran Dinamis'
                      : isCompanyDonationCategory
                      ? 'Catat Donasi Perusahaan / Pabrik'
                      : 'Catat Kas Masuk & Donasi'}
                  </h3>
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mt-0.5">
                    {tipe === 'pemasukan' ? 'Pemasukan & Sumber Dana Kas HUT RI 81' : 'Anggaran & Belanja Panitia HUT RI 81'}
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={onClose} 
                className="hover:bg-gray-100 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 transition-all cursor-pointer hover:rotate-90 duration-200"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
              {hasRestoredDraft && !isEditing && (
                <div className="flex items-center justify-between bg-blue-50/80 border border-blue-200 text-blue-800 px-3.5 py-2 rounded-xl text-xs">
                  <div className="flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                    <span>Draf isian transaksi otomatis dipulihkan dari sesi sebelumnya.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem('hut81_draft_catat_kas');
                      setHasRestoredDraft(false);
                      setKeterangan('');
                      setJumlahManual('');
                      setNamaPerusahaan('');
                      setItems([{ id: '1', nama: '', qty: 1, hargaSatuan: 0, harga: 0 }]);
                    }}
                    className="text-[10px] text-blue-700 hover:text-blue-900 font-bold underline cursor-pointer ml-2"
                  >
                    Reset Draf
                  </button>
                </div>
              )}

              {formError && (
                <div className="flex items-start gap-2.5 bg-red-50 text-red-600 p-3.5 rounded-xl border border-red-100 text-xs font-semibold">
                  <ShieldAlert size={16} className="shrink-0 mt-0.5 text-red-500 animate-pulse" />
                  <span>{formError}</span>
                </div>
              )}

              {duplicateWarning && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3.5 rounded-xl text-xs space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={16} />
                    <div>
                      <p className="font-bold text-amber-900 mb-0.5">Duplikasi Data Terdeteksi</p>
                      <p className="text-amber-800 font-medium leading-relaxed">{duplicateWarning}</p>
                    </div>
                  </div>
                  <div className="flex gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setBypassDuplicate(true);
                        setDuplicateWarning(null);
                        // Trigger submit with bypass
                        setTimeout(() => {
                          const submitBtn = document.getElementById('submit-kas-btn');
                          if (submitBtn) {
                            submitBtn.click();
                          }
                        }, 50);
                      }}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition-all active:scale-95 cursor-pointer shadow-xs"
                    >
                      Ya, Tetap Simpan Transaksi Ini
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDuplicateWarning(null);
                        setBypassDuplicate(false);
                      }}
                      className="border border-amber-300 bg-white text-amber-700 font-bold px-3.5 py-2 rounded-xl text-xs hover:bg-amber-100/50 transition-all cursor-pointer"
                    >
                      Batalkan
                    </button>
                  </div>
                </div>
              )}
              
              {/* Switch Tipe */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Jenis Transaksi</label>
                <div className="grid grid-cols-2 gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                  <button
                    type="button"
                    onClick={() => {
                      setTipe('pemasukan');
                      if (!kategori || KATEGORI_PENGELUARAN.includes(kategori)) {
                        setKategori('Donasi Perusahaan / Pabrik (Pihak Tidak Terikat)');
                      }
                    }}
                    className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${tipe === 'pemasukan' ? 'bg-white text-emerald-600 shadow-3xs border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <HandHeart size={14} />
                    Uang Masuk / Donasi (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTipe('pengeluaran');
                      if (!kategori || KATEGORI_PEMASUKAN.includes(kategori)) {
                        setKategori('Peralatan Lomba');
                      }
                    }}
                    className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${tipe === 'pengeluaran' ? 'bg-white text-red-600 shadow-3xs border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <Landmark size={14} />
                    Pengeluaran (-)
                  </button>
                </div>
              </div>

              {/* Quick Preset Selector for Pemasukan / Donasi */}
              {tipe === 'pemasukan' && (
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Pilihan Cepat Sumber Donasi &amp; Pemasukan
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setKategori('Donasi Perusahaan / Pabrik (Pihak Tidak Terikat)');
                        setSifatDonasi('Pihak Tidak Terikat (Sukarela / Murni)');
                        setUseCompanyForm(true);
                      }}
                      className={`text-[11px] px-2.5 py-1.5 rounded-lg font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${kategori === 'Donasi Perusahaan / Pabrik (Pihak Tidak Terikat)' ? 'bg-purple-600 text-white border-purple-600 shadow-xs' : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'}`}
                    >
                      <Factory size={12} />
                      Donasi Pabrik / Perusahaan (Tidak Terikat)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setKategori('Donasi CSR / Bantuan Perusahaan');
                        setSifatDonasi('Bantuan Program CSR Perusahaan');
                        setUseCompanyForm(true);
                      }}
                      className={`text-[11px] px-2.5 py-1.5 rounded-lg font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${kategori === 'Donasi CSR / Bantuan Perusahaan' ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'}`}
                    >
                      <Building2 size={12} />
                      Program CSR
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setKategori('Sponsorship / Mitra Usaha');
                        setSifatDonasi('Sponsorship Komersial (Spanduk / Banner / Logo)');
                        setUseCompanyForm(true);
                      }}
                      className={`text-[11px] px-2.5 py-1.5 rounded-lg font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${kategori === 'Sponsorship / Mitra Usaha' ? 'bg-amber-600 text-white border-amber-600 shadow-xs' : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'}`}
                    >
                      <Sparkles size={12} />
                      Sponsorship
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setKategori('Donatur Pribadi / Perorangan');
                        setUseCompanyForm(false);
                      }}
                      className={`text-[11px] px-2.5 py-1.5 rounded-lg font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${kategori === 'Donatur Pribadi / Perorangan' ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'}`}
                    >
                      <HandHeart size={12} />
                      Donatur Pribadi
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setKategori('Iuran Warga');
                        setUseCompanyForm(false);
                      }}
                      className={`text-[11px] px-2.5 py-1.5 rounded-lg font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${kategori === 'Iuran Warga' ? 'bg-blue-600 text-white border-blue-600 shadow-xs' : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'}`}
                    >
                      Iuran Warga
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Kategori Transaksi</label>
                  <select
                    value={kategori}
                    onChange={e => {
                      const val = e.target.value;
                      setKategori(val);
                      if (val.toLowerCase().includes('perusahaan') || val.toLowerCase().includes('pabrik') || val.toLowerCase().includes('csr') || val.toLowerCase().includes('sponsorship')) {
                        setUseCompanyForm(true);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-500 bg-white cursor-pointer transition-all font-medium text-gray-800"
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
                      className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-500 bg-white cursor-pointer text-gray-700 transition-all font-medium text-gray-800"
                    >
                      <option value="">-- Tidak Dihubungkan --</option>
                      {lombas.map(l => (
                        <option key={l.id} value={l.id}>{l.nama_lomba} (Budget: Rp {l.anggaran.toLocaleString('id-ID')})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* DEDICATED COMPANY / FACTORY DONATION HELPER FORM */}
              {tipe === 'pemasukan' && (isCompanyDonationCategory || useCompanyForm) && (
                <div className="bg-purple-50/70 border border-purple-200/80 rounded-2xl p-4 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-purple-100 text-purple-700">
                        <Building2 size={15} />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-purple-900 uppercase tracking-wider">
                          Detail Donatur Perusahaan / Pabrik
                        </h4>
                        <p className="text-[10px] text-purple-600 font-medium">Bantuan Pihak Tidak Terikat / CSR / Sponsorship</p>
                      </div>
                    </div>
                    <span className="text-[9px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-md border border-purple-200 uppercase">
                      Pihak Eksternal
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-purple-900 uppercase tracking-wider mb-1">
                        Nama Perusahaan / Pabrik / CV / PT
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: PT. Indofood Sukses Makmur / Pabrik Jaya"
                        value={namaPerusahaan}
                        onChange={e => {
                          const val = e.target.value;
                          setNamaPerusahaan(val);
                          handleApplyCompanyToKeterangan(val);
                        }}
                        className="w-full px-3 py-2 text-xs bg-white border border-purple-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-medium text-gray-900 shadow-3xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-purple-900 uppercase tracking-wider mb-1">
                        Sifat / Jenis Bantuan Donasi
                      </label>
                      <select
                        value={sifatDonasi}
                        onChange={e => {
                          const val = e.target.value;
                          setSifatDonasi(val);
                          handleApplyCompanyToKeterangan(undefined, val);
                        }}
                        className="w-full px-3 py-2 text-xs bg-white border border-purple-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-medium text-gray-900 cursor-pointer shadow-3xs"
                      >
                        <option value="Pihak Tidak Terikat (Sukarela / Murni)">Pihak Tidak Terikat (Sukarela / Murni)</option>
                        <option value="Bantuan CSR Perusahaan">Bantuan Program CSR Perusahaan</option>
                        <option value="Sponsorship Komersial">Sponsorship Komersial (Branding)</option>
                        <option value="Bantuan Dana Pembinaan RT">Bantuan Dana Pembinaan RT</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* DYNAMIC ITEMIZED BILLS (ONLY FOR PENGELUARAN AND NOT EDITING) */}
              {tipe === 'pengeluaran' && !isEditing ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Detail Baris Pengeluaran (Dinamis)</label>
                      <span className="text-[9px] text-gray-400">Isi Nama Barang, Qty (Kuantitas), &amp; Harga Satuan untuk kalkulasi otomatis</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddItemRow}
                      className="inline-flex items-center gap-1 text-[10px] bg-red-50 text-red-600 hover:bg-red-100/80 px-2.5 py-1.5 rounded-lg font-bold border border-red-100 transition-all cursor-pointer shadow-3xs"
                    >
                      <Plus size={11} />
                      Tambah Baris Item
                    </button>
                  </div>

                  {/* Table Header Labels */}
                  <div className="hidden sm:grid sm:grid-cols-12 gap-2 px-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    <div className="col-span-5">Nama Barang / Belanja</div>
                    <div className="col-span-2 text-center">Qty / Kuantitas</div>
                    <div className="col-span-2 text-right">Harga Satuan (Rp)</div>
                    <div className="col-span-2 text-right">Subtotal (Rp)</div>
                    <div className="col-span-1 text-center">Hapus</div>
                  </div>

                  <div className="space-y-2.5 max-h-[220px] overflow-y-auto bg-gray-50/50 p-2.5 rounded-xl border border-gray-150">
                    {items.map((item, index) => (
                      <div key={item.id} className="bg-white p-2 rounded-lg border border-gray-200 shadow-3xs flex flex-col sm:grid sm:grid-cols-12 gap-2 items-center">
                        {/* Nama Barang */}
                        <div className="w-full sm:col-span-5 flex items-center gap-1.5">
                          <span className="text-[10px] text-gray-400 font-mono font-bold w-4 shrink-0">{index + 1}.</span>
                          <input
                            type="text"
                            required
                            placeholder="Nama Barang (misal: Tali Tambang)"
                            value={item.nama}
                            onChange={e => handleUpdateItem(item.id, 'nama', e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs bg-gray-50/50 hover:bg-white focus:bg-white border border-gray-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-red-500 font-medium text-gray-800"
                          />
                        </div>

                        {/* Qty (Kuantitas) */}
                        <div className="w-full sm:col-span-2 flex items-center gap-1.5">
                          <span className="sm:hidden text-[10px] font-bold text-gray-400 w-16">Qty:</span>
                          <input
                            type="number"
                            min="1"
                            required
                            placeholder="Qty"
                            value={item.qty || ''}
                            onChange={e => handleUpdateItem(item.id, 'qty', Number(e.target.value))}
                            className="w-full px-2 py-1.5 text-xs text-center font-mono font-bold bg-gray-50/50 hover:bg-white focus:bg-white border border-gray-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-red-500 text-gray-800"
                            title="Kuantitas / Jumlah Item"
                          />
                        </div>

                        {/* Harga Satuan */}
                        <div className="w-full sm:col-span-2 flex items-center gap-1.5">
                          <span className="sm:hidden text-[10px] font-bold text-gray-400 w-16">Satuan (Rp):</span>
                          <input
                            type="number"
                            min="0"
                            required
                            placeholder="Harga @ satuan"
                            value={item.hargaSatuan || ''}
                            onChange={e => handleUpdateItem(item.id, 'hargaSatuan', Number(e.target.value))}
                            className="w-full px-2 py-1.5 text-xs text-right font-mono font-semibold bg-gray-50/50 hover:bg-white focus:bg-white border border-gray-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-red-500 text-gray-700"
                            title="Harga Satuan per pcs / unit"
                          />
                        </div>

                        {/* Subtotal (Computed or editable) */}
                        <div className="w-full sm:col-span-2 flex items-center gap-1.5">
                          <span className="sm:hidden text-[10px] font-bold text-gray-400 w-16">Subtotal:</span>
                          <input
                            type="number"
                            min="0"
                            required
                            placeholder="Subtotal"
                            value={item.harga || ''}
                            onChange={e => handleUpdateItem(item.id, 'harga', Number(e.target.value))}
                            className="w-full px-2 py-1.5 text-xs text-right font-mono font-bold bg-red-50/40 border border-red-200/70 rounded-md focus:outline-hidden text-red-600"
                            title="Subtotal = Qty × Harga Satuan"
                          />
                        </div>

                        {/* Aksi Hapus */}
                        <div className="w-full sm:col-span-1 flex justify-end sm:justify-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItemRow(item.id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-all cursor-pointer rounded-md hover:bg-red-50"
                            title="Hapus Baris Ini"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                    {tipe === 'pemasukan' ? 'Nominal Donasi / Uang Masuk (Rp)' : 'Jumlah Nominal Uang (Rp)'}
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="Misal: 1000000"
                    value={jumlahManual}
                    onChange={e => setJumlahManual(e.target.value)}
                    className={`w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-500 font-mono font-black ${tipe === 'pemasukan' ? 'text-emerald-600' : 'text-red-600'}`}
                  />
                </div>
              )}

              {/* Tanggal & Rincian Waktu Transaksi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Tanggal Transaksi</label>
                  <div className="relative">
                    <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                      type="date"
                      required
                      value={tanggal}
                      onChange={e => setTanggal(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-500 bg-white font-medium text-gray-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Rincian Waktu / Jam (WIB)</label>
                  <div className="relative">
                    <Clock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                      type="time"
                      value={jam}
                      onChange={e => setJam(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-500 bg-white font-mono font-medium text-gray-800"
                    />
                  </div>
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
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Keterangan / Tujuan Transaksi
                  </label>
                  {tipe === 'pemasukan' && isCompanyDonationCategory && namaPerusahaan && (
                    <button
                      type="button"
                      onClick={() => handleApplyCompanyToKeterangan()}
                      className="text-[10px] text-purple-700 hover:text-purple-900 font-bold underline cursor-pointer"
                    >
                      Format Otomatis dari Info Perusahaan
                    </button>
                  )}
                </div>
                <textarea
                  required
                  rows={2}
                  placeholder={tipe === 'pemasukan' ? "Contoh: Donasi pihak tidak terikat dari PT Surya Semen Sentosa untuk mendukung kegiatan HUT RI" : "Contoh: Belanja keperluan pembukaan & panggung panitia RT"}
                  value={keterangan}
                  onChange={e => setKeterangan(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-500 resize-none font-medium text-gray-800"
                />
              </div>

              {/* Bukti Transaksi (Foto/Kwitansi) */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Bukti Foto / Kwitansi / Tanda Terima (Opsional)</label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 flex flex-col items-center justify-center border border-dashed border-gray-200 rounded-xl p-4 hover:border-red-500/50 hover:bg-red-50/5 cursor-pointer transition-all">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <span className="text-xs font-bold text-gray-600">Pilih / Ambil Foto Bukti / Kwitansi</span>
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
              <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between shrink-0">
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
                  id="submit-kas-btn"
                  disabled={isSubmitting}
                  className={`px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${tipe === 'pemasukan' ? 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-100' : 'bg-red-600 hover:bg-red-700 hover:shadow-red-100'}`}
                >
                  {isSubmitting ? 'Memproses...' : 'Simpan Transaksi'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
