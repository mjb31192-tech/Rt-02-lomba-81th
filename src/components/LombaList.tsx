import { useState } from 'react';
import { Lomba, PermintaanLomba } from '../types';
import { Search, Plus, User, Award, CheckCircle, RefreshCw, HelpCircle, MessageSquare, ThumbsUp, Sparkles, Check, Trash2, Edit, Brain, Coins, ShieldAlert, PlusCircle, AlertCircle } from 'lucide-react';

interface LombaListProps {
  lombas: Lomba[];
  onStatusChange: (id: number, newStatus: 'Belum Mulai' | 'Berjalan' | 'Selesai') => void;
  onOpenAddLomba: () => void;
  isCompact?: boolean;
  permintaanLombaList?: PermintaanLomba[];
  onVotePermintaan?: (id: number) => void;
  onApproveRequestDirectly?: (id: number) => void;
  onOpenAddPermintaan?: () => void;
  onDeleteLomba?: (id: number) => void;
  onDeleteUsulan?: (id: number) => void;
  isPengurus?: boolean;
  onEditLombaClick?: (lomba: Lomba) => void;
  onAddLombaDirectly?: (nama: string, pj: string, anggaran: number, kategori: string) => void;
  onCreatePermintaanDirectly?: (nama: string, pengusul: string, rt: string, kategori: string, biaya: number) => void;
  currentUser?: any;
}

