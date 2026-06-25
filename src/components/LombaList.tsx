import { useState } from 'react';
import { Lomba, PermintaanLomba } from '../types';
import { Search, Plus, User, Award, CheckCircle, RefreshCw, HelpCircle, MessageSquare, ThumbsUp, Sparkles, Check, Trash2, Edit } from 'lucide-react';

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
}: LombaListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [kategoriFilter, setKategoriFilter] = useState<string>('all');
  const [subTab, setSubTab] = useState<'lomba' | 'usulan'>('lomba');

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

    </div>
  );
}