export default function LombaList({
  lombas,
  onStatusChange,
  onOpenAddLomba,
  isCompact = false,
  permintaanLombaList = [],
  onVotePermintaan,
  onApproveRequestDirectly,
  onOpenAddPermintaan,
  onDeleteLomba,
  onDeleteUsulan,
  isPengurus = false,
  onEditLombaClick,
  onAddLombaDirectly,
  onCreatePermintaanDirectly,
  currentUser,
}: LombaListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [kategoriFilter, setKategoriFilter] = useState<string>('all');
  const [subTab, setSubTab] = useState<'lomba' | 'usulan' | 'ai'>('lomba');

  // State for AI Lomba Recommender (Gemini integration)
  const [aiKategori, setAiKategori] = useState<string>('Umum');
  const [aiBudget, setAiBudget] = useState<string>('150000');
  const [aiJenis, setAiJenis] = useState<string>('Tradisional & Seru');
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiProgressText, setAiProgressText] = useState<string>('');
  const [aiResult, setAiResult] = useState<any[]>([]);
  const [aiError, setAiError] = useState<string | null>(null);
  const [addedAiLombas, setAddedAiLombas] = useState<Record<string, boolean>>({});

  const handleGenerateAI = async () => {
    setAiLoading(true);
    setAiError(null);
    setAiResult([]);
    
    const progressMessages = [
      "Menghubungi server Gemini AI...",
      "Merancang konsep lomba kreatif khas 17-an...",
      "Menghitung estimasi rincian biaya...",
      "Menyiapkan tips keselamatan khusus warga...",
      "Memfinalisasi format data rekomendasi..."
    ];
    
    let msgIndex = 0;
    setAiProgressText(progressMessages[0]);
    const interval = setInterval(() => {
      msgIndex++;
      if (msgIndex < progressMessages.length) {
        setAiProgressText(progressMessages[msgIndex]);
      }
    }, 1800);

    try {
      const response = await fetch("/api/ai/rekomendasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kategori: aiKategori,
          budget: Number(aiBudget),
          pesertaType: aiJenis
        })
      });
      
      clearInterval(interval);
      
      const contentType = response.headers.get("content-type") || "";
      const isJson = contentType.includes("application/json");

      if (!response.ok) {
        if (isJson) {
          const errData = await response.json();
          throw new Error(errData.error || "Gagal memproses rekomendasi AI.");
        } else {
          throw new Error(`Error HTTP ${response.status}: Gagal memproses rekomendasi AI. Sesi mungkin kedaluwarsa.`);
        }
      }
      
      if (!isJson) {
        throw new Error("Format respons server tidak valid (bukan JSON).");
      }

      const data = await response.json();
      if (data && data.rekomendasi) {
        setAiResult(data.rekomendasi);
      } else {
        setAiResult([]);
        throw new Error("Format respons AI tidak valid.");
      }
    } catch (err: any) {
      clearInterval(interval);
      setAiError(err.message || "Terjadi kesalahan koneksi.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleAddFromAI = (item: any) => {
    if (isPengurus) {
      if (onAddLombaDirectly) {
        onAddLombaDirectly(
          item.nama_lomba,
          currentUser?.nama || "Panitia AI",
          item.estimasi_biaya || Number(aiBudget),
          item.kategori || aiKategori
        );
        setAddedAiLombas(prev => ({ ...prev, [item.nama_lomba]: true }));
      } else {
        alert("Gagal menambahkan lomba: callback penambahan lomba tidak tersedia.");
      }
    } else {
      if (onCreatePermintaanDirectly) {
        onCreatePermintaanDirectly(
          item.nama_lomba,
          currentUser?.nama || "Warga RT",
          currentUser?.rt || "RT 01",
          item.kategori || aiKategori,
          item.estimasi_biaya || Number(aiBudget)
        );
        setAddedAiLombas(prev => ({ ...prev, [item.nama_lomba]: true }));
      } else {
        alert("Gagal mengusulkan lomba: silakan login sebagai Warga terlebih dahulu.");
      }
    }
  };

  // Filter active lomba list
  const filteredLombas = lombas.filter(l => {
    const matchSearch = l.nama_lomba.toLowerCase().includes(search.toLowerCase()) || 
                        l.pj.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || l.status === statusFilter;
    const matchKategori = kategoriFilter === 'all' || l.kategori === kategoriFilter;
    return matchSearch && matchStatus && matchKategori;
  });

  const displayLombas = isCompact ? filteredLombas.slice(0, 4) : filteredLombas;

  // Filter citizen contest suggestions
  const filteredUsulans = permintaanLombaList.filter(u => {
    const matchSearch = u.nama_lomba.toLowerCase().includes(search.toLowerCase()) ||
                        u.pengusul.toLowerCase().includes(search.toLowerCase());
    const matchKategori = kategoriFilter === 'all' || u.kategori === kategoriFilter;
    return matchSearch && matchKategori;
  });

  const getStatusBadge = (status: Lomba['status']) => {
    switch (status) {
      case 'Belum Mulai':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full border border-gray-200">
            <HelpCircle size={11} className="text-gray-500" />
            Belum Mulai
          </span>
        );
      case 'Berjalan':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-red-50 text-red-600 px-2.5 py-1 rounded-full border border-red-100 animate-pulse">
            <RefreshCw size={11} className="text-red-500 animate-spin-slow" />
            Berjalan
          </span>
        );
      case 'Selesai':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full border border-emerald-100">
            <CheckCircle size={11} className="text-emerald-500" />
            Selesai
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      
      {/* HEADER SECTION */}
      <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white">
        <div>
          <h3 className="font-display font-black text-gray-800 text-base flex items-center gap-2">
            Daftar Kegiatan Lomba RT
            {isCompact && (
              <span className="text-[10px] font-bold text-red-600 px-2.5 py-0.5 bg-red-50 rounded-full border border-red-100/30 uppercase tracking-wider">
                Live Lomba
              </span>
            )}
          </h3>
          <p className="text-xs text-gray-400 font-medium mt-0.5">
            {subTab === 'lomba' 
              ? (isCompact ? 'Daftar 4 lomba teratas dari total ' + lombas.length + ' lomba aktif' : 'Kelola status pelaksanaan, penanggung jawab, dan pemenang lomba')
              : 'Aspirasi warga yang mengajukan usul perlombaan baru secara dinamis'}
          </p>
        </div>

        {!isCompact && (
          <div className="flex gap-2">
            {subTab === 'lomba' ? (
              isPengurus && (
                <button
                  onClick={onOpenAddLomba}
                  className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs cursor-pointer transition-all active:scale-95"
                >
                  <Plus size={15} />
                  Tambah Lomba
                </button>
              )
            ) : (
              <button
                onClick={onOpenAddPermintaan}
                className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs cursor-pointer transition-all active:scale-95"
              >
                <Plus size={15} />
                Usulkan Lomba
              </button>
            )}
          </div>
        )}
      </div>

      {/* DYNAMIC SUB-TABS (Only on Lomba main page) */}
      {!isCompact && (
        <div className="bg-gray-50/50 p-2 border-b border-gray-100 flex gap-1">
          <button
            onClick={() => { setSubTab('lomba'); setSearch(''); }}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-2 ${subTab === 'lomba' ? 'bg-white text-red-600 shadow-3xs' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Award size={14} />
            Daftar Perlombaan Aktif
          </button>
          <button
            onClick={() => { setSubTab('usulan'); setSearch(''); }}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-2 relative ${subTab === 'usulan' ? 'bg-white text-red-600 shadow-3xs' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <MessageSquare size={14} />
            Aspirasi &amp; Usul Warga
            {permintaanLombaList.filter(u => u.status === 'Menunggu').length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[8px] font-bold text-white">
                {permintaanLombaList.filter(u => u.status === 'Menunggu').length}
              </span>
            )}
          </button>
          <button
            onClick={() => { setSubTab('ai'); setSearch(''); }}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-2 ${subTab === 'ai' ? 'bg-white text-red-600 shadow-3xs font-extrabold text-red-600' : 'text-gray-500 hover:text-gray-700 font-semibold'}`}
          >
            <Sparkles size={14} className="text-red-500 animate-pulse" />
            Rekomendasi Lomba (Gemini AI)
          </button>
        </div>
      )}

      {/* FILTER PANEL */}
      {!isCompact && (
        <div className="p-4 bg-white border-b border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={subTab === 'lomba' ? "Cari nama lomba atau nama PJ..." : "Cari usul lomba atau pengusul..."}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-red-500"
            />
          </div>

          <div>
            {subTab === 'lomba' ? (
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-hidden bg-white text-gray-700 cursor-pointer"
              >
                <option value="all">Semua Status Pelaksanaan</option>
                <option value="Belum Mulai">Belum Mulai</option>
                <option value="Berjalan">Berjalan</option>
                <option value="Selesai">Selesai</option>
              </select>
            ) : (
              <div className="text-xs text-gray-400 font-semibold px-3 py-2 border border-gray-100 rounded-xl bg-gray-50/50 flex items-center gap-1.5">
                <Sparkles size={13} className="text-red-500 animate-pulse" />
                <span>Usulan Warga di RT 01-04</span>
              </div>
            )}
          </div>

          <div>
            <select
              value={kategoriFilter}
              onChange={e => setKategoriFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-hidden bg-white text-gray-700 cursor-pointer"
            >
              <option value="all">Semua Target Demografi</option>
              <option value="Anak-anak">Anak-anak</option>
              <option value="Dewasa">Dewasa</option>
              <option value="Ibu-ibu">Ibu-ibu</option>
              <option value="Bapak-bapak">Bapak-bapak</option>
              <option value="Umum">Umum</option>
            </select>
          </div>
        </div>
      )}

      {/* ----------------- TAB 1: ACTIVE LOMBA LIST ----------------- */}
      {subTab === 'lomba' && (
        <div className="divide-y divide-gray-100">
          {displayLombas.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-xs font-medium">
              Tidak ada perlombaan aktif yang cocok dengan filter pencarian.
            </div>
          ) : (
            displayLombas.map(lomba => (
              <div
                key={lomba.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-all animate-fade-in"
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 bg-red-50 text-red-600 rounded-xl mt-0.5 shrink-0 shadow-xs shadow-red-100/50">
                    <Award size={18} />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-sm sm:text-base text-gray-800 font-display">{lomba.nama_lomba}</h4>
                      <span className="text-[9px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border border-gray-200/40">
                        {lomba.kategori}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-2 text-xs text-gray-500">
                      <div className="flex items-center gap-1.5 font-medium">
                        <User size={13} className="text-gray-400" />
                        <span>PJ: <strong className="text-gray-700 font-bold">{lomba.pj}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 font-medium">
                        <span>Pagu Anggaran: <strong className="text-emerald-600 font-mono font-bold">Rp {lomba.anggaran.toLocaleString('id-ID')}</strong></span>
                      </div>
                    </div>

                    {/* Winners display if Completed */}
                    {lomba.status === 'Selesai' && (lomba.pemenang_1 || lomba.pemenang_2 || lomba.pemenang_3) && (
                      <div className="mt-3 p-3 bg-amber-50/80 border border-amber-100 rounded-xl text-xs animate-fade-in shadow-3xs">
                        <span className="font-bold text-amber-800 block mb-1.5 uppercase tracking-wide text-[9px]">🏆 Pemenang Perlombaan Resmi:</span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-amber-950 font-medium">
                          {lomba.pemenang_1 && <div>🥇 Juara 1: <span className="font-bold">{lomba.pemenang_1}</span></div>}
                          {lomba.pemenang_2 && <div>🥈 Juara 2: <span className="font-bold">{lomba.pemenang_2}</span></div>}
                          {lomba.pemenang_3 && <div>🥉 Juara 3: <span className="font-bold">{lomba.pemenang_3}</span></div>}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status setting select box */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2.5 border-t sm:border-0 pt-3 sm:pt-0 border-gray-100">
                  <div className="shrink-0">{getStatusBadge(lomba.status)}</div>

                  <div className="flex items-center gap-2">
                    {isPengurus ? (
                      lomba.status !== 'Selesai' ? (
                        <select
                          value={lomba.status}
                          onChange={e => onStatusChange(lomba.id, e.target.value as Lomba['status'])}
                          className="text-[11px] border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white font-bold text-gray-600 focus:outline-hidden focus:ring-1 focus:ring-red-500 cursor-pointer shadow-3xs"
                        >
                          <option value="Belum Mulai">Ubah Ke Belum Mulai</option>
                          <option value="Berjalan">Ubah Ke Berjalan</option>
                          <option value="Selesai">Ubah Ke Selesai</option>
                        </select>
                      ) : (
                        <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold uppercase border border-emerald-100 tracking-wider">
                          Hasil Final
                        </span>
                      )
                    ) : (
                      <span className="text-[10px] text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-200/50 font-bold uppercase tracking-wider">
                        Terkunci
                      </span>
                    )}
                    {isPengurus && onEditLombaClick && (
                      <button
                        onClick={() => onEditLombaClick(lomba)}
                        className="p-1.5 text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all cursor-pointer active:scale-95"
                        title="Edit Detail Lomba"
                      >
                        <Edit size={13} />
                      </button>
                    )}
                    {isPengurus && onDeleteLomba && !isCompact && (
                      <button
                        onClick={() => onDeleteLomba(lomba.id)}
                        className="p-1.5 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-all cursor-pointer active:scale-95"
                        title="Hapus Lomba"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ----------------- TAB 2: CITIZEN SUGGESTED CONTESTS ----------------- */}
      {subTab === 'usulan' && (
        <div className="divide-y divide-gray-100">
          {filteredUsulans.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-xs font-medium">
              Belum ada usulan lomba dari warga yang sesuai pencarian.
            </div>
          ) : (
            filteredUsulans.map(usulan => (
              <div
                key={usulan.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-all animate-fade-in"
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl mt-0.5 shrink-0 shadow-xs shadow-amber-100/50">
                    <MessageSquare size={18} />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-sm sm:text-base text-gray-800 font-display">{usulan.nama_lomba}</h4>
                      <span className="text-[9px] bg-amber-50 border border-amber-100 text-amber-700 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                        Usulan: {usulan.kategori}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-2 text-xs text-gray-500">
                      <div className="flex items-center gap-1.5 font-medium">
                        <User size={13} className="text-gray-400" />
                        <span>Diusul oleh: <strong className="text-gray-700">{usulan.pengusul} ({usulan.rt})</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 font-medium">
                        <span>Estimasi Biaya: <strong className="text-emerald-600 font-mono">Rp {usulan.estimasi_biaya.toLocaleString('id-ID')}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Usulan Voting & Approval Panel */}
                <div className="flex items-center sm:items-center justify-between sm:justify-end gap-3 border-t sm:border-0 pt-3 sm:pt-0 border-gray-100 font-medium">
                  
                  {/* Status Indicator or Vote Button */}
                  {usulan.status === 'Menunggu' ? (
                    <>
                      <button
                        onClick={() => onVotePermintaan && onVotePermintaan(usulan.id)}
                        className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-95"
                      >
                        <ThumbsUp size={12} />
                        Dukung ({usulan.jumlah_pendukung})
                      </button>

                      {isPengurus && onApproveRequestDirectly && (
                        <button
                          onClick={() => onApproveRequestDirectly(usulan.id)}
                          className="inline-flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-3xs"
                        >
                          <Check size={12} />
                          Loloskan Lomba
                        </button>
                      )}

                      {isPengurus && onDeleteUsulan && (
                        <button
                          onClick={() => onDeleteUsulan(usulan.id)}
                          className="inline-flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-95"
                          title="Hapus Usulan"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                      <CheckCircle size={12} />
                      Telah Diloloskan Panitia
                    </div>
                  )}

                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ----------------- TAB 3: AI RECOMMENDATIONS (GEMINI) ----------------- */}
      {subTab === 'ai' && (
        <div className="p-5 space-y-6">
          {/* Banner */}
          <div className="bg-linear-to-r from-red-500 to-amber-500 rounded-2xl p-5 text-white shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="font-display font-black text-lg flex items-center gap-2">
                <Sparkles size={20} className="text-amber-200 animate-pulse shrink-0" />
                Asisten Kreator Lomba Pintar (Gemini AI)
              </h4>
              <p className="text-xs text-red-50/90 max-w-xl font-medium leading-relaxed">
                Bingung cari ide lomba yang baru, meriah, dan ramah kantong? Biarkan kecerdasan buatan Gemini merekomendasikan lomba unik khas 17-an yang ramah anggaran dan aman untuk warga RT Anda!
              </p>
            </div>
            <div className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/10 shrink-0">
              Powered by Gemini 3.5
            </div>
          </div>

          {/* Controls Form */}
          <div className="bg-gray-50 border border-gray-150 rounded-2xl p-4 sm:p-5 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Target Demografi</label>
              <select
                value={aiKategori}
                onChange={e => setAiKategori(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-red-500 cursor-pointer font-semibold text-gray-700"
              >
                <option value="Anak-anak">Anak-anak (Seru & Aman)</option>
                <option value="Ibu-ibu">Ibu-ibu (Heboh & Meriah)</option>
                <option value="Bapak-bapak">Bapak-bapak (Lucu & Santai)</option>
                <option value="Dewasa">Dewasa / Pemuda (Kompetitif)</option>
                <option value="Umum">Umum / Semua Kalangan</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Gaya / Karakter Lomba</label>
              <select
                value={aiJenis}
                onChange={e => setAiJenis(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-red-500 cursor-pointer font-semibold text-gray-700"
              >
                <option value="Tradisional & Seru">Tradisional & Klasik</option>
                <option value="Kreatif & Modern">Kreatif & Modern</option>
                <option value="Lucu, Gokil, Menghibur">Lucu, Gokil & Heboh</option>
                <option value="Kerja Sama Kelompok">Kerja Sama & Kekeluargaan</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Estimasi Anggaran Maks</label>
              <select
                value={aiBudget}
                onChange={e => setAiBudget(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-red-500 cursor-pointer font-semibold text-gray-700 font-mono"
              >
                <option value="50000">Rp 50.000 (Hemat Sekali)</option>
                <option value="150000">Rp 150.000 (Standar)</option>
                <option value="300000">Rp 300.000 (Menengah)</option>
                <option value="600000">Rp 600.000 (Mewah)</option>
              </select>
            </div>

            <div>
              <button
                onClick={handleGenerateAI}
                disabled={aiLoading}
                className="w-full inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white text-xs font-black uppercase tracking-wider py-3 px-4 rounded-xl shadow-xs cursor-pointer transition-all active:scale-98 disabled:cursor-not-allowed"
              >
                {aiLoading ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Sparkles size={15} />
                    Rekomendasi Lomba
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Loading state */}
          {aiLoading && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 animate-pulse">
              <div className="p-4 bg-red-50 text-red-600 rounded-full animate-spin">
                <Brain size={32} />
              </div>
              <div className="space-y-1">
                <h5 className="font-bold text-sm text-gray-800">Menghasilkan Ide Terbaik...</h5>
                <p className="text-xs text-red-600 font-bold tracking-wide animate-bounce">{aiProgressText}</p>
              </div>
            </div>
          )}

          {/* Error panel */}
          {aiError && (
            <div className="p-5 bg-red-50 border border-red-150 rounded-2xl flex items-start gap-3.5 animate-fade-in">
              <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={18} />
              <div className="space-y-1">
                <h5 className="font-bold text-xs text-red-800 uppercase tracking-wider">Gagal Mengakses Asisten AI</h5>
                <p className="text-xs text-red-700 leading-relaxed font-medium">
                  {aiError}
                </p>
                <p className="text-[10px] text-gray-400 font-semibold mt-1.5 uppercase">
                  Saran: Pastikan API Key Gemini terpasang dengan benar di menu Settings &gt; Secrets.
                </p>
              </div>
            </div>
          )}

          {/* Empty initial state */}
          {!aiLoading && !aiError && aiResult.length === 0 && (
            <div className="py-12 border-2 border-dashed border-gray-150 rounded-2xl flex flex-col items-center justify-center text-center p-6 bg-gray-50/20">
              <Sparkles size={24} className="text-amber-400 mb-3" />
              <h5 className="font-bold text-sm text-gray-700">Siap Membuat Perlombaan HUT RI yang Unik?</h5>
              <p className="text-xs text-gray-400 max-w-sm mt-1 leading-relaxed font-medium">
                Sesuaikan demografi, anggaran, dan gaya lomba di atas, lalu klik tombol <strong>Rekomendasi Lomba</strong> untuk merumuskan ide brilian otomatis dari Gemini.
              </p>
            </div>
          )}

          {/* Results Display */}
          {!aiLoading && !aiError && aiResult.length > 0 && (
            <div className="space-y-5 animate-fade-in">
              <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles size={11} className="text-amber-500 animate-pulse" />
                Ditemukan {aiResult.length} Ide Lomba Rekomendasi Gemini
              </h5>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {aiResult.map((item, idx) => (
                  <div key={idx} className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-all flex flex-col justify-between hover:border-red-200 relative group">
                    <div className="space-y-4">
                      {/* Name and category badge */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <h4 className="font-display font-black text-gray-800 text-sm group-hover:text-red-600 transition-colors">
                            {item.nama_lomba}
                          </h4>
                          <span className="inline-flex items-center gap-1 text-[9px] bg-red-50 border border-red-100 text-red-600 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                            {item.kategori || aiKategori}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">Pagu Usulan</span>
                          <span className="text-xs text-emerald-600 font-mono font-black">
                            Rp {(item.estimasi_biaya || Number(aiBudget)).toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-gray-500 leading-relaxed font-medium">
                        {item.deskripsi}
                      </p>

                      {/* Tools and safety info list */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-gray-100 text-[11px] leading-relaxed">
                        <div className="space-y-1.5">
                          <span className="font-bold text-gray-700 flex items-center gap-1 uppercase tracking-wide text-[9px]">
                            <Coins size={12} className="text-amber-500" />
                            Perlengkapan:
                          </span>
                          <ul className="list-disc list-inside text-gray-500 space-y-0.5 font-medium pl-1">
                            {item.perlengkapan && Array.isArray(item.perlengkapan) ? (
                              item.perlengkapan.slice(0, 3).map((tool: string, tIdx: number) => (
                                <li key={tIdx} className="truncate">{tool}</li>
                              ))
                            ) : (
                              <li>Karung, Helm, Peluit</li>
                            )}
                          </ul>
                        </div>

                        <div className="space-y-1.5">
                          <span className="font-bold text-gray-700 flex items-center gap-1 uppercase tracking-wide text-[9px]">
                            <ShieldAlert size={12} className="text-red-500 animate-pulse" />
                            Saran Keamanan:
                          </span>
                          <p className="text-gray-500 text-[10px] leading-normal font-semibold">
                            {item.tips_keamanan || "Siapkan obat-obatan ringan di dekat panggung."}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action trigger */}
                    <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                      <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-none">
                        {isPengurus ? "Otoritas Panitia Aktif" : "Sistem Demokrasi Warga"}
                      </span>
                      
                      {addedAiLombas[item.nama_lomba] ? (
                        <div className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 border border-emerald-100 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider animate-fade-in">
                          <Check size={14} />
                          Telah Diajukan
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddFromAI(item)}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                            isPengurus
                              ? "bg-red-600 hover:bg-red-700 text-white shadow-xs"
                              : "bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-100"
                          }`}
                        >
                          <PlusCircle size={14} />
                          {isPengurus ? "Terbitkan Lomba" : "Usulkan Lomba"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
